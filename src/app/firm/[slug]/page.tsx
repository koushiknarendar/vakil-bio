import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { BadgeCheck, MapPin, Globe, Mail, Phone, Calendar, Users, Building2 } from 'lucide-react'
import { Footer } from '@/components/Footer'
import { FirmViewTracker } from '@/components/FirmViewTracker'

function getSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://vakil.bio'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = getSupabase()
  const { data: company } = await supabase.from('companies').select('name, tagline, location').eq('slug', slug).single()
  if (!company) return { title: 'Firm Not Found' }

  const title = `${company.name} — Law Firm Profile | vakil.bio`
  const description = company.tagline
    || `${company.name} is a law firm${company.location ? ` based in ${company.location}` : ''} on vakil.bio.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    alternates: { canonical: `${BASE}/firm/${slug}` },
  }
}

export default async function FirmPage({ params }: Props) {
  const { slug } = await params
  const supabase = getSupabase()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!company) notFound()

  const { data: membersData } = await supabase
    .from('company_members')
    .select('role, lawyer:lawyers(id, full_name, username, photo_url, title, location, is_verified, verified_until, verification_type, years_experience)')
    .eq('company_id', company.id)
    .order('role') // admins first

  const members = (membersData ?? []).map(m => ({
    role: m.role,
    lawyer: m.lawyer as unknown as {
      id: string; full_name: string; username: string; photo_url?: string
      title?: string; location?: string; is_verified: boolean
      verified_until?: string; verification_type?: string; years_experience?: number
    },
  }))

  const now = new Date()
  const verifiedCount = members.filter(m =>
    m.lawyer.is_verified && (!m.lawyer.verified_until || new Date(m.lawyer.verified_until) > now)
  ).length

  // JSON-LD: Organization
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: company.name,
    description: company.about || company.tagline,
    url: `${BASE}/firm/${slug}`,
    ...(company.logo_url && { logo: company.logo_url }),
    ...(company.email && { email: company.email }),
    ...(company.phone && { telephone: company.phone }),
    ...(company.website && { sameAs: [company.website] }),
    ...(company.location && { address: { '@type': 'PostalAddress', addressLocality: company.location, addressCountry: 'IN' } }),
    ...(company.founded_year && { foundingDate: String(company.founded_year) }),
    ...(company.practice_areas?.length && { knowsAbout: company.practice_areas }),
    employee: members.map(m => ({
      '@type': 'Person',
      name: m.lawyer.full_name,
      jobTitle: m.lawyer.title || 'Advocate',
      url: `${BASE}/${m.lawyer.username}`,
    })),
  }

  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <FirmViewTracker companyId={company.id} />

      <div className="min-h-screen" style={{ background: '#F4F6FB' }}>
        {/* Nav */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid #E9ECF4',
        }}>
          <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/">
              <Image src="/logo.png" alt="vakil.bio" width={100} height={28}
                style={{ height: '22px', width: 'auto', mixBlendMode: 'multiply' }} priority />
            </Link>
            <Link href="/discover"
              style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>
              Find Lawyers
            </Link>
          </div>
        </nav>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px 80px' }}>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <ol style={{ display: 'flex', alignItems: 'center', gap: '6px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: '#94A3B8' }}>
              <li><Link href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</Link></li>
              <li>›</li>
              <li><Link href="/discover" style={{ color: '#94A3B8', textDecoration: 'none' }}>Find Lawyers</Link></li>
              <li>›</li>
              <li style={{ color: '#4F7AFF' }}>{company.name}</li>
            </ol>
          </nav>

          {/* Header card */}
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #EEF0F6', padding: '32px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
              {/* Logo */}
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name}
                  style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', border: '1px solid #EEF0F6', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: '80px', height: '80px', borderRadius: '20px', flexShrink: 0,
                  background: 'rgba(79,122,255,0.08)', border: '1px solid rgba(79,122,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Building2 style={{ width: '36px', height: '36px', color: '#4F7AFF' }} />
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                  {company.name}
                </h1>
                {company.tagline && (
                  <p style={{ fontSize: '15px', color: '#64748B', margin: '0 0 14px' }}>{company.tagline}</p>
                )}

                {/* Meta pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {company.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#64748B' }}>
                      <MapPin style={{ width: '13px', height: '13px' }} />{company.location}
                    </span>
                  )}
                  {company.founded_year && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#64748B' }}>
                      <Calendar style={{ width: '13px', height: '13px' }} />Est. {company.founded_year}
                    </span>
                  )}
                  {company.team_size && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#64748B' }}>
                      <Users style={{ width: '13px', height: '13px' }} />{company.team_size} people
                    </span>
                  )}
                  {verifiedCount > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                      <BadgeCheck style={{ width: '13px', height: '13px' }} />{verifiedCount} Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Contact links */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer"
                    style={{ padding: '8px', borderRadius: '12px', border: '1px solid #EEF0F6', background: '#F8FAFC', color: '#64748B', display: 'flex' }}>
                    <Globe style={{ width: '16px', height: '16px' }} />
                  </a>
                )}
                {company.email && (
                  <a href={`mailto:${company.email}`}
                    style={{ padding: '8px', borderRadius: '12px', border: '1px solid #EEF0F6', background: '#F8FAFC', color: '#64748B', display: 'flex' }}>
                    <Mail style={{ width: '16px', height: '16px' }} />
                  </a>
                )}
                {company.phone && (
                  <a href={`tel:${company.phone}`}
                    style={{ padding: '8px', borderRadius: '12px', border: '1px solid #EEF0F6', background: '#F8FAFC', color: '#64748B', display: 'flex' }}>
                    <Phone style={{ width: '16px', height: '16px' }} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* About */}
          {company.about && (
            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #EEF0F6', padding: '28px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px' }}>About</h2>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>{company.about}</p>
            </div>
          )}

          {/* Practice areas */}
          {company.practice_areas?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #EEF0F6', padding: '28px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px' }}>Practice Areas</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {company.practice_areas.map((area: string) => (
                  <Link key={area} href={`/discover?area=${encodeURIComponent(area)}`}
                    style={{
                      fontSize: '13px', fontWeight: 500, padding: '6px 14px', borderRadius: '999px',
                      background: 'rgba(79,122,255,0.07)', color: '#4F7AFF',
                      border: '1px solid rgba(79,122,255,0.15)', textDecoration: 'none',
                    }}>
                    {area}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Team */}
          {members.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #EEF0F6', padding: '28px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 20px' }}>
                Our Team ({members.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                {members.map(({ role, lawyer: l }) => {
                  const activeVerified = l.is_verified && (!l.verified_until || new Date(l.verified_until) > now)
                  const verifiedLabel = activeVerified
                    ? (l.verification_type === 'advocate' ? 'Verified Advocate'
                      : l.verification_type === 'professional' ? 'Verified Professional'
                      : 'Verified')
                    : null
                  return (
                    <Link key={l.username} href={`/${l.username}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        border: '1px solid #EEF0F6', borderRadius: '16px', padding: '16px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {l.photo_url ? (
                            <img src={l.photo_url} alt={l.full_name}
                              style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{
                              width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                              background: 'linear-gradient(135deg, #4F7AFF, #9B6DFF)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '15px', fontWeight: 700, color: '#fff',
                            }}>
                              {initials(l.full_name)}
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{l.full_name}</span>
                              {activeVerified && <BadgeCheck style={{ width: '14px', height: '14px', color: '#059669', flexShrink: 0 }} />}
                            </div>
                            {l.title && <p style={{ fontSize: '12px', color: '#6366F1', margin: '2px 0 0', fontWeight: 500 }}>{l.title}</p>}
                            {l.location && (
                              <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <MapPin style={{ width: '10px', height: '10px' }} />{l.location}
                              </p>
                            )}
                          </div>
                        </div>
                        {(verifiedLabel || role === 'admin') && (
                          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                            {role === 'admin' && (
                              <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'rgba(79,122,255,0.1)', color: '#4F7AFF', border: '1px solid rgba(79,122,255,0.2)' }}>
                                Partner
                              </span>
                            )}
                            {verifiedLabel && (
                              <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <BadgeCheck style={{ width: '10px', height: '10px' }} />{verifiedLabel}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
