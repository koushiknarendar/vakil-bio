import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const BASE = () => process.env.NEXT_PUBLIC_APP_URL!

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const storedState = request.cookies.get('oauth_ms_state')?.value

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${BASE()}/dashboard/calendar?error=state_mismatch`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${BASE()}/auth/login`)

  // Exchange code for tokens
  let tokens: { access_token?: string; refresh_token?: string; expires_in?: number }
  try {
    const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        redirect_uri: `${BASE()}/api/calendar/microsoft/callback`,
        grant_type: 'authorization_code',
        scope: 'offline_access https://graph.microsoft.com/Calendars.ReadWrite',
      }),
    })
    tokens = await tokenRes.json()
    if (!tokens.access_token) throw new Error('No access token in response')
  } catch {
    return NextResponse.redirect(`${BASE()}/dashboard/calendar?error=ms_auth_failed`)
  }

  // Get lawyer ID
  const { data: lawyer } = await supabase
    .from('lawyers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!lawyer) {
    return NextResponse.redirect(`${BASE()}/dashboard/calendar?error=lawyer_not_found`)
  }

  // Store tokens using service role (bypasses RLS)
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await serviceSupabase.from('lawyer_calendar_tokens').upsert({
    lawyer_id: lawyer.id,
    provider: 'microsoft',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    expires_at: new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'lawyer_id,provider' })

  const response = NextResponse.redirect(`${BASE()}/dashboard/calendar?connected=microsoft`)
  response.cookies.delete('oauth_ms_state')
  return response
}
