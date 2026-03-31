import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json()
    if (!companyId) return Response.json({ ok: true })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabase.rpc('increment_firm_views', { p_company_id: companyId })
  } catch {
    // silently ignore
  }

  return Response.json({ ok: true })
}
