import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { LawyerDirectory } from '@/components/LawyerDirectory'
import { BadgeCheck, Scale } from 'lucide-react'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://vakil.bio'

const ALL_AREAS = [
  'Criminal Law', 'Family Law', 'Property & Real Estate', 'Corporate & Business',
  'Labour & Employment', 'Consumer Protection', 'Civil Litigation', 'Tax Law',
  'Intellectual Property', 'Immigration', 'Banking & Finance', 'Environmental Law',
]

interface Props {
  searchParams: Promise<{ area?: string; verified?: string; q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { area, verified } = await searchParams
  const filterLabel = area ? ` — ${area}` : ''
  const verifiedLabel = verified === 'true' ? ' Verified' : ''
  const title = `Find${verifiedLabel} Lawyers in India${filterLabel} | vakil.bio`
  const description = area
    ? `Browse ${verifiedLabel.trim()} Indian advocates specialising in ${area}. View credentials, schedule consultations, and connect instantly on vakil.bio.`
    : `Discover verified Indian advocates by practice area — Criminal Law, Family Law, Property, Corporate and more. Browse profiles and consult top lawyers on vakil.bio.`

  return {
    title,
    description,
    keywords: [
      'find lawyer India', 'advocate directory India', 'consult lawyer online India',
      area, 'vakil.bio', 'Indian advocate', 'legal consultation India',
    ].filter(Boolean).join(', '),
    alternates: { canonical: `${BASE}/discover${area ? `?area=${encodeURIComponent(area)}` : ''}` },
    openGraph: {
      title,
      description,
      url: `${BASE}/discover`,
      type: 'website',
      siteName: 'vakil.bio',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

const FAQ = [
  {
    q: 'How do I find a lawyer in India?',
    a: 'Browse vakil.bio to discover advocates by practice area and location. Each profile shows credentials, experience, and services. You can send a free enquiry or book a paid consultation directly.',
  },
  {
    q: 'Are the lawyers on vakil.bio verified?',
    a: 'Verified advocates on vakil.bio have submitted their Bar Council enrollment number or degree certificate for manual review by our team. Look for the blue Verified badge on their profile.',
  },
  {
    q: 'Can I consult a lawyer online in India?',
    a: 'Yes. Lawyers on vakil.bio offer video and phone consultations. Simply visit their profile, choose a service, and book a time slot. You can also send a free enquiry first.',
  },
  {
    q: 'What practice areas are covered?',
    a: 'vakil.bio covers Criminal Law, Family Law, Property & Real Estate, Corporate & Business, Labour & Employment, Consumer Protection, Civil Litigation, Tax Law, Intellectual Property, Immigration, Banking & Finance, and Environmental Law.',
  },
  {
    q: 'How much does a legal consultation cost in India?',
    a: 'Consultation fees vary by lawyer and service type. Many advocates on vakil.bio offer an initial free enquiry. Paid consultations typically range from ₹299 to ₹2999 for a 30–60 minute session.',
  },
]

export default async function DiscoverPage({ searchParams }: Props) {
  const { area, verified, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('lawyers')
    .select('*')
    .neq('is_suspended', true)
    .order('created_at', { ascending: false })

  if (area && ALL_AREAS.includes(area)) {
    query = query.contains('practice_areas', [area])
  }
  if (verified === 'true') {
    query = query.eq('is_verified', true)
  }

  const { data: lawyers, error: lawyersError } = await query
  if (lawyersError) console.error('Discover page query error:', lawyersError)

  // Filter verified_until in JS (can't easily do gt in query without RPC)
  const now = new Date()
  const filteredLawyers = (lawyers ?? []).filter(l => {
    if (!l.is_verified) return verified !== 'true'
    if (l.verified_until && new Date(l.verified_until) < now) {
      return verified !== 'true' ? true : false
    }
    return true
  })

  // Stats
  const verifiedCount = (lawyers ?? []).filter(
    l => l.is_verified && (!l.verified_until || new Date(l.verified_until) > now)
  ).length

  // JSON-LD: ItemList of lawyers
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: area ? `${area} Lawyers in India` : 'Indian Advocates on vakil.bio',
    description: 'Directory of verified Indian advocates and legal professionals',
    url: `${BASE}/discover`,
    numberOfItems: filteredLawyers.length,
    itemListElement: filteredLawyers.slice(0, 50).map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Person',
        name: l.full_name,
        jobTitle: l.title || 'Advocate',
        url: `${BASE}/${l.username}`,
        image: l.photo_url || undefined,
        address: l.location ? { '@type': 'PostalAddress', addressLocality: l.location, addressCountry: 'IN' } : undefined,
      },
    })),
  }

