'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Phone, ArrowRight, ChevronLeft, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSignInPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatPhone = (value: string) => value.replace(/\D/g, '').slice(0, 10)

  const inputStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid rgba(15,23,42,0.15)',
    color: '#0F172A',
    borderRadius: '12px',
    padding: '10px 16px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
  }

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (phone.length !== 10) { setError('Enter a valid 10-digit number'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` })
    setLoading(false)
    if (error) { setError(error.message); return }
    setStep('otp')
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.verifyOtp({ phone: `+91${phone}`, token: otp, type: 'sms' })
    if (error) { setLoading(false); setError(error.message); return }
    if (data.user) router.push('/')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '380px', margin: '0 24px' }}>
        {/* Logo */}
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
          {step === 'phone' ? (
            <>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Admin Sign In</h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 24px' }}>Enter your admin phone number</p>

              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                    Mobile Number
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 12px', borderRadius: '12px', border: '1px solid rgba(15,23,42,0.15)', background: '#F8FAFC', color: '#64748B', fontSize: '13px', flexShrink: 0 }}>
                      <Phone style={{ width: '13px', height: '13px' }} /> +91
                    </div>
                    <input type="tel" inputMode="numeric" placeholder="98765 43210"
                      value={phone} onChange={e => setPhone(formatPhone(e.target.value))}
                      style={inputStyle} autoFocus required />
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
              <button onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '16px' }}>
                <ChevronLeft style={{ width: '14px', height: '14px' }} /> Back
              </button>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Enter OTP</h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 24px' }}>Sent to +91 {phone}</p>

              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="tel" inputMode="numeric" placeholder="• • • • • •"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
