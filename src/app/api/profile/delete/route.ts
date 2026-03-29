import { NextRequest } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(_req: NextRequest) {
  const authSupabase = await createServerClient()

  const { data: { user } } = await authSupabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getServiceSupabase()

  // Find lawyer by auth user id
  const { data: lawyer, error: lookupError } = await supabase
    .from('lawyers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (lookupError || !lawyer) {
    return Response.json({ error: 'Profile not found' }, { status: 404 })
  }

  const lawyerId = lawyer.id

  // Delete related data first
  await supabase.from('availability_slots').delete().eq('lawyer_id', lawyerId)
  await supabase.from('leads').delete().eq('lawyer_id', lawyerId)
  await supabase.from('bookings').delete().eq('lawyer_id', lawyerId)
  await supabase.from('services').delete().eq('lawyer_id', lawyerId)

  // Delete lawyer record
  const { error: deleteError } = await supabase.from('lawyers').delete().eq('id', lawyerId)
  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 })
  }

  // Sign out + delete auth user
  await authSupabase.auth.signOut()
  try {
    await supabase.auth.admin.deleteUser(user.id)
  } catch (e) {
    console.warn('Auth user delete skipped:', e)
  }

  return Response.json({ success: true })
}
