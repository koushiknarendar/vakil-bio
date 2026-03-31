import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createCashfreeOrder } from '@/lib/cashfree'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      serviceId, lawyerId, scheduledDate, scheduledTime,
      clientName, clientEmail, clientPhone, caseType, description, urgency,
    } = body

    if (!serviceId || !lawyerId || !clientName || !clientEmail || !clientPhone || !caseType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .eq('is_active', true)
      .single()

    if (serviceError || !service) {
      return Response.json({ error: 'Service not found or inactive' }, { status: 404 })
    }

    const commissionRate = parseFloat(process.env.NEXT_PUBLIC_PLATFORM_COMMISSION || '0.05')
    const amount = service.price
    const platformFee = Math.round(amount * commissionRate)
    const orderId = `booking_${Date.now()}`

    const cfOrder = await createCashfreeOrder({
      orderId,
      amount,
      customerId: orderId,
      customerName: clientName,
      customerEmail: clientEmail,
      customerPhone: clientPhone,
      note: `${service.title} — vakil.bio`,
    })

    // Create booking record (pending until payment verified)
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        lawyer_id: lawyerId,
        service_id: serviceId,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        case_type: caseType,
        description: description || null,
        urgency: urgency || 'medium',
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        status: 'pending',
        razorpay_order_id: cfOrder.order_id, // reusing column for Cashfree order ID
        amount,
        platform_fee: platformFee,
      })
      .select('id')
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      return Response.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    return Response.json({
      orderId: cfOrder.order_id,
      paymentSessionId: cfOrder.payment_session_id,
      bookingId: booking.id,
      amount,
      currency: 'INR',
    })
  } catch (error) {
    console.error('Create order error:', error)
    return Response.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
  }
}
