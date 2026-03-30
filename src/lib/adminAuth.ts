import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/sign-in')

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  if (!adminEmails.includes((user.email ?? '').toLowerCase())) redirect('/admin/sign-in')

  return user
}
