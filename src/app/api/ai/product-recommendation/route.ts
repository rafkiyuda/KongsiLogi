import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// ─────────────────────────────────────────────────────────────────────────────
// Exponential Smoothing (SES)
// Formula: Ft+1 = α * Yt + (1 - α) * Ft
// α (alpha) = smoothing factor (0 < α < 1)
//   - Higher α = more weight on recent data (reactive)
//   - Lower α  = more weight on older data (stable)
// ─────────────────────────────────────────────────────────────────────────────
function exponentialSmoothing(dailySales: number[], alpha = 0.3): { forecast: number; smoothedSeries: number[] } {
  if (dailySales.length === 0) return { forecast: 0, smoothedSeries: [] }
  if (dailySales.length === 1) return { forecast: dailySales[0], smoothedSeries: [...dailySales] }

  const smoothed: number[] = [dailySales[0]] // F1 = Y1 (initialize with first observation)

  for (let t = 1; t < dailySales.length; t++) {
    // Ft+1 = α * Yt + (1 - α) * Ft
    const nextForecast = alpha * dailySales[t] + (1 - alpha) * smoothed[t - 1]
    smoothed.push(+nextForecast.toFixed(2))
  }

  // Forecast for next period = last smoothed value
  const forecast = smoothed[smoothed.length - 1]
  return { forecast: +forecast.toFixed(1), smoothedSeries: smoothed }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/ai/product-recommendation
// Pipeline: DB Query → Exponential Smoothing → Gemini Humanization
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const fourteenDaysAgo = new Date(now)
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    // ── 1. Fetch all active products with stock info ──────────────────────
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        unit: true,
        minimumStock: true,
        sellingPrice: true,
        shelfLifeDays: true,
        inventoryBatches: {
          where: { remainingQuantity: { gt: 0 } },
          select: {
            remainingQuantity: true,
            expiryDate: true,
          },
          orderBy: { expiryDate: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    })

    // ── 2. Fetch sales data for last 30 days ─────────────────────────────
    const salesItems = await prisma.salesTransactionItem.findMany({
      where: {
        salesTransaction: {
          createdAt: { gte: thirtyDaysAgo },
        },
      },
      select: {
        productId: true,
        quantity: true,
        salesTransaction: {
          select: { createdAt: true },
        },
      },
    })

    // Group sales by productId AND by day (for Exponential Smoothing)
    const salesByProduct = new Map<string, { qty7d: number; qty14d: number; qty30d: number; dailyBreakdown: Map<string, number> }>()

    for (const item of salesItems) {
      const entry = salesByProduct.get(item.productId) || {
        qty7d: 0, qty14d: 0, qty30d: 0,
        dailyBreakdown: new Map<string, number>(),
      }

      const txDate = new Date(item.salesTransaction.createdAt)
      const dayKey = txDate.toISOString().split('T')[0] // "2026-06-01"

      entry.qty30d += item.quantity
      if (txDate >= fourteenDaysAgo) entry.qty14d += item.quantity
      if (txDate >= sevenDaysAgo) entry.qty7d += item.quantity

      // Aggregate per day
      entry.dailyBreakdown.set(dayKey, (entry.dailyBreakdown.get(dayKey) || 0) + item.quantity)

      salesByProduct.set(item.productId, entry)
    }

    // ── 3. Compute per-product statistics + Exponential Smoothing ────────
    const productStats = products.map(product => {
      const sales = salesByProduct.get(product.id) || {
        qty7d: 0, qty14d: 0, qty30d: 0,
        dailyBreakdown: new Map<string, number>(),
      }

      const avgDailySales = +(sales.qty30d / 30).toFixed(1)

      // Build ordered daily sales array for the last 30 days (fill gaps with 0)
      const dailySalesArray: number[] = []
      for (let d = 29; d >= 0; d--) {
        const date = new Date(now)
        date.setDate(date.getDate() - d)
        const key = date.toISOString().split('T')[0]
        dailySalesArray.push(sales.dailyBreakdown.get(key) || 0)
      }

      // ── Exponential Smoothing (α = 0.3) ────────────────────────────────
      const { forecast: forecastNextDay } = exponentialSmoothing(dailySalesArray, 0.3)

      // Trend: compare last 7 days vs previous 7 days (days 8-14)
      const prev7d = sales.qty14d - sales.qty7d
      let salesTrend: 'naik' | 'turun' | 'stabil' = 'stabil'
      let trendPercent = 0
      if (prev7d > 0) {
        trendPercent = Math.round(((sales.qty7d - prev7d) / prev7d) * 100)
        if (trendPercent > 15) salesTrend = 'naik'
        else if (trendPercent < -15) salesTrend = 'turun'
      } else if (sales.qty7d > 0) {
        salesTrend = 'naik'
        trendPercent = 100
      }

      const currentStock = product.inventoryBatches.reduce((sum, b) => sum + b.remainingQuantity, 0)

      // Days of stock uses forecast (smarter) instead of simple average
      const effectiveDailySales = forecastNextDay > 0 ? forecastNextDay : avgDailySales
      const daysOfStock = effectiveDailySales > 0
        ? +(currentStock / effectiveDailySales).toFixed(1)
        : null

      const nearestExpiry = product.inventoryBatches[0]?.expiryDate
      const nearestExpiryDays = nearestExpiry
        ? Math.ceil((new Date(nearestExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null

      return {
        productId: product.id,
        productName: product.name,
        category: product.category,
        unit: product.unit,
        minimumStock: product.minimumStock,
        sellingPrice: product.sellingPrice,
        stats: {
          avgDailySales,
          forecastNextDay,
          salesTrend,
          trendPercent,
          currentStock,
          daysOfStock,
          nearestExpiryDays,
          totalSold7d: sales.qty7d,
          totalSold30d: sales.qty30d,
        },
      }
    })

    // ── 4. Send summary to Gemini for humanized recommendations ──────────
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

    const summaryForAI = productStats.map(p => ({
      nama: p.productName,
      kategori: p.category,
      stokSaatIni: `${p.stats.currentStock} ${p.unit}`,
      stokMinimum: `${p.minimumStock} ${p.unit}`,
      rataRataJualPerHari: `${p.stats.avgDailySales} ${p.unit}`,
      prediksiJualBesok_ExponentialSmoothing: `${p.stats.forecastNextDay} ${p.unit}`,
      trenPenjualan: `${p.stats.salesTrend} (${p.stats.trendPercent > 0 ? '+' : ''}${p.stats.trendPercent}%)`,
      estimasiHariStok: p.stats.daysOfStock !== null ? `${p.stats.daysOfStock} hari` : 'Tidak ada data penjualan',
      batchTerdekatKadaluarsa: p.stats.nearestExpiryDays !== null ? `${p.stats.nearestExpiryDays} hari lagi` : 'Tidak ada batch aktif',
      terjual7Hari: `${p.stats.totalSold7d} ${p.unit}`,
      terjual30Hari: `${p.stats.totalSold30d} ${p.unit}`,
    }))

    const prompt = `Kamu adalah seorang analis supply chain sayuran & buah yang sangat berpengalaman di koperasi Indonesia.

Berdasarkan data statistik penjualan, prediksi Exponential Smoothing, dan stok berikut, berikan rekomendasi AKSI NYATA untuk setiap produk.

DATA PRODUK:
${JSON.stringify(summaryForAI, null, 2)}

INSTRUKSI:
1. Untuk SETIAP produk, tentukan level urgensi: "kritis", "tinggi", "sedang", atau "rendah"
2. Berikan rekomendasi singkat (1-2 kalimat) dalam bahasa Indonesia yang natural dan to-the-point. Sertakan angka prediksi dari Exponential Smoothing sebagai dasar rekomendasi.
3. Berikan saran aksi konkret (1 kalimat pendek)
4. Pertimbangkan: prediksi penjualan besok, tren penjualan, sisa stok vs rata-rata jual, kadaluarsa batch terdekat, dan stok minimum

RULES:
- "kritis" = stok habis dalam ≤2 hari ATAU sudah di bawah minimum ATAU ada batch kadaluarsa ≤1 hari
- "tinggi" = stok habis dalam 3-5 hari ATAU tren naik tajam tapi stok menipis
- "sedang" = stok cukup 6-10 hari, tidak ada masalah mendesak
- "rendah" = stok aman >10 hari
- Jika tidak ada data penjualan, urgensi minimal "sedang" karena perlu investigasi

Balas HANYA dengan JSON array valid. Setiap objek harus memiliki key:
- "productName" (string, nama produk PERSIS seperti di data)
- "urgency" (string: "kritis" | "tinggi" | "sedang" | "rendah")
- "recommendation" (string: rekomendasi dalam bahasa Indonesia)
- "action" (string: saran aksi pendek)

JANGAN tambahkan teks lain di luar JSON array.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON from response
    let cleanJson = text
    if (text.includes('```json')) {
      cleanJson = text.split('```json')[1].split('```')[0].trim()
    } else if (text.includes('```')) {
      cleanJson = text.split('```')[1].split('```')[0].trim()
    }

    const aiResults: Array<{
      productName: string
      urgency: string
      recommendation: string
      action: string
    }> = JSON.parse(cleanJson)

    // ── 5. Merge AI results with computed stats ──────────────────────────
    const recommendations = productStats.map(p => {
      const aiRec = aiResults.find(r => r.productName === p.productName)
      return {
        productId: p.productId,
        productName: p.productName,
        category: p.category,
        stats: p.stats,
        ai: aiRec
          ? {
              urgency: aiRec.urgency as 'kritis' | 'tinggi' | 'sedang' | 'rendah',
              recommendation: aiRec.recommendation,
              action: aiRec.action,
            }
          : {
              urgency: 'rendah' as const,
              recommendation: 'Data tidak cukup untuk analisis.',
              action: 'Pantau penjualan.',
            },
      }
    })

    return NextResponse.json({
      success: true,
      method: 'Exponential Smoothing (α=0.3) + Gemini 1.5 Flash',
      recommendations,
      generatedAt: now.toISOString(),
    })
  } catch (error) {
    console.error('AI Product Recommendation error:', error)
    const message = error instanceof Error ? error.message : 'Gagal menghasilkan rekomendasi AI'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
