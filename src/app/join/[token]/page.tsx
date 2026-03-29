import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Building2, Users, MapPin } from 'lucide-react'
import { JoinButton } from './JoinButton'

interface Props {
  params: Promise<{ token: string }>
}

export default async function JoinPage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()

  // Validate token
  const { data: invite } = await supabase
    .from('company_invites')
    .select('company_id, expires_at, company:companies(id, name, slug, logo_url, tagline, location)')
    .eq('token', token)
    .single()

  if (!invite || new Date(invite.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F6FB' }}>
        <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '24px', border: '1px solid #EEF0F6', maxWidth: '400px', margin: '0 24px' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>🔗</p>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Invalid or expired link</h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>This invite link has expired or is no longer valid. Ask the firm admin to generate a new one.</p>
          <Link href="/dashboard" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: '12px', background: '#4F7AFF', color: '#fff', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const company = invite.company as unknown as { id: string; name: string; slug: string; logo_url?: string; tagline?: string; location?: string }

  // Check if already logged in and already in a company
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: lawyer } = await supabase.from('lawyers').select('id').eq('user_id', user.id).single()
    if (lawyer) {
      const { data: existing } = await supabase.from('company_members').select('id').eq('lawyer_id', lawyer.id).single()
      if (existing) redirect('/dashboard/company')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F6FB' }}>
      <div style={{ width: '100%', maxWidth: '440px', margin: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/">
            <Image src="/logo.png" alt="vakil.bio" width={120} height={32}
              style={{ height: '28px', width: 'auto', mixBlendMode: 'multiply' }} priority />
          </Link>
        </div>

        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #EEF0F6', padding: '36px', textAlign: 'center' }}>
          {/* Firm logo / icon */}
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name}
              style={{ width: '72px', height: '72px', borderRadius: '18px', objectFit: 'cover', margin: '0 auto 16px', border: '1px solid #EEF0F6' }} />
          ) : (
            <div style={{
              width: '72px', height: '72px', borderRadius: '18px', margin: '0 auto 16px',
              background: 'rgba(79,122,255,0.08)', border: '1px solid rgba(79,122,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 style={{ width: '32px', height: '32px', color: '#4F7AFF' }} />
            </div>
          )}

          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
            {company.name}
          </h1>
          {company.tagline && (
            <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 12px' }}>{company.tagline}</p>
          )}
          {company.location && (
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <MapPin style={{ width: '12px', height: '12px' }} />{company.location}
            </p>
          )}

          <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users style={{ width: '18px', height: '18px', color: '#4F7AFF', flexShrink: 0 }} />
            <p style={{ fontSize: '14px', color: '#475569', margin: 0, textAlign: 'left' }}>
              You&apos;ve been invited to join <strong>{company.name}</strong> on vakil.bio.
            </p>
          </div>

          <JoinButton token={token} companySlug={company.slug} isLoggedIn={!!user} />

          <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '16px' }}>
            You need a vakil.bio account to join.
          </p>
        </div>
      </div>
    </div>
  )
}
