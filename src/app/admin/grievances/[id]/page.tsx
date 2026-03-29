import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { GrievanceActions } from './GrievanceActions'

export const dynamic = 'force-dynamic'

interface PageProps { params: Promise<{ id: string }> }

export default async function AdminGrievanceDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  if (!adminEmails.includes(user.email?.toLowerCase() ?? '')) redirect('/not-found')

  const { data: g } = await supabase.from('grievances').select('*').eq('id', id).single()
  if (!g) notFound()

  const STATUS_STYLE: Record<string, React.CSSProperties> = {
    open:       { background: 'rgba(220,38,38,0.08)',  color: '#DC2626' },
    in_review:  { background: 'rgba(234,179,8,0.1)',   color: '#B45309' },
    resolved:   { background: 'rgba(16,185,129,0.08)', color: '#10B981' },
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/grievances" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>← Grievances</Link>
        <span style={{ color: 'var(--border-lg)' }}>/</span>
        <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{g.subject}</span>
      </div>

      <div className="bg-white rounded-2xl border p-6 space-y-5" style={{ borderColor: 'var(--border)' }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{g.subject}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {g.name} · {g.email} · {new Date(g.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0"
            style={STATUS_STYLE[g.status] || STATUS_STYLE.open}>
            {g.status.replace('_', ' ')}
          </span>
        </div>

        {/* Description */}
        <div className="rounded-xl p-4" style={{ background: '#F8FAFC', border: '1px solid var(--border)' }}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{g.description}</p>
        </div>

        {/* Admin notes */}
        {g.admin_notes && (
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Internal Notes</p>
            <div className="rounded-xl p-4" style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#92400E' }}>{g.admin_notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <GrievanceActions grievanceId={g.id} currentStatus={g.status} currentNotes={g.admin_notes || ''} />
    </div>
  )
}
