'use client'

import { useState, useEffect, useRef } from 'react'
import {
  BadgeCheck, Shield, Clock, CheckCircle, XCircle, AlertCircle,
  Upload, Loader2, Zap, TrendingUp, Eye, MessageSquare, Star
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

declare global {
  interface Window {
    Cashfree: (config: { mode: string }) => {
      checkout: (opts: { paymentSessionId: string; redirectTarget: string }) => Promise<{
        error?: { message: string }
        paymentDetails?: { paymentMessage: string }
      }>
    }
  }
}

const STATE_BAR_COUNCILS = [
  'Bar Council of Delhi', 'Bar Council of Uttar Pradesh', 'Bar Council of Maharashtra & Goa',
  'Bar Council of Tamil Nadu & Pondicherry', 'Bar Council of Rajasthan', 'Bar Council of Gujarat',
  'Bar Council of Karnataka', 'Bar Council of Kerala', 'Bar Council of West Bengal',
  'Bar Council of Punjab & Haryana', 'Bar Council of Madhya Pradesh', 'Bar Council of Bihar',
  'Bar Council of Telangana', 'Bar Council of Andhra Pradesh', 'Bar Council of Odisha',
  'Bar Council of Assam, Nagaland, Meghalaya, Manipur, Tripura, Mizoram & Arunachal Pradesh',
  'Bar Council of Chhattisgarh', 'Bar Council of Jharkhand', 'Bar Council of Uttarakhand',
  'Bar Council of Himachal Pradesh', 'Bar Council of Jammu & Kashmir',
]

const PROFESSIONAL_ROLES = [
  'Legal Consultant', 'In-house Counsel', 'Compliance Officer',
  'Legal Researcher', 'Law Student', 'Retired Judge', 'Legal Academic', 'Other',
]

const PLANS = {
  monthly: { label: 'Monthly', amount: 99, period: 'month', perMonth: '₹99/mo' },
  yearly:  { label: 'Yearly',  amount: 999, period: 'year', perMonth: '₹83/mo · Save ₹189', badge: 'Best Value' },
}

const BENEFITS = [
  { icon: <BadgeCheck className="w-4 h-4" style={{ color: '#4F7AFF' }} />, text: 'Blue verification badge on your profile' },
  { icon: <MessageSquare className="w-4 h-4" style={{ color: '#059669' }} />, text: '3x more client enquiries on average' },
  { icon: <Eye className="w-4 h-4" style={{ color: '#7C5CFC' }} />, text: '4x more profile views vs unverified' },
  { icon: <TrendingUp className="w-4 h-4" style={{ color: '#F59E0B' }} />, text: 'Priority placement in search (coming soon)' },
  { icon: <Star className="w-4 h-4" style={{ color: '#EC4899' }} />, text: 'Verified Advocate / Professional tag' },
]

const inputSt: React.CSSProperties = {
  width: '100%', background: '#fff', border: '1px solid rgba(15,23,42,0.15)',
  borderRadius: '12px', padding: '10px 16px', fontSize: '14px',
  color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function isVerifiedActive(verifiedUntil?: string) {
  return !!verifiedUntil && new Date(verifiedUntil) > new Date()
}

type LawyerData = {
  id: string; full_name: string; email: string; phone?: string
  is_verified: boolean; verified_until?: string; verification_plan?: string
  verification_status?: string; verification_type?: string
}
type AppData = {
  id: string; verification_type: string; status: string
  bar_council_number?: string; state_bar_council?: string
  professional_role?: string; rejection_reason?: string
}

export default function VerificationPage() {
  const supabase = createClient()
  const [lawyer, setLawyer] = useState<LawyerData | null>(null)
  const [app, setApp] = useState<AppData | null>(null)
  const [verifiedCount, setVerifiedCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // Form state
  const [vType, setVType] = useState<'advocate' | 'professional'>('advocate')
  const [barNumber, setBarNumber] = useState('')
  const [stateCouncil, setStateCouncil] = useState('')
  const [proRole, setProRole] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [doc1File, setDoc1File] = useState<File | null>(null)
  const [doc2File, setDoc2File] = useState<File | null>(null)
  const doc1Ref = useRef<HTMLInputElement>(null)
  const doc2Ref = useRef<HTMLInputElement>(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Payment state
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [paySuccess, setPaySuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: lData }, { data: appData }, { count }] = await Promise.all([
        supabase.from('lawyers')
          .select('id, full_name, email, phone, is_verified, verified_until, verification_plan, verification_status, verification_type')
          .eq('user_id', user.id).single(),
        supabase.from('verification_applications')
          .select('id, verification_type, status, bar_council_number, state_bar_council, professional_role, rejection_reason')
          .eq('lawyer_id', (await supabase.from('lawyers').select('id').eq('user_id', user.id).single()).data?.id ?? '')
          .maybeSingle(),
        supabase.from('lawyers').select('*', { count: 'exact', head: true })
          .eq('is_verified', true).gt('verified_until', new Date().toISOString()),
      ])

      if (lData) setLawyer(lData)
      if (appData) setApp(appData)
      setVerifiedCount(count ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  async function uploadDoc(file: File, slot: 'doc1' | 'doc2'): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('slot', slot)
    const res = await fetch('/api/upload-verification-doc', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data.path
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!doc1File) { setSubmitError('Please upload the primary document'); return }
    setSubmitting(true)
    setSubmitError('')
    try {
      const doc1Path = await uploadDoc(doc1File, 'doc1')
      const doc2Path = doc2File ? await uploadDoc(doc2File, 'doc2') : null

      const res = await fetch('/api/verification/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationType: vType,
          barCouncilNumber: vType === 'advocate' ? barNumber : undefined,
          stateBarCouncil: vType === 'advocate' ? stateCouncil : undefined,
          professionalRole: vType === 'professional' ? proRole : undefined,
          document1Path: doc1Path,
          document2Path: doc2Path,
          linkedinUrl: linkedinUrl || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubmitSuccess(true)
      setLawyer(prev => prev ? { ...prev, verification_status: 'pending' } : prev)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed')
    }
    setSubmitting(false)
  }

  async function handlePay() {
    if (!lawyer) return
    setPaying(true)
    setPayError('')
    try {
        const res = await fetch('/api/verification/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      })
      const order = await res.json()
      if (!res.ok) throw new Error(order.error)

      // Load Cashfree SDK if not already loaded
      if (!window.Cashfree) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
          s.onload = () => resolve()
          s.onerror = () => reject(new Error('Cashfree SDK load failed'))
          document.head.appendChild(s)
        })
      }

      const cashfree = window.Cashfree({ mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || 'sandbox' })
      const result = await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: '_modal',
      })

      if (result.error) throw new Error(result.error.message)

      // Payment completed — verify server-side
      const vRes = await fetch('/api/verification/verify-payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderId, plan: selectedPlan }),
      })
      const vData = await vRes.json()
      if (!vRes.ok) throw new Error(vData.error)
      setLawyer(prev => prev ? { ...prev, is_verified: true, verified_until: vData.verifiedUntil, verification_plan: selectedPlan } : prev)
      setPaySuccess(true)
    } catch (err) {
      if ((err as Error).message !== 'cancelled') setPayError((err as Error).message)
    }
    setPaying(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--text-muted)' }} /></div>
  }

  const verificationStatus = lawyer?.verification_status ?? 'none'
  const activeVerified = isVerifiedActive(lawyer?.verified_until) && lawyer?.is_verified

  // ── ACTIVE ────────────────────────────────────────────────────────
  if (activeVerified || paySuccess) {
    return <ActiveView lawyer={lawyer!} verifiedCount={verifiedCount} onRenew={() => setPaySuccess(false)} />
  }

  // ── APPROVED — awaiting payment ───────────────────────────────────
  if (verificationStatus === 'approved') {
    return (
      <div className="max-w-2xl mx-auto space-y-5 pb-6">
        <PageHeader verifiedCount={verifiedCount} />
        <div className="glass rounded-2xl p-5 flex items-start gap-4"
          style={{ border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.05)' }}>
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#059669' }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: '#065F46' }}>You're approved!</p>
            <p className="text-xs mt-0.5" style={{ color: '#059669' }}>
              Your credentials have been verified. Pay to activate your badge.
            </p>
          </div>
        </div>
        <PaymentSection selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} onPay={handlePay} paying={paying} payError={payError} />
      </div>
    )
  }

  // ── PENDING ───────────────────────────────────────────────────────
  if (verificationStatus === 'pending' || submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto space-y-5 pb-6">
        <PageHeader verifiedCount={verifiedCount} />
        <div className="glass rounded-2xl p-6 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Clock className="w-7 h-7" style={{ color: '#F59E0B' }} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Application under review</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              We're reviewing your credentials. This usually takes <strong>24–48 hours</strong>.
              You'll be notified once approved.
            </p>
          </div>
          {app && (
            <div className="text-xs px-4 py-2 rounded-xl inline-block"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Submitted as: {app.verification_type === 'advocate' ? `Advocate · ${app.bar_council_number}` : app.professional_role}
            </div>
          )}
        </div>
        <BenefitsList />
      </div>
    )
  }

  // ── REJECTED ──────────────────────────────────────────────────────
  if (verificationStatus === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto space-y-5 pb-6">
        <PageHeader verifiedCount={verifiedCount} />
        <div className="glass rounded-2xl p-5 flex items-start gap-4"
          style={{ border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.04)' }}>
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: '#DC2626' }}>Application not approved</p>
            {app?.rejection_reason && (
              <p className="text-xs mt-0.5" style={{ color: 'rgba(220,38,38,0.8)' }}>Reason: {app.rejection_reason}</p>
            )}
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Please review the reason above and reapply with the correct documents.
            </p>
          </div>
        </div>
        <ApplicationForm
          vType={vType} setVType={setVType}
          barNumber={barNumber} setBarNumber={setBarNumber}
          stateCouncil={stateCouncil} setStateCouncil={setStateCouncil}
          proRole={proRole} setProRole={setProRole}
          linkedinUrl={linkedinUrl} setLinkedinUrl={setLinkedinUrl}
          doc1File={doc1File} setDoc1File={setDoc1File} doc1Ref={doc1Ref}
          doc2File={doc2File} setDoc2File={setDoc2File} doc2Ref={doc2Ref}
          onSubmit={handleSubmit} submitting={submitting} error={submitError}
        />
      </div>
    )
  }

  // ── NOT APPLIED ───────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-6">
      <PageHeader verifiedCount={verifiedCount} />
      <ApplicationForm
        vType={vType} setVType={setVType}
        barNumber={barNumber} setBarNumber={setBarNumber}
        stateCouncil={stateCouncil} setStateCouncil={setStateCouncil}
        proRole={proRole} setProRole={setProRole}
        linkedinUrl={linkedinUrl} setLinkedinUrl={setLinkedinUrl}
        doc1File={doc1File} setDoc1File={setDoc1File} doc1Ref={doc1Ref}
        doc2File={doc2File} setDoc2File={setDoc2File} doc2Ref={doc2Ref}
        onSubmit={handleSubmit} submitting={submitting} error={submitError}
      />
      <BenefitsList />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────

