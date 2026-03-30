import { NextRequest } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://vakil.bio'

function verificationEmail(name: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;">
      <div style="background:#0F172A;padding:28px 24px;text-align:center;">
        <span style="color:#fff;font-size:22px;font-weight:700;">vakil<span style="color:#4F7AFF;">.</span>bio</span>
      </div>
      <div style="padding:32px 24px;">
        <p style="color:#374151;margin-bottom:8px;">Hi ${name},</p>
        <p style="color:#6B7280;line-height:1.7;margin-bottom:20px;">
          Your vakil.bio profile is live — but did you know that getting <strong>Verified</strong> can significantly increase the trust clients place in you?
        </p>

        <div style="background:#F0F7FF;border:1px solid #BFDBFE;border-radius:14px;padding:20px;margin-bottom:24px;">
          <p style="color:#1D4ED8;font-weight:700;font-size:15px;margin:0 0 12px;">✦ Benefits of getting Verified</p>
          <ul style="color:#374151;font-size:14px;line-height:1.9;margin:0;padding-left:18px;">
            <li>Blue <strong>Verified Advocate</strong> badge on your profile</li>
            <li>Higher ranking in search results on vakil.bio</li>
            <li>Increased client trust and more consultation requests</li>
            <li>Stand out from unverified profiles</li>
          </ul>
        </div>

        <p style="color:#6B7280;line-height:1.7;margin-bottom:24px;">
          Verification is quick — submit your Bar Council enrollment number and supporting documents. Our team reviews within 24–48 hours.
        </p>

        <a href="${BASE}/dashboard/verification" style="display:inline-block;background:#4F7AFF;color:#fff;padding:12px 28px;border-radius:12px;font-weight:600;text-decoration:none;font-size:14px;">
          Get Verified Now →
        </a>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;border-top:1px solid #E5E7EB;">
        <p style="color:#9CA3AF;font-size:11px;margin:0;text-align:center;">vakil.bio · Professional profiles for Indian advocates</p>
      </div>
    </div>
  `
}

export async function POST(req: NextRequest) {
  const authSupabase = await createServerClient()
  const { data: { user } } = await authSupabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const normalize = (p: string) => p.replace(/^\+/, '')
  const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => normalize(p.trim()))
  if (!adminPhones.includes(normalize(user.phone ?? ''))) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!process.env.RESEND_API_KEY) return Response.json({ error: 'Resend not configured' }, { status: 500 })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: lawyers } = await supabase
    .from('lawyers')
    .select('full_name, email')
    .eq('is_verified', false)
    .not('email', 'is', null)

  if (!lawyers || lawyers.length === 0) {
    return Response.json({ sent: 0, message: 'No unverified lawyers with email' })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  let sent = 0

  for (const lawyer of lawyers) {
    if (!lawyer.email) continue
    try {
      await resend.emails.send({
        from: 'vakil.bio <noreply@vakil.bio>',
        to: lawyer.email,
        subject: 'Get your Verified badge on vakil.bio ✦',
        html: verificationEmail(lawyer.full_name),
      })
      sent++
    } catch (e) {
      console.error(`Failed to send to ${lawyer.email}:`, e)
    }
  }

  return Response.json({ sent, total: lawyers.length })
}
