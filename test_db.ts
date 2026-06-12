import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const prs = await prisma.purchaseRequest.findMany({
    include: { requestedBy: true, approvedBy: true, supplier: true, items: true }
  })
  console.log(JSON.stringify(prs, null, 2))
}
main()
