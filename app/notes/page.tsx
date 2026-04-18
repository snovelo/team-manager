'use client'

import { useEffect, useState } from 'react'

type Agent = { id: string; name: string }
type Note = { id: string; agentId: string; agent: { name: string }; note: string; date: string | null; createdBy: string | null; createdAt: string }

const BLANK = { agentId: '', note: '', date: '', createdBy: '' }

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)
  const [form, setForm] = useState(BLANK)
  const [filterAgent, setFilterAgent] = useState('')

  async function load() {
    const params = filterAgent ? `?agentId=${filterAgent}` : ''
    const [data, ag] = await Promise.all([
      fetch(`/api/notes${params}`).then(r => r.json()),
      fetch('/api/agents').then(r => r.json()),
    ])
    setNotes(data)
    setAgents(ag)
  }

  useEffect(() => { load() }, [filterAgent])

  function openAdd() { setEditing(null); setForm(BLANK); setShowForm(true) }
  function openEdit(n: Note) {
    setEditing(n)
    setForm({ agentId: n.agentId, note: n.note, date: n.date ?? '', createdBy: n.createdBy ?? '' })
    setShowForm(true)
  }

  async function save() {
    if (!form.agentId || !form.note.trim()) return
    if (editing) {
      await fetch(`/api/notes/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setShowForm(false)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this note?')) return
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ad-Hoc Notes</h1>
        <button onClick={openAdd} className="btn-primary">+ Add Note</button>
      </div>

      <div className="mb-4">
        <select value={filterAgent} onChange={e => setFilterAgent(e.target.value)} className="input w-52">
          <option value="">All Agents</option>
          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {notes.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-lg border border-gray-200">No notes found.</div>
        )}
        {notes.map(n => (
          <div key={n.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900">{n.agent.name}</span>
                  {n.date && <span className="text-xs text-gray-400">{n.date}</span>}
                  {n.createdBy && <span className="text-xs text-gray-400">· by {n.createdBy}</span>}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.note}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(n)} className="text-xs text-green-800 hover:underline">Edit</button>
                <button onClick={() => remove(n.id)} className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Note' : 'Add Note'}</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Agent *</label>
                <select value={form.agentId} onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))} className="input">
                  <option value="">— Select Agent —</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Note *</label>
                <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="input h-28 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" placeholder="e.g. 4/8/26" />
                </div>
                <div>
                  <label className="label">Created By</label>
                  <input value={form.createdBy} onChange={e => setForm(f => ({ ...f, createdBy: e.target.value }))} className="input" />
                </div>
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
