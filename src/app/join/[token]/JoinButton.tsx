'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle } from 'lucide-react'

export function JoinButton({ token, companySlug, isLoggedIn }: { token: string; companySlug: string; isLoggedIn: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  if (!isLoggedIn) {
    return (
      <a
        href={`/auth/login?redirect=/join/${token}`}
        style={{
          display: 'block', width: '100%', padding: '13px', borderRadius: '14px',
          background: '#4F7AFF', color: '#fff', fontWeight: 700, fontSize: '15px',
          textDecoration: 'none', textAlign: 'center',
        }}
      >
        Log in to Join
      </a>
    )
  }

  async function handleJoin() {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/join/${token}`, { method: 'POST' })
    const json = await res.json()
    if (res.ok) {
      setDone(true)
      setTimeout(() => router.push('/dashboard/company'), 1200)
    } else {
      setError(json.error || 'Failed to join')
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#059669', fontWeight: 700, fontSize: '15px' }}>
        <CheckCircle style={{ width: '20px', height: '20px' }} /> Joined! Redirecting…
      </div>
    )
  }

  return (
    <div>
      <button onClick={handleJoin} disabled={loading}
        style={{
          width: '100%', padding: '13px', borderRadius: '14px',
          background: '#4F7AFF', color: '#fff', fontWeight: 700, fontSize: '15px',
          border: 'none', cursor: loading ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          opacity: loading ? 0.7 : 1,
        }}>
        {loading && <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />}
        Join {loading ? '' : 'This Firm'}
      </button>
      {error && <p style={{ fontSize: '13px', color: '#DC2626', marginTop: '10px' }}>{error}</p>}
    </div>
  )
}
