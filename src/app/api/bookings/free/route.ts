import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { triggerCalendarEvent } from '@/lib/calendar'
import { createNotification } from '@/lib/notifications'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceId, lawyerId, scheduledDate, scheduledTime, clientName, clientEmail, clientPhone, caseType, description } = body

    if (!serviceId || !lawyerId || !clientName || !clientEmail || !clientPhone || !caseType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Verify service is actually free
    const { data: service } = await supabase.from('services').select('*').eq('id', serviceId).single()
    if (!service || service.price !== 0) {
      return Response.json({ error: 'Service is not free' }, { status: 400 })
    }

    const { data: booking, error } = await supabase.from('bookings').insert({
      lawyer_id: lawyerId,
      service_id: serviceId,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      case_type: caseType,
      description: description || null,
      urgency: 'medium',
      scheduled_date: scheduledDate || null,
      scheduled_time: scheduledTime || null,
      status: 'confirmed',
      amount: 0,
      platform_fee: 0,
    }).select(`*, service:services(*), lawyer:lawyers(*)`).single()

    if (error || !booking) {
      return Response.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    // Trigger calendar (non-blocking)
    triggerCalendarEvent(booking).catch((e) => console.error('Calendar trigger error:', e))

    // Notify lawyer
    createNotification(supabase, lawyerId, 'booking', 'New booking received',
      `${clientName} booked a session with you`, '/dashboard/bookings').catch(() => {})

    return Response.json({ success: true, bookingId: booking.id })
  } catch (error) {
    console.error('Free booking error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
