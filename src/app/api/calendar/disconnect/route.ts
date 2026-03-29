import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { provider } = await request.json()
  if (provider !== 'google' && provider !== 'microsoft') {
    return Response.json({ error: 'Invalid provider' }, { status: 400 })
  }

  const { data: lawyer } = await supabase
    .from('lawyers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!lawyer) return Response.json({ error: 'Not found' }, { status: 404 })

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await serviceSupabase
    .from('lawyer_calendar_tokens')
    .delete()
    .eq('lawyer_id', lawyer.id)
    .eq('provider', provider)

  return Response.json({ success: true })
}
