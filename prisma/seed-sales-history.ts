import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed 90 days of realistic sales history WITHOUT deleting existing data.
 * This script is additive-only.
 *
 * Characteristics of generated data:
 * - Weekend sales ~30% higher than weekday
 * - Each product has a "popularity weight" to reflect realistic demand
 * - 1-4 items per transaction
 * - Random cashier assignment from existing users
 * - Batch assignment uses existing batches (FIFO style)
 */
async function main() {
  console.log('📊 Seeding 90 days of sales history...')

  // Fetch existing data we need
  const cashiers = await prisma.user.findMany({
    where: { role: { in: ['CASHIER', 'ADMIN'] } },
    select: { id: true },
  })
  if (cashiers.length === 0) {
    console.error('❌ No cashier/admin users found. Run main seed first.')
    return
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, sellingPrice: true, unit: true },
  })
  if (products.length === 0) {
    console.error('❌ No products found. Run main seed first.')
    return
  }

  // Get all batches for FIFO assignment
  const batches = await prisma.inventoryBatch.findMany({
    select: { id: true, productId: true },
  })
  const batchByProduct = new Map<string, string[]>()
  for (const b of batches) {
    if (!batchByProduct.has(b.productId)) batchByProduct.set(b.productId, [])
    batchByProduct.get(b.productId)!.push(b.id)
  }

  // Popularity weights — higher = more popular
  const popularityMap: Record<string, number> = {
    'Bayam': 8, 'Kangkung': 7, 'Sawi Putih': 5, 'Selada': 4,
    'Cabai Merah': 9, 'Cabai Rawit': 6, 'Tomat': 10, 'Wortel': 5,
    'Brokoli': 3, 'Buncis': 4, 'Kol': 6, 'Daun Bawang': 5,
  }

  const now = new Date()
  let totalTransactions = 0
  let totalItems = 0

  for (let daysBack = 90; daysBack >= 1; daysBack--) {
    const date = new Date(now)
    date.setDate(date.getDate() - daysBack)
    date.setHours(7, 0, 0, 0) // Start at 7am

    const dayOfWeek = date.getDay() // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Number of transactions this day (8-15 weekday, 12-20 weekend)
    const baseTransactions = isWeekend ? 12 : 8
    const maxExtra = isWeekend ? 8 : 7
    const numTransactions = baseTransactions + Math.floor(Math.random() * maxExtra)

    for (let t = 0; t < numTransactions; t++) {
      // Random time during business hours (7am - 8pm)
      const txDate = new Date(date)
      txDate.setHours(7 + Math.floor(Math.random() * 13))
      txDate.setMinutes(Math.floor(Math.random() * 60))
      txDate.setSeconds(Math.floor(Math.random() * 60))

      // Pick 1-4 random products, weighted by popularity
      const numItems = 1 + Math.floor(Math.random() * 4)
      const shuffled = [...products].sort(() => Math.random() - 0.5)

      // Weighted selection
      const selectedProducts: typeof products = []
      for (const p of shuffled) {
        if (selectedProducts.length >= numItems) break
        const weight = popularityMap[p.name] || 3
        if (Math.random() < weight / 12) {
          selectedProducts.push(p)
        }
      }
      // Ensure at least 1 product
      if (selectedProducts.length === 0) {
        selectedProducts.push(shuffled[0])
      }

      const items = selectedProducts.map(p => {
        const batchIds = batchByProduct.get(p.id)
        const batchId = batchIds ? batchIds[Math.floor(Math.random() * batchIds.length)] : null

        // Quantity: 1-5 for most, 1-3 for expensive items
        const maxQty = p.sellingPrice > 30000 ? 3 : 5
        const quantity = 1 + Math.floor(Math.random() * maxQty)

        return {
          productId: p.id,
          batchId: batchId!,
          quantity,
          price: p.sellingPrice,
          subtotal: quantity * p.sellingPrice,
        }
      }).filter(i => i.batchId) // Only include items with valid batches

      if (items.length === 0) continue

      const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0)
      const cashier = cashiers[Math.floor(Math.random() * cashiers.length)]
      const paymentMethod = Math.random() > 0.6 ? 'CASH' : Math.random() > 0.5 ? 'TRANSFER' : 'QRIS'

      const dateStr = `${txDate.getFullYear()}${String(txDate.getMonth() + 1).padStart(2, '0')}${String(txDate.getDate()).padStart(2, '0')}`
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
      const transactionCode = `TRX-${dateStr}-${randomSuffix}`

      try {
        await prisma.salesTransaction.create({
          data: {
            cashierId: cashier.id,
            transactionCode,
            totalAmount,
            paymentMethod: paymentMethod as any,
            createdAt: txDate,
            items: { create: items },
          },
        })
        totalTransactions++
        totalItems += items.length
      } catch (e) {
        // Skip duplicate transaction codes
        continue
      }
    }

    if (daysBack % 10 === 0) {
      console.log(`  📅 Processed day -${daysBack}...`)
    }
  }

  console.log(`✅ Seeded ${totalTransactions} transactions with ${totalItems} items over 90 days!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