  // JSON-LD: FAQ
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q: question, a: answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }

  // JSON-LD: WebPage
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Discover Lawyers in India | vakil.bio',
    description: 'Find and consult verified Indian advocates by practice area',
    url: `${BASE}/discover`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Discover Lawyers', item: `${BASE}/discover` },
        ...(area ? [{ '@type': 'ListItem', position: 3, name: area, item: `${BASE}/discover?area=${encodeURIComponent(area)}` }] : []),
      ],
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />

      <div className="min-h-screen" style={{ background: '#F4F6FB' }}>

        {/* Nav */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid #E9ECF4',
        }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/">
              <Image src="/logo.png" alt="vakil.bio" width={100} height={28} style={{ height: '22px', width: 'auto', mixBlendMode: 'multiply' }} priority />
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link href="/" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Home</Link>
              <Link href="/auth/login" style={{
                fontSize: '13px', fontWeight: 600, padding: '7px 16px', borderRadius: '10px',
                background: '#4F7AFF', color: '#fff', textDecoration: 'none',
              }}>
                Create Profile
              </Link>
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px 24px 80px' }}>

          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" style={{ marginBottom: '16px' }}>
              <ol style={{ display: 'flex', alignItems: 'center', gap: '6px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: '#94A3B8' }}>
                <li><Link href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</Link></li>
                <li>›</li>
                <li><Link href="/discover" style={{ color: area ? '#94A3B8' : '#4F7AFF', textDecoration: 'none' }}>Find Lawyers</Link></li>
                {area && <><li>›</li><li style={{ color: '#4F7AFF' }}>{area}</li></>}
              </ol>
            </nav>

            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px', lineHeight: 1.2 }}>
              {area ? `${area} Lawyers in India` : 'Find Lawyers in India'}
            </h1>
            <p style={{ fontSize: '16px', color: '#64748B', margin: '0 0 28px', maxWidth: '600px' }}>
              {area
                ? `Browse verified advocates specialising in ${area}. View credentials and book a consultation directly.`
                : 'Browse verified advocates by practice area. View credentials, read about their experience, and connect instantly.'
              }
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {[
                { value: `${(lawyers ?? []).length}+`, label: 'Advocates' },
                { value: `${verifiedCount}`, label: 'Verified' },
                { value: '12', label: 'Practice Areas' },
              ].map(({ value, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#4F7AFF' }}>{value}</span>
                  <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Directory with filters */}
          <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Loading advocates…</div>}>
            <LawyerDirectory
              lawyers={filteredLawyers}
              initialArea={area}
              initialVerified={verified === 'true'}
              initialQ={q}
            />
          </Suspense>

          {/* FAQ Section — AEO */}
          <section style={{ marginTop: '80px' }} aria-labelledby="faq-heading">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <Scale style={{ width: '20px', height: '20px', color: '#4F7AFF' }} />
              <h2 id="faq-heading" style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Frequently Asked Questions
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {FAQ.map(({ q: question, a: answer }) => (
                <details key={question} style={{
                  background: '#fff', border: '1px solid #EEF0F6',
                  borderRadius: '16px', padding: '20px 24px',
                  cursor: 'pointer',
                }}>
                  <summary style={{ fontWeight: 600, fontSize: '15px', color: '#0F172A', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    {question}
                    <span style={{ color: '#94A3B8', fontSize: '18px', flexShrink: 0 }}>+</span>
                  </summary>
                  <p style={{ margin: '12px 0 0', fontSize: '14px', lineHeight: 1.7, color: '#475569' }}>{answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section style={{ marginTop: '64px', textAlign: 'center', background: '#fff', border: '1px solid #EEF0F6', borderRadius: '24px', padding: '48px 32px' }}>
            <BadgeCheck style={{ width: '40px', height: '40px', color: '#4F7AFF', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>Are you a lawyer?</h2>
            <p style={{ fontSize: '15px', color: '#64748B', margin: '0 0 24px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
              Create your professional profile on vakil.bio and start receiving consultations from clients across India.
            </p>
            <Link href="/auth/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px', borderRadius: '14px',
              background: '#4F7AFF', color: '#fff', fontWeight: 600, fontSize: '15px',
              textDecoration: 'none',
            }}>
              Create Your Profile — Free
            </Link>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}
