import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const entry = await prisma.qAEntry.update({ where: { id }, data: body })
  return Response.json(entry)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.qAEntry.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
