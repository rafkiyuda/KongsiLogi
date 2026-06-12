import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const purchaseRequests = await prisma.purchaseRequest.findMany({
    include: {
      requestedBy: { select: { name: true } },
      approvedBy: { select: { name: true } },
      supplier: { select: { name: true } },
      items: { include: { product: { select: { name: true, unit: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
  console.log(JSON.stringify(purchaseRequests, null, 2))
}
main()
