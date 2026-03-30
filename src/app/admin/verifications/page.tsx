import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { BadgeCheck, Clock, XCircle, CheckCircle } from 'lucide-react'
import { VerificationActions } from './VerificationActions'

interface VerificationApp {
  id: string
  status: string
  verification_type: string
  bar_council_number?: string
  state_bar_council?: string
  professional_role?: string
  linkedin_url?: string
  rejection_reason?: string
  created_at: string
  doc1SignedUrl?: string
  doc2SignedUrl?: string
  lawyer: { full_name: string; username: string; email: string; photo_url?: string }
}

function getServiceSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default async function AdminVerificationsPage() {
  const authSupabase = await createServerClient()
  const { data: { user } } = await authSupabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(e => e.trim())
  if (!adminPhones.includes(user.phone ?? '')) redirect('/dashboard')

  const supabase = getServiceSupabase()

  const { data: applications } = await supabase
    .from('verification_applications')
    .select('*, lawyer:lawyers(id, full_name, username, email, photo_url)')
    .order('created_at', { ascending: false })

  const pending = applications?.filter(a => a.status === 'pending') ?? []
  const reviewed = applications?.filter(a => a.status !== 'pending') ?? []

  // Generate signed URLs for documents
  async function getSignedUrl(path: string | null) {
    if (!path) return null
    const { data } = await supabase.storage.from('verification-docs').createSignedUrl(path, 3600)
    return data?.signedUrl ?? null
  }

  const appsWithUrls: VerificationApp[] = await Promise.all(
    (applications ?? []).map(async (app) => ({
      ...app,
      lawyer: app.lawyer as VerificationApp['lawyer'],
      doc1SignedUrl: await getSignedUrl(app.document_1_url) ?? undefined,
      doc2SignedUrl: await getSignedUrl(app.document_2_url) ?? undefined,
    }))
  )

  const pendingWithUrls = appsWithUrls.filter(a => a.status === 'pending')
  const reviewedWithUrls = appsWithUrls.filter(a => a.status !== 'pending')

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Verification Applications</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {pending.length} pending · {reviewed.length} reviewed
          </p>
        </div>
      </div>

      {/* Pending */}
      {pendingWithUrls.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Clock className="w-4 h-4 text-amber-500" /> Pending Review ({pendingWithUrls.length})
          </h2>
          <div className="space-y-4">
            {pendingWithUrls.map(app => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        </section>
      )}

      {pendingWithUrls.length === 0 && (
        <div className="text-center py-16 rounded-2xl bg-white border" style={{ borderColor: 'var(--border)' }}>
          <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#059669' }} />
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>All caught up!</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>No pending verification applications.</p>
        </div>
      )}

      {/* Reviewed */}
      {reviewedWithUrls.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
            Recently Reviewed ({reviewedWithUrls.length})
          </h2>
          <div className="space-y-3">
            {reviewedWithUrls.map(app => (
              <ApplicationCard key={app.id} app={app} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ApplicationCard({ app, compact = false }: { app: VerificationApp; compact?: boolean }) {
  const lawyer = app.lawyer
  const isAdvocate = app.verification_type === 'advocate'
  const initials = lawyer.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {lawyer.photo_url ? (
            <img src={lawyer.photo_url} alt={lawyer.full_name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #4F7AFF, #9B6DFF)' }}>
              {initials}
            </div>
          )}
          <div>
            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{lawyer.full_name}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>@{lawyer.username} · {lawyer.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={isAdvocate
              ? { background: 'rgba(79,122,255,0.1)', color: '#4F7AFF', border: '1px solid rgba(79,122,255,0.2)' }
              : { background: 'rgba(155,109,255,0.1)', color: '#7C5CFC', border: '1px solid rgba(155,109,255,0.2)' }
            }>
            {isAdvocate ? 'Advocate' : 'Professional'}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(app.created_at as string)}</span>
        </div>
      </div>

      {/* Details */}
      {!compact && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          {isAdvocate ? (
            <>
              <Detail label="Enrollment No." value={app.bar_council_number} />
              <Detail label="State Bar Council" value={app.state_bar_council} />
            </>
          ) : (
            <Detail label="Role" value={app.professional_role} />
          )}
          {app.linkedin_url && <Detail label="LinkedIn" value={app.linkedin_url} link />}
        </div>
      )}

      {/* Documents */}
      {!compact && (app.doc1SignedUrl || app.doc2SignedUrl) && (
        <div className="flex gap-2 flex-wrap">
          {app.doc1SignedUrl && (
            <a href={app.doc1SignedUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:opacity-80"
              style={{ background: 'rgba(79,122,255,0.08)', color: '#4F7AFF', border: '1px solid rgba(79,122,255,0.15)' }}>
              📄 {isAdvocate ? 'Sanad / Certificate' : 'Degree Certificate'}
            </a>
          )}
          {app.doc2SignedUrl && (
            <a href={app.doc2SignedUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:opacity-80"
              style={{ background: 'rgba(79,122,255,0.08)', color: '#4F7AFF', border: '1px solid rgba(79,122,255,0.15)' }}>
              📄 ID Proof
            </a>
          )}
        </div>
      )}

      {/* Status / Actions */}
      {app.status === 'pending' ? (
        <VerificationActions applicationId={app.id} />
      ) : (
        <div className="flex items-center gap-2 text-xs font-medium pt-1"
          style={app.status === 'approved'
            ? { color: '#059669' }
            : { color: '#DC2626' }
          }>
          {app.status === 'approved'
            ? <><CheckCircle className="w-3.5 h-3.5" /> Approved</>
            : <><XCircle className="w-3.5 h-3.5" /> Rejected — {app.rejection_reason}</>

          }
        </div>
      )}
    </div>
  )
}

function Detail({ label, value, link = false }: { label: string; value?: string; link?: boolean }) {
  if (!value) return null
  return (
    <div>
      <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium" style={{ color: '#4F7AFF' }}>
          {value}
        </a>
      ) : (
        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</div>
      )}
    </div>
  )
}
