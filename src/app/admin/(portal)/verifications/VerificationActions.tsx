'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export function VerificationActions({ applicationId }: { applicationId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  async function act(action: 'approve' | 'reject') {
    if (action === 'reject' && !reason.trim()) { setError('Please provide a rejection reason'); return }
    setLoading(action)
    setError('')
    try {
      const res = await fetch(`/api/admin/verifications/${applicationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectionReason: reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
      {!showReject ? (
        <div className="flex gap-2">
          <button onClick={() => act('approve')} disabled={!!loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ background: '#059669' }}>
            {loading === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Approve
          </button>
          <button onClick={() => setShowReject(true)} disabled={!!loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ background: 'rgba(220,38,38,0.06)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.15)' }}>
            <XCircle className="w-4 h-4" /> Reject
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Reason for rejection (visible to the lawyer)..."
            rows={2}
            className="w-full text-sm rounded-xl p-3"
            style={{ border: '1px solid var(--border)', resize: 'none', outline: 'none', color: 'var(--text-primary)' }}
          />
          <div className="flex gap-2">
            <button onClick={() => act('reject')} disabled={!!loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: '#DC2626' }}>
              {loading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Confirm Reject
            </button>
            <button onClick={() => { setShowReject(false); setReason('') }}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#F1F5F9', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
    </div>
  )
}
