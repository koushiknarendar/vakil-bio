'use client'

import { useState } from 'react'

const CASE_TYPES = [
  'Criminal Law',
  'Family Law',
  'Property & Real Estate',
  'Corporate & Business',
  'Labour & Employment',
  'Consumer Protection',
  'Civil Litigation',
  'Tax Law',
  'Intellectual Property',
  'Immigration',
  'Banking & Finance',
  'Other',
]

interface Props {
  lawyerId: string
  lawyerName: string
  dark?: boolean
}

export function LeadForm({ lawyerId, lawyerName, dark }: Props) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [caseType, setCaseType] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const inputStyle = dark ? {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '10px 16px',
    fontSize: '14px',
    outline: 'none',
    color: '#F1F5F9',
    width: '100%',
    boxSizing: 'border-box' as const,
  } : {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '10px 16px',
    fontSize: '14px',
    outline: 'none',
    color: '#111827',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = dark ? { color: 'rgba(241,245,249,0.6)' } : { color: '#374151' }

  const inputFocusStyle = dark
    ? { border: '1px solid rgba(79,122,255,0.5)' }
    : { border: '1px solid #2563EB' }
  const inputBlurStyle = dark
    ? { border: '1px solid rgba(255,255,255,0.1)' }
    : { border: '1px solid #E5E7EB' }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lawyerId,
          clientName: fullName.trim(),
          clientPhone: phone,
          caseType,
          description: description.trim(),
          urgency: 'medium',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong. Please try again.')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center', gap: '12px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: dark ? 'rgba(16,185,129,0.15)' : '#F0FDF4', border: dark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 11.5L9 16.5L18 6" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p style={{ fontSize: '15px', fontWeight: 600, color: dark ? '#F1F5F9' : '#0F172A', margin: 0 }}>Enquiry sent!</p>
        <p style={{ fontSize: '13px', color: dark ? 'rgba(241,245,249,0.5)' : '#64748B', margin: 0 }}>{lawyerName} will contact you shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Full Name */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', ...labelStyle }}>
          Full Name <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
          onBlur={(e) => Object.assign(e.target.style, inputBlurStyle)}
        />
      </div>

      {/* Phone */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', ...labelStyle }}>
          Phone <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <span style={{
            display: 'flex', alignItems: 'center', padding: '10px 12px', whiteSpace: 'nowrap',
            background: dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
            border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB',
            borderRight: 'none', borderRadius: '12px 0 0 12px',
            fontSize: '14px', color: dark ? 'rgba(241,245,249,0.4)' : '#6B7280', fontWeight: 500,
          }}>
            +91
          </span>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit number"
            maxLength={10}
            style={{ ...inputStyle, borderRadius: '0 12px 12px 0', flex: 1 }}
            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputBlurStyle)}
          />
        </div>
      </div>

      {/* Case Type */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', ...labelStyle }}>
          Case Type <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <select
          required
          value={caseType}
          onChange={(e) => setCaseType(e.target.value)}
          style={{
            ...inputStyle,
            appearance: 'none',
            backgroundImage: dark
              ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23A0AEC0' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`
              : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center',
            paddingRight: '36px',
            cursor: 'pointer',
            color: caseType ? (dark ? '#F1F5F9' : '#111827') : (dark ? 'rgba(241,245,249,0.3)' : '#9CA3AF'),
            colorScheme: dark ? 'dark' : 'light',
          }}
          onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
          onBlur={(e) => Object.assign(e.target.style, inputBlurStyle)}
        >
          <option value="" disabled>Select case type</option>
          {CASE_TYPES.map((ct) => (
            <option key={ct} value={ct}>{ct}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', ...labelStyle }}>
          Brief Description <span style={{ color: dark ? 'rgba(241,245,249,0.35)' : '#9CA3AF', fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Briefly describe your situation..."
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          onFocus={(e) => Object.assign(e.target.style, { ...inputFocusStyle, resize: 'vertical' })}
          onBlur={(e) => Object.assign(e.target.style, { ...inputBlurStyle, resize: 'vertical' })}
        />
      </div>

      {/* Error */}
      {error && (
        <p style={{
          fontSize: '13px',
          color: dark ? '#FCA5A5' : '#DC2626',
          background: dark ? 'rgba(239,68,68,0.1)' : '#FEF2F2',
          border: dark ? '1px solid rgba(239,68,68,0.2)' : '1px solid #FECACA',
          borderRadius: '10px', padding: '10px 14px', margin: 0,
        }}>
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          background: dark ? 'linear-gradient(135deg, #4F7AFF, #9B6DFF)' : '#2563EB',
          color: '#fff', fontWeight: 600, padding: '12px 0',
          borderRadius: '12px', width: '100%', border: 'none',
          fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1, transition: 'opacity 0.15s',
          boxShadow: dark ? '0 4px 16px rgba(79,122,255,0.3)' : 'none',
        }}
      >
        {loading ? 'Sending…' : 'Send Enquiry'}
      </button>
    </form>
  )
}
