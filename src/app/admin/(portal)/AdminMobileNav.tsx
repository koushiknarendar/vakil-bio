'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, LayoutDashboard, Users, BadgeCheck, MessageSquare, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/lawyers', label: 'Lawyers', icon: Users },
  { href: '/verifications', label: 'Verifications', icon: BadgeCheck },
  { href: '/grievances', label: 'Grievances', icon: MessageSquare },
]

export function AdminMobileNav() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { setMounted(true) }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const drawer = (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)} />
      <div className="fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col shadow-xl"
        style={{ background: '#fff' }}>
        <div className="h-14 flex items-center justify-between px-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="vakil.bio" width={80} height={24} className="h-5 w-auto" style={{ mixBlendMode: 'multiply' }} />
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}>Admin</span>
          </div>
          <button onClick={() => setOpen(false)} className="p-1" style={{ color: 'var(--text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-[#F1F5F9]"
              style={{ color: 'var(--text-secondary)' }}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-[#F1F5F9]"
            style={{ color: 'var(--text-muted)' }}>
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <button onClick={() => setOpen(true)} className="p-2 rounded-lg lg:hidden" style={{ color: 'var(--text-secondary)' }}>
        <Menu className="w-5 h-5" />
      </button>
      {mounted && open && createPortal(drawer, document.body)}
    </>
  )
}
