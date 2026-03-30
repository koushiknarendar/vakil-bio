import { NextRequest } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { createNotification } from '@/lib/notifications'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://vakil.bio'

function approvedEmail(name: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;">
      <div style="background:#0F172A;padding:28px 24px;text-align:center;">
        <span style="color:#fff;font-size:22px;font-weight:700;">vakil<span style="color:#4F7AFF;">.</span>bio</span>
      </div>
      <div style="padding:32px 24px;">
        <div style="background:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
          <p style="color:#059669;font-weight:700;font-size:16px;margin:0;">✓ Your credentials have been verified!</p>
        </div>
        <p style="color:#374151;margin-bottom:8px;">Hi ${name},</p>
        <p style="color:#6B7280;line-height:1.7;margin-bottom:24px;">
          Great news — your credentials have been reviewed and approved by the vakil.bio team.
          You can now activate your Verified badge by completing the payment on your dashboard.
        </p>
        <a href="${BASE}/dashboard/verification" style="display:inline-block;background:#4F7AFF;color:#fff;padding:12px 28px;border-radius:12px;font-weight:600;text-decoration:none;font-size:14px;">
          Activate Your Badge →
        </a>
        <p style="color:#9CA3AF;font-size:12px;margin-top:28px;line-height:1.6;">
          The Verified badge confirms your credentials to clients, increasing trust and bookings.
        </p>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;border-top:1px solid #E5E7EB;">
        <p style="color:#9CA3AF;font-size:11px;margin:0;text-align:center;">vakil.bio · Professional profiles for Indian advocates</p>
      </div>
    </div>
  `
}

function rejectedEmail(name: string, reason: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;">
      <div style="background:#0F172A;padding:28px 24px;text-align:center;">
        <span style="color:#fff;font-size:22px;font-weight:700;">vakil<span style="color:#4F7AFF;">.</span>bio</span>
      </div>
      <div style="padding:32px 24px;">
        <p style="color:#374151;margin-bottom:8px;">Hi ${name},</p>
        <p style="color:#6B7280;line-height:1.7;margin-bottom:20px;">
          We reviewed your verification application and were unable to approve it at this time.
        </p>
        <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:16px;margin-bottom:24px;">
          <p style="color:#DC2626;font-weight:600;font-size:13px;margin:0 0 6px;">Reason:</p>
          <p style="color:#374151;font-size:14px;margin:0;line-height:1.6;">${reason}</p>
        </div>
        <p style="color:#6B7280;line-height:1.7;margin-bottom:24px;">
          You can update your application and re-apply from your dashboard.
        </p>
        <a href="${BASE}/dashboard/verification" style="display:inline-block;background:#4F7AFF;color:#fff;padding:12px 28px;border-radius:12px;font-weight:600;text-decoration:none;font-size:14px;">
          Re-apply →
        </a>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;border-top:1px solid #E5E7EB;">
        <p style="color:#9CA3AF;font-size:11px;margin:0;text-align:center;">vakil.bio · Professional profiles for Indian advocates</p>
      </div>
    </div>
  `
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authSupabase = await createServerClient()
    const { data: { user } } = await authSupabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(e => e.trim())
    if (!adminPhones.includes(user.phone ?? '')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { action, rejectionReason } = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: app } = await supabase
      .from('verification_applications')
      .select('*, lawyer:lawyers(id, full_name, email, verification_type)')
      .eq('id', id)
      .single()

    if (!app) return Response.json({ error: 'Application not found' }, { status: 404 })

    const lawyer = app.lawyer as { id: string; full_name: string; email: string; verification_type: string }

    if (action === 'approve') {
      await supabase.from('verification_applications').update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', id)

      await supabase.from('lawyers').update({
        verification_status: 'approved',
        verification_type: app.verification_type,
        updated_at: new Date().toISOString(),
      }).eq('id', app.lawyer_id)

      createNotification(supabase, lawyer.id, 'verification_approved',
        'Verification approved! 🎉', 'Your credentials have been verified. Activate your badge now.',
        '/dashboard/verification').catch(() => {})

      // Send approval email (non-blocking)
      if (lawyer.email && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY)
        resend.emails.send({
          from: 'vakil.bio <noreply@vakil.bio>',
          to: lawyer.email,
          subject: '✓ Your verification has been approved — vakil.bio',
          html: approvedEmail(lawyer.full_name),
        }).catch(e => console.error('Approval email error:', e))
      }

    } else if (action === 'reject') {
      if (!rejectionReason) return Response.json({ error: 'Rejection reason required' }, { status: 400 })

      await supabase.from('verification_applications').update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', id)

      await supabase.from('lawyers').update({
        verification_status: 'rejected',
        updated_at: new Date().toISOString(),
      }).eq('id', app.lawyer_id)

      createNotification(supabase, lawyer.id, 'verification_rejected',
        'Verification not approved', `Reason: ${rejectionReason}`,
        '/dashboard/verification').catch(() => {})

      // Send rejection email (non-blocking)
      if (lawyer.email && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY)
        resend.emails.send({
          from: 'vakil.bio <noreply@vakil.bio>',
          to: lawyer.email,
          subject: 'Update on your vakil.bio verification application',
          html: rejectedEmail(lawyer.full_name, rejectionReason),
        }).catch(e => console.error('Rejection email error:', e))
      }

    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Admin verification action error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
