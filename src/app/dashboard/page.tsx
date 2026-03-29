import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  TrendingUp,
  CalendarCheck,
  Users,
  ExternalLink,
  ArrowRight,
  IndianRupee,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge, UrgencyBadge } from '@/components/ui/Badge'
import type { Booking, Lead } from '@/lib/types'

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconColor,
  iconBg,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  iconColor: string
  iconBg: string
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: iconBg, color: iconColor }}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="font-heading text-2xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: lawyer } = await supabase.from('lawyers').select('*').eq('user_id', user.id).single()
  if (!lawyer) redirect('/auth/onboarding')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const [bookingsResult, leadsResult, recentBookingsResult, recentLeadsResult, earningsResult] = await Promise.all([
    supabase.from('bookings').select('amount, status, created_at').eq('lawyer_id', lawyer.id).gte('created_at', startOfMonth + 'T00:00:00'),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('lawyer_id', lawyer.id).gte('created_at', startOfMonth + 'T00:00:00'),
    supabase.from('bookings').select('*, service:services(title)').eq('lawyer_id', lawyer.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('leads').select('*').eq('lawyer_id', lawyer.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('bookings').select('amount').eq('lawyer_id', lawyer.id).gte('created_at', startOfMonth + 'T00:00:00').in('status', ['confirmed', 'completed']),
  ])

  const bookingsThisMonth = bookingsResult.data?.filter((b) => b.status !== 'cancelled').length || 0
  const leadsThisMonth = leadsResult.count || 0
  const earningsThisMonth = earningsResult.data?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0
  const recentBookings = (recentBookingsResult.data || []) as (Booking & { service: { title: string } })[]
  const recentLeads = (recentLeadsResult.data || []) as Lead[]

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = lawyer.full_name.split(' ')[0]
  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${lawyer.username}`

  const fields = [lawyer.full_name, lawyer.title, lawyer.bio, lawyer.photo_url, lawyer.location, lawyer.years_experience, lawyer.bar_council_number]
  const completeness = Math.round((fields.filter(Boolean).length / fields.length) * 100)

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Here&apos;s what&apos;s happening with your practice
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs glass"
            style={{ color: 'var(--text-secondary)' }}>
            <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>vakil.bio/{lawyer.username}</span>
          </div>
          <Link
            href={profileUrl}
            target="_blank"
            className="p-2 rounded-xl glass transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Profile Views" value={lawyer.profile_views?.toLocaleString('en-IN') || '0'} sub="This month" iconColor="var(--blue)" iconBg="rgba(79,122,255,0.1)" />
        <StatCard icon={CalendarCheck} label="Bookings" value={bookingsThisMonth} sub="This month" iconColor="var(--green)" iconBg="rgba(16,185,129,0.1)" />
        <StatCard icon={Users} label="Enquiries" value={leadsThisMonth} sub="This month" iconColor="var(--purple)" iconBg="rgba(124,95,212,0.1)" />
        <StatCard icon={IndianRupee} label="Earnings" value={earningsThisMonth > 0 ? '₹' + earningsThisMonth.toLocaleString('en-IN') : '₹0'} sub="This month" iconColor="var(--green)" iconBg="rgba(16,185,129,0.1)" />
      </div>

      {/* Profile completeness */}
      {completeness < 100 && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Profile Completeness</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Complete your profile to attract more clients</p>
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{completeness}%</span>
          </div>
          <div className="w-full rounded-full h-1.5 mb-3" style={{ background: 'rgba(15,23,42,0.08)' }}>
            <div className="h-1.5 rounded-full transition-all"
              style={{ width: `${completeness}%`, background: 'var(--grad-brand)' }} />
          </div>
          <Link href="/dashboard/profile"
            className="text-xs flex items-center gap-1 font-medium transition-colors"
            style={{ color: 'var(--blue)' }}>
            Complete your profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Bookings */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Bookings</h3>
            <Link href="/dashboard/bookings" className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
              View all →
            </Link>
          </div>
          {recentBookings.length > 0 ? (
            <div>
              {recentBookings.map((booking) => (
                <div key={booking.id} className="px-5 py-3 flex items-center justify-between gap-3"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{booking.client_name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {booking.service?.title} · {booking.scheduled_date}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {booking.amount > 0 && (
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        ₹{booking.amount.toLocaleString('en-IN')}
                      </span>
                    )}
                    <StatusBadge status={booking.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <CalendarCheck className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--border-lg)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No bookings yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Share your profile link to get started</p>
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Enquiries</h3>
            <Link href="/dashboard/leads" className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
              View all →
            </Link>
          </div>
          {recentLeads.length > 0 ? (
            <div>
              {recentLeads.map((lead) => (
                <div key={lead.id} className="px-5 py-3 flex items-center justify-between gap-3"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{lead.client_name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{lead.case_type} · {lead.client_phone}</div>
                  </div>
                  <UrgencyBadge urgency={lead.urgency} />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <Users className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--border-lg)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No enquiries yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Leads from your profile will appear here</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
