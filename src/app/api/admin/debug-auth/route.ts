import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Not logged in' })
  return Response.json({
    phone: user.phone,
    email: user.email,
    id: user.id,
    ADMIN_PHONES: process.env.ADMIN_PHONES,
    match: (process.env.ADMIN_PHONES || '').split(',').map(p => p.trim()).includes(user.phone ?? ''),
  })
}
