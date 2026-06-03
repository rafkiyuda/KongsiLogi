import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateBatchCode } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const purchaseRequests = await prisma.purchaseRequest.findMany({
      where: status ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECEIVED' } : {},
      include: {
        requestedBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
        supplier: { select: { name: true } },
        items: { include: { product: { select: { name: true, unit: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(purchaseRequests)
  } catch (error) {
    console.error('Procurement GET error:', error)
    return NextResponse.json({ error: 'Gagal memuat data pembelian' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { supplierId, notes, items } = body

    const totalEstimatedPrice = items.reduce((sum: number, item: { estimatedPrice: number; quantity: number }) =>
      sum + (item.estimatedPrice * item.quantity), 0)

    const pr = await prisma.purchaseRequest.create({
      data: {
        requestedById: userId,
        supplierId: supplierId || null,
        notes,
        totalEstimatedPrice,
        items: {
          create: items.map((item: { productId: string; quantity: number; unit: string; estimatedPrice: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            unit: item.unit || 'kg',
            estimatedPrice: item.estimatedPrice || 0,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    })

    return NextResponse.json(pr, { status: 201 })
  } catch (error) {
    console.error('Procurement POST error:', error)
    return NextResponse.json({ error: 'Gagal membuat permintaan pembelian' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, action, rejectionReason } = body
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (action === 'approve') {
      const pr = await prisma.purchaseRequest.update({
        where: { id },
        data: { status: 'APPROVED', approvedById: userId, approvedAt: new Date() },
      })
      return NextResponse.json(pr)
    }

    if (action === 'reject') {
      const pr = await prisma.purchaseRequest.update({
        where: { id },
        data: { status: 'REJECTED', approvedById: userId, approvedAt: new Date(), rejectionReason },
      })
      return NextResponse.json(pr)
    }

    if (action === 'receive') {
      // Get PR with items
      const pr = await prisma.purchaseRequest.findUnique({
        where: { id },
        include: { items: { include: { product: true } } },
      })
      if (!pr) return NextResponse.json({ error: 'PR not found' }, { status: 404 })

      // Create inventory batches for each item
      for (const item of pr.items) {
        const batchCode = generateBatchCode(item.product.name)
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + item.product.shelfLifeDays)

        await prisma.inventoryBatch.create({
          data: {
            productId: item.productId,
            supplierId: pr.supplierId,
            batchCode,
            quantity: item.quantity,
            remainingQuantity: item.quantity,
            unit: item.unit,
            receivedDate: new Date(),
            expiryDate,
            storageLocation: 'Cold Storage A',
            status: 'SAFE',
          },
        })
      }

      // Update PR status
      await prisma.purchaseRequest.update({
        where: { id },
        data: { status: 'RECEIVED' },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Procurement PATCH error:', error)
    return NextResponse.json({ error: 'Gagal memproses permintaan' }, { status: 500 })
  }
}
