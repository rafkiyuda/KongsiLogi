import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating user avatars...')

  await prisma.user.updateMany({
    where: { email: 'admin@kongsil.co' },
    data: { avatarUrl: 'https://i.pravatar.cc/150?img=11' }, // Pak Hendra (man)
  })

  await prisma.user.updateMany({
    where: { email: 'gudang@kongsil.co' },
    data: { avatarUrl: 'https://i.pravatar.cc/150?img=5' }, // Bu Sari (woman)
  })

  await prisma.user.updateMany({
    where: { email: 'kasir@kongsil.co' },
    data: { avatarUrl: 'https://i.pravatar.cc/150?img=8' }, // Mas Dedi (man)
  })

  await prisma.user.updateMany({
    where: { email: 'viewer@kongsil.co' },
    data: { avatarUrl: 'https://i.pravatar.cc/150?img=9' }, // Ibu Dewi (woman)
  })

  console.log('✅ Avatars updated successfully')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
