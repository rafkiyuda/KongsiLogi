import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const audits = await prisma.stockAudit.findMany({
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

    return NextResponse.json(audits)
  } catch (error) {
    console.error('Stock opname GET error:', error)
    return NextResponse.json({ error: 'Gagal memuat data audit' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { action } = body

    if (action === 'create') {
      // Get all active batches for audit
      const batches = await prisma.inventoryBatch.findMany({
        where: { remainingQuantity: { gt: 0 }, status: { not: 'EXPIRED' } },
        include: { product: true },
        orderBy: [{ product: { name: 'asc' } }, { receivedDate: 'asc' }],
      })

      const audit = await prisma.stockAudit.create({
        data: {
          auditDate: new Date(),
          conductedBy: userId,
          status: 'IN_PROGRESS',
          items: {
            create: batches.map(b => ({
              productId: b.productId,
              batchId: b.id,
              systemQuantity: b.remainingQuantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: { select: { name: true, unit: true } },
              batch: { select: { batchCode: true, storageLocation: true } },
            },
          },
        },
      })

      return NextResponse.json(audit, { status: 201 })
    }

    if (action === 'submit') {
      const { auditId, items, notes } = body

      // Update each audit item
      for (const item of items) {
        const physicalQty = Number(item.physicalQuantity)
        const auditItem = await prisma.stockAuditItem.findUnique({ where: { id: item.id } })
        if (!auditItem) continue

        await prisma.stockAuditItem.update({
          where: { id: item.id },
          data: {
            physicalQuantity: physicalQty,
            difference: physicalQty - auditItem.systemQuantity,
            note: item.note || null,
          },
        })
      }

      // Complete the audit
      await prisma.stockAudit.update({
        where: { id: auditId },
        data: { status: 'COMPLETED', notes },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Stock opname POST error:', error)
    return NextResponse.json({ error: 'Gagal memproses audit' }, { status: 500 })
  }
}
