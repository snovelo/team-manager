'use client'

import { useEffect, useState } from 'react'

type Agent = {
  id: string
  name: string
  currentShift: string | null
  productionDate: string | null
  previousRating: string | null
  coachingDay: string | null
  coachingTime: string | null
  lastCoachingDate: string | null
  providedBy: string | null
  allHandsAttendance: string | null
  hireDate: string | null
  mbrLink: string | null
  coachingPlanLink: string | null
  erDocLink: string | null
}

type AgentForm = Omit<Agent, 'id'>

const RATING_COLORS: Record<string, string> = {
  'High Impact': 'bg-green-100 text-green-800',
  'On Track': 'bg-blue-100 text-blue-800',
  'Needs Improvement': 'bg-yellow-100 text-yellow-800',
  'At Risk': 'bg-red-100 text-red-800',
}

const BLANK: AgentForm = {
  name: '', currentShift: '', productionDate: '', previousRating: '',
  coachingDay: '', coachingTime: '', lastCoachingDate: '', providedBy: '',
  allHandsAttendance: '', hireDate: '', mbrLink: '', coachingPlanLink: '', erDocLink: '',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

function AgentRow({ agent, onSaved, onDeleted }: {
  agent: Agent
  onSaved: () => void
  onDeleted: () => void
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<AgentForm>({ ...agent })
  const [saving, setSaving] = useState(false)

  function set(key: keyof AgentForm, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function save() {
    setSaving(true)
    await fetch(`/api/agents/${agent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setOpen(false)
    onSaved()
  }

  function cancel() {
    setForm({ ...agent })
    setOpen(false)
  }

  async function remove() {
    if (!confirm(`Delete ${agent.name}?`)) return
    await fetch(`/api/agents/${agent.id}`, { method: 'DELETE' })
    onDeleted()
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden" style={{ borderColor: open ? '#00c805' : '#e5e7eb' }}>
      {/* Header row — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-green-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
            style={{ backgroundColor: '#00c805' }}>
            {agent.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
          </div>
          <span className="font-semibold text-gray-900 truncate">{agent.name}</span>
          {agent.previousRating && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${RATING_COLORS[agent.previousRating] || 'bg-gray-100 text-gray-700'}`}>
              {agent.previousRating}
            </span>
          )}
          <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">{agent.coachingDay || ''}{agent.coachingTime ? ` · ${agent.coachingTime}` : ''}</span>
          <span className="text-xs text-gray-400 shrink-0 hidden md:inline">{agent.currentShift || ''}</span>
        </div>
        <span className="text-gray-400 text-xs ml-4 shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {/* Expanded editable panel */}
      {open && (
        <div className="border-t px-4 py-4" style={{ borderColor: '#e5e7eb', backgroundColor: '#f7fdf7' }}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            <Field label="Name">
              <input value={form.name || ''} onChange={e => set('name', e.target.value)} className="input" />
            </Field>
            <Field label="Current Shift">
              <input value={form.currentShift || ''} onChange={e => set('currentShift', e.target.value)} className="input" />
            </Field>
            <Field label="Production Date">
              <input value={form.productionDate || ''} onChange={e => set('productionDate', e.target.value)} className="input" />
            </Field>
            <Field label="Hire Date">
              <input value={form.hireDate || ''} onChange={e => set('hireDate', e.target.value)} className="input" />
            </Field>
            <Field label="Rating">
              <select value={form.previousRating || ''} onChange={e => set('previousRating', e.target.value)} className="input">
                <option value="">— Select —</option>
                <option>High Impact</option>
                <option>On Track</option>
                <option>Needs Improvement</option>
                <option>At Risk</option>
              </select>
            </Field>
            <Field label="Coaching Day">
              <select value={form.coachingDay || ''} onChange={e => set('coachingDay', e.target.value)} className="input">
                <option value="">— Select —</option>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
              </select>
            </Field>
            <Field label="Coaching Time (EST)">
              <input value={form.coachingTime || ''} onChange={e => set('coachingTime', e.target.value)} className="input" placeholder="e.g. 3:00 PM" />
            </Field>
          </div>

          {/* Document links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 pt-3 border-t border-gray-200">
            <Field label="MBR Link">
              <input value={form.mbrLink || ''} onChange={e => set('mbrLink', e.target.value)} className="input" placeholder="https://..." />
            </Field>
            <Field label="Coaching Plan Link">
              <input value={form.coachingPlanLink || ''} onChange={e => set('coachingPlanLink', e.target.value)} className="input" placeholder="https://..." />
            </Field>
            <Field label="ER Doc Link">
              <input value={form.erDocLink || ''} onChange={e => set('erDocLink', e.target.value)} className="input" placeholder="https://..." />
            </Field>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={remove} className="text-xs text-red-500 hover:underline">Delete Agent</button>
            <div className="flex gap-2">
              <button onClick={cancel} className="btn-secondary">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RosterPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newForm, setNewForm] = useState(BLANK)

  async function load() {
    const res = await fetch('/api/agents')
    setAgents(await res.json())
  }

  useEffect(() => { load() }, [])

  async function addAgent() {
    if (!newForm.name.trim()) return
    await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newForm),
    })
    setNewForm(BLANK)
    setShowAdd(false)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Roster</h1>
        <button onClick={() => setShowAdd(s => !s)} className="btn-primary">
          {showAdd ? 'Cancel' : '+ Add Agent'}
        </button>
      </div>

      {/* Add agent inline form */}
      {showAdd && (
        <div className="bg-white rounded-lg border p-4 mb-4 shadow-sm" style={{ borderColor: '#00c805' }}>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">New Agent</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
            <div className="col-span-2 md:col-span-1">
              <label className="label">Name *</label>
              <input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Current Shift</label>
              <input value={newForm.currentShift || ''} onChange={e => setNewForm(f => ({ ...f, currentShift: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Hire Date</label>
              <input value={newForm.hireDate || ''} onChange={e => setNewForm(f => ({ ...f, hireDate: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Rating</label>
              <select value={newForm.previousRating || ''} onChange={e => setNewForm(f => ({ ...f, previousRating: e.target.value }))} className="input">
                <option value="">— Select —</option>
                <option>High Impact</option>
                <option>On Track</option>
                <option>Needs Improvement</option>
                <option>At Risk</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowAdd(false); setNewForm(BLANK) }} className="btn-secondary">Cancel</button>
            <button onClick={addAgent} className="btn-primary">Add Agent</button>
          </div>
        </div>
      )}

      {/* Agent accordion list */}
      <div className="space-y-2">
        {agents.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-lg border border-gray-200">
            No agents yet. Click &quot;+ Add Agent&quot; to get started.
          </div>
        )}
        {agents.map(a => (
          <AgentRow key={a.id} agent={a} onSaved={load} onDeleted={load} />
        ))}
      </div>
    </div>
  )
}
