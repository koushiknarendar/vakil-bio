import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — vakil.bio',
  description: 'Privacy Policy for vakil.bio.',
}

export default function PrivacyPage() {
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
          <h1 className="font-heading text-3xl font-bold text-[#0F172A] mb-3">Privacy Policy</h1>
          <p className="text-base text-[#475569]">
            This Privacy Policy describes how <strong>vakil.bio</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operating the platform <strong>vakil.bio</strong>, collects, uses, and protects your personal information.
          </p>
        </div>

        <div className="space-y-10 text-[#374151]">

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">1. Who We Are</h2>
            <p className="text-base leading-relaxed">
              vakil.bio is a product of <strong>vakil.bio</strong>, a company incorporated in India. We operate a professional profile platform for advocates, enabling them to share their credentials, practice areas, and consultation availability through a single link.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">2. Information We Collect</h2>
            <p className="text-base leading-relaxed mb-3">We collect the following types of information:</p>
            <ul className="space-y-2 text-base">
              {[
                'Mobile number (for OTP-based login)',
                'Profile information provided by advocates: name, title, practice areas, experience, location, languages, and bio',
                'Enquiry details submitted by visitors: name, phone number, email, case type, and description',
                'Booking and consultation details including scheduled date and time',
                'Payment transaction references (we do not store card or UPI credentials directly — these are handled by Razorpay)',
                'Basic usage analytics: profile views and page interactions',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">3. How We Use Your Information</h2>
            <ul className="space-y-2 text-base">
              {[
                'To operate and maintain your advocate profile',
                'To facilitate connections between advocates and prospective clients',
                'To send booking confirmations and notifications via WhatsApp and email',
                'To process consultation fee transactions through Razorpay',
                'To provide advocates with practice analytics',
                'To improve our platform based on usage patterns',
                'To comply with legal obligations under Indian law',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">4. Data Sharing</h2>
            <p className="text-base leading-relaxed mb-3">We do not sell your personal data. We share data only with:</p>
            <ul className="space-y-2 text-base">
              {[
                'Razorpay — for payment processing and payouts (governed by Razorpay\'s Privacy Policy)',
                'Supabase — our database and authentication provider',
                'Twilio — for WhatsApp and SMS notifications',
                'Resend — for transactional email delivery',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-base leading-relaxed mt-3">
              We may also disclose information where required by law or to protect the rights, property, or safety of our users.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">5. Data Retention</h2>
            <p className="text-base leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide our services. You may request deletion of your account and associated data by contacting us at the address below. Certain data may be retained for legal and compliance purposes.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">6. Your Rights</h2>
            <p className="text-base leading-relaxed mb-3">
              Under applicable Indian data protection law, you have the right to:
            </p>
            <ul className="space-y-2 text-base">
              {[
                'Access the personal data we hold about you',
                'Request correction of inaccurate data',
                'Request deletion of your data',
                'Withdraw consent where processing is based on consent',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">7. Cookies & Analytics</h2>
            <p className="text-base leading-relaxed">
              We use minimal cookies for session management and authentication. We use PostHog for analytics, which collects anonymised usage data to help us improve the platform. No third-party advertising cookies are used.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-4">8. Contact Us</h2>
            <p className="text-base leading-relaxed">
              For any privacy-related queries or to exercise your rights, please contact:
            </p>
            <div className="mt-4 p-5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-base space-y-1">
              <p className="font-semibold text-[#0F172A]">vakil.bio</p>
              <p className="text-[#475569]">Email: privacy@vakil.bio</p>
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
