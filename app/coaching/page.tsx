'use client'

import { useEffect, useState } from 'react'

type Agent = { id: string; name: string }
type CoachingNote = {
  id: string
  agentId: string
  agent: { name: string }
  content: string
  tags: string
  createdBy: string | null
  createdAt: string
}

type NoteTag = 'performance' | 'attendance' | 'quality' | 'productivity' | 'customer_sentiment' | 'follow_up' | 'recognition'

const ALL_TAGS: { value: NoteTag; label: string; color: string }[] = [
  { value: 'performance', label: 'Performance', color: 'bg-blue-100 text-blue-800' },
  { value: 'attendance', label: 'Attendance', color: 'bg-orange-100 text-orange-800' },
  { value: 'quality', label: 'Quality', color: 'bg-purple-100 text-purple-800' },
  { value: 'productivity', label: 'Productivity', color: 'bg-green-100 text-green-800' },
  { value: 'customer_sentiment', label: 'Customer Sentiment', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'follow_up', label: 'Follow-Up', color: 'bg-red-100 text-red-800' },
  { value: 'recognition', label: 'Recognition', color: 'bg-emerald-100 text-emerald-800' },
]

const BLANK = { agentId: '', content: '', tags: [] as NoteTag[], createdBy: '' }

function tagColor(tag: string) {
  return ALL_TAGS.find(t => t.value === tag)?.color || 'bg-gray-100 text-gray-700'
}
function tagLabel(tag: string) {
  return ALL_TAGS.find(t => t.value === tag)?.label || tag
}

export default function CoachingPage() {
  const [notes, setNotes] = useState<CoachingNote[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CoachingNote | null>(null)
  const [form, setForm] = useState(BLANK)
  const [filterAgent, setFilterAgent] = useState('')
  const [filterTag, setFilterTag] = useState('')

  async function load() {
    const params = filterAgent ? `?agentId=${filterAgent}` : ''
    const [data, ag] = await Promise.all([
      fetch(`/api/coaching${params}`).then(r => r.json()),
      fetch('/api/agents').then(r => r.json()),
    ])
    setNotes(data)
    setAgents(ag)
  }

  useEffect(() => { load() }, [filterAgent])

  function openAdd() { setEditing(null); setForm(BLANK); setShowForm(true) }
  function openEdit(n: CoachingNote) {
    setEditing(n)
    setForm({ agentId: n.agentId, content: n.content, tags: JSON.parse(n.tags) as NoteTag[], createdBy: n.createdBy ?? '' })
    setShowForm(true)
  }

  function toggleTag(tag: NoteTag) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))
  }

  async function save() {
    if (!form.agentId || !form.content.trim()) return
    const payload = { ...form, tags: JSON.stringify(form.tags) }
    if (editing) {
      await fetch(`/api/coaching/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } else {
      await fetch('/api/coaching', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    }
    setShowForm(false)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this coaching note?')) return
    await fetch(`/api/coaching/${id}`, { method: 'DELETE' })
    load()
  }

  const displayed = filterTag
    ? notes.filter(n => (JSON.parse(n.tags) as string[]).includes(filterTag))
    : notes

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">1:1 Coaching Notes</h1>
        <button onClick={openAdd} className="btn-primary">+ Add Note</button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <select value={filterAgent} onChange={e => setFilterAgent(e.target.value)} className="input w-52">
          <option value="">All Agents</option>
          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="input w-48">
          <option value="">All Tags</option>
          {ALL_TAGS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {displayed.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-lg border border-gray-200">No coaching notes found.</div>
        )}
        {displayed.map(n => {
          const tags: string[] = JSON.parse(n.tags)
          return (
            <div key={n.id} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {n.agent.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                    </div>
                    <span className="font-semibold text-sm text-gray-900">{n.agent.name}</span>
                    <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                    {n.createdBy && <span className="text-xs text-gray-400">· by {n.createdBy}</span>}
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {tags.map(tag => (
                        <span key={tag} className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagColor(tag)}`}>
                          {tagLabel(tag)}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.content}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(n)} className="text-xs text-green-800 hover:underline">Edit</button>
                  <button onClick={() => remove(n.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Coaching Note' : 'Add Coaching Note'}</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Agent *</label>
                <select value={form.agentId} onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))} className="input">
                  <option value="">— Select Agent —</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => toggleTag(t.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        form.tags.includes(t.value)
                          ? `${t.color} border-transparent`
                          : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Note *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="input h-36 resize-none"
                  placeholder="What was discussed in this 1:1..."
                />
                <p className="text-xs text-gray-400 mt-1">{form.content.length} characters</p>
              </div>
              <div>
                <label className="label">Created By</label>
                <input value={form.createdBy} onChange={e => setForm(f => ({ ...f, createdBy: e.target.value }))} className="input" />
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
