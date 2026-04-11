import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return Response.json({ error: 'Email required' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    if (error) {
      console.error('generateLink error:', error)
      return Response.json({ error: 'Failed to generate OTP' }, { status: 500 })
    }

    const emailOtp = data.properties?.email_otp
    const hashedToken = data.properties?.hashed_token

    if (!emailOtp || !hashedToken) {
      console.error('Missing email_otp or hashed_token in generateLink response', data.properties)
      return Response.json({ error: 'Failed to generate OTP' }, { status: 500 })
    }

    // Store hashed_token in HTTP-only cookie so server can verify without client-side Supabase auth call
    const cookieValue = Buffer.from(JSON.stringify({
      email: email.toLowerCase(),
      hashed_token: hashedToken,
      expires: Date.now() + 10 * 60 * 1000,
    })).toString('base64')

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'vakil.bio <noreply@vakil.bio>',
        to: email,
        subject: `${emailOtp} — Your vakil.bio login code`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;">
            <div style="background:#0F172A;padding:24px;text-align:center;">
              <span style="color:#fff;font-size:20px;font-weight:700;">vakil<span style="color:#4F7AFF;">.</span>bio</span>
            </div>
            <div style="padding:32px 24px;text-align:center;">
              <p style="color:#374151;font-size:15px;margin:0 0 24px;">Your login code:</p>
              <div style="background:#F8FAFC;border:2px solid #E2E8F0;border-radius:12px;padding:20px;display:inline-block;margin-bottom:24px;">
                <span style="font-family:monospace;font-size:36px;font-weight:700;letter-spacing:0.3em;color:#0F172A;">${emailOtp}</span>
              </div>
              <p style="color:#9CA3AF;font-size:13px;margin:0;">This code expires in 10 minutes. Do not share it.</p>
            </div>
            <div style="background:#F9FAFB;padding:16px 24px;border-top:1px solid #E5E7EB;">
              <p style="color:#9CA3AF;font-size:11px;margin:0;text-align:center;">vakil.bio</p>
            </div>
          </div>
        `,
      })
    }

    const isSecure = process.env.NODE_ENV === 'production'
    const response = Response.json({ success: true })
    response.headers.set(
      'Set-Cookie',
      `user_otp=${cookieValue}; HttpOnly; ${isSecure ? 'Secure; ' : ''}SameSite=Lax; Max-Age=600; Path=/`
    )
    return response
  } catch (err) {
    console.error('send-otp error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
