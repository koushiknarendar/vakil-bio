'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, BookOpen, Users, BadgeCheck, XCircle, X } from 'lucide-react'

interface Notification {
  id: string
  type: 'booking' | 'lead' | 'verification_approved' | 'verification_rejected'
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const typeIcon: Record<Notification['type'], React.ReactNode> = {
  booking: <BookOpen className="w-4 h-4" style={{ color: '#4F7AFF' }} />,
  lead: <Users className="w-4 h-4" style={{ color: '#7C5CFC' }} />,
  verification_approved: <BadgeCheck className="w-4 h-4" style={{ color: '#059669' }} />,
  verification_rejected: <XCircle className="w-4 h-4" style={{ color: '#DC2626' }} />,
}

export function DashboardNotifications() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => setNotifications(d.notifications ?? []))
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleOpen() {
    setOpen(o => !o)
    if (!open && unread > 0) {
      await fetch('/api/notifications', { method: 'PATCH' })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
  }

  function handleClick(n: Notification) {
    setOpen(false)
    if (n.link) router.push(n.link)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
            style={{ background: '#DC2626', fontSize: '9px', fontWeight: 700, lineHeight: 1 }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-xl overflow-hidden z-50"
          style={{ background: '#fff', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</span>
            <button onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: '360px' }}>
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <button key={n.id} onClick={() => handleClick(n)}
                  className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-gray-50"
                  style={!n.read ? { background: 'rgba(79,122,255,0.04)' } : {}}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    {typeIcon[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: '#4F7AFF' }} />
                      )}
                    </div>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
