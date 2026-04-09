import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET() {
  const agents = await prisma.agent.findMany({
    orderBy: { name: 'asc' },
  })
  return Response.json(agents)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const agent = await prisma.agent.create({ data: body })
  return Response.json(agent, { status: 201 })
}
