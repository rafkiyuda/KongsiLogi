import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id')

    const notifications = await prisma.notification.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ error: 'Gagal memuat notifikasi' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, action } = body

    if (action === 'read') {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      })
    }

    if (action === 'read-all') {
      const userId = request.headers.get('x-user-id')
      if (userId) {
        await prisma.notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification update error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui notifikasi' }, { status: 500 })
  }
}
