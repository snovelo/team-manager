'use client'

import { useEffect, useState } from 'react'

type Agent = {
  id: string
  name: string
  previousRating: string | null
  currentShift: string | null
  coachingDay: string | null
}

// Metric definition — swap `value` for a live Superset fetch later
type Metric = {
  label: string
  key: string
  format: 'percent' | 'number' | 'time' | 'score'
  description: string
}

const MTD_METRICS: Metric[] = [
  { key: 'casesHandled',     label: 'Cases Handled',       format: 'number',  description: 'Total cases closed this month' },
  { key: 'qaScore',          label: 'QA Score',            format: 'percent', description: 'Average QA score this month' },
  { key: 'csat',             label: 'CSAT',                format: 'percent', description: 'Customer satisfaction score' },
  { key: 'avgHandleTime',    label: 'Avg Handle Time',     format: 'time',    description: 'Average case handle time (min)' },
  { key: 'fcr',              label: 'First Contact Res.',  format: 'percent', description: 'First contact resolution rate' },
  { key: 'scheduleAdherence',label: 'Schedule Adherence',  format: 'percent', description: 'Time on scheduled activity' },
]

const QTD_METRICS: Metric[] = [
  { key: 'casesHandled',     label: 'Cases Handled',       format: 'number',  description: 'Total cases closed this quarter' },
  { key: 'qaScore',          label: 'QA Score',            format: 'percent', description: 'Average QA score this quarter' },
  { key: 'csat',             label: 'CSAT',                format: 'percent', description: 'Customer satisfaction score' },
  { key: 'avgHandleTime',    label: 'Avg Handle Time',     format: 'time',    description: 'Average case handle time (min)' },
  { key: 'fcr',              label: 'First Contact Res.',  format: 'percent', description: 'First contact resolution rate' },
  { key: 'coachingSessions', label: 'Coaching Sessions',   format: 'number',  description: '1:1 sessions completed this quarter' },
]

const RATING_COLORS: Record<string, string> = {
  'High Impact':       'bg-emerald-100 text-emerald-800',
  'On Track':          'bg-sky-100 text-sky-800',
  'Needs Improvement': 'bg-amber-100 text-amber-800',
  'At Risk':           'bg-red-100 text-red-800',
}

function formatValue(value: number | null, format: Metric['format']): string {
  if (value === null) return '—'
  switch (format) {
    case 'percent': return `${value}%`
    case 'time':    return `${value}m`
    case 'score':   return value.toFixed(1)
    default:        return value.toLocaleString()
  }
}

function MetricCard({ metric, value, period }: {
  metric: Metric
  value: number | null
  period: 'MTD' | 'QTD'
}) {
  const isEmpty = value === null

  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-col gap-1 shadow-sm">
      <span className="text-xs text-gray-400 font-medium">{metric.label}</span>
      {isEmpty ? (
        <div className="h-7 flex items-center">
          <span className="text-xs text-gray-300 italic">No data yet</span>
        </div>
      ) : (
        <span className="text-2xl font-semibold text-gray-800">
          {formatValue(value, metric.format)}
        </span>
      )}
      <span className="text-xs text-gray-400">{metric.description}</span>
    </div>
  )
}

function PeriodSection({ label, metrics, data }: {
  label: string
  metrics: Metric[]
  data: Record<string, number | null>
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded"
          style={{ backgroundColor: '#eaf3eb', color: '#3a7d44' }}
        >
          {label}
        </span>
        <div className="flex-1 border-t border-gray-100" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map(m => (
          <MetricCard key={m.key} metric={m} value={data[m.key] ?? null} period={label as 'MTD' | 'QTD'} />
        ))}
      </div>
    </div>
  )
}

export default function PerformancePage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedId, setSelectedId] = useState<string>('')

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then((data: Agent[]) => {
        setAgents(data)
        if (data.length > 0) setSelectedId(data[0].id)
      })
  }, [])

  const selected = agents.find(a => a.id === selectedId)

  // Placeholder — replace these with live Superset API calls keyed by agent
  const mtdData: Record<string, number | null> = {
    casesHandled: null, qaScore: null, csat: null,
    avgHandleTime: null, fcr: null, scheduleAdherence: null,
  }
  const qtdData: Record<string, number | null> = {
    casesHandled: null, qaScore: null, csat: null,
    avgHandleTime: null, fcr: null, coachingSessions: null,
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-700">Performance</h1>
          <p className="text-xs text-gray-400 mt-0.5">MTD &amp; QTD metrics per agent — Superset integration pending</p>
        </div>

        {/* Agent selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium whitespace-nowrap">View agent</label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="input max-w-56"
          >
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Agent summary strip */}
      {selected && (
        <div
          className="flex items-center gap-4 rounded-xl px-4 py-3 mb-6 border"
          style={{ backgroundColor: '#eaf3eb', borderColor: '#c5dfc9' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ backgroundColor: '#3a7d44' }}
          >
            {selected.name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm">{selected.name}</p>
            <p className="text-xs text-gray-500">
              {selected.currentShift || 'No shift set'}
              {selected.coachingDay ? ` · Coaching: ${selected.coachingDay}` : ''}
            </p>
          </div>
          {selected.previousRating && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${RATING_COLORS[selected.previousRating] ?? 'bg-gray-100 text-gray-600'}`}>
              {selected.previousRating}
            </span>
          )}
        </div>
      )}

      {agents.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
          No agents on the roster yet.
        </div>
      ) : (
        <div className="space-y-8">
          <PeriodSection label="MTD" metrics={MTD_METRICS} data={mtdData} />
          <PeriodSection label="QTD" metrics={QTD_METRICS} data={qtdData} />

          {/* Superset integration placeholder */}
          <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-8 text-center">
            <p className="text-sm font-medium text-gray-400">Superset integration</p>
            <p className="text-xs text-gray-300 mt-1 max-w-sm mx-auto">
              When your Superset reports are ready, connect them here to populate the metrics above per agent automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
