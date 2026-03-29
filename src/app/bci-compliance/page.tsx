import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'BCI Compliance — vakil.bio',
  description: 'vakil.bio is committed to compliance with Bar Council of India Rules on Professional Standards and Advertisement.',
}

export default function BCICompliancePage() {
  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="vakil.bio" width={120} height={36} className="h-7 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} priority />
          </Link>
          <Link href="/" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>← Home</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB' }}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              BCI Compliance Statement
            </h1>
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
              vakil.bio's commitment to Bar Council of India rules and professional standards.
            </p>
          </div>
        </div>

        <div className="space-y-8" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>

          <section className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
            <h2 className="font-heading font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>
              What vakil.bio is
            </h2>
            <p className="text-sm">
              vakil.bio is a technology platform that enables enrolled advocates to maintain a professional online presence. It functions as a neutral, self-managed directory — similar to a professional listing service — where advocates voluntarily publish their own credentials, practice areas, and contact information.
            </p>
            <p className="text-sm mt-3">
              vakil.bio does not solicit legal work on behalf of any advocate, nor does it make referrals, recommendations, or endorsements of any kind.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
            <h2 className="font-heading font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>
              No Solicitation
            </h2>
            <p className="text-sm">
              In accordance with Rule 36 of the Bar Council of India Rules under the Advocates Act, 1961, vakil.bio does not advertise or solicit clients on behalf of any advocate. The platform does not:
            </p>
            <ul className="list-disc list-inside text-sm mt-3 space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li>Approach potential clients on behalf of advocates</li>
              <li>Make unsolicited contact with any individual regarding their legal matters</li>
              <li>Rank or recommend advocates based on commercial consideration</li>
              <li>Operate as a referral service or lead-generation agency for legal services</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
            <h2 className="font-heading font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>
              Advocate Responsibility
            </h2>
            <p className="text-sm">
              Each advocate who creates a profile on vakil.bio does so voluntarily and is solely responsible for the accuracy and legality of the information they publish. By using vakil.bio, advocates confirm that:
            </p>
            <ul className="list-disc list-inside text-sm mt-3 space-y-2">
              <li>They are validly enrolled with the relevant State Bar Council</li>
              <li>The information on their profile is accurate, current, and not misleading</li>
              <li>They comply with all applicable BCI rules regarding professional conduct and communication</li>
              <li>They do not use the platform to make any representation that constitutes solicitation</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
            <h2 className="font-heading font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>
              Technology Platform, Not a Law Firm
            </h2>
            <p className="text-sm">
              vakil.bio is a technology service provider, not a law firm, legal consultancy, or intermediary for legal services. It does not provide legal advice, representation, or services of any kind. Any consultation, advice, or legal service is rendered exclusively by the enrolled advocate directly, under their own professional responsibility.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
            <h2 className="font-heading font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>
              Fee Transparency
            </h2>
            <p className="text-sm">
              vakil.bio charges a platform fee of 10% on payments processed through the platform, in exchange for providing scheduling, payment, and profile infrastructure. This fee is a technology service charge, not a referral fee or commission for procuring legal work.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
            <h2 className="font-heading font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>
              Grievances & Contact
            </h2>
            <p className="text-sm">
              If you have concerns about any content on vakil.bio that may be inconsistent with BCI rules or professional standards, please contact us at{' '}
              <a href="mailto:legal@vakil.bio" className="underline" style={{ color: '#2563EB' }}>legal@vakil.bio</a>.
              We take such concerns seriously and will review and respond promptly.
            </p>
          </section>

          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Last updated: March 2026
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', background: '#fff' }} className="py-6 px-4 text-center">
        <div className="flex items-center justify-center gap-5 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/privacy" className="hover:opacity-70 transition-opacity">Privacy Policy</Link>
          <Link href="/terms" className="hover:opacity-70 transition-opacity">Terms of Use</Link>
          <Link href="/" className="hover:opacity-70 transition-opacity">Home</Link>
        </div>
      </footer>
    </div>
  )
}
