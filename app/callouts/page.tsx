'use client'

import { useEffect, useState } from 'react'

type Agent = { id: string; name: string }
type Callout = { id: string; agentId: string; agent: { name: string }; date: string; dayOfWeek: string | null; type: string; note: string | null; recordedBy: string | null }

const TYPES = [
  'Same Day Call-Out',
  'One Day Notice Sick Call Out',
  'No Call No Show',
  'Late Arrival',
  'Early Departure',
  'Unplanned Absence',
  'Other',
]
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const BLANK = { agentId: '', date: '', dayOfWeek: '', type: '', note: '', recordedBy: '' }

export default function CalloutsPage() {
  const [callouts, setCallouts] = useState<Callout[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Callout | null>(null)
  const [form, setForm] = useState(BLANK)
  const [filterAgent, setFilterAgent] = useState('')

  async function load() {
    const params = filterAgent ? `?agentId=${filterAgent}` : ''
    const [data, ag] = await Promise.all([
      fetch(`/api/callouts${params}`).then(r => r.json()),
      fetch('/api/agents').then(r => r.json()),
    ])
    setCallouts(data)
    setAgents(ag)
  }

  useEffect(() => { load() }, [filterAgent])

  function openAdd() { setEditing(null); setForm(BLANK); setShowForm(true) }
  function openEdit(c: Callout) {
    setEditing(c)
    setForm({ agentId: c.agentId, date: c.date, dayOfWeek: c.dayOfWeek ?? '', type: c.type, note: c.note ?? '', recordedBy: c.recordedBy ?? '' })
    setShowForm(true)
  }

  async function save() {
    if (!form.agentId || !form.date || !form.type) return
    if (editing) {
      await fetch(`/api/callouts/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/callouts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setShowForm(false)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/callouts/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Call Outs / Time Reporting</h1>
        <button onClick={openAdd} className="btn-primary">+ Add Entry</button>
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
              {['Agent', 'Date', 'Day', 'Type', 'Note', 'Recorded By', ''].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {callouts.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No callout entries found.</td></tr>
            )}
            {callouts.map(c => (
              <tr key={c.id} className="hover:bg-green-50/40">
                <td className="px-3 py-2 font-medium whitespace-nowrap">{c.agent.name}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{c.date}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{c.dayOfWeek || '—'}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{c.type}</td>
                <td className="px-3 py-2 text-gray-600 max-w-xs truncate">{c.note || '—'}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{c.recordedBy || '—'}</td>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Entry' : 'Add Call Out / Occurrence'}</h2>
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
                  <label className="label">Date *</label>
                  <input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" placeholder="e.g. 4/8/26" />
                </div>
                <div>
                  <label className="label">Day of Week</label>
                  <select value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: e.target.value }))} className="input">
                    <option value="">— Select —</option>
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Type *</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input">
                  <option value="">— Select —</option>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Note</label>
                <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">Recorded By</label>
                <input value={form.recordedBy} onChange={e => setForm(f => ({ ...f, recordedBy: e.target.value }))} className="input" />
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
