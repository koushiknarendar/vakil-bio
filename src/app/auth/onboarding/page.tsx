'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

const PRACTICE_AREAS = [
  'Criminal Law', 'Family Law', 'Property & Real Estate', 'Corporate & Business',
  'Labour & Employment', 'Consumer Protection', 'Civil Litigation', 'Tax Law',
  'Intellectual Property', 'Immigration', 'Banking & Finance', 'Environmental Law',
]

const LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil',
  'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Urdu',
]

const DURATION_OPTIONS = [
  { value: 15 as const, label: '15 min', type: 'consultation_15', title: '15-min Quick Consultation', defaultPrice: 499 },
  { value: 30 as const, label: '30 min', type: 'consultation_30', title: '30-min Consultation', defaultPrice: 999 },
  { value: 60 as const, label: '60 min', type: 'consultation_60', title: '60-min Deep Dive', defaultPrice: 1499 },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [title, setTitle] = useState('')
  const [yearsExp, setYearsExp] = useState('')
  const [location, setLocation] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English'])

  const [consultDuration, setConsultDuration] = useState<15 | 30 | 60>(30)
  const [consultPrice, setConsultPrice] = useState(999)

  const [userPhone, setUserPhone] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth/login')
      else {
        setUserId(data.user.id)
        setUserPhone(data.user.phone ?? '')
      }
    })
  }, [])

  useEffect(() => {
    if (!username || username.length < 3) { setUsernameAvailable(null); return }
    const timer = setTimeout(async () => {
      setCheckingUsername(true)
      const { data } = await supabase.from('lawyers').select('username').eq('username', username).single()
      setUsernameAvailable(!data)
      setCheckingUsername(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [username])

  const handleComplete = async () => {
    if (!userId) return
    setLoading(true)
    setError('')
    try {
      const { data: lawyer, error: lawyerError } = await supabase
        .from('lawyers')
        .insert({
          user_id: userId, username, full_name: fullName, email, phone: userPhone, title,
          years_experience: yearsExp ? parseInt(yearsExp) : 0,
          location, practice_areas: selectedAreas, languages: selectedLanguages,
          plan: 'free', show_bci_disclaimer: true,
        })
        .select('id')
        .single()
      if (lawyerError) throw lawyerError

      const durationOption = DURATION_OPTIONS.find(d => d.value === consultDuration)!
      await supabase.from('services').insert({
        lawyer_id: lawyer.id,
        type: durationOption.type,
        title: durationOption.title,
        description: 'Video or phone consultation',
        duration_minutes: consultDuration,
        price: consultPrice,
        is_active: true,
      })

      const defaultSlots = [1, 2, 3, 4, 5].map((day) => ({
        lawyer_id: lawyer.id, day_of_week: day, start_time: '09:00', end_time: '18:00', is_active: true,
      }))
      await supabase.from('availability_slots').insert(defaultSlots)

      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) => {
      if (prev.includes(area)) return prev.filter((a) => a !== area)
      if (prev.length >= 3) return prev
      return [...prev, area]
    })
  }

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) => prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang])
  }

  const canGoNext = () => {
    if (step === 1) return username.length >= 3 && usernameAvailable === true
    if (step === 2) return fullName.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    return consultPrice > 0
  }

  const inputSt: React.CSSProperties = {
    width: '100%',
    background: '#fff',
    border: '1px solid rgba(15,23,42,0.15)',
    borderRadius: '12px',
    padding: '10px 16px',
    fontSize: '14px',
    color: 'var(--text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>

      {/* Subtle glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-25"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(155,109,255,0.2) 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="vakil.bio" width={130} height={40}
            className="h-9 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} priority />
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                style={
                  s < step
                    ? { background: 'var(--green)', color: '#fff' }
                    : s === step
                    ? { background: '#2563EB', color: '#fff' }
                    : { background: 'rgba(15,23,42,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                }
              >
                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className="w-12 h-0.5 transition-all"
                  style={{ background: s < step ? 'var(--green)' : 'var(--border-md)' }} />
              )}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8">
          {/* Step 1: Username */}
          {step === 1 && (
            <div>
              <h1 className="font-heading text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Claim your profile link
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                This is your permanent, shareable vakil.bio link
              </p>

              <div className="mb-6">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Choose your username
                </label>
                <div className="flex items-center">
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: '42px', background: 'var(--bg-surface)', border: '1px solid rgba(15,23,42,0.15)', borderRight: 'none', borderRadius: '12px 0 0 12px', color: 'var(--text-muted)', fontSize: '14px', flexShrink: 0 }}>
                    vakil.bio/
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="yourname"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '').slice(0, 30))}
                      style={{ width: '100%', background: '#fff', border: '1px solid rgba(15,23,42,0.15)', borderRadius: '0 12px 12px 0', padding: '10px 40px 10px 16px', fontSize: '14px', color: 'var(--text-primary)', outline: 'none' }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {checkingUsername && <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-muted)' }} />}
                      {!checkingUsername && usernameAvailable === true && <CheckCircle className="w-4 h-4" style={{ color: 'var(--green)' }} />}
                      {!checkingUsername && usernameAvailable === false && <span style={{ color: '#DC2626', fontSize: '14px' }}>✗</span>}
                    </div>
                  </div>
                </div>
                {usernameAvailable === true && username.length >= 3 && (
                  <p className="text-xs mt-1.5" style={{ color: 'var(--green)' }}>✓ vakil.bio/{username} is available!</p>
                )}
                {usernameAvailable === false && (
                  <p className="text-xs mt-1.5" style={{ color: '#DC2626' }}>This username is already taken. Try another.</p>
                )}
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  Only lowercase letters, numbers, hyphens and underscores. Min 3 characters.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h1 className="font-heading text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Build your profile</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tell clients about yourself</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Full Name *</label>
                <input type="text" placeholder="Adv. Rahul Sharma" value={fullName}
                  onChange={(e) => setFullName(e.target.value)} style={inputSt} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Email Address *</label>
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} style={inputSt} />
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  For booking confirmations and important updates
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Title / Designation</label>
                <input type="text" placeholder="Advocate, Delhi High Court" value={title}
                  onChange={(e) => setTitle(e.target.value)} style={inputSt} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Years of Experience</label>
                  <input type="number" placeholder="5" min="0" max="60" value={yearsExp}
                    onChange={(e) => setYearsExp(e.target.value)} style={inputSt} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Location</label>
                  <input type="text" placeholder="New Delhi" value={location}
                    onChange={(e) => setLocation(e.target.value)} style={inputSt} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Practice Areas</label>
                  <span className="text-xs font-medium" style={{ color: 'var(--blue)' }}>{selectedAreas.length}/3</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRACTICE_AREAS.map((area) => {
                    const selected = selectedAreas.includes(area)
                    const maxed = selectedAreas.length >= 3 && !selected
                    return (
                      <button key={area} type="button" onClick={() => toggleArea(area)} disabled={maxed}
                        className="text-xs px-3 py-1.5 rounded-lg border transition-all"
                        style={selected
                          ? { background: 'rgba(79,122,255,0.1)', border: '1px solid rgba(79,122,255,0.3)', color: 'var(--blue)' }
                          : maxed
                          ? { background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'not-allowed', opacity: 0.5 }
                          : { background: '#fff', border: '1px solid var(--border-md)', color: 'var(--text-secondary)' }
                        }>
                        {area}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Languages</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                      className="text-xs px-3 py-1.5 rounded-lg border transition-all"
                      style={selectedLanguages.includes(lang)
                        ? { background: 'rgba(124,95,212,0.1)', border: '1px solid rgba(124,95,212,0.3)', color: 'var(--purple)' }
                        : { background: '#fff', border: '1px solid var(--border-md)', color: 'var(--text-secondary)' }
                      }>
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Consultation */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-heading text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Set up your consultation
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  You can add more services later from the dashboard
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Session duration
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setConsultDuration(opt.value); setConsultPrice(opt.defaultPrice) }}
                      style={{
                        flex: 1, padding: '12px 8px', borderRadius: '12px', border: '1px solid',
                        borderColor: consultDuration === opt.value ? 'rgba(37,99,235,0.4)' : 'var(--border-md)',
                        background: consultDuration === opt.value ? 'rgba(37,99,235,0.06)' : '#fff',
                        color: consultDuration === opt.value ? '#2563EB' : 'var(--text-secondary)',
                        fontWeight: consultDuration === opt.value ? 600 : 400,
                        fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                      }}
                    >
                      <span style={{ fontSize: '18px', fontWeight: 700 }}>{opt.label}</span>
                      <span style={{ fontSize: '11px', opacity: 0.7 }}>session</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Your fee (₹)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>₹</span>
                  <input
                    type="number"
                    value={consultPrice}
                    min={0}
                    onChange={(e) => setConsultPrice(parseInt(e.target.value) || 0)}
                    style={{ ...inputSt, maxWidth: '160px', fontSize: '20px', fontWeight: 600, padding: '10px 14px' }}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>per session</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  You can change this anytime from the dashboard
                </p>
              </div>

              {error && (
                <div className="text-sm rounded-lg px-3 py-2"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#DC2626' }}>
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button onClick={() => setStep((s) => s - 1)} className="text-sm transition-colors"
                style={{ color: 'var(--text-muted)' }}>
                ← Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button onClick={() => setStep((s) => s + 1)} disabled={!canGoNext()}
                className="btn-primary flex items-center gap-2 font-semibold px-6 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                Continue →
              </button>
            ) : (
              <button onClick={handleComplete} disabled={loading || !canGoNext()}
                className="btn-primary flex items-center gap-2 font-semibold px-6 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Setting up...' : 'Launch my profile 🚀'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
