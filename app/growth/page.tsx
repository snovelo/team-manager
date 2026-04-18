'use client'

import { useEffect, useState } from 'react'

type Agent = { id: string; name: string }
type GrowthConvo = {
  id: string; agentId: string; agent: { name: string }
  quarter: string; year: number; rating: string | null; bonusAdjWarning: string | null
  review: string | null; deliveredViaLattice: boolean; dateAccepted: string | null; dateDelivered: string | null
}

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']
const RATINGS = ['High Impact', 'On Track', 'Needs Improvement', 'At Risk']
const BLANK = { agentId: '', quarter: '', year: new Date().getFullYear(), rating: '', bonusAdjWarning: '', review: '', deliveredViaLattice: false, dateAccepted: '', dateDelivered: '' }

export default function GrowthPage() {
  const [convos, setConvos] = useState<GrowthConvo[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<GrowthConvo | null>(null)
  const [form, setForm] = useState(BLANK)
  const [filterAgent, setFilterAgent] = useState('')

  async function load() {
    const params = filterAgent ? `?agentId=${filterAgent}` : ''
    const [data, ag] = await Promise.all([
      fetch(`/api/growth${params}`).then(r => r.json()),
      fetch('/api/agents').then(r => r.json()),
    ])
    setConvos(data)
    setAgents(ag)
  }

  useEffect(() => { load() }, [filterAgent])

  function openAdd() { setEditing(null); setForm(BLANK); setShowForm(true) }
  function openEdit(c: GrowthConvo) {
    setEditing(c)
    setForm({ agentId: c.agentId, quarter: c.quarter, year: c.year, rating: c.rating ?? '', bonusAdjWarning: c.bonusAdjWarning ?? '', review: c.review ?? '', deliveredViaLattice: c.deliveredViaLattice, dateAccepted: c.dateAccepted ?? '', dateDelivered: c.dateDelivered ?? '' })
    setShowForm(true)
  }

  async function save() {
    if (!form.agentId || !form.quarter) return
    const payload = { ...form, year: Number(form.year) }
    if (editing) {
      await fetch(`/api/growth/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } else {
      await fetch('/api/growth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    }
    setShowForm(false)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/growth/${id}`, { method: 'DELETE' })
    load()
  }

  const RATING_COLORS: Record<string, string> = {
    'High Impact': 'bg-green-100 text-green-800',
    'On Track': 'bg-blue-100 text-blue-800',
    'Needs Improvement': 'bg-yellow-100 text-yellow-800',
    'At Risk': 'bg-red-100 text-red-800',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Growth Conversations</h1>
        <button onClick={openAdd} className="btn-primary">+ Add Convo</button>
      </div>

      <div className="mb-4">
        <select value={filterAgent} onChange={e => setFilterAgent(e.target.value)} className="input w-52">
          <option value="">All Agents</option>
          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Agent', 'Quarter', 'Year', 'Rating', 'Bonus/Warning', 'Lattice', 'Date Accepted', 'Date Delivered', 'Review', ''].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {convos.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No growth convos found.</td></tr>
            )}
            {convos.map(c => (
              <tr key={c.id} className="hover:bg-green-50/40">
                <td className="px-3 py-2 font-medium whitespace-nowrap">{c.agent.name}</td>
                <td className="px-3 py-2 text-gray-600">{c.quarter}</td>
                <td className="px-3 py-2 text-gray-600">{c.year}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {c.rating ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RATING_COLORS[c.rating] || 'bg-gray-100 text-gray-700'}`}>{c.rating}</span> : '—'}
                </td>
                <td className="px-3 py-2 text-gray-600">{c.bonusAdjWarning || '—'}</td>
                <td className="px-3 py-2 text-gray-600">{c.deliveredViaLattice ? '✓' : '—'}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{c.dateAccepted || '—'}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{c.dateDelivered || '—'}</td>
                <td className="px-3 py-2 text-gray-500 max-w-xs truncate text-xs">{c.review ? c.review.slice(0, 80) + (c.review.length > 80 ? '...' : '') : '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button onClick={() => openEdit(c)} className="text-xs text-green-800 hover:underline mr-2">Edit</button>
                  <button onClick={() => remove(c.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Growth Convo' : 'Add Growth Convo'}</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Agent *</label>
                <select value={form.agentId} onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))} className="input">
                  <option value="">— Select Agent —</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Quarter *</label>
                  <select value={form.quarter} onChange={e => setForm(f => ({ ...f, quarter: e.target.value }))} className="input">
                    <option value="">— Select —</option>
                    {QUARTERS.map(q => <option key={q}>{q}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Year</label>
                  <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Rating</label>
                <select value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className="input">
                  <option value="">— Select —</option>
                  {RATINGS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Bonus Adj / Warning</label>
                <input value={form.bonusAdjWarning} onChange={e => setForm(f => ({ ...f, bonusAdjWarning: e.target.value }))} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date Accepted</label>
                  <input value={form.dateAccepted} onChange={e => setForm(f => ({ ...f, dateAccepted: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="label">Date Delivered</label>
                  <input value={form.dateDelivered} onChange={e => setForm(f => ({ ...f, dateDelivered: e.target.value }))} className="input" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="lattice" checked={form.deliveredViaLattice} onChange={e => setForm(f => ({ ...f, deliveredViaLattice: e.target.checked }))} className="rounded" />
                <label htmlFor="lattice" className="text-sm text-gray-700">Delivered via Lattice</label>
              </div>
              <div>
                <label className="label">Review Notes</label>
                <textarea value={form.review} onChange={e => setForm(f => ({ ...f, review: e.target.value }))} className="input h-28 resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={save} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