function PageHeader({ verifiedCount }: { verifiedCount: number }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Get Verified</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Prove your credentials. Build instant client trust.
        </p>
      </div>
      {verifiedCount > 0 && (
        <div className="text-right shrink-0">
          <div className="font-heading text-xl font-bold" style={{ color: 'var(--blue)' }}>{verifiedCount}+</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>advocates verified</div>
        </div>
      )}
    </div>
  )
}

function BenefitsList() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>What you get</p>
      {BENEFITS.map((b, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            {b.icon}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{b.text}</p>
        </div>
      ))}
    </div>
  )
}

function ApplicationForm({
  vType, setVType, barNumber, setBarNumber, stateCouncil, setStateCouncil,
  proRole, setProRole, linkedinUrl, setLinkedinUrl,
  doc1File, setDoc1File, doc1Ref, doc2File, setDoc2File, doc2Ref,
  onSubmit, submitting, error,
}: {
  vType: 'advocate' | 'professional'; setVType: (v: 'advocate' | 'professional') => void
  barNumber: string; setBarNumber: (v: string) => void
  stateCouncil: string; setStateCouncil: (v: string) => void
  proRole: string; setProRole: (v: string) => void
  linkedinUrl: string; setLinkedinUrl: (v: string) => void
  doc1File: File | null; setDoc1File: (f: File | null) => void; doc1Ref: React.RefObject<HTMLInputElement | null>
  doc2File: File | null; setDoc2File: (f: File | null) => void; doc2Ref: React.RefObject<HTMLInputElement | null>
  onSubmit: (e: React.FormEvent) => void; submitting: boolean; error: string
}) {
  return (
    <form onSubmit={onSubmit} className="glass rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Apply for Verification</h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Free to apply · We review within 24–48 hours · Pay to activate after approval
        </p>
      </div>

      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
        {(['advocate', 'professional'] as const).map(t => (
          <button key={t} type="button" onClick={() => setVType(t)}
            className="py-2 rounded-lg text-sm font-medium transition-all"
            style={vType === t
              ? { background: '#fff', color: 'var(--blue)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
              : { color: 'var(--text-muted)' }
            }>
            {t === 'advocate' ? '⚖️ Enrolled Advocate' : '💼 Legal Professional'}
          </button>
        ))}
      </div>

      {vType === 'advocate' ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Bar Council Enrollment Number *
            </label>
            <input value={barNumber} onChange={e => setBarNumber(e.target.value)} required
              placeholder="e.g. D/1234/2015" style={inputSt} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              State Bar Council *
            </label>
            <select value={stateCouncil} onChange={e => setStateCouncil(e.target.value)} required
              style={{ ...inputSt, cursor: 'pointer' }}>
              <option value="">Select State Bar Council</option>
              {STATE_BAR_COUNCILS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <FileUploadField
            label="Sanad / Enrollment Certificate *"
            hint="Upload your Bar Council certificate (PDF, JPG, PNG · max 10MB)"
            file={doc1File} setFile={setDoc1File} inputRef={doc1Ref}
          />
          <FileUploadField
            label="ID Proof (optional)"
            hint="Aadhaar, PAN, or Passport"
            file={doc2File} setFile={setDoc2File} inputRef={doc2Ref}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Your Role *
            </label>
            <select value={proRole} onChange={e => setProRole(e.target.value)} required
              style={{ ...inputSt, cursor: 'pointer' }}>
              <option value="">Select your role</option>
              {PROFESSIONAL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <FileUploadField
            label="Degree Certificate *"
            hint="Upload your LLB/LLM degree certificate (PDF, JPG, PNG · max 10MB)"
            file={doc1File} setFile={setDoc1File} inputRef={doc1Ref}
          />
          <FileUploadField
            label="ID Proof (optional)"
            hint="Aadhaar, PAN, or Passport"
            file={doc2File} setFile={setDoc2File} inputRef={doc2Ref}
          />
        </div>
      )}

      {/* LinkedIn */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          LinkedIn Profile (optional but recommended)
        </label>
        <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)}
          placeholder="https://linkedin.com/in/yourname" style={inputSt} />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm" style={{ color: '#DC2626' }}>
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <button type="submit" disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #4F7AFF, #9B6DFF)', boxShadow: '0 4px 16px rgba(79,122,255,0.28)' }}>
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Shield className="w-4 h-4" /> Submit for Verification</>}
      </button>
      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        No payment required to apply. You'll pay only after we approve your credentials.
      </p>
    </form>
  )
}

