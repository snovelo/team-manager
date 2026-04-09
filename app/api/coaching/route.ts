import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const agentId = new URL(req.url).searchParams.get('agentId')
  const notes = await prisma.coachingNote.findMany({
    where: agentId ? { agentId } : {},
    include: { agent: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(notes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const note = await prisma.coachingNote.create({ data: body })
  return Response.json(note, { status: 201 })
}
