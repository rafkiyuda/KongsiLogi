import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        inventoryBatches: {
          where: { remainingQuantity: { gt: 0 } },
          include: { supplier: { select: { name: true } } },
          orderBy: { receivedDate: 'asc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    const totalRemaining = product.inventoryBatches.reduce((sum, b) => sum + b.remainingQuantity, 0)

    // Generate recommendations
    const recommendations: string[] = []
    const now = new Date()

    product.inventoryBatches.forEach(batch => {
      const daysLeft = Math.ceil((new Date(batch.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysLeft <= 0) recommendations.push(`Batch ${batch.batchCode}: Sudah kadaluarsa, segera buang!`)
      else if (daysLeft <= 1) recommendations.push(`Batch ${batch.batchCode}: Kritis! Sisa ${daysLeft} hari, segera jual atau diskon.`)
      else if (daysLeft <= 3) recommendations.push(`Batch ${batch.batchCode}: Prioritaskan penjualan, sisa ${daysLeft} hari.`)
    })

    if (totalRemaining <= 0) recommendations.push('Stok habis! Segera buat permintaan pembelian.')
    else if (totalRemaining <= product.minimumStock) recommendations.push(`Stok menipis (${totalRemaining} ${product.unit}), pertimbangkan restock.`)

    return NextResponse.json({
      ...product,
      totalRemaining,
      recommendations,
    })
  } catch (error) {
    console.error('Product detail error:', error)
    return NextResponse.json({ error: 'Gagal memuat detail produk' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        unit: body.unit,
        sellingPrice: Number(body.sellingPrice),
        costPrice: Number(body.costPrice || 0),
        minimumStock: Number(body.minimumStock),
        shelfLifeDays: Number(body.shelfLifeDays),
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui produk' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 })
  }
}
