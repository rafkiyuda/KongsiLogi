import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
          where: { status: 'STORED' },
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

    // Batches waiting for putaway
    const pendingPutaway = await prisma.inventoryBatch.findMany({
      where: { status: 'WAITING_PUTAWAY' },
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

      // Infer product from tag prefix (e.g., BAY-TAG-0001 -> BAY -> Bayam)
      let skuPrefix = tagCode.split('-')[0]
      
      // Hardcode mapping untuk 2 ID fisik kartu agar otomatis terdeteksi sebagai Tomat
      if (tagCode === '0008461465' || tagCode === '0008634628') {
        skuPrefix = 'TOM'
      }

      const skuMapReverse: Record<string, string> = {
        'BAY': 'Bayam', 'KAN': 'Kangkung', 'SAW': 'Sawi Putih', 'SEL': 'Selada',
        'CBM': 'Cabai Merah', 'CBR': 'Cabai Rawit', 'TOM': 'Tomat', 'WOR': 'Wortel',
        'BRO': 'Brokoli', 'BNC': 'Buncis', 'KOL': 'Kol', 'DBW': 'Daun Bawang',
      }
      const inferredProductName = skuMapReverse[skuPrefix]
      let inferredProduct = null
      if (inferredProductName) {
        inferredProduct = await prisma.product.findFirst({
          where: { name: inferredProductName },
          select: { id: true, name: true, category: true }
        })
      }

      return NextResponse.json({ tag, inferredProduct })
    }

    // ── RECEIVE BATCH ────────────────────────────────────────────────────
    if (action === 'receive_batch') {
      const { tagCodes, productId, supplierId } = body

      if (!tagCodes || !Array.isArray(tagCodes) || tagCodes.length === 0) {
        return NextResponse.json({ error: 'Minimal 1 tag RFID harus discan' }, { status: 400 })
      }

      // Validate all tags
      const tags = await prisma.rfidTag.findMany({
        where: { tagCode: { in: tagCodes } }
      })

      if (tags.length !== tagCodes.length) {
        return NextResponse.json({ error: 'Beberapa tag tidak ditemukan di database' }, { status: 404 })
      }

      // Check status
      for (const t of tags) {
        if (t.status === 'ASSIGNED') return NextResponse.json({ error: `Tag ${t.tagCode} sedang digunakan` }, { status: 400 })
        if (t.status === 'DECOMMISSIONED') return NextResponse.json({ error: `Tag ${t.tagCode} tidak aktif` }, { status: 400 })
      }

      // Validate matching SKU prefixes (only if tags use SKU- prefix format)
      if (tagCodes[0].includes('-')) {
        const prefix = tagCodes[0].split('-')[0]
        for (const code of tagCodes) {
          if (code.split('-')[0] !== prefix) {
            return NextResponse.json({ error: 'Tag yang discan harus dari SKU (Product) yang sama' }, { status: 400 })
          }
        }
      }

      // Get product info for SKU code
      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })

      const quantity = tagCodes.length

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
          status: 'WAITING_PUTAWAY',
          notes: `Diterima via RFID (Total: ${quantity} tag)`,
        },
      })

      // Assign all tags to batch
      await prisma.rfidTag.updateMany({
        where: { tagCode: { in: tagCodes } },
        data: { status: 'ASSIGNED', currentBatchId: batch.id, lastScannedAt: now },
      })

      // Log for each tag
      const logsToCreate = tags.map(t => ({
        rfidTagId: t.id,
        batchCode,
        productName: product.name,
        quantity: 1, // 1 tag = 1 crate
        action: 'SCAN_IN',
        note: `Crate diterima dari supplier`,
      }))
      await prisma.receivingLog.createMany({ data: logsToCreate })

      // Refetch with includes for the frontend
      const batchWithIncludes = await prisma.inventoryBatch.findUnique({
        where: { id: batch.id },
        include: {
          product: { select: { name: true, category: true } },
          rfidTags: { select: { tagCode: true } },
        }
      })

      return NextResponse.json({ batch: batchWithIncludes, batchCode })
    }

    // ── ALLOCATE RACK (PUTAWAY) ──────────────────────────────────────────
    if (action === 'allocate_rack') {
      const { batchId, allocations, overrideAdmin } = body

      // allocations: [{ rackId, quantity }]
      
      const batch = await prisma.inventoryBatch.findUnique({ where: { id: batchId } })
      if (!batch) return NextResponse.json({ error: 'Batch tidak ditemukan' }, { status: 404 })

      const totalAlloc = allocations.reduce((sum: number, a: any) => sum + Number(a.quantity), 0)
      if (totalAlloc > batch.quantity) {
        return NextResponse.json({ error: 'Jumlah alokasi melebihi jumlah batch' }, { status: 400 })
      }

      // Validate rack capacities unless admin override
      if (!overrideAdmin) {
        for (const alloc of allocations as { rackId: string; quantity: number }[]) {
          const rack = await prisma.rack.findUnique({
            where: { id: alloc.rackId },
            include: { batchLocations: { where: { status: 'STORED' } } },
          })
          if (!rack) return NextResponse.json({ error: `Rack tidak ditemukan` }, { status: 404 })

          const currentUsed = rack.batchLocations.reduce((sum, bl) => sum + bl.quantity, 0)
          if (currentUsed + alloc.quantity > rack.capacityCrates) {
            return NextResponse.json({
              error: `${rack.rackCode} tidak cukup kapasitas (sisa ${rack.capacityCrates - currentUsed} crate)`,
            }, { status: 400 })
          }
        }
      }

      // Create batch locations
      for (const alloc of allocations as { rackId: string; quantity: number }[]) {
        await prisma.batchLocation.create({
          data: { batchId, rackId: alloc.rackId, quantity: alloc.quantity, status: 'STORED' },
        })
      }

      // Update batch status
      await prisma.inventoryBatch.update({
        where: { id: batchId },
        data: { status: 'STORED' }
      })

      // Log for each tag
      const tags = await prisma.rfidTag.findMany({ where: { currentBatchId: batchId } })
      if (tags.length > 0) {
        const productName = (await prisma.product.findUnique({ where: { id: batch.productId } }))?.name || ''
        const logsToCreate = tags.map(t => ({
          rfidTagId: t.id,
          batchCode: batch.batchCode,
          productName,
          quantity: 1,
          action: 'PUTAWAY',
          note: `Dialokasikan ke rak bersama ${tags.length - 1} crate lainnya`,
        }))
        await prisma.receivingLog.createMany({ data: logsToCreate })
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
