'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle } from 'lucide-react'

interface Props {
  grievanceId: string
  currentStatus: string
  currentNotes: string
}

export function GrievanceActions({ grievanceId, currentStatus, currentNotes }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState(currentNotes)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/grievances/${grievanceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    }
    setSaving(false)
  }

  const selectSt: React.CSSProperties = {
    background: '#fff', border: '1px solid rgba(15,23,42,0.15)',
    borderRadius: '10px', padding: '8px 12px', fontSize: '13px',
    color: '#0F172A', outline: 'none', width: '100%',
  }

  return (
    <div className="bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: 'var(--border)' }}>
      <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Update Grievance</h2>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)} style={selectSt}>
          <option value="open">Open</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Internal Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
          style={{ ...selectSt, resize: 'none' }}
          placeholder="Add internal notes about this grievance..." />
      </div>

      {error && <p className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-colors disabled:opacity-50"
        style={{ background: '#2563EB' }}>
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saved && <CheckCircle className="w-4 h-4" />}
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
      </button>
    </div>
  )
}
