import { NextRequest } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const authSupabase = await createServerClient()
    const { data: { user } } = await authSupabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { verificationType, barCouncilNumber, stateBarCouncil, professionalRole, document1Path, document2Path, linkedinUrl } = body

    if (!verificationType || !['advocate', 'professional'].includes(verificationType)) {
      return Response.json({ error: 'Invalid verification type' }, { status: 400 })
    }
    if (verificationType === 'advocate' && (!barCouncilNumber || !stateBarCouncil)) {
      return Response.json({ error: 'Bar Council number and State Bar Council are required' }, { status: 400 })
    }
    if (verificationType === 'professional' && !professionalRole) {
      return Response.json({ error: 'Professional role is required' }, { status: 400 })
    }
    if (!document1Path) {
      return Response.json({ error: 'Primary document is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: lawyer } = await supabase
      .from('lawyers').select('id, verification_status').eq('user_id', user.id).single()
    if (!lawyer) return Response.json({ error: 'Profile not found' }, { status: 404 })

    // Don't allow re-application if already pending or approved
    if (lawyer.verification_status === 'pending') {
      return Response.json({ error: 'Application already under review' }, { status: 400 })
    }
    if (lawyer.verification_status === 'approved') {
      return Response.json({ error: 'Already approved — proceed to payment' }, { status: 400 })
    }

    // Upsert application (allows reapplication after rejection)
    const { error: appError } = await supabase
      .from('verification_applications')
      .upsert({
        lawyer_id: lawyer.id,
        verification_type: verificationType,
        status: 'pending',
        bar_council_number: barCouncilNumber || null,
        state_bar_council: stateBarCouncil || null,
        professional_role: professionalRole || null,
        document_1_url: document1Path,
        document_2_url: document2Path || null,
        linkedin_url: linkedinUrl || null,
        rejection_reason: null,
        reviewed_at: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'lawyer_id' })

    if (appError) {
      console.error('Application upsert error:', appError)
      return Response.json({ error: 'Failed to submit application' }, { status: 500 })
    }

    // Update lawyer verification status
    await supabase.from('lawyers').update({
      verification_status: 'pending',
      updated_at: new Date().toISOString(),
    }).eq('id', lawyer.id)

    return Response.json({ success: true })
  } catch (err) {
    console.error('Apply error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
