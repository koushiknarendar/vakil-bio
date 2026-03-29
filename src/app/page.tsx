import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  CheckCircle,
  Users,
  CalendarCheck,
  BarChart2,
  Star,
  Clock,
  BadgeCheck,
} from 'lucide-react'
import { TypeWriter } from '@/components/TypeWriter'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'vakil.bio — Your legal profile, in one link',
  description: 'Indian advocates: create your professional profile, accept bookings, and grow your practice. Free to get started.',
  keywords: 'lawyer profile India, advocate profile, legal consultation India, vakil.bio, Indian lawyer directory, book a lawyer',
  alternates: { canonical: 'https://vakil.bio' },
  openGraph: {
    title: 'vakil.bio — Your legal profile, in one link',
    description: 'Indian advocates: create your professional profile, accept bookings, and grow your practice.',
    type: 'website',
    url: 'https://vakil.bio',
    siteName: 'vakil.bio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'vakil.bio — Your legal profile, in one link',
    description: 'Indian advocates: create your professional profile, accept bookings, and grow your practice.',
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'vakil.bio',
  url: 'https://vakil.bio',
  description: 'Professional profile platform for Indian advocates',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://vakil.bio/discover?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'vakil.bio',
  url: 'https://vakil.bio',
  logo: 'https://vakil.bio/logo.png',
  description: 'The professional profile platform for Indian advocates. Create your profile, accept bookings, and grow your practice.',
  foundingDate: '2025',
  areaServed: 'IN',
  serviceType: 'Legal Professional Directory',
  sameAs: [
    'https://twitter.com/vakilbio',
  ],
}

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'vakil.bio',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://vakil.bio',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    description: 'Free professional profile for Indian advocates',
  },
  audience: {
    '@type': 'Audience',
    audienceType: 'Indian Advocates and Legal Professionals',
  },
}

