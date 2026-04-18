import { SignJWT } from 'jose'
import { NextRequest } from 'next/server'

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!)

export async function POST(req: NextRequest) {
  const { pin } = await req.json()

  if (!pin || pin !== process.env.APP_PIN) {
    return Response.json({ error: 'Invalid PIN' }, { status: 401 })
  }

  const token = await new SignJWT({ auth: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  const res = Response.json({ ok: true })
  res.headers.set(
    'Set-Cookie',
    `session=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict`
  )
  return res
}
