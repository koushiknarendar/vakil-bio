import { SupabaseClient } from '@supabase/supabase-js'

export type NotificationType = 'booking' | 'lead' | 'verification_approved' | 'verification_rejected'

export async function createNotification(
  supabase: SupabaseClient,
  lawyerId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
) {
  await supabase.from('notifications').insert({ lawyer_id: lawyerId, type, title, message, link })
}
