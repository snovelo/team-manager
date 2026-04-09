'use client'

import { useEffect, useState } from 'react'

type Agent = { id: string; name: string }
type QAEntry = {
  id: string
  agentId: string
  agent: { name: string }
  month: string
  year: number
  reviewer: string
  score: number | null
  additionalQA: string | null
  notes: string | null
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const BLANK = { agentId: '', month: '', year: new Date().getFullYear(), reviewer: '', score: '', additionalQA: '', notes: '' }

export default function QAPage() {
  const [entries, setEntries] = useState<QAEntry[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<QAEntry | null>(null)
  const [form, setForm] = useState(BLANK)
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()))

  async function load() {
    const params = new URLSearchParams()
    if (filterMonth) params.set('month', filterMonth)
    if (filterYear) params.set('year', filterYear)
    const [qa, ag] = await Promise.all([
      fetch(`/api/qa?${params}`).then(r => r.json()),
      fetch('/api/agents').then(r => r.json()),
    ])
    setEntries(qa)
    setAgents(ag)
  }

  useEffect(() => { load() }, [filterMonth, filterYear])

  function openAdd() {
    setEditing(null)
    setForm(BLANK)
    setShowForm(true)
  }

  function openEdit(e: QAEntry) {
    setEditing(e)
    setForm({ agentId: e.agentId, month: e.month, year: e.year, reviewer: e.reviewer, score: String(e.score ?? ''), additionalQA: e.additionalQA ?? '', notes: e.notes ?? '' })
    setShowForm(true)
  }

  async function save() {
    const payload = { ...form, year: Number(form.year), score: form.score ? Number(form.score) : null }
    if (editing) {
      await fetch(`/api/qa/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } else {
      await fetch('/api/qa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    }
    setShowForm(false)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/qa/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">QA Tracking</h1>
        <button onClick={openAdd} className="btn-primary">+ Add Entry</button>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="input w-40">
          <option value="">All Months</option>
          {MONTHS.map(m => <option key={m}>{m}</option>)}
        </select>
        <input type="number" value={filterYear} onChange={e => setFilterYear(e.target.value)} className="input w-28" placeholder="Year" />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Agent', 'Month', 'Year', 'Reviewer', 'Score', 'Additional QA', 'Notes', ''].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No QA entries found.</td></tr>
            )}
            {entries.map(e => (
              <tr key={e.id} className="hover:bg-green-50">
                <td className="px-3 py-2 font-medium">{e.agent.name}</td>
                <td className="px-3 py-2 text-gray-600">{e.month}</td>
                <td className="px-3 py-2 text-gray-600">{e.year}</td>
                <td className="px-3 py-2 text-gray-600">{e.reviewer}</td>
                <td className="px-3 py-2 text-gray-600">{e.score ?? '—'}</td>
                <td className="px-3 py-2 text-gray-600">{e.additionalQA || '—'}</td>
                <td className="px-3 py-2 text-gray-600 max-w-xs truncate">{e.notes || '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button onClick={() => openEdit(e)} className="text-xs text-green-600 hover:underline mr-2">Edit</button>
                  <button onClick={() => remove(e.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit QA Entry' : 'Add QA Entry'}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Agent *</label>
                <select value={form.agentId} onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))} className="input">
                  <option value="">— Select Agent —</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Month</label>
                <select value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} className="input">
                  <option value="">— Select —</option>
                  {MONTHS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} className="input" />
              </div>
              <div>
                <label className="label">Reviewer</label>
                <input value={form.reviewer} onChange={e => setForm(f => ({ ...f, reviewer: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">Score</label>
                <input type="number" step="0.01" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} className="input" />
              </div>
              <div className="col-span-2">
                <label className="label">Additional QA</label>
                <input value={form.additionalQA} onChange={e => setForm(f => ({ ...f, additionalQA: e.target.value }))} className="input" />
              </div>
              <div className="col-span-2">
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
