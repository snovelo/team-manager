import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const agentId = new URL(req.url).searchParams.get('agentId')
  const callouts = await prisma.callout.findMany({
    where: agentId ? { agentId } : {},
    include: { agent: { select: { name: true } } },
    orderBy: { date: 'desc' },
  })
  return Response.json(callouts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const callout = await prisma.callout.create({ data: body })
  return Response.json(callout, { status: 201 })
}
