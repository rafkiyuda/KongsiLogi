import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const tomat = await prisma.product.findFirst({ where: { name: 'Tomat' } })
  console.log('Tomat:', tomat)
  if (tomat) {
    let batch = await prisma.inventoryBatch.findFirst({ where: { productId: tomat.id } })
    if (!batch) {
      batch = await prisma.inventoryBatch.create({
        data: {
          productId: tomat.id,
          batchCode: 'BATCH-TOMAT-01',
          quantity: 100,
          remainingQuantity: 100,
          unit: 'kg',
          receivedDate: new Date(),
          expiryDate: new Date(Date.now() + 7*24*60*60*1000)
        }
      })
      console.log('Created batch:', batch)
    } else {
      console.log('Found batch:', batch)
    }

    // Now insert the RFID tags
    const tags = ['0008461465', '0008634628']
    for (const code of tags) {
      const existing = await prisma.rfidTag.findUnique({ where: { tagCode: code } })
      if (!existing) {
        await prisma.rfidTag.create({
          data: {
            tagCode: code,
            status: 'ASSIGNED',
            currentBatchId: batch.id
          }
        })
        console.log(`Created RFID ${code}`)
      } else {
        await prisma.rfidTag.update({
          where: { tagCode: code },
          data: {
            status: 'ASSIGNED',
            currentBatchId: batch.id
          }
        })
        console.log(`Updated RFID ${code}`)
      }
    }
  }
}
main().then(() => prisma.$disconnect()).catch(console.error)
