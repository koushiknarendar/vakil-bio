import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — vakil.bio',
  description: 'Terms of Service for vakil.bio.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-[#E2E8F0] bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="vakil.bio" width={120} height={36} className="h-8 w-auto object-contain" />
          </Link>
          <Link href="/" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">← Back to home</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="mb-10">
          <p className="text-sm text-[#64748B] mb-2">Last updated: March 2026</p>
          <h1 className="font-heading text-3xl font-bold text-[#0F172A] mb-3">Terms of Service</h1>
          <p className="text-base text-[#475569]">
            These Terms of Service govern your use of <strong>vakil.bio</strong>, a platform operated by <strong>vakil.bio</strong>. By accessing or using our platform, you agree to be bound by these terms.
          </p>
        </div>

        <div className="space-y-10 text-[#374151]">

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">1. About the Platform</h2>
            <p className="text-base leading-relaxed">
              vakil.bio is a product of <strong>vakil.bio</strong>, a company incorporated under the laws of India. vakil.bio provides a technology platform that allows advocates to create and share professional profiles, and enables clients to schedule consultations and submit enquiries directly.
            </p>
            <p className="text-base leading-relaxed mt-3">
              vakil.bio is a technology service provider and is not a law firm. We do not provide legal advice and are not a party to any advocate-client relationship formed through our platform.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">2. Eligibility</h2>
            <p className="text-base leading-relaxed">
              To register as an advocate on vakil.bio, you must be enrolled with the Bar Council of India or a State Bar Council and be in good standing. By creating a profile, you confirm that you are a practising advocate licensed under Indian law and that your use of this platform complies with all applicable Bar Council of India rules and regulations, including those governing advertising and solicitation.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">3. Advocate Responsibilities</h2>
            <ul className="space-y-2 text-base">
              {[
                'You are solely responsible for the accuracy of the information on your profile, including your credentials, practice areas, and availability.',
                'You must ensure your use of this platform complies with the Bar Council of India Rules on Professional Standards, advertising, and solicitation.',
                'You are responsible for the legal advice and services you provide to clients. vakil.bio bears no liability for the quality, accuracy, or outcome of any legal services.',
                'You must maintain appropriate professional conduct and confidentiality in all client interactions.',
                'You agree not to misuse the platform for spam, fraudulent listings, or any illegal activity.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">4. Client Responsibilities</h2>
            <ul className="space-y-2 text-base">
              {[
                'Consultations booked through vakil.bio are with independent advocates, not with vakil.bio.',
                'You are responsible for providing accurate information when submitting enquiries or booking consultations.',
                'vakil.bio does not guarantee the outcome of any legal consultation or service.',
                'You agree not to misuse the platform or submit false or malicious enquiries.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">5. Payments & Fees</h2>
            <p className="text-base leading-relaxed mb-3">
              Consultation fees are set by advocates and collected through Razorpay, our payment processing partner. vakil.bio charges a platform service fee (deducted at payout) for facilitating the technology infrastructure. This fee is for technology services only and does not represent a share of legal fees.
            </p>
            <p className="text-base leading-relaxed">
              Refund requests are subject to the individual advocate&apos;s cancellation policy. In cases of technical failure resulting in a charge without a successful booking, please contact us at support@vakil.bio.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">6. Intellectual Property</h2>
            <p className="text-base leading-relaxed">
              The vakil.bio name, logo, and platform design are the property of vakil.bio. You may not reproduce, distribute, or create derivative works without our written permission. Advocate profile content remains the intellectual property of the respective advocate.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-base leading-relaxed">
              vakil.bio is provided &quot;as is&quot; without warranties of any kind. We do not warrant that the platform will be uninterrupted or error-free. vakil.bio is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">8. Governing Law</h2>
            <p className="text-base leading-relaxed">
              These Terms are governed by the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in India.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">9. Changes to These Terms</h2>
            <p className="text-base leading-relaxed">
              We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the revised Terms. We will notify registered advocates of material changes via email or in-app notification.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">10. Contact</h2>
            <div className="p-5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-base space-y-1">
              <p className="font-semibold text-[#0F172A]">vakil.bio</p>
              <p className="text-[#475569]">Email: legal@vakil.bio</p>
              <p className="text-[#475569]">Platform: vakil.bio</p>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] py-8 px-4 sm:px-6 bg-white mt-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <Image src="/logo.png" alt="vakil.bio" width={90} height={28} className="h-7 w-auto object-contain" />
          <p className="text-sm text-[#94A3B8]">© 2026 vakil.bio.</p>
          <div className="flex gap-5 text-sm text-[#64748B]">
            <Link href="/terms" className="hover:text-[#374151] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#374151] transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
