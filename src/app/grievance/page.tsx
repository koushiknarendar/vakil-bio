'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Loader2 } from 'lucide-react'

const inputSt: React.CSSProperties = {
  width: '100%', background: '#fff', border: '1px solid rgba(15,23,42,0.15)',
  borderRadius: '12px', padding: '10px 14px', fontSize: '14px',
  color: '#0F172A', outline: 'none',
}

export default function GrievancePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, description }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="vakil.bio" width={100} height={30} className="h-6 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} priority />
          </Link>
          <Link href="/" className="text-sm" style={{ color: 'rgba(15,23,42,0.55)' }}>← Home</Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {submitted ? (
          <div className="bg-white rounded-2xl border p-10 max-w-md w-full text-center" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <CheckCircle className="w-7 h-7" style={{ color: '#10B981' }} />
            </div>
            <h2 className="font-heading text-xl font-bold mb-2" style={{ color: '#0F172A' }}>Grievance Submitted</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(15,23,42,0.55)' }}>
              We've received your grievance and will review it within 5 working days.
            </p>
            <Link href="/" className="text-sm font-medium" style={{ color: '#2563EB' }}>Return to Home</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border p-8 max-w-lg w-full" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
            <h1 className="font-heading text-2xl font-bold mb-1" style={{ color: '#0F172A' }}>Submit a Grievance</h1>
            <p className="text-sm mb-6" style={{ color: 'rgba(15,23,42,0.55)' }}>
              Report a concern about an advocate, a booking, or our platform. We take all grievances seriously.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(15,23,42,0.55)' }}>Your Name *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required style={inputSt} placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(15,23,42,0.55)' }}>Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputSt} placeholder="your@email.com" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(15,23,42,0.55)' }}>Subject *</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required style={inputSt} placeholder="Brief description of the issue" />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(15,23,42,0.55)' }}>Description *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={5}
                  style={{ ...inputSt, resize: 'none' }}
                  placeholder="Please provide as much detail as possible, including any advocate usernames, booking IDs, or dates involved." />
              </div>

              {error && <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{ background: '#2563EB' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Submit Grievance'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
