import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import {
  MapPin,
  Clock,
  BadgeCheck,
  Phone,
  MessageCircle,
  Briefcase,
  Globe,
  GraduationCap,
  Building2,
  ArrowRight,
  Calendar,
  FileText,
  Link as LinkIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ShareButton } from '@/components/ShareButton'
import { Footer } from '@/components/Footer'
import { LeadForm } from '@/components/LeadForm'
import { ProfileViewTracker } from '@/components/ProfileViewTracker'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { getProfileTranslation, getUILabels, SUPPORTED_LANGUAGES } from '@/lib/translate'
import type { Metadata } from 'next'
import type { Service } from '@/lib/types'

interface Props {
  params: Promise<{ username: string }>
  searchParams: Promise<{ lang?: string }>
}

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://vakil.bio'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: lawyer } = await supabase
    .from('lawyers')
    .select('full_name, title, bio, photo_url, location, practice_areas, years_experience')
    .eq('username', username)
    .single()

  if (!lawyer) return { title: 'Advocate Not Found — vakil.bio' }

  const areas = lawyer.practice_areas?.slice(0, 3).join(', ')
  const locationStr = lawyer.location ? ` in ${lawyer.location}` : ''
  const title = lawyer.location && areas
    ? `${lawyer.full_name} — ${areas} Lawyer${locationStr} | vakil.bio`
    : `${lawyer.full_name} — ${lawyer.title || 'Advocate'} | vakil.bio`

  const description = lawyer.bio
    ? lawyer.bio.slice(0, 160)
    : `Consult ${lawyer.full_name}${locationStr} on vakil.bio. ${areas ? `Specialises in ${areas}.` : ''} Book a consultation or send a free enquiry.`

  const keywords = [
    lawyer.full_name, lawyer.title, lawyer.location,
    ...(lawyer.practice_areas ?? []),
    'vakil.bio', 'advocate India', 'lawyer consultation',
  ].filter(Boolean).join(', ')

  const profileUrl = `${BASE}/${username}`

  return {
    title,
    description,
    keywords,
    alternates: { canonical: profileUrl },
    openGraph: {
      title, description,
      url: profileUrl,
      type: 'profile',
      siteName: 'vakil.bio',
      images: lawyer.photo_url ? [{ url: lawyer.photo_url, width: 400, height: 400, alt: lawyer.full_name }] : [],
    },
    twitter: { card: 'summary', title, description, images: lawyer.photo_url ? [lawyer.photo_url] : [] },
  }
}

// ── Shared card style ────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #EEF0F6',
  borderRadius: '20px',
  boxShadow: '0 2px 16px rgba(15,23,42,0.05)',
}

const pageStyles = `
  .svc-card { transition: box-shadow 0.18s, border-color 0.18s; cursor: default; }
  .svc-card:hover { box-shadow: 0 6px 28px rgba(79,122,255,0.1) !important; border-color: #C7D4FF !important; }
  .book-btn { transition: opacity 0.15s, transform 0.15s; }
  .book-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .cta-btn { transition: opacity 0.15s; }
  .cta-btn:hover { opacity: 0.85; }
`

