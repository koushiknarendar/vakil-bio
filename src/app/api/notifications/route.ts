import { createClient } from '@/lib/supabase/server'
import { createClient as serviceClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: lawyer } = await supabase.from('lawyers').select('id').eq('user_id', user.id).single()
  if (!lawyer) return Response.json({ notifications: [] })

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('lawyer_id', lawyer.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return Response.json({ notifications: notifications ?? [] })
}

export async function PATCH() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: lawyer } = await supabase.from('lawyers').select('id').eq('user_id', user.id).single()
  if (!lawyer) return Response.json({ success: true })

  const svc = serviceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  await svc.from('notifications').update({ read: true }).eq('lawyer_id', lawyer.id).eq('read', false)

  return Response.json({ success: true })
}
