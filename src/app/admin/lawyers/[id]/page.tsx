import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminLawyerActions } from './AdminLawyerActions'

export const dynamic = 'force-dynamic'

interface PageProps { params: Promise<{ id: string }> }

export default async function AdminLawyerDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  if (!adminEmails.includes(user.email?.toLowerCase() ?? '')) redirect('/not-found')

  const { data: lawyer } = await supabase.from('lawyers').select('*').eq('id', id).single()
  if (!lawyer) notFound()

  const [bookingsRes, leadsRes, servicesRes] = await Promise.all([
    supabase.from('bookings').select('id, amount, status, scheduled_date, client_name, created_at').eq('lawyer_id', id).order('created_at', { ascending: false }).limit(10),
    supabase.from('leads').select('id, client_name, case_type, created_at').eq('lawyer_id', id).order('created_at', { ascending: false }).limit(10),
    supabase.from('services').select('*').eq('lawyer_id', id),
  ])

  const totalEarnings = bookingsRes.data?.filter(b => ['confirmed','completed'].includes(b.status)).reduce((s, b) => s + (b.amount || 0), 0) || 0

  const row = (label: string, value: string | number | null) => (
    <div className="flex items-start justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-sm font-medium text-right" style={{ color: 'var(--text-primary)' }}>{value || '—'}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/lawyers" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>← Lawyers</Link>
        <span style={{ color: 'var(--border-lg)' }}>/</span>
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{lawyer.full_name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Profile Info</h2>
            {row('Full Name', lawyer.full_name)}
            {row('Username', `@${lawyer.username}`)}
            {row('Title', lawyer.title)}
            {row('Location', lawyer.location)}
            {row('Phone', lawyer.phone)}
            {row('Email', lawyer.email)}
            {row('WhatsApp', lawyer.whatsapp_number)}
            {row('Bar Council No.', lawyer.bar_council_number)}
            {row('Years Experience', lawyer.years_experience)}
            {row('Plan', lawyer.plan)}
            {row('Profile Views', lawyer.profile_views || 0)}
            {row('Joined', new Date(lawyer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }))}
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Services</h2>
            {(servicesRes.data || []).length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No services</p>}
            {(servicesRes.data || []).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.title}</span>
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                    style={s.is_active ? { background: 'rgba(16,185,129,0.08)', color: 'var(--green)' } : { background: 'rgba(15,23,42,0.06)', color: 'var(--text-muted)' }}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>₹{s.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          {/* Recent bookings */}
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Bookings</h2>
              <span className="text-xs font-medium" style={{ color: 'var(--green)' }}>Total: ₹{totalEarnings.toLocaleString('en-IN')}</span>
            </div>
            {(bookingsRes.data || []).length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No bookings</p>}
            {(bookingsRes.data || []).map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{b.client_name}</span>
                  <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{b.scheduled_date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>₹{(b.amount || 0).toLocaleString('en-IN')}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                    style={{ background: 'rgba(15,23,42,0.06)', color: 'var(--text-muted)' }}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <AdminLawyerActions
            lawyerId={lawyer.id}
            isVerified={lawyer.is_verified}
            isSuspended={lawyer.is_suspended ?? false}
          />
        </div>
      </div>
    </div>
  )
}
