import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/sign-in')

  const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => p.trim())
  if (!adminPhones.includes(user.phone ?? '')) redirect('/admin/sign-in')

  return user
}
