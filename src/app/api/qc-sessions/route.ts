import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Create new QC Session
    const qcSession = await prisma.qcSession.create({
      data: {
        qcSessionId: body.qcSessionId,
        skuId: body.skuId,
        skuName: body.skuName,
        supplierId: body.supplierId,
        supplierName: body.supplierName,
        freshnessScore: body.freshnessScore,
        freshnessStatus: body.freshnessStatus,
        confidenceScore: body.confidenceScore,
        aiRecommendation: body.aiRecommendation,
        staffDecision: body.staffDecision,
        status: body.status || 'APPROVED_FOR_RECEIVING',
        imageEvidenceUrl: body.imageEvidenceUrl,
        notes: body.notes,
        checkedAt: body.checkedAt ? new Date(body.checkedAt) : new Date(),
        checkedBy: body.checkedBy || 'System',
      }
    })

    return NextResponse.json({ success: true, qcSession })
  } catch (error: any) {
    console.error('Error creating QC Session:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const whereClause: any = {}
    if (status) {
      whereClause.status = status
    }

    // Only get QC Sessions that haven't been linked to a batch yet
    whereClause.inventoryBatch = {
      is: null
    }

    const sessions = await prisma.qcSession.findMany({
      where: whereClause,
      orderBy: { checkedAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ success: true, sessions })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
