'use client'

import { useEffect, useRef, useState } from 'react'

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

const RATINGS = ['High Impact', 'On Track', 'Needs Improvement', 'At Risk']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const RATING_COLORS: Record<string, string> = {
  'High Impact':       'bg-emerald-100 text-emerald-800',
  'On Track':          'bg-sky-100 text-sky-800',
  'Needs Improvement': 'bg-amber-100 text-amber-800',
  'At Risk':           'bg-red-100 text-red-800',
}

const BLANK: AgentForm = {
  name: '', currentShift: '', productionDate: '', previousRating: '',
  coachingDay: '', coachingTime: '', lastCoachingDate: '', providedBy: '',
  allHandsAttendance: '', hireDate: '', mbrLink: '', coachingPlanLink: '', erDocLink: '',
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('')
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ backgroundColor: '#3a7d44' }}
    >
      {initials}
    </div>
  )
}

function RatingBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-gray-300 text-xs">—</span>
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${RATING_COLORS[value] ?? 'bg-gray-100 text-gray-600'}`}>
      {value}
    </span>
  )
}

function CellText({ value, onChange, placeholder }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      className="cell-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder ?? ''}
    />
  )
}

function CellSelect({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <select className="cell-input" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">—</option>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  )
}

function AgentRow({ agent, onSaved, onDeleted }: {
  agent: Agent
  onSaved: () => void
  onDeleted: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<AgentForm>({ ...agent })
  const [saving, setSaving] = useState(false)
  const rowRef = useRef<HTMLTableRowElement>(null)

  function set(key: keyof AgentForm, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function save() {
    setSaving(true)
    const { name, currentShift, productionDate, previousRating, coachingDay,
            coachingTime, lastCoachingDate, providedBy, allHandsAttendance,
            hireDate, mbrLink, coachingPlanLink, erDocLink } = form
    await fetch(`/api/agents/${agent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, currentShift, productionDate, previousRating,
        coachingDay, coachingTime, lastCoachingDate, providedBy,
        allHandsAttendance, hireDate, mbrLink, coachingPlanLink, erDocLink }),
    })
    setSaving(false)
    setEditing(false)
    onSaved()
  }

  function cancel() {
    setForm({ ...agent })
    setEditing(false)
  }

  async function remove() {
    if (!confirm(`Delete ${agent.name}?`)) return
    await fetch(`/api/agents/${agent.id}`, { method: 'DELETE' })
    onDeleted()
  }

  if (!editing) {
    return (
      <tr
        ref={rowRef}
        className="border-b border-gray-100 hover:bg-green-50/40 transition-colors cursor-pointer group"
        onClick={() => setEditing(true)}
      >
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <Avatar name={agent.name} />
            <span className="text-sm font-medium text-gray-800">{agent.name}</span>
          </div>
        </td>
        <td className="px-3 py-2.5 text-sm text-gray-600">{agent.currentShift || <span className="text-gray-300">—</span>}</td>
        <td className="px-3 py-2.5"><RatingBadge value={agent.previousRating} /></td>
        <td className="px-3 py-2.5 text-sm text-gray-600">{agent.coachingDay || <span className="text-gray-300">—</span>}</td>
        <td className="px-3 py-2.5 text-sm text-gray-600">{agent.coachingTime || <span className="text-gray-300">—</span>}</td>
        <td className="px-3 py-2.5 text-sm text-gray-600">{agent.hireDate || <span className="text-gray-300">—</span>}</td>
        <td className="px-3 py-2.5 text-sm text-gray-600">{agent.productionDate || <span className="text-gray-300">—</span>}</td>
        <td className="px-3 py-2.5">
          <div className="flex gap-3">
            {agent.mbrLink && <a href={agent.mbrLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-green-700 hover:underline">MBR</a>}
            {agent.coachingPlanLink && <a href={agent.coachingPlanLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-green-700 hover:underline">Plan</a>}
            {agent.erDocLink && <a href={agent.erDocLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-green-700 hover:underline">ER</a>}
          </div>
        </td>
        <td className="px-3 py-2.5">
          <span className="text-xs text-gray-300 group-hover:text-gray-400 transition-colors">Edit</span>
        </td>
      </tr>
    )
  }

  return (
    <>
      {/* Editing row */}
      <tr className="border-b-0" style={{ backgroundColor: '#f0f7f1' }}>
        <td className="px-3 py-2">
          <div className="flex items-center gap-2">
            <Avatar name={form.name || agent.name} />
            <CellText value={form.name || ''} onChange={v => set('name', v)} placeholder="Name" />
          </div>
        </td>
        <td className="px-3 py-2"><CellText value={form.currentShift || ''} onChange={v => set('currentShift', v)} placeholder="Shift" /></td>
        <td className="px-3 py-2"><CellSelect value={form.previousRating || ''} onChange={v => set('previousRating', v)} options={RATINGS} /></td>
        <td className="px-3 py-2"><CellSelect value={form.coachingDay || ''} onChange={v => set('coachingDay', v)} options={DAYS} /></td>
        <td className="px-3 py-2"><CellText value={form.coachingTime || ''} onChange={v => set('coachingTime', v)} placeholder="3:00 PM" /></td>
        <td className="px-3 py-2"><CellText value={form.hireDate || ''} onChange={v => set('hireDate', v)} placeholder="MM/DD/YYYY" /></td>
        <td className="px-3 py-2"><CellText value={form.productionDate || ''} onChange={v => set('productionDate', v)} placeholder="MM/DD/YYYY" /></td>
        <td className="px-3 py-2 space-y-1">
          <CellText value={form.mbrLink || ''} onChange={v => set('mbrLink', v)} placeholder="MBR link" />
          <CellText value={form.coachingPlanLink || ''} onChange={v => set('coachingPlanLink', v)} placeholder="Plan link" />
          <CellText value={form.erDocLink || ''} onChange={v => set('erDocLink', v)} placeholder="ER link" />
        </td>
        <td className="px-3 py-2 whitespace-nowrap">
          <div className="flex flex-col gap-1.5 items-start">
            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="btn-primary py-1 px-3 text-xs">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={cancel} className="btn-secondary py-1 px-3 text-xs">Cancel</button>
            </div>
            <button onClick={remove} className="text-xs text-red-400 hover:text-red-600 hover:underline transition-colors">Delete</button>
          </div>
        </td>
      </tr>
      {/* Subtle bottom border for editing row */}
      <tr style={{ backgroundColor: '#3a7d44', height: 2 }}><td colSpan={9} /></tr>
    </>
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
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-700">Roster</h1>
        <button onClick={() => setShowAdd(s => !s)} className="btn-primary">
          {showAdd ? 'Cancel' : '+ Add Agent'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border p-4 mb-4 shadow-sm" style={{ borderColor: '#c5dfc9' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">New Agent</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="col-span-2 md:col-span-1">
              <label className="label">Name *</label>
              <input
                value={newForm.name}
                onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                className="input"
                placeholder="Full name"
                onKeyDown={e => e.key === 'Enter' && addAgent()}
              />
            </div>
            <div>
              <label className="label">Current Shift</label>
              <input
                value={newForm.currentShift || ''}
                onChange={e => setNewForm(f => ({ ...f, currentShift: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Hire Date</label>
              <input
                value={newForm.hireDate || ''}
                onChange={e => setNewForm(f => ({ ...f, hireDate: e.target.value }))}
                className="input"
                placeholder="MM/DD/YYYY"
              />
            </div>
            <div>
              <label className="label">Rating</label>
              <select
                value={newForm.previousRating || ''}
                onChange={e => setNewForm(f => ({ ...f, previousRating: e.target.value }))}
                className="input"
              >
                <option value="">— Select —</option>
                {RATINGS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowAdd(false); setNewForm(BLANK) }} className="btn-secondary">Cancel</button>
            <button onClick={addAgent} className="btn-primary">Add Agent</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {agents.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No agents yet. Click &ldquo;+ Add Agent&rdquo; to get started.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200" style={{ backgroundColor: '#eaf3eb' }}>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Agent</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Shift</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Coaching Day</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Time (EST)</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hire Date</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Prod Date</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Links</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {agents.map(a => (
                <AgentRow key={a.id} agent={a} onSaved={load} onDeleted={load} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
