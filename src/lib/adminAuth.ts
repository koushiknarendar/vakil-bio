import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/sign-in')

  const normalize = (p: string) => p.replace(/^\+/, '')
  const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => normalize(p.trim()))
  if (!adminPhones.includes(normalize(user.phone ?? ''))) redirect('/admin/sign-in')

  return user
}
