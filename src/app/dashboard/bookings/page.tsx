'use client'

import { useState, useEffect } from 'react'
import { CalendarCheck, CheckCircle, XCircle, X, Phone, Mail, IndianRupee, FileText, Tag } from 'lucide-react'
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

function BookingDetailSheet({
  booking,
  onClose,
  onStatusUpdate,
}: {
  booking: Booking & { service: { title: string } | null }
  onClose: () => void
  onStatusUpdate: (id: string, status: BookingStatus) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
      <div
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-5"
        style={{ background: '#ffffff', zIndex: 1, boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
              {booking.client_name}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {booking.scheduled_date} · {booking.scheduled_time}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={booking.status} />
            <button onClick={onClose} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <a href={`tel:${booking.client_phone}`} className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {booking.client_phone}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <a href={`mailto:${booking.client_email}`} className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {booking.client_email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <IndianRupee className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              ₹{booking.amount.toLocaleString('en-IN')}
            </span>
          </div>
          {booking.case_type && (
            <div className="flex items-center gap-3">
              <Tag className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{booking.case_type}</span>
            </div>
          )}
          {booking.description && (
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {booking.description}
              </p>
            </div>
          )}
          {booking.service?.title && (
            <div className="flex items-center gap-3">
              <CalendarCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{booking.service.title}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {(booking.status === 'confirmed' || booking.status === 'pending') && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { onStatusUpdate(booking.id, 'completed'); onClose() }}
              className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-xl font-medium transition-all"
              style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--green)' }}>
              <CheckCircle className="w-4 h-4" />
              Mark Complete
            </button>
            <button
              onClick={() => { onStatusUpdate(booking.id, 'cancelled'); onClose() }}
              className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-xl font-medium transition-all"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BookingsPage() {
  const supabase = createClient()
  const [bookings, setBookings] = useState<(Booking & { service: { title: string } | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabFilter>('all')
  const [lawyerId, setLawyerId] = useState<string | null>(null)
  const [selected, setSelected] = useState<(Booking & { service: { title: string } | null }) | null>(null)

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
                    <tr key={booking.id}
                      className="cursor-pointer transition-colors hover:bg-black/[0.02]"
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onClick={() => setSelected(booking)}>
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
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
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
                <div key={booking.id} className="p-4 space-y-2 cursor-pointer"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onClick={() => setSelected(booking)}>
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
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selected && (
        <BookingDetailSheet
          booking={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={updateStatus}
        />
      )}
    </div>
  )
}
