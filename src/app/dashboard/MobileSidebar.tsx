'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu, X,
  LayoutDashboard, CalendarCheck, CalendarDays,
  Users, User, Briefcase, Clock, BadgeCheck, Building2,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/bookings', icon: CalendarCheck, label: 'Bookings' },
  { href: '/dashboard/leads', icon: Users, label: 'Leads' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
  { href: '/dashboard/services', icon: Briefcase, label: 'Services' },
  { href: '/dashboard/availability', icon: Clock, label: 'Availability' },
  { href: '/dashboard/company', icon: Building2, label: 'Firm' },
  { href: '/dashboard/calendar', icon: CalendarDays, label: 'Calendar' },
  { href: '/dashboard/verification', icon: BadgeCheck, label: 'Get Verified' },
]

interface Props {
  lawyer: {
    full_name: string
    username: string
    plan: string
    photo_url?: string | null
    verification_type?: string | null
  }
  initials: string
  lawyerIsVerified: boolean
  daysLeft: number
}

export function MobileSidebar({ lawyer, initials, lawyerIsVerified, daysLeft }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Header left: logo + hamburger */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg -ml-1"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Image
          src="/logo.png"
          alt="vakil.bio"
          width={110}
          height={28}
          className="h-7 w-auto object-contain"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 flex flex-col"
            style={{ background: 'var(--bg-base)', borderRight: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <Image
                src="/logo.png"
                alt="vakil.bio"
                width={110}
                height={28}
                className="h-7 w-auto object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
              {NAV.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href
                const isVerification = href === '/dashboard/verification'
                const highlight = isVerification && !lawyerIsVerified
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all"
                    style={
                      isActive
                        ? { background: 'rgba(79,122,255,0.08)', color: '#4F7AFF' }
                        : highlight
                        ? { color: '#4F7AFF', background: 'rgba(79,122,255,0.04)' }
                        : { color: 'var(--text-secondary)' }
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {label}
                    {highlight && !isActive && (
                      <span className="ml-auto text-white px-1.5 py-0.5 rounded-full"
                        style={{ background: 'linear-gradient(135deg,#4F7AFF,#9B6DFF)', fontSize: '9px', fontWeight: 700 }}>
                        NEW
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Footer: verified badge + profile */}
            <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
              {lawyerIsVerified && (
                <Link href="/dashboard/verification">
                  <div className="rounded-xl px-3 py-2 flex items-center justify-between"
                    style={{
                      background: daysLeft <= 7 ? 'rgba(220,38,38,0.06)' : daysLeft <= 30 ? 'rgba(245,158,11,0.06)' : 'rgba(5,150,105,0.06)',
                      border: `1px solid ${daysLeft <= 7 ? 'rgba(220,38,38,0.2)' : daysLeft <= 30 ? 'rgba(245,158,11,0.2)' : 'rgba(5,150,105,0.2)'}`,
                    }}>
                    <div className="flex items-center gap-1.5">
                      <BadgeCheck className="w-3.5 h-3.5"
                        style={{ color: daysLeft <= 7 ? '#DC2626' : daysLeft <= 30 ? '#F59E0B' : '#059669' }} />
                      <span className="text-xs font-medium"
                        style={{ color: daysLeft <= 7 ? '#DC2626' : daysLeft <= 30 ? '#D97706' : '#059669' }}>
                        {lawyer.verification_type === 'advocate' ? 'Verified Advocate' : 'Verified Professional'}
                      </span>
                    </div>
                    <span className="text-xs font-semibold"
                      style={{ color: daysLeft <= 7 ? '#DC2626' : daysLeft <= 30 ? '#D97706' : '#6B7280' }}>
                      {daysLeft}d
                    </span>
                  </div>
                </Link>
              )}

              <div className="flex items-center gap-2.5">
                {lawyer.photo_url ? (
                  <img src={lawyer.photo_url} alt={lawyer.full_name}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                    style={{ border: '1px solid var(--border)' }} />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: 'var(--grad-brand)' }}>
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {lawyer.full_name}
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    @{lawyer.username}
                  </div>
                </div>
                <div className="text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0"
                  style={lawyer.plan === 'pro'
                    ? { background: 'rgba(16,185,129,0.1)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.2)' }
                    : { background: 'rgba(15,23,42,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                  }>
                  {lawyer.plan === 'pro' ? 'Pro' : 'Free'}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
