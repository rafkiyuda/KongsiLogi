import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Today's sales
    const todaySales = await prisma.salesTransaction.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow } },
      _sum: { totalAmount: true },
      _count: true,
    })

    // Total active stock
    const totalStock = await prisma.inventoryBatch.aggregate({
      where: { status: { not: 'EXPIRED' }, remainingQuantity: { gt: 0 } },
      _sum: { remainingQuantity: true },
    })

    // Low stock products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        inventoryBatches: {
          where: { status: { not: 'EXPIRED' }, remainingQuantity: { gt: 0 } },
        },
      },
    })

    const lowStockProducts = products.filter(p => {
      const totalRemaining = p.inventoryBatches.reduce((sum, b) => sum + b.remainingQuantity, 0)
      return totalRemaining <= p.minimumStock && totalRemaining > 0
    }).map(p => ({
      id: p.id,
      name: p.name,
      remaining: p.inventoryBatches.reduce((sum, b) => sum + b.remainingQuantity, 0),
      minimum: p.minimumStock,
      unit: p.unit,
    }))

    const outOfStockProducts = products.filter(p => {
      const totalRemaining = p.inventoryBatches.reduce((sum, b) => sum + b.remainingQuantity, 0)
      return totalRemaining <= 0
    }).map(p => ({
      id: p.id,
      name: p.name,
      unit: p.unit,
    }))

    // Near expiry batches (within 3 days)
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    const nearExpiryBatches = await prisma.inventoryBatch.findMany({
      where: {
        expiryDate: { lte: threeDaysFromNow },
        status: { not: 'EXPIRED' },
        remainingQuantity: { gt: 0 },
      },
      include: { product: true },
      orderBy: { expiryDate: 'asc' },
      take: 10,
    })

    // Pending purchase requests
    const pendingPR = await prisma.purchaseRequest.count({
      where: { status: 'PENDING' },
    })

    // Cold storage capacity
    const coldStorageUsed = await prisma.inventoryBatch.aggregate({
      where: { remainingQuantity: { gt: 0 }, status: { not: 'EXPIRED' } },
      _sum: { remainingQuantity: true },
    })

    // Next audit
    const nextAudit = await prisma.stockAudit.findFirst({
      where: { status: 'SCHEDULED' },
      orderBy: { auditDate: 'asc' },
    })

    // Unread notifications count
    const unreadNotifications = await prisma.notification.count({
      where: { isRead: false },
    })

    // Last 7 days sales for chart
    const salesChart = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dailySales = await prisma.salesTransaction.aggregate({
        where: { createdAt: { gte: date, lt: nextDate } },
        _sum: { totalAmount: true },
        _count: true,
      })

      salesChart.push({
        date: date.toISOString().split('T')[0],
        label: new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric' }).format(date),
        total: dailySales._sum.totalAmount || 0,
        count: dailySales._count,
      })
    }

    // Recent transactions
    const recentTransactions = await prisma.salesTransaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { cashier: { select: { name: true } } },
    })

    return NextResponse.json({
      todaySales: {
        total: todaySales._sum.totalAmount || 0,
        count: todaySales._count,
      },
      totalStock: totalStock._sum.remainingQuantity || 0,
      lowStockProducts,
      outOfStockProducts,
      nearExpiryBatches: nearExpiryBatches.map(b => ({
        id: b.id,
        productName: b.product.name,
        batchCode: b.batchCode,
        remainingQuantity: b.remainingQuantity,
        expiryDate: b.expiryDate,
        daysLeft: Math.ceil((b.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        unit: b.unit,
      })),
      pendingPurchaseRequests: pendingPR,
      coldStorage: {
        used: coldStorageUsed._sum.remainingQuantity || 0,
        capacity: 1000,
        percentage: Math.round(((coldStorageUsed._sum.remainingQuantity || 0) / 1000) * 100),
      },
      nextAudit: nextAudit ? {
        id: nextAudit.id,
        date: nextAudit.auditDate,
      } : null,
      unreadNotifications,
      salesChart,
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        code: t.transactionCode,
        total: t.totalAmount,
        cashier: t.cashier.name,
        createdAt: t.createdAt,
      })),
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Gagal memuat data dashboard' },
      { status: 500 }
    )
  }
}
