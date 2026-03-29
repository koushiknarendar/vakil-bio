import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  open:       { background: 'rgba(220,38,38,0.08)',   color: '#DC2626' },
  in_review:  { background: 'rgba(234,179,8,0.1)',    color: '#B45309' },
  resolved:   { background: 'rgba(16,185,129,0.08)',  color: '#10B981' },
}

export default async function AdminGrievancesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  if (!adminEmails.includes(user.email?.toLowerCase() ?? '')) redirect('/not-found')

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

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
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
