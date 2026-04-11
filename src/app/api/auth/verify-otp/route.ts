import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()
    if (!email || !otp) return Response.json({ error: 'Email and OTP required' }, { status: 400 })

    // Read the stored token from the HTTP-only cookie set during send-otp
    const cookieHeader = req.headers.get('cookie') || ''
    const match = cookieHeader.match(/(?:^|;\s*)user_otp=([^;]+)/)
    if (!match) return Response.json({ error: 'OTP session expired. Please request a new code.' }, { status: 400 })

    let storedData: { email: string; hashed_token: string; expires: number }
    try {
      storedData = JSON.parse(Buffer.from(match[1], 'base64').toString())
    } catch {
      return Response.json({ error: 'Invalid OTP session. Please request a new code.' }, { status: 400 })
    }

    if (storedData.email !== email.toLowerCase()) {
      return Response.json({ error: 'Email mismatch. Please request a new code.' }, { status: 400 })
    }
    if (Date.now() > storedData.expires) {
      return Response.json({ error: 'OTP expired. Please request a new code.' }, { status: 400 })
    }

    // Use the hashed_token (not the raw OTP) to verify
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      token_hash: storedData.hashed_token,
      type: 'magiclink',
    })

    // Clear the OTP cookie regardless of result
    cookieStore.set('user_otp', '', { maxAge: 0, path: '/' })

    if (error) {
      console.error('verifyOtp error:', error)
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('verify-otp error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
