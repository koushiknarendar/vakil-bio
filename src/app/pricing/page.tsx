import Link from 'next/link'
import { Check } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — vakil.bio',
  description: 'Simple, transparent pricing for Indian advocates.',
}

const FREE_FEATURES = [
  'Your own vakil.bio/username profile',
  'Unlimited consultations (3 types)',
  'Lead capture & enquiry form',
  'WhatsApp notifications for leads',
  'Lawyer directory listing',
  'AI-powered bio generation',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Document Review service',
  'Priority DM service',
  'Reduced platform fee (8% → 5%)',
  'Priority in search results',
  'Verified badge',
  'Advanced analytics',
]

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 700, color: '#0F172A', marginBottom: '12px', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
            Simple, honest pricing
          </h1>
          <p style={{ fontSize: '18px', color: '#64748B', maxWidth: '480px', margin: '0 auto' }}>
            Start for free. Upgrade when you&apos;re ready to grow.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Free */}
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Free</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '40px', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-heading)' }}>₹0</span>
                <span style={{ color: '#94A3B8', fontSize: '14px' }}>/forever</span>
              </div>
              <p style={{ color: '#64748B', fontSize: '14px', marginTop: '8px' }}>+ 10% platform fee per booking</p>
            </div>
            <Link href="/auth/login" style={{ display: 'block', textAlign: 'center', background: '#F1F5F9', color: '#374151', fontWeight: 600, padding: '12px', borderRadius: '12px', textDecoration: 'none', fontSize: '15px', marginBottom: '28px' }}>
              Get started free
            </Link>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {FREE_FEATURES.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#374151' }}>
                  <Check style={{ width: '16px', height: '16px', color: '#10B981', marginTop: '2px', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div style={{ background: '#fff', borderRadius: '20px', border: '2px solid #2563EB', padding: '32px', boxShadow: '0 4px 24px rgba(37,99,235,0.1)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#2563EB', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
              MOST POPULAR
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Pro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '40px', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-heading)' }}>₹799</span>
                <span style={{ color: '#94A3B8', fontSize: '14px' }}>/month</span>
              </div>
              <p style={{ color: '#64748B', fontSize: '14px', marginTop: '8px' }}>+ 5% platform fee per booking</p>
            </div>
            <a href="https://wa.me/919999999999?text=I'd like to upgrade to vakil.bio Pro" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', background: '#2563EB', color: '#fff', fontWeight: 600, padding: '12px', borderRadius: '12px', textDecoration: 'none', fontSize: '15px', marginBottom: '28px' }}>
              Upgrade to Pro
            </a>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {PRO_FEATURES.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#374151' }}>
                  <Check style={{ width: '16px', height: '16px', color: '#2563EB', marginTop: '2px', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '13px', marginTop: '40px' }}>
          Questions? WhatsApp us at{' '}
          <a href="https://wa.me/919999999999" style={{ color: '#2563EB' }}>+91 99999 99999</a>
        </p>
      </div>
    </div>
  )
}
