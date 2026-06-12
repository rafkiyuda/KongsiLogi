import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/smart-receiving — fetch all RFID data for the dashboard
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    // RFID Tags
    const rfidTags = await prisma.rfidTag.findMany({
      orderBy: { tagCode: 'asc' },
      include: {
        currentBatch: {
          select: { batchCode: true, product: { select: { name: true } } },
        },
      },
    })

    // Racks with occupancy
    const racks = await prisma.rack.findMany({
      where: { isActive: true },
      orderBy: { rackCode: 'asc' },
      include: {
        batchLocations: {
          include: {
            batch: {
              select: { batchCode: true, product: { select: { name: true } } },
            },
          },
        },
      },
    })

    const racksWithOccupancy = racks.map(rack => {
      const usedCrates = rack.batchLocations.reduce((sum, bl) => sum + bl.quantity, 0)
      return {
        id: rack.id,
        rackCode: rack.rackCode,
        zone: rack.zone,
        capacityCrates: rack.capacityCrates,
        isActive: rack.isActive,
        usedCrates,
        occupancyPercent: Math.round((usedCrates / rack.capacityCrates) * 100),
        batches: rack.batchLocations.map(bl => ({
          batchCode: bl.batch.batchCode,
          productName: bl.batch.product.name,
          quantity: bl.quantity,
          placedAt: bl.placedAt.toISOString(),
        })),
      }
    })

    // Receiving logs
    const receivingLogs = await prisma.receivingLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        rfidTag: { select: { tagCode: true } },
      },
    })

    // Products & Suppliers for receiving form
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, category: true, unit: true, shelfLifeDays: true },
      orderBy: { name: 'asc' },
    })

    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })

    // Batches waiting for putaway (have RFID tag assigned but no rack allocation yet)
    const pendingPutaway = await prisma.inventoryBatch.findMany({
      where: {
        rfidTags: { some: { status: 'ASSIGNED' } },
        batchLocations: { none: {} },
      },
      include: {
        product: { select: { name: true, category: true } },
        rfidTags: { select: { tagCode: true } },
      },
      orderBy: { receivedDate: 'desc' },
    })

    return NextResponse.json({
      rfidTags,
      racks: racksWithOccupancy,
      receivingLogs,
      products,
      suppliers,
      pendingPutaway,
    })
  } catch (error) {
    console.error('Smart Receiving API GET error:', error)
    return NextResponse.json({ error: 'Gagal memuat data Smart Receiving' }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/smart-receiving — perform RFID actions
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    // ── SCAN TAG ─────────────────────────────────────────────────────────
    if (action === 'scan_tag') {
      const { tagCode } = body
      const tag = await prisma.rfidTag.findUnique({
        where: { tagCode },
        include: {
          currentBatch: {
            select: { batchCode: true, product: { select: { name: true } } },
          },
        },
      })

      if (!tag) {
        return NextResponse.json({ error: `Tag ${tagCode} tidak ditemukan` }, { status: 404 })
      }

      // Update last scanned
      await prisma.rfidTag.update({
        where: { id: tag.id },
        data: { lastScannedAt: new Date() },
      })

      return NextResponse.json({ tag })
    }

    // ── RECEIVE BATCH ────────────────────────────────────────────────────
    if (action === 'receive_batch') {
      const { tagCode, productId, quantity, supplierId } = body

      // Validate tag
      const tag = await prisma.rfidTag.findUnique({ where: { tagCode } })
      if (!tag) return NextResponse.json({ error: 'Tag tidak ditemukan' }, { status: 404 })
      if (tag.status === 'ASSIGNED') return NextResponse.json({ error: 'Tag sedang digunakan untuk batch lain' }, { status: 400 })
      if (tag.status === 'DECOMMISSIONED') return NextResponse.json({ error: 'Tag sudah tidak aktif' }, { status: 400 })

      // Get product info for SKU code
      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })

      // Generate batch code: SKU-YYMMDD-NNN
      const skuMap: Record<string, string> = {
        'Bayam': 'BAY', 'Kangkung': 'KAN', 'Sawi Putih': 'SAW', 'Selada': 'SEL',
        'Cabai Merah': 'CBM', 'Cabai Rawit': 'CBR', 'Tomat': 'TOM', 'Wortel': 'WOR',
        'Brokoli': 'BRO', 'Buncis': 'BNC', 'Kol': 'KOL', 'Daun Bawang': 'DBW',
      }
      const sku = skuMap[product.name] || product.name.substring(0, 3).toUpperCase()
      const now = new Date()
      const dateStr = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

      // Count existing batches today for sequence
      const todayBatches = await prisma.inventoryBatch.count({
        where: {
          batchCode: { startsWith: `${sku}-${dateStr}` },
        },
      })
      const seq = String(todayBatches + 1).padStart(3, '0')
      const batchCode = `${sku}-${dateStr}-${seq}`

      // Calculate expiry
      const expiryDate = new Date(now)
      expiryDate.setDate(expiryDate.getDate() + product.shelfLifeDays)

      // Create batch
      const batch = await prisma.inventoryBatch.create({
        data: {
          productId,
          supplierId: supplierId || null,
          batchCode,
          quantity: Number(quantity),
          remainingQuantity: Number(quantity),
          unit: 'crate',
          receivedDate: now,
          expiryDate,
          storageLocation: 'Cold Storage A',
          status: 'SAFE',
          notes: `Diterima via RFID: ${tagCode}`,
        },
      })

      // Assign tag to batch
      await prisma.rfidTag.update({
        where: { id: tag.id },
        data: { status: 'ASSIGNED', currentBatchId: batch.id, lastScannedAt: now },
      })

      // Log
      await prisma.receivingLog.create({
        data: {
          rfidTagId: tag.id,
          batchCode,
          productName: product.name,
          quantity: Number(quantity),
          action: 'SCAN_IN',
          note: `Batch baru diterima dari supplier`,
        },
      })

      return NextResponse.json({ batch, batchCode })
    }

    // ── ALLOCATE RACK ────────────────────────────────────────────────────
    if (action === 'allocate_rack') {
      const { batchId, allocations } = body // allocations: [{ rackId, quantity }]

      const batch = await prisma.inventoryBatch.findUnique({ where: { id: batchId } })
      if (!batch) return NextResponse.json({ error: 'Batch tidak ditemukan' }, { status: 404 })

      // Validate total
      const totalAlloc = (allocations as { rackId: string; quantity: number }[]).reduce((sum: number, a: { quantity: number }) => sum + a.quantity, 0)
      if (totalAlloc !== batch.quantity) {
        return NextResponse.json({
          error: `Total alokasi (${totalAlloc} crate) tidak sesuai dengan jumlah batch (${batch.quantity} crate)`,
        }, { status: 400 })
      }

      // Validate rack capacities
      for (const alloc of allocations as { rackId: string; quantity: number }[]) {
        const rack = await prisma.rack.findUnique({
          where: { id: alloc.rackId },
          include: { batchLocations: true },
        })
        if (!rack) return NextResponse.json({ error: `Rack tidak ditemukan` }, { status: 404 })

        const currentUsed = rack.batchLocations.reduce((sum, bl) => sum + bl.quantity, 0)
        if (currentUsed + alloc.quantity > rack.capacityCrates) {
          return NextResponse.json({
            error: `${rack.rackCode} tidak cukup kapasitas (sisa ${rack.capacityCrates - currentUsed} crate)`,
          }, { status: 400 })
        }
      }

      // Create batch locations
      for (const alloc of allocations as { rackId: string; quantity: number }[]) {
        await prisma.batchLocation.create({
          data: { batchId, rackId: alloc.rackId, quantity: alloc.quantity },
        })
      }

      // Log
      const tag = await prisma.rfidTag.findFirst({ where: { currentBatchId: batchId } })
      if (tag) {
        await prisma.receivingLog.create({
          data: {
            rfidTagId: tag.id,
            batchCode: batch.batchCode,
            productName: (await prisma.product.findUnique({ where: { id: batch.productId } }))?.name || '',
            quantity: Number(batch.quantity),
            action: 'PUTAWAY',
            note: `Dialokasikan ke ${(allocations as { rackId: string; quantity: number }[]).length} rack`,
          },
        })
      }

      return NextResponse.json({ success: true })
    }

    // ── RELEASE TAG ──────────────────────────────────────────────────────
    if (action === 'release_tag') {
      const { tagCode } = body

      const tag = await prisma.rfidTag.findUnique({
        where: { tagCode },
        include: { currentBatch: { select: { batchCode: true, product: { select: { name: true } } } } },
      })
      if (!tag) return NextResponse.json({ error: 'Tag tidak ditemukan' }, { status: 404 })
      if (tag.status !== 'ASSIGNED') return NextResponse.json({ error: 'Tag tidak sedang digunakan' }, { status: 400 })

      // Log before releasing
      await prisma.receivingLog.create({
        data: {
          rfidTagId: tag.id,
          batchCode: tag.currentBatch?.batchCode || '',
          productName: tag.currentBatch?.product?.name || '',
          quantity: 0,
          action: 'RELEASE',
          note: `Tag dilepas dan siap digunakan kembali`,
        },
      })

      await prisma.rfidTag.update({
        where: { id: tag.id },
        data: { status: 'AVAILABLE', currentBatchId: null },
      })

      return NextResponse.json({ success: true })
    }

    // ── GET RACK RECOMMENDATION ──────────────────────────────────────────
    if (action === 'recommend_racks') {
      const { quantity } = body
      const totalNeeded = Number(quantity)

      const racks = await prisma.rack.findMany({
        where: { isActive: true },
        include: { batchLocations: true },
        orderBy: { rackCode: 'asc' },
      })

      const recommendations: { rackId: string; rackCode: string; zone: string; available: number; suggested: number }[] = []
      let remaining = totalNeeded

      for (const rack of racks) {
        if (remaining <= 0) break
        const used = rack.batchLocations.reduce((sum, bl) => sum + bl.quantity, 0)
        const available = rack.capacityCrates - used
        if (available <= 0) continue

        const suggested = Math.min(available, remaining)
        recommendations.push({
          rackId: rack.id,
          rackCode: rack.rackCode,
          zone: rack.zone,
          available,
          suggested,
        })
        remaining -= suggested
      }

      return NextResponse.json({
        recommendations,
        totalNeeded,
        totalAllocated: totalNeeded - remaining,
        unallocated: remaining,
      })
    }

    return NextResponse.json({ error: 'Action tidak dikenal' }, { status: 400 })
  } catch (error) {
    console.error('Smart Receiving API POST error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
