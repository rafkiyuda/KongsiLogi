import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.receivingLog.deleteMany()
  await prisma.batchLocation.deleteMany()
  await prisma.rfidTag.deleteMany()
  await prisma.rack.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.stockAuditItem.deleteMany()
  await prisma.stockAudit.deleteMany()
  await prisma.salesTransactionItem.deleteMany()
  await prisma.salesTransaction.deleteMany()
  await prisma.purchaseRequestItem.deleteMany()
  await prisma.purchaseRequest.deleteMany()
  await prisma.inventoryBatch.deleteMany()
  await prisma.product.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.cooperative.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Cleared existing data')

  // ===== COOPERATIVE =====
  await prisma.cooperative.create({
    data: {
      name: 'Koperasi Melati Jaya',
      businessType: 'Sayuran & Cold Storage',
      location: 'Kabupaten Bandung Barat, Jawa Barat',
      coldStorageCapacity: 1000,
    },
  })

  // ===== USERS =====
  const hashPassword = async (pwd: string) => bcrypt.hash(pwd, 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Pak Hendra',
      email: 'admin@kongsil.co',
      password: await hashPassword('admin123'),
      role: 'ADMIN',
    },
  })

  const warehouse = await prisma.user.create({
    data: {
      name: 'Bu Sari',
      email: 'gudang@kongsil.co',
      password: await hashPassword('gudang123'),
      role: 'WAREHOUSE_STAFF',
    },
  })

  const cashier = await prisma.user.create({
    data: {
      name: 'Mas Dedi',
      email: 'kasir@kongsil.co',
      password: await hashPassword('kasir123'),
      role: 'CASHIER',
    },
  })

  const viewer = await prisma.user.create({
    data: {
      name: 'Ibu Dewi',
      email: 'viewer@kongsil.co',
      password: await hashPassword('viewer123'),
      role: 'VIEWER',
    },
  })

  console.log('✅ Users created')

  // ===== SUPPLIERS =====
  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { name: 'Tani Makmur Lembang', phone: '081234567890', address: 'Lembang, Bandung Barat' } }),
    prisma.supplier.create({ data: { name: 'CV Segar Jaya', phone: '081345678901', address: 'Ciwidey, Bandung' } }),
    prisma.supplier.create({ data: { name: 'UD Berkah Tani', phone: '082456789012', address: 'Garut, Jawa Barat' } }),
    prisma.supplier.create({ data: { name: 'Kelompok Tani Subur', phone: '083567890123', address: 'Cisarua, Bogor' } }),
    prisma.supplier.create({ data: { name: 'PT Agro Nusantara', phone: '084678901234', address: 'Cianjur, Jawa Barat' } }),
  ])

  console.log('✅ Suppliers created')

  // ===== PRODUCTS =====
  const products = await Promise.all([
    prisma.product.create({ data: { name: 'Bayam', category: 'Sayuran Daun', unit: 'kg', sellingPrice: 12000, costPrice: 8000, minimumStock: 15, shelfLifeDays: 5, imageUrl: 'https://loremflickr.com/400/400/spinach,vegetable/all' } }),
    prisma.product.create({ data: { name: 'Kangkung', category: 'Sayuran Daun', unit: 'kg', sellingPrice: 10000, costPrice: 6000, minimumStock: 15, shelfLifeDays: 4, imageUrl: 'https://loremflickr.com/400/400/water+spinach,vegetable/all' } }),
    prisma.product.create({ data: { name: 'Sawi Putih', category: 'Sayuran Daun', unit: 'kg', sellingPrice: 15000, costPrice: 10000, minimumStock: 10, shelfLifeDays: 7, imageUrl: 'https://loremflickr.com/400/400/napa+cabbage/all' } }),
    prisma.product.create({ data: { name: 'Selada', category: 'Sayuran Daun', unit: 'kg', sellingPrice: 18000, costPrice: 12000, minimumStock: 8, shelfLifeDays: 5, imageUrl: 'https://loremflickr.com/400/400/lettuce,leaf/all' } }),
    prisma.product.create({ data: { name: 'Cabai Merah', category: 'Bumbu Dapur', unit: 'kg', sellingPrice: 45000, costPrice: 30000, minimumStock: 10, shelfLifeDays: 10, imageUrl: 'https://loremflickr.com/400/400/red+chili,pepper/all' } }),
    prisma.product.create({ data: { name: 'Cabai Rawit', category: 'Bumbu Dapur', unit: 'kg', sellingPrice: 50000, costPrice: 35000, minimumStock: 8, shelfLifeDays: 10, imageUrl: 'https://loremflickr.com/400/400/chili,spicy/all' } }),
    prisma.product.create({ data: { name: 'Tomat', category: 'Sayuran Buah', unit: 'kg', sellingPrice: 14000, costPrice: 9000, minimumStock: 15, shelfLifeDays: 7, imageUrl: 'https://loremflickr.com/400/400/tomato,ripe/all' } }),
    prisma.product.create({ data: { name: 'Wortel', category: 'Sayuran Akar', unit: 'kg', sellingPrice: 16000, costPrice: 10000, minimumStock: 12, shelfLifeDays: 14, imageUrl: 'https://loremflickr.com/400/400/carrot,vegetable/all' } }),
    prisma.product.create({ data: { name: 'Brokoli', category: 'Sayuran Buah', unit: 'kg', sellingPrice: 25000, costPrice: 18000, minimumStock: 8, shelfLifeDays: 7, imageUrl: 'https://loremflickr.com/400/400/broccoli/all' } }),
    prisma.product.create({ data: { name: 'Buncis', category: 'Sayuran Buah', unit: 'kg', sellingPrice: 13000, costPrice: 8000, minimumStock: 10, shelfLifeDays: 6, imageUrl: 'https://loremflickr.com/400/400/green+beans,vegetable/all' } }),
    prisma.product.create({ data: { name: 'Kol', category: 'Sayuran Daun', unit: 'kg', sellingPrice: 8000, costPrice: 5000, minimumStock: 20, shelfLifeDays: 10, imageUrl: 'https://loremflickr.com/400/400/cabbage/all' } }),
    prisma.product.create({ data: { name: 'Daun Bawang', category: 'Bumbu Dapur', unit: 'kg', sellingPrice: 20000, costPrice: 14000, minimumStock: 5, shelfLifeDays: 5, imageUrl: 'https://loremflickr.com/400/400/scallion,onion/all' } }),
  ])

  console.log('✅ Products created')

  // ===== INVENTORY BATCHES =====
  const now = new Date()
  const daysAgo = (d: number) => { const date = new Date(now); date.setDate(date.getDate() - d); return date }
  const daysFromNow = (d: number) => { const date = new Date(now); date.setDate(date.getDate() + d); return date }

  const batches = await Promise.all([
    // Bayam - multiple batches
    prisma.inventoryBatch.create({ data: { productId: products[0].id, supplierId: suppliers[0].id, batchCode: 'BAY-20240601-A1B2', quantity: 25, remainingQuantity: 8, unit: 'kg', receivedDate: daysAgo(4), expiryDate: daysFromNow(1), storageLocation: 'Cold Storage A', status: 'CRITICAL' } }),
    prisma.inventoryBatch.create({ data: { productId: products[0].id, supplierId: suppliers[0].id, batchCode: 'BAY-20240603-C3D4', quantity: 20, remainingQuantity: 18, unit: 'kg', receivedDate: daysAgo(1), expiryDate: daysFromNow(4), storageLocation: 'Cold Storage A', status: 'SAFE' } }),
    // Kangkung
    prisma.inventoryBatch.create({ data: { productId: products[1].id, supplierId: suppliers[1].id, batchCode: 'KAN-20240602-E5F6', quantity: 15, remainingQuantity: 5, unit: 'kg', receivedDate: daysAgo(3), expiryDate: daysFromNow(1), storageLocation: 'Cold Storage A', status: 'ATTENTION' } }),
    // Sawi Putih
    prisma.inventoryBatch.create({ data: { productId: products[2].id, supplierId: suppliers[0].id, batchCode: 'SAW-20240601-G7H8', quantity: 30, remainingQuantity: 22, unit: 'kg', receivedDate: daysAgo(2), expiryDate: daysFromNow(5), storageLocation: 'Cold Storage B', status: 'SAFE' } }),
    // Selada
    prisma.inventoryBatch.create({ data: { productId: products[3].id, supplierId: suppliers[3].id, batchCode: 'SEL-20240603-I9J0', quantity: 12, remainingQuantity: 10, unit: 'kg', receivedDate: daysAgo(1), expiryDate: daysFromNow(4), storageLocation: 'Cold Storage A', status: 'SAFE' } }),
    // Cabai Merah
    prisma.inventoryBatch.create({ data: { productId: products[4].id, supplierId: suppliers[2].id, batchCode: 'CAB-20240530-K1L2', quantity: 20, remainingQuantity: 3, unit: 'kg', receivedDate: daysAgo(5), expiryDate: daysFromNow(5), storageLocation: 'Cold Storage B', status: 'ATTENTION' } }),
    prisma.inventoryBatch.create({ data: { productId: products[4].id, supplierId: suppliers[4].id, batchCode: 'CAB-20240603-M3N4', quantity: 15, remainingQuantity: 15, unit: 'kg', receivedDate: daysAgo(0), expiryDate: daysFromNow(10), storageLocation: 'Cold Storage B', status: 'SAFE' } }),
    // Cabai Rawit
    prisma.inventoryBatch.create({ data: { productId: products[5].id, supplierId: suppliers[2].id, batchCode: 'RAW-20240602-O5P6', quantity: 10, remainingQuantity: 7, unit: 'kg', receivedDate: daysAgo(2), expiryDate: daysFromNow(8), storageLocation: 'Cold Storage B', status: 'SAFE' } }),
    // Tomat
    prisma.inventoryBatch.create({ data: { productId: products[6].id, supplierId: suppliers[1].id, batchCode: 'TOM-20240601-Q7R8', quantity: 25, remainingQuantity: 12, unit: 'kg', receivedDate: daysAgo(3), expiryDate: daysFromNow(4), storageLocation: 'Cold Storage A', status: 'SAFE' } }),
    prisma.inventoryBatch.create({ data: { productId: products[6].id, supplierId: suppliers[3].id, batchCode: 'TOM-20240603-S9T0', quantity: 20, remainingQuantity: 20, unit: 'kg', receivedDate: daysAgo(0), expiryDate: daysFromNow(7), storageLocation: 'Cold Storage C', status: 'SAFE' } }),
    // Wortel
    prisma.inventoryBatch.create({ data: { productId: products[7].id, supplierId: suppliers[4].id, batchCode: 'WOR-20240528-U1V2', quantity: 30, remainingQuantity: 15, unit: 'kg', receivedDate: daysAgo(6), expiryDate: daysFromNow(8), storageLocation: 'Cold Storage C', status: 'SAFE' } }),
    // Brokoli
    prisma.inventoryBatch.create({ data: { productId: products[8].id, supplierId: suppliers[0].id, batchCode: 'BRO-20240602-W3X4', quantity: 10, remainingQuantity: 6, unit: 'kg', receivedDate: daysAgo(2), expiryDate: daysFromNow(5), storageLocation: 'Cold Storage A', status: 'SAFE' } }),
    // Buncis
    prisma.inventoryBatch.create({ data: { productId: products[9].id, supplierId: suppliers[1].id, batchCode: 'BUN-20240601-Y5Z6', quantity: 15, remainingQuantity: 2, unit: 'kg', receivedDate: daysAgo(4), expiryDate: daysFromNow(2), storageLocation: 'Cold Storage B', status: 'CRITICAL' } }),
    // Kol
    prisma.inventoryBatch.create({ data: { productId: products[10].id, supplierId: suppliers[3].id, batchCode: 'KOL-20240530-A7B8', quantity: 40, remainingQuantity: 28, unit: 'kg', receivedDate: daysAgo(4), expiryDate: daysFromNow(6), storageLocation: 'Cold Storage C', status: 'SAFE' } }),
    // Daun Bawang
    prisma.inventoryBatch.create({ data: { productId: products[11].id, supplierId: suppliers[2].id, batchCode: 'DAU-20240603-C9D0', quantity: 8, remainingQuantity: 8, unit: 'kg', receivedDate: daysAgo(0), expiryDate: daysFromNow(5), storageLocation: 'Cold Storage A', status: 'SAFE' } }),
  ])

  console.log('✅ Inventory batches created')

  // ===== PURCHASE REQUESTS =====
  const pr1 = await prisma.purchaseRequest.create({
    data: {
      requestedById: warehouse.id,
      supplierId: suppliers[0].id,
      status: 'PENDING',
      notes: 'Stok bayam dan kangkung menipis',
      totalEstimatedPrice: 320000,
      items: {
        create: [
          { productId: products[0].id, quantity: 20, unit: 'kg', estimatedPrice: 8000 },
          { productId: products[1].id, quantity: 20, unit: 'kg', estimatedPrice: 6000 },
        ],
      },
    },
  })

  await prisma.purchaseRequest.create({
    data: {
      requestedById: warehouse.id,
      approvedById: admin.id,
      supplierId: suppliers[2].id,
      status: 'APPROVED',
      notes: 'Restock cabai untuk minggu depan',
      totalEstimatedPrice: 750000,
      approvedAt: daysAgo(1),
      items: {
        create: [
          { productId: products[4].id, quantity: 15, unit: 'kg', estimatedPrice: 30000 },
          { productId: products[5].id, quantity: 5, unit: 'kg', estimatedPrice: 35000 },
        ],
      },
    },
  })

  console.log('✅ Purchase requests created')

  // ===== SALES TRANSACTIONS =====
  const createSale = async (daysBack: number, items: { productId: string; batchId: string; qty: number; price: number }[], cashierId: string) => {
    const date = daysAgo(daysBack)
    const code = `TRX-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const total = items.reduce((sum, i) => sum + i.qty * i.price, 0)

    await prisma.salesTransaction.create({
      data: {
        cashierId,
        transactionCode: code,
        totalAmount: total,
        paymentMethod: Math.random() > 0.5 ? 'CASH' : 'TRANSFER',
        createdAt: date,
        items: {
          create: items.map(i => ({
            productId: i.productId,
            batchId: i.batchId,
            quantity: i.qty,
            price: i.price,
            subtotal: i.qty * i.price,
          })),
        },
      },
    })
  }

  // Create transactions for last 7 days
  await createSale(6, [{ productId: products[0].id, batchId: batches[0].id, qty: 3, price: 12000 }, { productId: products[6].id, batchId: batches[8].id, qty: 2, price: 14000 }], cashier.id)
  await createSale(5, [{ productId: products[2].id, batchId: batches[3].id, qty: 4, price: 15000 }, { productId: products[4].id, batchId: batches[5].id, qty: 2, price: 45000 }], cashier.id)
  await createSale(4, [{ productId: products[7].id, batchId: batches[10].id, qty: 5, price: 16000 }, { productId: products[1].id, batchId: batches[2].id, qty: 3, price: 10000 }], cashier.id)
  await createSale(3, [{ productId: products[0].id, batchId: batches[0].id, qty: 5, price: 12000 }, { productId: products[8].id, batchId: batches[11].id, qty: 2, price: 25000 }], cashier.id)
  await createSale(2, [{ productId: products[3].id, batchId: batches[4].id, qty: 2, price: 18000 }, { productId: products[10].id, batchId: batches[13].id, qty: 6, price: 8000 }], cashier.id)
  await createSale(1, [{ productId: products[6].id, batchId: batches[8].id, qty: 4, price: 14000 }, { productId: products[5].id, batchId: batches[7].id, qty: 1, price: 50000 }], cashier.id)
  await createSale(0, [{ productId: products[0].id, batchId: batches[1].id, qty: 2, price: 12000 }, { productId: products[4].id, batchId: batches[6].id, qty: 1, price: 45000 }], cashier.id)
  await createSale(0, [{ productId: products[2].id, batchId: batches[3].id, qty: 3, price: 15000 }, { productId: products[7].id, batchId: batches[10].id, qty: 2, price: 16000 }], cashier.id)

  console.log('✅ Sales transactions created')

  // ===== STOCK AUDIT =====
  const audit = await prisma.stockAudit.create({
    data: {
      auditDate: daysAgo(3),
      conductedBy: warehouse.id,
      status: 'COMPLETED',
      notes: 'Audit rutin mingguan',
      items: {
        create: [
          { productId: products[0].id, batchId: batches[0].id, systemQuantity: 10, physicalQuantity: 8, difference: -2, note: 'Kemungkinan rusak' },
          { productId: products[2].id, batchId: batches[3].id, systemQuantity: 25, physicalQuantity: 25, difference: 0 },
          { productId: products[4].id, batchId: batches[5].id, systemQuantity: 5, physicalQuantity: 3, difference: -2, note: 'Perlu investigasi' },
          { productId: products[6].id, batchId: batches[8].id, systemQuantity: 15, physicalQuantity: 15, difference: 0 },
          { productId: products[7].id, batchId: batches[10].id, systemQuantity: 18, physicalQuantity: 17, difference: -1, note: 'Selisih kecil' },
          { productId: products[10].id, batchId: batches[13].id, systemQuantity: 32, physicalQuantity: 32, difference: 0 },
        ],
      },
    },
  })

  // Schedule next audit
  await prisma.stockAudit.create({
    data: {
      auditDate: daysFromNow(4),
      conductedBy: warehouse.id,
      status: 'SCHEDULED',
      notes: 'Audit rutin mingguan berikutnya',
    },
  })

  console.log('✅ Stock audits created')

  // ===== NOTIFICATIONS =====
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: admin.id,
        title: 'Permintaan Pembelian Baru',
        message: 'Bu Sari mengajukan permintaan pembelian bayam dan kangkung.',
        type: 'PURCHASE_APPROVAL',
        actionUrl: '/dashboard/procurement',
      },
    }),
    prisma.notification.create({
      data: {
        userId: warehouse.id,
        title: 'Stok Bayam Menipis',
        message: 'Stok bayam batch BAY-20240601-A1B2 hanya tersisa 8 kg.',
        type: 'LOW_STOCK',
        actionUrl: '/dashboard/inventory',
      },
    }),
    prisma.notification.create({
      data: {
        userId: warehouse.id,
        title: 'Produk Hampir Kadaluarsa',
        message: 'Buncis batch BUN-20240601-Y5Z6 akan kadaluarsa dalam 2 hari!',
        type: 'EXPIRY_ALERT',
        actionUrl: '/dashboard/inventory',
      },
    }),
    prisma.notification.create({
      data: {
        userId: admin.id,
        title: 'Jadwal Audit',
        message: 'Stock opname dijadwalkan dalam 4 hari.',
        type: 'AUDIT_REMINDER',
        actionUrl: '/dashboard/stock-opname',
      },
    }),
    prisma.notification.create({
      data: {
        userId: cashier.id,
        title: 'Stok Kangkung Menipis',
        message: 'Sisa kangkung hanya 5 kg, stok di bawah minimum.',
        type: 'LOW_STOCK',
        actionUrl: '/dashboard/inventory',
      },
    }),
  ])

  console.log('✅ Notifications created')

  // ===== RFID TAGS =====
  const rfidTags = await Promise.all([
    prisma.rfidTag.create({ data: { tagCode: 'BAY-TAG-0001', status: 'ASSIGNED', currentBatchId: batches[0].id, lastScannedAt: daysAgo(4) } }),
    prisma.rfidTag.create({ data: { tagCode: 'BAY-TAG-0002', status: 'ASSIGNED', currentBatchId: batches[1].id, lastScannedAt: daysAgo(1) } }),
    prisma.rfidTag.create({ data: { tagCode: 'SAW-TAG-0001', status: 'ASSIGNED', currentBatchId: batches[3].id, lastScannedAt: daysAgo(2) } }),
    prisma.rfidTag.create({ data: { tagCode: 'WOR-TAG-0001', status: 'AVAILABLE', lastScannedAt: daysAgo(5) } }),
    prisma.rfidTag.create({ data: { tagCode: 'BAY-TAG-0003', status: 'AVAILABLE' } }),
    prisma.rfidTag.create({ data: { tagCode: 'BAY-TAG-0004', status: 'AVAILABLE' } }),
    prisma.rfidTag.create({ data: { tagCode: 'BAY-TAG-0005', status: 'AVAILABLE' } }),
    prisma.rfidTag.create({ data: { tagCode: 'TOM-TAG-0001', status: 'AVAILABLE' } }),
    prisma.rfidTag.create({ data: { tagCode: 'CBM-TAG-0001', status: 'ASSIGNED', currentBatchId: batches[5].id, lastScannedAt: daysAgo(5) } }),
    prisma.rfidTag.create({ data: { tagCode: 'KAN-TAG-0001', status: 'AVAILABLE' } }),
    prisma.rfidTag.create({ data: { tagCode: 'KAN-TAG-0002', status: 'AVAILABLE' } }),
    prisma.rfidTag.create({ data: { tagCode: 'KAN-TAG-0003', status: 'AVAILABLE' } }),
    prisma.rfidTag.create({ data: { tagCode: 'KAN-TAG-0004', status: 'AVAILABLE' } }),
    prisma.rfidTag.create({ data: { tagCode: 'KAN-TAG-0005', status: 'AVAILABLE' } }),
    prisma.rfidTag.create({ data: { tagCode: 'BRO-TAG-0001', status: 'DECOMMISSIONED' } }),
    prisma.rfidTag.create({ data: { tagCode: 'KOL-TAG-0001', status: 'AVAILABLE' } }),
  ])

  console.log('✅ RFID Tags created')

  // ===== RACKS =====
  const rackList = await Promise.all([
    prisma.rack.create({ data: { rackCode: 'RACK-01', zone: 'Cold Storage A', capacityCrates: 30 } }),
    prisma.rack.create({ data: { rackCode: 'RACK-02', zone: 'Cold Storage A', capacityCrates: 25 } }),
    prisma.rack.create({ data: { rackCode: 'RACK-03', zone: 'Cold Storage B', capacityCrates: 40 } }),
    prisma.rack.create({ data: { rackCode: 'RACK-04', zone: 'Cold Storage B', capacityCrates: 35 } }),
    prisma.rack.create({ data: { rackCode: 'RACK-05', zone: 'Cold Storage C', capacityCrates: 50 } }),
  ])

  console.log('✅ Racks created')

  // ===== BATCH LOCATIONS =====
  await Promise.all([
    prisma.batchLocation.create({ data: { batchId: batches[0].id, rackId: rackList[0].id, quantity: 8, placedAt: daysAgo(4) } }),
    prisma.batchLocation.create({ data: { batchId: batches[1].id, rackId: rackList[0].id, quantity: 18, placedAt: daysAgo(1) } }),
    prisma.batchLocation.create({ data: { batchId: batches[3].id, rackId: rackList[1].id, quantity: 22, placedAt: daysAgo(2) } }),
    prisma.batchLocation.create({ data: { batchId: batches[5].id, rackId: rackList[2].id, quantity: 3, placedAt: daysAgo(5) } }),
    prisma.batchLocation.create({ data: { batchId: batches[6].id, rackId: rackList[2].id, quantity: 15, placedAt: daysAgo(0) } }),
    prisma.batchLocation.create({ data: { batchId: batches[8].id, rackId: rackList[3].id, quantity: 12, placedAt: daysAgo(3) } }),
    prisma.batchLocation.create({ data: { batchId: batches[10].id, rackId: rackList[4].id, quantity: 15, placedAt: daysAgo(6) } }),
    prisma.batchLocation.create({ data: { batchId: batches[13].id, rackId: rackList[4].id, quantity: 28, placedAt: daysAgo(4) } }),
  ])

  console.log('✅ Batch Locations created')

  // ===== RECEIVING LOGS =====
  await Promise.all([
    prisma.receivingLog.create({ data: { rfidTagId: rfidTags[0].id, batchCode: 'BAY-20240601-A1B2', productName: 'Bayam', quantity: 25, action: 'SCAN_IN', note: 'Batch diterima dari Tani Makmur Lembang', createdAt: daysAgo(4) } }),
    prisma.receivingLog.create({ data: { rfidTagId: rfidTags[0].id, batchCode: 'BAY-20240601-A1B2', productName: 'Bayam', quantity: 25, action: 'PUTAWAY', note: 'Dialokasikan ke RACK-01', createdAt: daysAgo(4) } }),
    prisma.receivingLog.create({ data: { rfidTagId: rfidTags[1].id, batchCode: 'BAY-20240603-C3D4', productName: 'Bayam', quantity: 20, action: 'SCAN_IN', note: 'Batch diterima dari Tani Makmur Lembang', createdAt: daysAgo(1) } }),
    prisma.receivingLog.create({ data: { rfidTagId: rfidTags[1].id, batchCode: 'BAY-20240603-C3D4', productName: 'Bayam', quantity: 20, action: 'PUTAWAY', note: 'Dialokasikan ke RACK-01', createdAt: daysAgo(1) } }),
    prisma.receivingLog.create({ data: { rfidTagId: rfidTags[2].id, batchCode: 'SAW-20240601-G7H8', productName: 'Sawi Putih', quantity: 30, action: 'SCAN_IN', note: 'Batch diterima dari Tani Makmur Lembang', createdAt: daysAgo(2) } }),
    prisma.receivingLog.create({ data: { rfidTagId: rfidTags[2].id, batchCode: 'SAW-20240601-G7H8', productName: 'Sawi Putih', quantity: 30, action: 'PUTAWAY', note: 'Dialokasikan ke RACK-02', createdAt: daysAgo(2) } }),
    prisma.receivingLog.create({ data: { rfidTagId: rfidTags[6].id, batchCode: 'CAB-20240530-K1L2', productName: 'Cabai Merah', quantity: 20, action: 'SCAN_IN', note: 'Batch diterima dari UD Berkah Tani', createdAt: daysAgo(5) } }),
    prisma.receivingLog.create({ data: { rfidTagId: rfidTags[3].id, batchCode: 'WOR-20240528-U1V2', productName: 'Wortel', quantity: 30, action: 'SCAN_IN', note: 'Batch diterima dari PT Agro Nusantara', createdAt: daysAgo(6) } }),
    prisma.receivingLog.create({ data: { rfidTagId: rfidTags[3].id, batchCode: 'WOR-20240528-U1V2', productName: 'Wortel', quantity: 30, action: 'PUTAWAY', note: 'Dialokasikan ke RACK-05', createdAt: daysAgo(6) } }),
    prisma.receivingLog.create({ data: { rfidTagId: rfidTags[3].id, batchCode: 'WOR-20240528-U1V2', productName: 'Wortel', quantity: 0, action: 'RELEASE', note: 'Tag dilepas dan siap digunakan kembali', createdAt: daysAgo(5) } }),
  ])

  console.log('✅ Receiving Logs created')
  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
