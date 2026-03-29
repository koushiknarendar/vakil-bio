import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BadgeCheck, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminLawyersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  if (!adminEmails.includes(user.email?.toLowerCase() ?? '')) redirect('/not-found')

  const { data: lawyers } = await supabase
    .from('lawyers')
    .select('id, username, full_name, title, location, plan, is_verified, is_suspended, profile_views, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Lawyers</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{lawyers?.length || 0} registered advocates</p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
              <th className="text-left px-5 py-3 font-medium text-xs" style={{ color: 'var(--text-muted)' }}>Advocate</th>
              <th className="text-left px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-muted)' }}>Location</th>
              <th className="text-center px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-muted)' }}>Plan</th>
              <th className="text-center px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-muted)' }}>Status</th>
              <th className="text-center px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-muted)' }}>Views</th>
              <th className="text-center px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-muted)' }}>Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(lawyers || []).map((lawyer) => (
              <tr key={lawyer.id} style={{ borderBottom: '1px solid var(--border)' }}
                className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-5 py-3">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {lawyer.full_name}
                    {lawyer.is_verified && <BadgeCheck className="w-3.5 h-3.5 inline ml-1 text-blue-500" />}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>@{lawyer.username}</div>
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{lawyer.location || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={lawyer.plan === 'pro'
                      ? { background: 'rgba(124,95,212,0.1)', color: 'var(--purple)' }
                      : { background: 'rgba(15,23,42,0.06)', color: 'var(--text-muted)' }}>
                    {lawyer.plan}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {lawyer.is_suspended
                    ? <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}>Suspended</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(16,185,129,0.08)', color: 'var(--green)' }}>Active</span>
                  }
                </td>
                <td className="px-4 py-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  {lawyer.profile_views || 0}
                </td>
                <td className="px-4 py-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(lawyer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/${lawyer.username}`} target="_blank"
                      className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors"
                      style={{ color: 'var(--text-muted)' }}>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link href={`/admin/lawyers/${lawyer.id}`}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-[#F1F5F9]"
                      style={{ color: 'var(--blue)' }}>
                      Manage
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!lawyers || lawyers.length === 0) && (
          <div className="py-16 text-center" style={{ color: 'var(--text-muted)' }}>No lawyers yet</div>
        )}
      </div>
    </div>
  )
}
