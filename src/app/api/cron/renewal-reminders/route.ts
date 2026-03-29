import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://vakil.bio'

function renewalEmail(name: string, daysLeft: number, verificationType: string) {
  const isAdvocate = verificationType === 'advocate'
  const badgeLabel = isAdvocate ? 'Verified Advocate' : 'Verified Professional'
  const urgencyColor = daysLeft <= 3 ? '#DC2626' : '#D97706'
  const urgencyBg = daysLeft <= 3 ? '#FEF2F2' : '#FFFBEB'
  const urgencyBorder = daysLeft <= 3 ? '#FECACA' : '#FDE68A'

  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;">
      <div style="background:#0F172A;padding:28px 24px;text-align:center;">
        <span style="color:#fff;font-size:22px;font-weight:700;">vakil<span style="color:#4F7AFF;">.</span>bio</span>
      </div>
      <div style="padding:32px 24px;">
        <div style="background:${urgencyBg};border:1px solid ${urgencyBorder};border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
          <p style="color:${urgencyColor};font-weight:700;font-size:16px;margin:0;">
            ⚠️ Your ${badgeLabel} badge expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}
          </p>
        </div>
        <p style="color:#374151;margin-bottom:8px;">Hi ${name},</p>
        <p style="color:#6B7280;line-height:1.7;margin-bottom:24px;">
          Your <strong>${badgeLabel}</strong> badge on vakil.bio expires in <strong>${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>.
          Renew now to keep your verified status and continue building client trust.
        </p>
        <a href="${BASE}/dashboard/verification" style="display:inline-block;background:#4F7AFF;color:#fff;padding:12px 28px;border-radius:12px;font-weight:600;text-decoration:none;font-size:14px;">
          Renew Your Badge →
        </a>
        <p style="color:#9CA3AF;font-size:12px;margin-top:28px;line-height:1.6;">
          The Verified badge signals credibility to potential clients. Don't let it lapse.
        </p>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;border-top:1px solid #E5E7EB;">
        <p style="color:#9CA3AF;font-size:11px;margin:0;text-align:center;">vakil.bio · Professional profiles for Indian advocates</p>
      </div>
    </div>
  `
}

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron (or manually with the secret)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find lawyers whose badge expires in 7 days (within a 24h window)
  const in7Days = new Date()
  in7Days.setDate(in7Days.getDate() + 7)
  const windowStart = new Date(in7Days)
  windowStart.setHours(0, 0, 0, 0)
  const windowEnd = new Date(in7Days)
  windowEnd.setHours(23, 59, 59, 999)

  const { data: lawyers, error } = await supabase
    .from('lawyers')
    .select('id, full_name, email, verification_type, verified_until')
    .eq('is_verified', true)
    .gte('verified_until', windowStart.toISOString())
    .lte('verified_until', windowEnd.toISOString())

  if (error) {
    console.error('Renewal reminders query error:', error)
    return Response.json({ error: 'DB error' }, { status: 500 })
  }

  if (!lawyers || lawyers.length === 0) {
    return Response.json({ sent: 0, message: 'No renewals due in 7 days' })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  let sent = 0

  for (const lawyer of lawyers) {
    if (!lawyer.email) continue
    const daysLeft = Math.ceil(
      (new Date(lawyer.verified_until).getTime() - Date.now()) / 86400000
    )
    try {
      await resend.emails.send({
        from: 'vakil.bio <noreply@vakil.bio>',
        to: lawyer.email,
        subject: `⚠️ Your Verified badge expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — vakil.bio`,
        html: renewalEmail(lawyer.full_name, daysLeft, lawyer.verification_type ?? 'advocate'),
      })
      sent++
    } catch (e) {
      console.error(`Renewal email failed for ${lawyer.email}:`, e)
    }
  }

  return Response.json({ sent, total: lawyers.length })
}
