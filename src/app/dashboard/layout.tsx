import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  Users,
  User,
  Briefcase,
  Clock,
  BadgeCheck,
  Building2,
} from 'lucide-react'
import { DashboardNotifications } from './DashboardNotifications'
import { createClient } from '@/lib/supabase/server'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/bookings', icon: CalendarCheck, label: 'Bookings' },
  { href: '/dashboard/leads', icon: Users, label: 'Leads' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
  { href: '/dashboard/services', icon: Briefcase, label: 'Services' },
  { href: '/dashboard/availability', icon: Clock, label: 'Availability' },
  { href: '/dashboard/company', icon: Building2, label: 'Firm', mobileHide: false },
  { href: '/dashboard/calendar', icon: CalendarDays, label: 'Calendar', mobileHide: true },
  { href: '/dashboard/verification', icon: BadgeCheck, label: 'Get Verified', mobileHide: false },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: lawyer } = await supabase
    .from('lawyers')
    .select('id, full_name, username, plan, photo_url, is_verified, verified_until, verification_type')
    .eq('user_id', user.id)
    .single()

  if (!lawyer) redirect('/auth/onboarding')

  const initials = lawyer.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const now = new Date()
  const lawyerIsVerified = lawyer?.is_verified && lawyer?.verified_until && new Date(lawyer.verified_until) > now
  const daysLeft = lawyer?.verified_until
    ? Math.max(0, Math.ceil((new Date(lawyer.verified_until).getTime() - now.getTime()) / 86400000))
    : 0

  return (
    <div className="min-h-screen flex font-body" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col fixed left-0 top-0 bottom-0 z-40"
        style={{ background: 'var(--bg-base)', borderRight: '1px solid var(--border)' }}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <Image
            src="/logo.png"
            alt="vakil.bio"
            width={120}
            height={32}
            className="h-7 w-auto object-contain"
            style={{ mixBlendMode: 'multiply' }}
            priority
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isVerificationItem = href === '/dashboard/verification'
            const showUpgradeDot = isVerificationItem && !lawyerIsVerified
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={isVerificationItem && !lawyerIsVerified
                  ? { color: '#4F7AFF', background: 'rgba(79,122,255,0.06)' }
                  : { color: 'var(--text-secondary)' }
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {showUpgradeDot && (
                  <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg, #4F7AFF, #9B6DFF)', fontSize: '9px' }}>
                    NEW
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Verified badge expiry */}
          {lawyerIsVerified && (
            <Link href="/dashboard/verification">
              <div className="rounded-xl px-3 py-2 flex items-center justify-between"
                style={{
                  background: daysLeft <= 7 ? 'rgba(220,38,38,0.06)' : daysLeft <= 30 ? 'rgba(245,158,11,0.06)' : 'rgba(5,150,105,0.06)',
                  border: `1px solid ${daysLeft <= 7 ? 'rgba(220,38,38,0.2)' : daysLeft <= 30 ? 'rgba(245,158,11,0.2)' : 'rgba(5,150,105,0.2)'}`,
                }}>
                <div className="flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: daysLeft <= 7 ? '#DC2626' : daysLeft <= 30 ? '#F59E0B' : '#059669' }} />
                  <span className="text-xs font-medium" style={{ color: daysLeft <= 7 ? '#DC2626' : daysLeft <= 30 ? '#D97706' : '#059669' }}>
                    {lawyer.verification_type === 'advocate' ? 'Verified Advocate' : 'Verified Professional'}
                  </span>
                </div>
                <span className="text-xs font-semibold shrink-0" style={{ color: daysLeft <= 7 ? '#DC2626' : daysLeft <= 30 ? '#D97706' : '#6B7280' }}>
                  {daysLeft}d
                </span>
              </div>
            </Link>
          )}
          <div className="flex items-center gap-2.5">
            {lawyer.photo_url ? (
              <img src={lawyer.photo_url} alt={lawyer.full_name}
                className="w-8 h-8 rounded-full object-cover shrink-0"
                style={{ border: '1px solid var(--border)' }} />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: 'var(--grad-brand)' }}>
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{lawyer.full_name}</div>
              <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>@{lawyer.username}</div>
            </div>
            <div
              className="text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0"
              style={
                lawyer.plan === 'pro'
                  ? { background: 'rgba(16,185,129,0.1)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.2)' }
                  : { background: 'rgba(15,23,42,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {lawyer.plan === 'pro' ? 'Pro' : 'Free'}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30"
          style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <Image
              src="/logo.png"
              alt="vakil.bio"
              width={110}
              height={28}
              className="h-7 w-auto object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <DashboardNotifications />
            {lawyer.photo_url ? (
              <img src={lawyer.photo_url} alt={lawyer.full_name}
                className="w-8 h-8 rounded-full object-cover"
                style={{ border: '1px solid var(--border)' }} />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'var(--grad-brand)' }}>
                {initials}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>

      {/* Bottom nav - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 h-16"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border)' }}>
        {navItems.filter(item => !('mobileHide' in item && item.mobileHide)).map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 py-1 px-2 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
