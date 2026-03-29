'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Link2Off, ExternalLink, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function CalendarPageInner() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [lawyerId, setLawyerId] = useState<string | null>(null)
  const [google, setGoogle] = useState(false)
  const [microsoft, setMicrosoft] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<'google' | 'microsoft' | null>(null)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    if (connected === 'google') setNotice({ type: 'success', text: 'Google Calendar connected successfully.' })
    else if (connected === 'microsoft') setNotice({ type: 'success', text: 'Outlook Calendar connected successfully.' })
    else if (error) setNotice({ type: 'error', text: 'Connection failed. Please try again.' })
  }, [searchParams])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: lawyer } = await supabase.from('lawyers').select('id').eq('user_id', user.id).single()
      if (!lawyer) return
      setLawyerId(lawyer.id)

      const { data: tokens } = await supabase
        .from('lawyer_calendar_tokens')
        .select('provider')
        .eq('lawyer_id', lawyer.id)

      setGoogle(tokens?.some(t => t.provider === 'google') ?? false)
      setMicrosoft(tokens?.some(t => t.provider === 'microsoft') ?? false)
      setLoading(false)
    }
    init()
  }, [])

  async function disconnect(provider: 'google' | 'microsoft') {
    setActionLoading(provider)
    try {
      const res = await fetch('/api/calendar/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      if (res.ok) {
        if (provider === 'google') setGoogle(false)
        else setMicrosoft(false)
        setNotice({ type: 'success', text: `${provider === 'google' ? 'Google' : 'Outlook'} Calendar disconnected.` })
      }
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-20 lg:pb-6">
        <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: 'var(--bg-base)' }} />
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map(i => (
            <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: 'var(--bg-base)' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Calendar Sync
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Connect your calendar — confirmed bookings appear automatically with client details.
        </p>
      </div>

      {/* Notice */}
      {notice && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={
            notice.type === 'success'
              ? { background: 'rgba(16,185,129,0.08)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.2)' }
              : { background: 'rgba(239,68,68,0.06)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }
          }
        >
          {notice.text}
        </div>
      )}

      {/* Provider cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <CalendarCard
          name="Google Calendar"
          description="New bookings auto-appear in Google Calendar. Your client gets a calendar invite too."
          icon={<GoogleIcon />}
          connected={google}
          loading={actionLoading === 'google'}
          onConnect={() => { window.location.href = '/api/calendar/google/connect' }}
          onDisconnect={() => disconnect('google')}
        />
        <CalendarCard
          name="Outlook Calendar"
          description="Sync bookings with Microsoft Outlook or any Exchange-connected calendar."
          icon={<MicrosoftIcon />}
          connected={microsoft}
          loading={actionLoading === 'microsoft'}
          onConnect={() => { window.location.href = '/api/calendar/microsoft/connect' }}
          onDisconnect={() => disconnect('microsoft')}
        />
      </div>

      {/* Info card */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>How it works</span>
        </div>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <li className="flex gap-2">
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            When a client books and pays, an event is created in your connected calendar automatically.
          </li>
          <li className="flex gap-2">
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            Your client receives a calendar invite with the booking details.
          </li>
          <li className="flex gap-2">
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            You can connect both Google and Outlook at the same time.
          </li>
          <li className="flex gap-2">
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            Apple Calendar users can download an .ics file from each booking.
          </li>
        </ul>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  return (
    <Suspense>
      <CalendarPageInner />
    </Suspense>
  )
}

function CalendarCard({
  name,
  description,
  icon,
  connected,
  loading,
  onConnect,
  onDisconnect,
}: {
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  loading: boolean
  onConnect: () => void
  onDisconnect: () => void
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {name}
            </span>
            {connected && (
              <span
                className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  color: 'var(--green)',
                  border: '1px solid rgba(16,185,129,0.2)',
                }}
              >
                <CheckCircle2 className="w-3 h-3" />
                Connected
              </span>
            )}
          </div>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        </div>
      </div>

      {connected ? (
        <button
          onClick={onDisconnect}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            background: 'rgba(239,68,68,0.06)',
            color: '#EF4444',
            border: '1px solid rgba(239,68,68,0.15)',
          }}
        >
          <Link2Off className="w-3.5 h-3.5" />
          {loading ? 'Disconnecting...' : 'Disconnect'}
        </button>
      ) : (
        <button
          onClick={onConnect}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-medium transition-colors hover:opacity-80"
          style={{
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Connect
        </button>
      )}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  )
}
