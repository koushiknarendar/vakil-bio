import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lawyerId } = body

    if (!lawyerId) {
      return Response.json({ ok: true })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
      await supabase.rpc('increment_profile_views', { p_lawyer_id: lawyerId })
    } catch {
      // silently ignore — column or function may not exist yet
    }
  } catch {
    // silently ignore — never fail the request
  }

  return Response.json({ ok: true })
}
