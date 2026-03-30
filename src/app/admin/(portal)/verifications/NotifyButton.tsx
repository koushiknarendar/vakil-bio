'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle } from 'lucide-react'

export function NotifyButton({ unverifiedCount }: { unverifiedCount: number }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ emailSent: number; whatsappSent: number; total: number } | null>(null)
  const [error, setError] = useState('')

  async function handleSend() {
    if (!confirm(`Send verification reminder to ${unverifiedCount} unverified lawyers?`)) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/notify-unverified', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setResult(json)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send')
    }
    setLoading(false)
  }

  if (result) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl"
        style={{ background: 'rgba(5,150,105,0.08)', color: '#059669', border: '1px solid rgba(5,150,105,0.2)' }}>
        <CheckCircle className="w-4 h-4" />
        {result.emailSent} emails · {result.whatsappSent} WhatsApp sent
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {error && <span className="text-xs" style={{ color: '#DC2626' }}>{error}</span>}
      <button
        onClick={handleSend}
        disabled={loading || unverifiedCount === 0}
        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-50"
        style={{ background: 'rgba(79,122,255,0.08)', color: '#4F7AFF', border: '1px solid rgba(79,122,255,0.2)' }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Notify {unverifiedCount} unverified lawyers
      </button>
    </div>
  )
}
