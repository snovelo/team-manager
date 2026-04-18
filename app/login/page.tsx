'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    setLoading(false)
    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Incorrect PIN. Try again.')
      setPin('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f2f5f2' }}>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-10 w-full max-w-xs text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-4"
          style={{ backgroundColor: '#3a7d44' }}
        >
          TN
        </div>
        <h1 className="text-base font-semibold text-gray-700 mb-1">Team Novelo Dashboard</h1>
        <p className="text-xs text-gray-400 mb-6">Enter your PIN to continue</p>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={12}
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="input text-center tracking-widest text-lg"
            placeholder="••••"
            autoFocus
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || !pin}
            className="btn-primary w-full"
          >
            {loading ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  )
}
