import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, Users, MessageSquare, BadgeCheck } from 'lucide-react'
import { AdminSignOut } from './AdminSignOut'
import { AdminMobileNav } from './AdminMobileNav'

const NAV = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/lawyers', label: 'Lawyers', icon: Users },
  { href: '/verifications', label: 'Verifications', icon: BadgeCheck },
  { href: '/grievances', label: 'Grievances', icon: MessageSquare },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: '#F8FAFC' }}>
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r" style={{ background: '#fff', borderColor: 'var(--border)' }}>
        <div className="h-14 flex items-center px-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <Image src="/logo.png" alt="vakil.bio" width={100} height={30} className="h-6 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} />
          <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}>Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-[#F1F5F9]"
              style={{ color: 'var(--text-secondary)' }}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <AdminSignOut />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden h-14 flex items-center justify-between px-4 sticky top-0 z-30 border-b"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
          <AdminMobileNav />
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="vakil.bio" width={80} height={24} className="h-5 w-auto" style={{ mixBlendMode: 'multiply' }} />
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}>Admin</span>
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-x-hidden min-w-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
