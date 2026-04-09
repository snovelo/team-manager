import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const agentId = new URL(req.url).searchParams.get('agentId')
  const opps = await prisma.coachingOpp.findMany({
    where: agentId ? { agentId } : {},
    include: { agent: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(opps)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const opp = await prisma.coachingOpp.create({ data: body })
  return Response.json(opp, { status: 201 })
}
