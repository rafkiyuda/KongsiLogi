import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTransactionCode } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const where: Record<string, unknown> = {}
    if (date) {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      where.createdAt = { gte: start, lt: end }
    }

    const transactions = await prisma.salesTransaction.findMany({
      where,
      include: {
        cashier: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, unit: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('POS GET error:', error)
    return NextResponse.json({ error: 'Gagal memuat transaksi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, paymentMethod, customerName } = body
    const cashierId = request.headers.get('x-user-id')

    if (!cashierId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Keranjang kosong' }, { status: 400 })
    }

    // Process FIFO stock deduction
    const transactionItems: Array<{
      productId: string
      batchId: string
      quantity: number
      price: number
      subtotal: number
    }> = []

    let totalAmount = 0

    for (const item of items) {
      const { productId, quantity, price } = item

      // Get batches sorted by received date (FIFO)
      const batches = await prisma.inventoryBatch.findMany({
        where: {
          productId,
          remainingQuantity: { gt: 0 },
          status: { not: 'EXPIRED' },
        },
        orderBy: { receivedDate: 'asc' },
      })

      let remainingQty = quantity
      for (const batch of batches) {
        if (remainingQty <= 0) break

        const deductQty = Math.min(remainingQty, batch.remainingQuantity)

        // Update batch
        await prisma.inventoryBatch.update({
          where: { id: batch.id },
          data: {
            remainingQuantity: batch.remainingQuantity - deductQty,
            status: (batch.remainingQuantity - deductQty) <= 0 ? 'EXPIRED' : batch.status,
          },
        })

        transactionItems.push({
          productId,
          batchId: batch.id,
          quantity: deductQty,
          price,
          subtotal: deductQty * price,
        })

        remainingQty -= deductQty
      }

      if (remainingQty > 0) {
        return NextResponse.json(
          { error: `Stok ${item.productName || 'produk'} tidak mencukupi` },
          { status: 400 }
        )
      }

      totalAmount += quantity * price
    }

    // Create transaction
    const transaction = await prisma.salesTransaction.create({
      data: {
        cashierId,
        transactionCode: generateTransactionCode(),
        totalAmount,
        paymentMethod: paymentMethod || 'CASH',
        customerName: customerName || null,
        items: {
          create: transactionItems,
        },
      },
      include: {
        items: {
          include: { product: { select: { name: true } } },
        },
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('POS POST error:', error)
    return NextResponse.json({ error: 'Gagal membuat transaksi' }, { status: 500 })
  }
}
