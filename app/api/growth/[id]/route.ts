import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const convo = await prisma.growthConvo.update({ where: { id }, data: body })
  return Response.json(convo)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.growthConvo.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
