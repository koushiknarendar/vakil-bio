import { NextRequest } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function getServiceSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function isAdmin(): Promise<boolean> {
  const authSupabase = await createServerClient()
  const { data: { user } } = await authSupabase.auth.getUser()
  if (!user?.email) return false
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  return adminEmails.includes(user.email.toLowerCase())
}

function resolvedEmail(name: string, subject: string, notes: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;">
      <div style="background:#0F172A;padding:28px 24px;text-align:center;">
        <span style="color:#fff;font-size:22px;font-weight:700;">vakil<span style="color:#4F7AFF;">.</span>bio</span>
      </div>
      <div style="padding:32px 24px;">
        <div style="background:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
          <p style="color:#059669;font-weight:700;font-size:16px;margin:0;">✓ Your grievance has been resolved</p>
        </div>
        <p style="color:#374151;margin-bottom:8px;">Hi ${name},</p>
        <p style="color:#6B7280;line-height:1.7;margin-bottom:16px;">
          We wanted to let you know that your grievance regarding <strong style="color:#374151;">"${subject}"</strong> has been reviewed and resolved by our team.
        </p>
        ${notes ? `
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:16px;margin-bottom:24px;">
          <p style="color:#64748B;font-size:12px;font-weight:600;text-transform:uppercase;margin:0 0 8px;">Resolution Notes</p>
          <p style="color:#374151;line-height:1.6;margin:0;">${notes}</p>
        </div>` : ''}
        <p style="color:#6B7280;line-height:1.7;margin-bottom:24px;">
          If you have further concerns or feel this was not addressed adequately, please don't hesitate to reach out to us again.
        </p>
        <p style="color:#9CA3AF;font-size:12px;margin-top:28px;line-height:1.6;">
          Thank you for bringing this to our attention. — Team vakil.bio
        </p>
      </div>
    </div>
  `
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status, notes } = await req.json()

  const supabase = getServiceSupabase()

  // Fetch grievance before updating (to get email, name, subject)
  const { data: grievance } = await supabase
    .from('grievances')
    .select('name, email, subject, status')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('grievances')
    .update({ status, admin_notes: notes })
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Send resolution email if status changed to resolved
  if (status === 'resolved' && grievance?.status !== 'resolved' && grievance?.email) {
    await resend.emails.send({
      from: 'vakil.bio <noreply@vakil.bio>',
      to: grievance.email,
      subject: `Your grievance has been resolved — vakil.bio`,
      html: resolvedEmail(grievance.name, grievance.subject, notes || ''),
    }).catch(err => console.error('Resolution email error:', err))
  }

  return Response.json({ success: true })
}
