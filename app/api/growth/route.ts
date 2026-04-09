import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const agentId = new URL(req.url).searchParams.get('agentId')
  const convos = await prisma.growthConvo.findMany({
    where: agentId ? { agentId } : {},
    include: { agent: { select: { name: true } } },
    orderBy: [{ year: 'desc' }, { quarter: 'asc' }],
  })
  return Response.json(convos)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const convo = await prisma.growthConvo.create({ data: body })
  return Response.json(convo, { status: 201 })
}
