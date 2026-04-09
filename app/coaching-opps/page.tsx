'use client'

import { useEffect, useState } from 'react'

type Agent = { id: string; name: string }
type Opp = { id: string; agentId: string; agent: { name: string }; caseNumber: string; date: string | null; notes: string | null }

const BLANK = { agentId: '', caseNumber: '', date: '', notes: '' }

export default function CoachingOppsPage() {
  const [opps, setOpps] = useState<Opp[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Opp | null>(null)
  const [form, setForm] = useState(BLANK)
  const [filterAgent, setFilterAgent] = useState('')

  async function load() {
    const params = filterAgent ? `?agentId=${filterAgent}` : ''
    const [data, ag] = await Promise.all([
      fetch(`/api/coaching-opps${params}`).then(r => r.json()),
      fetch('/api/agents').then(r => r.json()),
    ])
    setOpps(data)
    setAgents(ag)
  }

  useEffect(() => { load() }, [filterAgent])

  function openAdd() { setEditing(null); setForm(BLANK); setShowForm(true) }
  function openEdit(o: Opp) {
    setEditing(o)
    setForm({ agentId: o.agentId, caseNumber: o.caseNumber, date: o.date ?? '', notes: o.notes ?? '' })
    setShowForm(true)
  }

  async function save() {
    if (!form.agentId || !form.caseNumber.trim()) return
    if (editing) {
      await fetch(`/api/coaching-opps/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/coaching-opps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setShowForm(false)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/coaching-opps/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coaching Opps</h1>
        <button onClick={openAdd} className="btn-primary">+ Add Opp</button>
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
              {['Agent', 'Case Number', 'Date', 'Notes', ''].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {opps.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No coaching opps found.</td></tr>
            )}
            {opps.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium">{o.agent.name}</td>
                <td className="px-3 py-2 text-gray-600 font-mono">{o.caseNumber}</td>
                <td className="px-3 py-2 text-gray-600">{o.date || '—'}</td>
                <td className="px-3 py-2 text-gray-600 max-w-sm truncate">{o.notes || '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button onClick={() => openEdit(o)} className="text-xs text-indigo-600 hover:underline mr-2">Edit</button>
                  <button onClick={() => remove(o.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Coaching Opp' : 'Add Coaching Opp'}</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Agent *</label>
                <select value={form.agentId} onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))} className="input">
                  <option value="">— Select Agent —</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Case Number *</label>
                <input value={form.caseNumber} onChange={e => setForm(f => ({ ...f, caseNumber: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">Date</label>
                <input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" placeholder="e.g. 4/8/26" />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input h-20 resize-none" />
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
