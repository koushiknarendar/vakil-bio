'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowRight, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) { setError(data.error || 'Failed to send OTP'); return }
      setStep('otp')
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (otp.length < 6) { setError('Please enter the full OTP code'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (!res.ok) { setLoading(false); setError(data.error || 'Failed to verify OTP'); return }

      // Get current user after auth
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: lawyer } = await supabase.from('lawyers').select('id').eq('user_id', user.id).single()
        router.push(lawyer ? '/dashboard' : '/auth/onboarding')
      }
      setLoading(false)
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const inputStyle = {
    background: '#fff',
    border: '1px solid rgba(15,23,42,0.15)',
    color: 'var(--text-primary)',
    borderRadius: '12px',
    padding: '10px 16px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
  }

  const Spinner = () => (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>

      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-30"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(79,122,255,0.2) 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="vakil.bio" width={130} height={40}
              className="h-9 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} priority />
          </Link>
        </div>

        <div className="glass rounded-2xl p-8">
          {step === 'email' ? (
            <>
              <div className="mb-6">
                <h1 className="font-heading text-2xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Welcome back
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Enter your email to receive a login code
                </p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: '36px' }}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm rounded-lg px-3 py-2"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#DC2626' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <Spinner /> : (<>Send OTP <ArrowRight className="w-4 h-4" /></>)}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <button onClick={() => { setStep('email'); setOtp(''); setError('') }}
                  className="flex items-center gap-1 text-sm mb-4 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <h1 className="font-heading text-2xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Check your email
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Login code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    style={{ ...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '0.4em', padding: '12px 16px', fontFamily: 'monospace' }}
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="text-sm rounded-lg px-3 py-2"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#DC2626' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <Spinner /> : 'Verify & Continue'}
                </button>

                <button type="button" onClick={handleSendOTP}
                  className="w-full text-sm py-2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  Didn&apos;t receive it? Resend
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline" style={{ color: 'var(--text-secondary)' }}>Terms</Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
