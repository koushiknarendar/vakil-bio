import { createClient } from '@/lib/supabase/server'
import { Users, CalendarCheck, IndianRupee, MessageSquare, TrendingUp, BadgeCheck } from 'lucide-react'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

function Stat({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color }}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
    </div>
  )
}

export default async function AdminOverviewPage() {
  await requireAdmin()
  const supabase = await createClient()

  const [lawyersRes, bookingsRes, grievancesRes] = await Promise.all([
    supabase.from('lawyers').select('id, is_verified, created_at', { count: 'exact' }),
    supabase.from('bookings').select('amount, status', { count: 'exact' }),
    supabase.from('grievances').select('id, status', { count: 'exact' }),
  ])

  const totalLawyers = lawyersRes.count || 0
  const verifiedLawyers = lawyersRes.data?.filter(l => l.is_verified).length || 0
  const totalBookings = bookingsRes.count || 0
  const totalRevenue = bookingsRes.data?.filter(b => ['confirmed','completed'].includes(b.status)).reduce((s, b) => s + (b.amount || 0), 0) || 0
  const platformFees = Math.round(totalRevenue * 0.1)
  const openGrievances = grievancesRes.data?.filter(g => g.status === 'open').length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Overview</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Platform health at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat label="Total Lawyers" value={totalLawyers} icon={Users} color="#2563EB" />
        <Stat label="Verified Lawyers" value={verifiedLawyers} icon={BadgeCheck} color="#10B981" />
        <Stat label="Total Bookings" value={totalBookings} icon={CalendarCheck} color="#7C5FD4" />
        <Stat label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon={IndianRupee} color="#10B981" />
        <Stat label="Platform Fees (10%)" value={`₹${platformFees.toLocaleString('en-IN')}`} icon={TrendingUp} color="#2563EB" />
        <Stat label="Open Grievances" value={openGrievances} icon={MessageSquare} color="#DC2626" />
      </div>
    </div>
  )
}
