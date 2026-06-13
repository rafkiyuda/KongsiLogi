import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const codes = ['0008461465', '0008634628']
  await prisma.rfidTag.updateMany({
    where: { tagCode: { in: codes } },
    data: { status: 'AVAILABLE', currentBatchId: null }
  })
  
  const batch = await prisma.inventoryBatch.findFirst({
    where: { batchCode: 'BATCH-TOMAT-01' }
  })
  if (batch) {
    await prisma.inventoryBatch.delete({ where: { id: batch.id } })
  }
  console.log('Reset tags to AVAILABLE')
}
main().then(() => prisma.$disconnect()).catch(console.error)
