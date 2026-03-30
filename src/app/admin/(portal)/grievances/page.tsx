import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  open:       { background: 'rgba(220,38,38,0.08)',   color: '#DC2626' },
  in_review:  { background: 'rgba(234,179,8,0.1)',    color: '#B45309' },
  resolved:   { background: 'rgba(16,185,129,0.08)',  color: '#10B981' },
}

export default async function AdminGrievancesPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: grievances } = await supabase
    .from('grievances')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Grievances</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{grievances?.length || 0} total submissions</p>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {(grievances || []).map((g) => (
          <div key={g.id} className="bg-white rounded-2xl border p-4 space-y-2" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{g.name}</div>
                <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{g.email}</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0"
                style={STATUS_STYLE[g.status] || STATUS_STYLE.open}>
                {g.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{g.subject}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {new Date(g.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
              <Link href={`/admin/grievances/${g.id}`}
                className="text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ color: 'var(--blue)', background: 'rgba(79,122,255,0.08)' }}>
                View
              </Link>
            </div>
          </div>
        ))}
        {(!grievances || grievances.length === 0) && (
          <div className="py-16 text-center bg-white rounded-2xl border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>No grievances yet</div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
              <th className="text-left px-5 py-3 font-medium text-xs" style={{ color: 'var(--text-muted)' }}>From</th>
              <th className="text-left px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-muted)' }}>Subject</th>
              <th className="text-center px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-muted)' }}>Status</th>
              <th className="text-center px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-muted)' }}>Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(grievances || []).map((g) => (
              <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}
                className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-5 py-3">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{g.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{g.email}</div>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="truncate" style={{ color: 'var(--text-secondary)' }}>{g.subject}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                    style={STATUS_STYLE[g.status] || STATUS_STYLE.open}>
                    {g.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(g.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/grievances/${g.id}`}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-[#F1F5F9]"
                    style={{ color: 'var(--blue)' }}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!grievances || grievances.length === 0) && (
          <div className="py-16 text-center" style={{ color: 'var(--text-muted)' }}>No grievances yet</div>
        )}
      </div>
    </div>
  )
}
