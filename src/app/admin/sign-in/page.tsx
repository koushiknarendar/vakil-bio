'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, ArrowRight, ChevronLeft, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSignInPage() {
  const supabase = createClient()

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid rgba(15,23,42,0.15)',
    color: '#0F172A',
    borderRadius: '12px',
    padding: '10px 16px',
    fontSize: '16px',
    outline: 'none',
    width: '100%',
  }

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
    setLoading(false)
    if (error) { setError(error.message); return }
    setStep('otp')
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (otp.length < 6) { setError('Enter the full OTP code'); return }
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
    if (error) { setLoading(false); setError(error.message); return }
    window.location.href = '/'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '380px', margin: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/">
            <Image src="/logo.png" alt="vakil.bio" width={120} height={32}
              style={{ height: '28px', width: 'auto', mixBlendMode: 'multiply' }} priority />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
            <ShieldCheck style={{ width: '14px', height: '14px', color: '#DC2626' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626' }}>Admin Access</span>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
          {step === 'email' ? (
            <>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Admin Sign In</h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 24px' }}>Enter your admin email address</p>

              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94A3B8' }} />
                    <input type="email" placeholder="admin@example.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: '36px' }} autoFocus required />
                  </div>
                </div>

                {error && <p style={{ fontSize: '13px', color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '8px 12px', margin: 0 }}>{error}</p>}

                <button type="submit" disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', borderRadius: '12px', background: '#0F172A', color: '#fff', fontWeight: 600, fontSize: '14px', border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Sending…' : <><span>Send OTP</span><ArrowRight style={{ width: '16px', height: '16px' }} /></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <button onClick={() => { setStep('email'); setOtp(''); setError('') }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '16px' }}>
                <ChevronLeft style={{ width: '14px', height: '14px' }} /> Back
              </button>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Check your email</h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 24px' }}>We sent a code to {email}</p>

              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="text" inputMode="numeric" placeholder="• • • • • •"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  style={{ ...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '0.5em', padding: '12px 16px', fontFamily: 'monospace' }}
                  autoFocus required />

                {error && <p style={{ fontSize: '13px', color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '8px 12px', margin: 0 }}>{error}</p>}

                <button type="submit" disabled={loading}
                  style={{ padding: '11px', borderRadius: '12px', background: '#0F172A', color: '#fff', fontWeight: 600, fontSize: '14px', border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Verifying…' : 'Verify & Enter Admin'}
                </button>

                <button type="button" onClick={handleSendOTP}
                  style={{ fontSize: '13px', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Resend OTP
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
