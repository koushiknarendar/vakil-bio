'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, ShieldOff, Shield, Trash2, Loader2 } from 'lucide-react'

interface Props {
  lawyerId: string
  isVerified: boolean
  isSuspended: boolean
}

export function AdminLawyerActions({ lawyerId, isVerified, isSuspended }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  async function action(type: 'verify' | 'unverify' | 'suspend' | 'unsuspend' | 'delete') {
    setLoading(type)
    setError('')
    try {
      const res = await fetch(`/api/admin/lawyers/${lawyerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')
      if (type === 'delete') {
        router.push('/admin/lawyers')
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    }
    setLoading(null)
    setDeleteConfirm(false)
  }

  const btn = (label: string, type: Parameters<typeof action>[0], icon: React.ReactNode, danger = false) => (
    <button onClick={() => action(type)} disabled={!!loading}
      className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
      style={danger
        ? { background: 'rgba(220,38,38,0.06)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.15)' }
        : { background: '#F8FAFC', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
      {loading === type ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {label}
    </button>
  )

  return (
    <div className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: 'var(--border)' }}>
      <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Actions</h2>

      {isVerified
        ? btn('Remove Verification', 'unverify', <BadgeCheck className="w-4 h-4" />)
        : btn('Verify Advocate', 'verify', <BadgeCheck className="w-4 h-4" />)
      }

      {isSuspended
        ? btn('Unsuspend Profile', 'unsuspend', <Shield className="w-4 h-4" />)
        : btn('Suspend Profile', 'suspend', <ShieldOff className="w-4 h-4" />, true)
      }

      <div className="pt-1" style={{ borderTop: '1px solid var(--border)' }}>
        {!deleteConfirm
          ? (
            <button onClick={() => setDeleteConfirm(true)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ background: 'rgba(220,38,38,0.06)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.15)' }}>
              <Trash2 className="w-4 h-4" />
              Delete Profile
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs" style={{ color: '#DC2626' }}>Are you sure? This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => action('delete')} disabled={!!loading}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                  style={{ background: '#DC2626' }}>
                  {loading === 'delete' ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Yes, delete'}
                </button>
                <button onClick={() => setDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium"
                  style={{ background: '#F1F5F9', color: 'var(--text-secondary)' }}>
                  Cancel
                </button>
              </div>
            </div>
          )
        }
      </div>

      {error && <p className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
    </div>
  )
}