const AVATARS = [
  '/lawyer-1.avif',
  '/lawyer-2.avif',
  '/lawyer-3.avif',
]

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
    <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="vakil.bio"
              width={160}
              height={40}
              className="h-8 w-auto object-contain"
              style={{ mixBlendMode: 'multiply' }}
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/discover"
              className="text-sm font-medium hidden sm:block transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Discover Lawyers
            </Link>
            <Link
              href="/auth/login"
              className="btn-primary text-sm font-semibold px-5 py-2.5 rounded-xl"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Subtle glow orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[-60px] left-[20%] w-[500px] h-[500px] rounded-full opacity-30 animate-pulse-glow"
            style={{ background: 'radial-gradient(circle, rgba(79,122,255,0.18) 0%, transparent 70%)' }} />
          <div className="absolute top-[80px] right-[10%] w-[350px] h-[350px] rounded-full opacity-25 animate-pulse-glow"
            style={{ background: 'radial-gradient(circle, rgba(155,109,255,0.15) 0%, transparent 70%)', animationDelay: '1.5s' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-28 text-center">
          {/* Social proof */}
          <div className="inline-flex flex-wrap items-center gap-4 mb-10 px-4 py-3 rounded-2xl animate-fade-up" style={{
            background: '#fff',
            border: '1px solid rgba(37,99,235,0.15)',
            boxShadow: '0 2px 12px rgba(37,99,235,0.08)',
          }}>
            <div className="flex -space-x-2.5">
              {AVATARS.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Advocate"
                  className="w-9 h-9 rounded-full object-cover"
                  style={{ border: '2px solid #fff' }}
                />
              ))}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>500+ advocates trust vakil.bio</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Profiles created across India</div>
            </div>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 animate-fade-up-d1">
            <span style={{ color: 'var(--text-primary)' }}>Everything you are,</span>
            <br />
            <span style={{ fontFamily: 'var(--font-cursive)', fontStyle: 'italic', fontWeight: 400, color: '#2563EB' }}>in one link</span>
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up-d2"
            style={{ color: 'var(--text-secondary)' }}>
            Create your vakil.bio profile. Share your credentials, let clients schedule consultations, and manage your practice — all without a website.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-d3">
            <Link
              href="/auth/login"
              className="btn-primary inline-flex items-center gap-2 text-base font-semibold px-8 py-4 rounded-xl"
            >
              Create Your Free Profile
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 text-base px-8 py-4 rounded-xl transition-all font-medium"
              style={{
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-md)',
                background: 'var(--bg-surface)',
              }}
            >
              Discover Lawyers
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm"
            style={{ color: 'var(--text-muted)' }}>
            {['Free to start', 'No website needed', 'Bar Council compliant'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--green)' }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 sm:px-6" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Everything you need to grow your practice
            </h2>
            <p className="max-w-xl mx-auto text-lg" style={{ color: 'var(--text-secondary)' }}>
              Built specifically for Indian lawyers — simple, professional, and fully compliant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <Users className="w-6 h-6" />,
                iconColor: 'var(--blue)',
                iconBg: 'rgba(79,122,255,0.1)',
                title: 'Showcase Your Expertise',
                desc: 'A professional profile with your credentials, practice areas, experience, and verified badge — everything a client needs to trust you.',
              },
              {
                icon: <CalendarCheck className="w-6 h-6" />,
                iconColor: 'var(--green)',
                iconBg: 'rgba(16,185,129,0.1)',
                title: 'Accept Consultations',
                desc: 'Let clients schedule consultations at your available times. Structured intake, professional confirmations, no back-and-forth on WhatsApp.',
              },
              {
                icon: <BarChart2 className="w-6 h-6" />,
                iconColor: 'var(--purple)',
                iconBg: 'rgba(124,95,212,0.1)',
                title: 'Practice Insights',
                desc: 'Understand how clients find you — profile visits, enquiries, and consultation history in one clean dashboard.',
              },
            ].map((f, i) => (
              <div key={i} className="glass rounded-2xl p-7">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: f.iconBg, color: f.iconColor }}>
                  {f.icon}
                </div>
                <h3 className="font-heading text-lg font-semibold mb-3"
                  style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-4 sm:px-6" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Up and running in minutes
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              No technical setup. No website. Just your link.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Sign Up', desc: 'Create your account with your phone number. OTP login — no passwords required.' },
              { title: 'Build Your Profile', desc: 'Add your credentials, practice areas, education and consultation availability.' },
              { title: 'Share Your Link', desc: 'Share vakil.bio/yourname on WhatsApp, LinkedIn, or your email signature.' },
              { title: 'Connect', desc: 'Clients find your profile, read your credentials, and reach out through structured enquiry forms.' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="glass rounded-2xl p-6 h-full">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-sm mb-4"
                    style={{ background: 'rgba(79,122,255,0.1)', color: 'var(--blue-l)' }}>
                    {i + 1}
                  </div>
                  <h3 className="font-heading font-semibold mb-2 text-base"
                    style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:flex absolute top-8 -right-3 z-10"
                    style={{ color: 'var(--border-md)' }}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ways to connect ── */}
      <section className="py-24 px-4 sm:px-6" style={{ background: 'var(--bg-surface)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Multiple ways for clients to reach you
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Start with free consultations. Unlock paid bookings when you&apos;re ready — we only take 10% per booking, nothing more.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: <Clock className="w-6 h-6" />,
                iconColor: 'var(--green)',
                iconBg: 'rgba(16,185,129,0.1)',
                title: 'Free Consultation Booking',
                desc: 'Let clients book a consultation slot directly. Structured intake form, automatic confirmation — no phone tag.',
                badge: 'Free',
                badgeBg: 'rgba(16,185,129,0.1)',
                badgeColor: 'var(--green)',
                badgeBorder: 'rgba(16,185,129,0.2)',
              },
              {
                icon: <CalendarCheck className="w-6 h-6" />,
                iconColor: 'var(--blue)',
                iconBg: 'rgba(79,122,255,0.1)',
                title: 'Paid Consultations',
                desc: 'Collect fees upfront for your time. We process payments securely — you keep 90%, we take 10%.',
                badge: 'Pro · 10% fee',
                badgeBg: 'rgba(79,122,255,0.08)',
                badgeColor: 'var(--blue)',
                badgeBorder: 'rgba(79,122,255,0.2)',
              },
              {
                icon: <BadgeCheck className="w-6 h-6" />,
                iconColor: 'var(--purple)',
                iconBg: 'rgba(124,95,212,0.1)',
                title: 'Verified Profile Badge',
                desc: 'Get your Bar Council enrollment verified and display a trust badge on your profile — the signal clients look for.',
                badge: 'Verification',
                badgeBg: 'rgba(124,95,212,0.08)',
                badgeColor: 'var(--purple)',
                badgeBorder: 'rgba(124,95,212,0.2)',
              },
            ].map((s, i) => (
              <div key={i} className="glass rounded-2xl p-7">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: s.iconBg, color: s.iconColor }}>
                    {s.icon}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: s.badgeBg, color: s.badgeColor, border: `1px solid ${s.badgeBorder}` }}>
                    {s.badge}
                  </span>
                </div>
                <h3 className="font-heading font-semibold mb-2 text-base"
                  style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="py-20 px-4 sm:px-6" style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-xl max-w-xl mx-auto mb-5 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            &quot;Finally, a professional home for my legal practice. Clients find everything they need in one link — no more back-and-forth on WhatsApp.&quot;
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>— Advocate Priya Mehta, Delhi High Court</p>
        </div>
      </section>

      {/* ── CTA with typing animation ── */}
      <section className="py-24 px-4 sm:px-6" style={{ background: 'var(--bg-surface)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl p-12 sm:p-16 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(79,122,255,0.06) 0%, rgba(155,109,255,0.04) 100%)',
              border: '1px solid rgba(79,122,255,0.15)',
            }}>
            {/* Subtle glow */}
            <div className="pointer-events-none absolute top-[-40px] left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-40"
              style={{ background: 'radial-gradient(circle, rgba(79,122,255,0.2) 0%, transparent 70%)' }} />

            <div className="relative">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Your vakil.bio profile is waiting
              </h2>
              <div className="text-xl font-heading font-semibold mb-8">
                <TypeWriter />
              </div>
              <p className="mb-8 max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Join advocates already using vakil.bio to present their practice professionally and connect with clients.
              </p>
              <Link
                href="/auth/login"
                className="btn-primary inline-flex items-center gap-2 text-base font-semibold px-8 py-4 rounded-xl"
              >
                Create Your Free Profile
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

    </div>
    </>
  )
}
