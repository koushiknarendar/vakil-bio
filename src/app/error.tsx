'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
      <div style={{ textAlign: 'center', padding: '0 24px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>Something went wrong</h2>
        <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{ background: '#2563EB', color: '#fff', fontWeight: 600, padding: '10px 24px', borderRadius: '12px', border: 'none', fontSize: '14px', cursor: 'pointer' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
