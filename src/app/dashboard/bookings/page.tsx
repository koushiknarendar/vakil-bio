'use client'

import { useState, useEffect } from 'react'
import { CalendarCheck, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/ui/Badge'
import type { Booking, BookingStatus } from '@/lib/types'

type TabFilter = 'all' | 'upcoming' | 'completed' | 'cancelled'

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function BookingsPage() {
  const supabase = createClient()
  const [bookings, setBookings] = useState<(Booking & { service: { title: string } | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabFilter>('all')
  const [lawyerId, setLawyerId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: lawyer } = await supabase.from('lawyers').select('id').eq('user_id', user.id).single()
      if (!lawyer) return
      setLawyerId(lawyer.id)
      await fetchBookings(lawyer.id)
    }
    init()
  }, [])

  async function fetchBookings(lid: string) {
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('*, service:services(title)')
      .eq('lawyer_id', lid)
      .order('created_at', { ascending: false })
    setBookings(data || [])
    setLoading(false)
  }

  async function updateStatus(bookingId: string, status: BookingStatus) {
    await supabase.from('bookings').update({ status }).eq('id', bookingId)
    if (lawyerId) fetchBookings(lawyerId)
  }

  const filtered = bookings.filter((b) => {
    if (tab === 'all') return true
    if (tab === 'upcoming') return b.status === 'confirmed' || b.status === 'pending'
    if (tab === 'completed') return b.status === 'completed'
    if (tab === 'cancelled') return b.status === 'cancelled' || b.status === 'refunded'
    return true
  })

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-6">
      <div>
        <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Bookings</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Manage your consultation bookings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 w-fit" style={{ background: 'rgba(15,23,42,0.05)' }}>
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={tab === key
              ? { background: '#fff', color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(15,23,42,0.1)' }
              : { color: 'var(--text-muted)' }
            }>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarCheck className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--border-lg)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No bookings found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Client', 'Service', 'Date & Time', 'Amount', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium"
                        style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((booking) => (
                    <tr key={booking.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-5 py-3">
                        <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{booking.client_name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{booking.client_email}</div>
                      </td>
                      <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {booking.service?.title || '—'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{booking.scheduled_date}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{booking.scheduled_time}</div>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        ₹{booking.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {(booking.status === 'confirmed' || booking.status === 'pending') && (
                            <>
                              <button onClick={() => updateStatus(booking.id, 'completed')}
                                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
                                style={{ color: 'var(--green)' }}>
                                <CheckCircle className="w-3.5 h-3.5" />
                                Complete
                              </button>
                              <button onClick={() => updateStatus(booking.id, 'cancelled')}
                                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
                                style={{ color: '#DC2626' }}>
                                <XCircle className="w-3.5 h-3.5" />
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden">
              {filtered.map((booking) => (
                <div key={booking.id} className="p-4 space-y-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{booking.client_name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{booking.service?.title}</div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>{booking.scheduled_date} · {booking.scheduled_time}</span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      ₹{booking.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {(booking.status === 'confirmed' || booking.status === 'pending') && (
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => updateStatus(booking.id, 'completed')}
                        className="flex-1 text-xs py-1.5 rounded-lg border transition-all"
                        style={{ color: 'var(--green)', borderColor: 'rgba(16,185,129,0.3)' }}>
                        Mark Complete
                      </button>
                      <button onClick={() => updateStatus(booking.id, 'cancelled')}
                        className="flex-1 text-xs py-1.5 rounded-lg border transition-all"
                        style={{ color: '#DC2626', borderColor: 'rgba(239,68,68,0.3)' }}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