export default async function PublicProfilePage({ params, searchParams }: Props) {
  const { username } = await params
  const { lang } = await searchParams

  // Validate lang param — fall back to 'en' if not in our list
  const activeLang = SUPPORTED_LANGUAGES.some(l => l.code === lang && lang !== 'en')
    ? lang!
    : 'en'

  const supabase = await createClient()

  const { data: lawyer } = await supabase.from('lawyers').select('*').eq('username', username).single()
  if (!lawyer || lawyer.is_suspended) notFound()

  const { data: services } = await supabase
    .from('services').select('*').eq('lawyer_id', lawyer.id).eq('is_active', true).order('created_at')

  const allServices: Service[] = services ?? []

  // Verification is only active if is_verified=true AND verified_until is in the future
  const isVerified = lawyer.is_verified &&
    (!lawyer.verified_until || new Date(lawyer.verified_until) > new Date())

  // ── Apply translations ─────────────────────────────────────────────
  let displayTitle: string | undefined = lawyer.title
  let displayBio: string | undefined = lawyer.bio
  let displayServices = allServices

  if (activeLang !== 'en') {
    try {
      const t = await getProfileTranslation(lawyer, allServices, activeLang)
      if (t.title) displayTitle = t.title
      if (t.bio) displayBio = t.bio
      if (t.services.length) {
        displayServices = allServices.map(s => {
          const ts = t.services.find(ts => ts.id === s.id)
          return ts ? { ...s, title: ts.title, description: ts.description } : s
        })
      }
    } catch (e) {
      console.error('Translation failed, falling back to English:', e)
    }
  }

  const labels = getUILabels(activeLang)
  const initials = lawyer.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const profileUrl = `${BASE}/${username}`

  // ── JSON-LD structured data ────────────────────────────────────────
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: lawyer.full_name,
    jobTitle: lawyer.title || 'Advocate',
    description: lawyer.bio || undefined,
    url: profileUrl,
    image: lawyer.photo_url || undefined,
    ...(lawyer.location ? {
      address: { '@type': 'PostalAddress', addressLocality: lawyer.location, addressCountry: 'IN' },
      workLocation: { '@type': 'Place', name: lawyer.location },
    } : {}),
    knowsAbout: lawyer.practice_areas ?? [],
    ...(lawyer.years_experience ? { hasOccupation: {
      '@type': 'Occupation',
      name: 'Lawyer',
      estimatedSalary: undefined,
      occupationLocation: lawyer.location ? { '@type': 'City', name: lawyer.location } : undefined,
    } } : {}),
    ...(lawyer.linkedin_url ? { sameAs: [lawyer.linkedin_url] } : {}),
    ...(allServices.length > 0 ? {
      offers: allServices.map(s => ({
        '@type': 'Offer',
        name: s.title,
        description: s.description || undefined,
        price: s.price === 0 ? '0' : String(s.price),
        priceCurrency: 'INR',
      })),
    } : {}),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Find Lawyers', item: `${BASE}/discover` },
      { '@type': 'ListItem', position: 3, name: lawyer.full_name, item: profileUrl },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <div style={{ background: '#F4F6FB', minHeight: '100vh', fontFamily: 'inherit' }}>
      <style>{pageStyles}</style>

      {/* ── Minimal nav ────────────────────────────────────────────── */}
      <div style={{ background: '#F4F6FB', borderBottom: '1px solid #E9ECF4' }}>
        <div style={{
          maxWidth: '560px', margin: '0 auto', padding: '0 20px',
          height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/">
            <Image
              src="/logo.png" alt="vakil.bio" width={80} height={24}
              style={{ height: '20px', width: 'auto', mixBlendMode: 'multiply', opacity: 0.75 }}
              priority
            />
          </Link>
          <Suspense fallback={null}>
            <LanguageSwitcher currentLang={activeLang} />
          </Suspense>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '28px 16px 56px' }}>

        {/* ── Profile header ── */}
        <div style={{ marginBottom: '8px' }}>

          {/* Avatar */}
          <div style={{ marginBottom: '16px' }}>
            {lawyer.photo_url ? (
              <img
                src={lawyer.photo_url} alt={lawyer.full_name}
                style={{
                  width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover',
                  border: '3px solid #fff',
                  boxShadow: '0 0 0 3px #4F7AFF, 0 4px 20px rgba(79,122,255,0.2)',
                }}
              />
            ) : (
              <div style={{
                width: '88px', height: '88px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #4F7AFF, #9B6DFF)',
                border: '3px solid #fff',
                boxShadow: '0 0 0 3px #4F7AFF, 0 4px 20px rgba(79,122,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', fontWeight: 700, color: '#fff',
              }}>
                {initials}
              </div>
            )}
          </div>

          {/* Name + verified */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
              {lawyer.full_name}
            </h1>
            {isVerified && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '3px',
                fontSize: '11px', fontWeight: 600, color: '#059669',
                background: '#ECFDF5', border: '1px solid #A7F3D0',
                borderRadius: '999px', padding: '2px 8px',
              }}>
                <BadgeCheck style={{ width: '11px', height: '11px' }} />
                {lawyer.verification_type === 'advocate' ? labels.verifiedAdvocate ?? 'Verified Advocate'
                  : lawyer.verification_type === 'professional' ? labels.verifiedProfessional ?? 'Verified Professional'
                  : labels.verified}
              </span>
            )}
          </div>

          {/* Title */}
          {displayTitle && (
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#6366F1', margin: '0 0 12px', lineHeight: 1.4 }}>
              {displayTitle}
            </p>
          )}

          {/* Meta pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '16px' }}>
            {lawyer.location && <MetaChip icon={<MapPin style={{ width: '11px', height: '11px' }} />}>{lawyer.location}</MetaChip>}
            {lawyer.years_experience > 0 && <MetaChip icon={<Briefcase style={{ width: '11px', height: '11px' }} />}>{lawyer.years_experience}+ {labels.yrsExp}</MetaChip>}
            {lawyer.languages?.length > 0 && <MetaChip icon={<Globe style={{ width: '11px', height: '11px' }} />}>{lawyer.languages.join(', ')}</MetaChip>}
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
            {lawyer.whatsapp_number && lawyer.show_whatsapp !== false && (
              <a
                href={`https://wa.me/91${lawyer.whatsapp_number}?text=Hi, I found your profile on vakil.bio and would like to get in touch.`}
                target="_blank" rel="noopener noreferrer"
                className="cta-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 18px', borderRadius: '12px',
                  fontSize: '13px', fontWeight: 600, color: '#fff',
                  background: '#16A34A', textDecoration: 'none',
                  boxShadow: '0 2px 10px rgba(22,163,74,0.25)',
                }}
              >
                <MessageCircle style={{ width: '15px', height: '15px' }} /> WhatsApp
              </a>
            )}
            {lawyer.phone && lawyer.show_phone !== false && (
              <a
                href={`tel:+91${lawyer.phone}`}
                className="cta-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 18px', borderRadius: '12px',
                  fontSize: '13px', fontWeight: 600, color: '#374151',
                  background: '#fff', border: '1px solid #E5E7EB',
                  textDecoration: 'none',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <Phone style={{ width: '15px', height: '15px' }} /> {labels.call}
              </a>
            )}
            <ShareButton url={profileUrl} />
          </div>

          {/* Practice areas */}
          {lawyer.practice_areas?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
              {lawyer.practice_areas.map((area: string) => (
                <span key={area} style={{
                  fontSize: '12px', fontWeight: 500, color: '#4F7AFF',
                  background: 'rgba(79,122,255,0.07)',
                  border: '1px solid rgba(79,122,255,0.14)',
                  borderRadius: '999px', padding: '4px 12px',
                }}>
                  {area}
                </span>
              ))}
            </div>
          )}

          {/* Social links */}
          {(lawyer.website_url || lawyer.linkedin_url || lawyer.twitter_url || lawyer.instagram_url || lawyer.youtube_url) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {lawyer.website_url && <SocialLink href={lawyer.website_url} label={labels.website} icon={<LinkIcon style={{ width: '13px', height: '13px' }} />} />}
              {lawyer.linkedin_url && <SocialLink href={lawyer.linkedin_url} label="LinkedIn" icon={<LinkedInIcon />} />}
              {lawyer.twitter_url && <SocialLink href={lawyer.twitter_url} label="X" icon={<XIcon />} />}
              {lawyer.instagram_url && <SocialLink href={lawyer.instagram_url} label="Instagram" icon={<InstagramIcon />} />}
              {lawyer.youtube_url && <SocialLink href={lawyer.youtube_url} label="YouTube" icon={<YouTubeIcon />} />}
            </div>
          )}
        </div>

        {/* ── Services ─────────────────────────────────────────────── */}
        {displayServices.length > 0 && (
          <section style={{ marginTop: '28px' }}>
            <SectionHeading>{labels.services}</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {displayServices.map((service) => {
                const isFree = service.price === 0
                const pct = service.original_price && service.original_price > service.price
                  ? Math.round(((service.original_price - service.price) / service.original_price) * 100)
                  : 0
                const isConsultation = service.type === 'consultation'

                return (
                  <div key={service.id} className="svc-card" style={{ ...card, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

                      {/* Icon bubble */}
                      <div style={{
                        width: '46px', height: '46px', flexShrink: 0, borderRadius: '14px',
                        background: isConsultation ? 'rgba(79,122,255,0.08)' : 'rgba(155,109,255,0.08)',
                        border: isConsultation ? '1px solid rgba(79,122,255,0.14)' : '1px solid rgba(155,109,255,0.14)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isConsultation
                          ? <Calendar style={{ width: '19px', height: '19px', color: '#4F7AFF' }} />
                          : <FileText style={{ width: '19px', height: '19px', color: '#9B6DFF' }} />
                        }
                      </div>

                      {/* Title + meta */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{service.title}</span>
                          {isFree && (
                            <span style={{
                              fontSize: '11px', fontWeight: 700, color: '#059669',
                              background: '#ECFDF5', border: '1px solid #A7F3D0',
                              borderRadius: '999px', padding: '1px 8px',
                            }}>{labels.free}</span>
                          )}
                          {pct > 0 && (
                            <span style={{
                              fontSize: '11px', fontWeight: 700, color: '#DC2626',
                              background: '#FEF2F2', border: '1px solid #FECACA',
                              borderRadius: '999px', padding: '1px 8px',
                            }}>{pct}% {labels.off}</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {service.duration_minutes && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#94A3B8' }}>
                              <Clock style={{ width: '11px', height: '11px' }} />
                              {service.duration_minutes} {labels.min}
                            </span>
                          )}
                          {service.description && (
                            <span style={{ fontSize: '12px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {service.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price + book */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', flexShrink: 0 }}>
                        {pct > 0 && (
                          <span style={{ fontSize: '11px', color: '#CBD5E1', textDecoration: 'line-through' }}>
                            ₹{service.original_price!.toLocaleString('en-IN')}
                          </span>
                        )}
                        {!isFree && (
                          <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>
                            ₹{service.price.toLocaleString('en-IN')}
                          </span>
                        )}
                        <Link
                          href={`/${username}/book/${service.id}`}
                          className="book-btn"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontSize: '13px', fontWeight: 600, color: '#fff',
                            background: '#4F7AFF', borderRadius: '10px',
                            padding: '7px 14px', textDecoration: 'none', whiteSpace: 'nowrap',
                            boxShadow: '0 2px 10px rgba(79,122,255,0.28)',
                          }}
                        >
                          {isFree ? labels.bookFree : labels.book}
                          <ArrowRight style={{ width: '13px', height: '13px' }} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── About ────────────────────────────────────────────────── */}
        {displayBio && (
          <section style={{ marginTop: '16px', ...card, padding: '20px 22px' }}>
            <SectionHeading>{labels.about}</SectionHeading>
            <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#475569', whiteSpace: 'pre-line', margin: '10px 0 0' }}>
              {displayBio}
            </p>
          </section>
        )}

        {/* ── Education & Experience ───────────────────────────────── */}
        {(lawyer.current_firm || lawyer.university) && (
          <section style={{ marginTop: '12px', ...card, padding: '20px 22px' }}>
            <SectionHeading>{labels.education}</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
              {lawyer.current_firm && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', flexShrink: 0, borderRadius: '12px',
                    background: 'rgba(79,122,255,0.07)', border: '1px solid rgba(79,122,255,0.13)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Building2 style={{ width: '18px', height: '18px', color: '#4F7AFF' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>{lawyer.current_firm}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                      {lawyer.title || 'Advocate'}{lawyer.years_experience ? ` · ${lawyer.years_experience}+ ${labels.yrsExp}` : ''}
                    </div>
                  </div>
                </div>
              )}
              {lawyer.university && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', flexShrink: 0, borderRadius: '12px',
                    background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.13)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <GraduationCap style={{ width: '18px', height: '18px', color: '#059669' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>{lawyer.university}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                      LL.B{lawyer.graduation_year ? ` · Class of ${lawyer.graduation_year}` : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Free Enquiry ─────────────────────────────────────────── */}
        <section style={{ marginTop: '12px', ...card, padding: '20px 22px' }}>
          <SectionHeading>{labels.enquiryHeading}</SectionHeading>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 18px', lineHeight: 1.5 }}>
            {labels.enquirySub(lawyer.full_name)}
          </p>
          <LeadForm lawyerId={lawyer.id} lawyerName={lawyer.full_name} />
        </section>

      </div>

      <ProfileViewTracker lawyerId={lawyer.id} />
    </div>
    <Footer minimal />
    </>
  )
}

function MetaChip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontSize: '12px', fontWeight: 500, color: '#64748B',
      background: '#fff', border: '1px solid #E9ECF4',
      borderRadius: '999px', padding: '4px 11px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {icon}{children}
    </span>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
      {children}
    </h2>
  )
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer"
      className="cta-btn"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        fontSize: '12px', fontWeight: 500, color: '#475569',
        background: '#fff', border: '1px solid #E9ECF4',
        borderRadius: '999px', padding: '5px 12px',
        textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {icon}{label}
    </a>
  )
}

function LinkedInIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#0F172A">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="url(#ig-grad)">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433"/>
          <stop offset="50%" stopColor="#dc2743"/>
          <stop offset="100%" stopColor="#bc1888"/>
        </linearGradient>
      </defs>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#FF0000">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}
