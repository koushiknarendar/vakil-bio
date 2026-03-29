import { NextRequest } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function getServiceSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function isAdmin(req: NextRequest): Promise<boolean> {
  const authSupabase = await createServerClient()
  const { data: { user } } = await authSupabase.auth.getUser()
  if (!user?.email) return false
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  return adminEmails.includes(user.email.toLowerCase())
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { action } = await req.json()
  const supabase = getServiceSupabase()

  if (action === 'verify') {
    const { error } = await supabase.from('lawyers').update({ is_verified: true }).eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true })
  }

  if (action === 'unverify') {
    const { error } = await supabase.from('lawyers').update({ is_verified: false }).eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true })
  }

  if (action === 'suspend') {
    const { error } = await supabase.from('lawyers').update({ is_suspended: true }).eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true })
  }

  if (action === 'unsuspend') {
    const { error } = await supabase.from('lawyers').update({ is_suspended: false }).eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true })
  }

  if (action === 'delete') {
    await supabase.from('bookings').delete().eq('lawyer_id', id)
    await supabase.from('leads').delete().eq('lawyer_id', id)
    await supabase.from('services').delete().eq('lawyer_id', id)
    await supabase.from('availability_slots').delete().eq('lawyer_id', id)
    const { data: lawyer } = await supabase.from('lawyers').select('user_id').eq('id', id).single()
    const { error } = await supabase.from('lawyers').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    if (lawyer?.user_id) {
      try { await supabase.auth.admin.deleteUser(lawyer.user_id) } catch {}
    }
    return Response.json({ success: true })
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 })
}
