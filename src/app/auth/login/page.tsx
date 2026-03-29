'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, ArrowRight, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatPhone = (value: string) => value.replace(/\D/g, '').slice(0, 10)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (phone.length !== 10) { setError('Please enter a valid 10-digit mobile number'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` })
    setLoading(false)
    if (error) { setError(error.message); return }
    setStep('otp')
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.verifyOtp({ phone: `+91${phone}`, token: otp, type: 'sms' })
    if (error) { setLoading(false); setError(error.message); return }
    if (data.user) {
      const { data: lawyer } = await supabase.from('lawyers').select('id').eq('user_id', data.user.id).single()
      router.push(lawyer ? '/dashboard' : '/auth/onboarding')
    }
    setLoading(false)
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

      {/* Subtle glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-30"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(79,122,255,0.2) 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="vakil.bio" width={130} height={40}
              className="h-9 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} priority />
          </Link>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          {step === 'phone' ? (
            <>
              <div className="mb-6">
                <h1 className="font-heading text-2xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Welcome back
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Enter your mobile number to continue
                </p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center px-3 rounded-xl text-sm shrink-0 gap-1"
                      style={{ background: 'var(--bg-surface)', border: '1px solid rgba(15,23,42,0.15)', color: 'var(--text-muted)' }}>
                      <Phone className="w-3.5 h-3.5" />
                      +91
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      style={inputStyle}
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
                <button onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                  className="flex items-center gap-1 text-sm mb-4 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <h1 className="font-heading text-2xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Enter OTP
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  We sent a 6-digit code to +91 {phone}
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    6-digit OTP
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
                  Didn&apos;t receive OTP? Resend
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline transition-colors" style={{ color: 'var(--text-secondary)' }}>Terms</Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline transition-colors" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
