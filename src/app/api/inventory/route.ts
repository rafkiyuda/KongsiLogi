import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
        ...(category && { category }),
      },
      include: {
        inventoryBatches: {
          where: {
            remainingQuantity: { gt: 0 },
            ...(status && { status: status as any }),
          },
          include: { supplier: { select: { name: true } } },
          orderBy: { receivedDate: 'asc' }, // FIFO
        },
      },
      orderBy: { name: 'asc' },
    })

    const enrichedProducts = products.map(product => {
      const totalRemaining = product.inventoryBatches.reduce((sum, b) => sum + b.remainingQuantity, 0)
      const stockStatus = totalRemaining <= 0 ? 'critical' :
        totalRemaining <= product.minimumStock ? 'attention' : 'safe'

      const nearestExpiry = product.inventoryBatches
        .filter(b => b.remainingQuantity > 0)
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0]

      const daysUntilExpiry = nearestExpiry
        ? Math.ceil((new Date(nearestExpiry.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null

      return {
        ...product,
        totalRemaining,
        stockStatus,
        batchCount: product.inventoryBatches.length,
        nearestExpiry: nearestExpiry?.expiryDate || null,
        daysUntilExpiry,
      }
    })

    return NextResponse.json(enrichedProducts)
  } catch (error) {
    console.error('Inventory API error:', error)
    return NextResponse.json({ error: 'Gagal memuat data inventaris' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, category, unit, sellingPrice, costPrice, minimumStock, shelfLifeDays } = body

    const product = await prisma.product.create({
      data: {
        name,
        category,
        unit: unit || 'kg',
        sellingPrice: Number(sellingPrice),
        costPrice: Number(costPrice || 0),
        minimumStock: Number(minimumStock || 10),
        shelfLifeDays: Number(shelfLifeDays || 7),
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Gagal menambahkan produk' }, { status: 500 })
  }
}