function FileUploadField({ label, hint, file, setFile, inputRef }: {
  label: string; hint: string
  file: File | null; setFile: (f: File | null) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <button type="button" onClick={() => inputRef.current?.click()}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed transition-colors"
        style={file
          ? { borderColor: '#4F7AFF', background: 'rgba(79,122,255,0.04)' }
          : { borderColor: 'var(--border)', background: 'transparent' }
        }>
        <Upload className="w-4 h-4 shrink-0" style={{ color: file ? '#4F7AFF' : 'var(--text-muted)' }} />
        <div className="text-left min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: file ? '#4F7AFF' : 'var(--text-secondary)' }}>
            {file ? file.name : 'Click to upload'}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{hint}</p>
        </div>
      </button>
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
        onChange={e => setFile(e.target.files?.[0] ?? null)} />
    </div>
  )
}

function PaymentSection({ selectedPlan, onSelectPlan, onPay, paying, payError }: {
  selectedPlan: 'monthly' | 'yearly'; onSelectPlan: (p: 'monthly' | 'yearly') => void
  onPay: () => void; paying: boolean; payError: string
}) {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Activate your badge</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.entries(PLANS) as ['monthly' | 'yearly', typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => (
          <button key={key} type="button" onClick={() => onSelectPlan(key)}
            className="relative text-left rounded-xl p-4 transition-all"
            style={{ border: selectedPlan === key ? '2px solid #4F7AFF' : '2px solid var(--border)', background: selectedPlan === key ? 'rgba(79,122,255,0.04)' : '#fff' }}>
            {'badge' in plan && plan.badge && (
              <span className="absolute -top-2.5 left-3 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: 'linear-gradient(135deg, #4F7AFF, #9B6DFF)' }}>{plan.badge}</span>
            )}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{plan.label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{plan.perMonth}</div>
              </div>
              <div className="text-right">
                <div className="font-heading text-xl font-bold" style={{ color: 'var(--text-primary)' }}>₹{plan.amount}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>/{plan.period}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      {payError && <p className="text-sm flex items-center gap-2" style={{ color: '#DC2626' }}><AlertCircle className="w-4 h-4" />{payError}</p>}
      <button onClick={onPay} disabled={paying}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #4F7AFF, #9B6DFF)', boxShadow: '0 4px 16px rgba(79,122,255,0.28)' }}>
        {paying ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</> : <><Zap className="w-4 h-4" />Activate Badge · ₹{PLANS[selectedPlan].amount}/{PLANS[selectedPlan].period}</>}
      </button>
      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Secure payment via Cashfree · No auto-renewal</p>
    </div>
  )
}

function ActiveView({ lawyer, verifiedCount, onRenew }: { lawyer: LawyerData; verifiedCount: number; onRenew: () => void }) {
  const daysLeft = lawyer.verified_until
    ? Math.max(0, Math.ceil((new Date(lawyer.verified_until).getTime() - Date.now()) / 86400000))
    : 0

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Verification</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Your profile is verified</p>
        </div>
        {verifiedCount > 0 && (
          <div className="text-right shrink-0">
            <div className="font-heading text-xl font-bold" style={{ color: 'var(--blue)' }}>{verifiedCount}+</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>advocates verified</div>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <BadgeCheck className="w-6 h-6" style={{ color: '#059669' }} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {lawyer.verification_type === 'advocate' ? 'Verified Advocate' : 'Verified Professional'}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {lawyer.verification_plan === 'yearly' ? 'Yearly plan' : 'Monthly plan'} · Active until {formatDate(lawyer.verified_until!)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl p-3" style={{ background: 'var(--bg-surface)' }}>
            <div className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{daysLeft}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>days remaining</div>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'var(--bg-surface)' }}>
            <div className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              {lawyer.verification_plan === 'yearly' ? '₹999' : '₹99'}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>/{lawyer.verification_plan === 'yearly' ? 'year' : 'month'}</div>
          </div>
        </div>

        {daysLeft <= 30 && (
          <button onClick={onRenew}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #4F7AFF, #9B6DFF)' }}>
            Renew Early
          </button>
        )}
      </div>

      <BenefitsList />
    </div>
  )
}
