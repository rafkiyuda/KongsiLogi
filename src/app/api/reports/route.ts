import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'sales'
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const dateFilter: Record<string, unknown> = {}
    if (from) dateFilter.gte = new Date(from)
    if (to) {
      const toDate = new Date(to)
      toDate.setDate(toDate.getDate() + 1)
      dateFilter.lt = toDate
    }

    if (type === 'sales') {
      const transactions = await prisma.salesTransaction.findMany({
        where: from || to ? { createdAt: dateFilter } : {},
        include: {
          cashier: { select: { name: true } },
          items: { include: { product: { select: { name: true, unit: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      })

      const totalSales = transactions.reduce((sum, t) => sum + t.totalAmount, 0)
      const totalTransactions = transactions.length

      return NextResponse.json({
        type: 'sales',
        summary: { totalSales, totalTransactions },
        data: transactions,
      })
    }

    if (type === 'purchases') {
      const purchases = await prisma.purchaseRequest.findMany({
        where: {
          status: 'RECEIVED',
          ...(from || to ? { createdAt: dateFilter } : {}),
        },
        include: {
          requestedBy: { select: { name: true } },
          supplier: { select: { name: true } },
          items: { include: { product: { select: { name: true, unit: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      })

      const totalPurchases = purchases.reduce((sum, p) => sum + p.totalEstimatedPrice, 0)

      return NextResponse.json({
        type: 'purchases',
        summary: { totalPurchases, totalOrders: purchases.length },
        data: purchases,
      })
    }

    if (type === 'stock') {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        include: {
          inventoryBatches: {
            where: { remainingQuantity: { gt: 0 } },
            orderBy: { receivedDate: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      })

      const stockData = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        unit: p.unit,
        sellingPrice: p.sellingPrice,
        costPrice: p.costPrice,
        totalRemaining: p.inventoryBatches.reduce((sum, b) => sum + b.remainingQuantity, 0),
        totalValue: p.inventoryBatches.reduce((sum, b) => sum + b.remainingQuantity * p.costPrice, 0),
        batchCount: p.inventoryBatches.length,
      }))

      const totalStockValue = stockData.reduce((sum, s) => sum + s.totalValue, 0)
      const totalStockQty = stockData.reduce((sum, s) => sum + s.totalRemaining, 0)

      return NextResponse.json({
        type: 'stock',
        summary: { totalStockValue, totalStockQty, totalProducts: stockData.length },
        data: stockData,
      })
    }

    if (type === 'audit') {
      const audits = await prisma.stockAudit.findMany({
        where: {
          status: 'COMPLETED',
          ...(from || to ? { auditDate: dateFilter } : {}),
        },
        include: {
          conductor: { select: { name: true } },
          items: {
            include: {
              product: { select: { name: true, unit: true } },
              batch: { select: { batchCode: true } },
            },
          },
        },
        orderBy: { auditDate: 'desc' },
      })

      return NextResponse.json({
        type: 'audit',
        summary: { totalAudits: audits.length },
        data: audits,
      })
    }

    if (type === 'profit-loss') {
      const salesTotal = await prisma.salesTransaction.aggregate({
        where: from || to ? { createdAt: dateFilter } : {},
        _sum: { totalAmount: true },
      })

      const purchaseTotal = await prisma.purchaseRequest.aggregate({
        where: {
          status: 'RECEIVED',
          ...(from || to ? { createdAt: dateFilter } : {}),
        },
        _sum: { totalEstimatedPrice: true },
      })

      const revenue = salesTotal._sum.totalAmount || 0
      const expenses = purchaseTotal._sum.totalEstimatedPrice || 0
      const profit = revenue - expenses

      return NextResponse.json({
        type: 'profit-loss',
        summary: { revenue, expenses, profit, margin: revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0' },
        data: null,
      })
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json({ error: 'Gagal memuat laporan' }, { status: 500 })
  }
}
