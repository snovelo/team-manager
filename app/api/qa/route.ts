import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('agentId')
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  const entries = await prisma.qAEntry.findMany({
    where: {
      ...(agentId ? { agentId } : {}),
      ...(month ? { month } : {}),
      ...(year ? { year: parseInt(year) } : {}),
    },
    include: { agent: { select: { name: true } } },
    orderBy: [{ year: 'desc' }, { agentId: 'asc' }],
  })
  return Response.json(entries)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entry = await prisma.qAEntry.create({ data: body })
  return Response.json(entry, { status: 201 })
}
