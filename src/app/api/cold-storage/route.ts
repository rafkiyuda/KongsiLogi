import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const batches = await prisma.inventoryBatch.findMany({
      where: { remainingQuantity: { gt: 0 } },
      include: { product: { select: { name: true, category: true } } },
      orderBy: { expiryDate: 'asc' },
    })

    const totalUsed = batches.reduce((sum, b) => sum + b.remainingQuantity, 0)

    return NextResponse.json({
      batches,
      capacity: { used: totalUsed, total: 1000 },
    })
  } catch (error) {
    console.error('Cold storage error:', error)
    return NextResponse.json({ error: 'Gagal memuat data cold storage' }, { status: 500 })
  }
}
