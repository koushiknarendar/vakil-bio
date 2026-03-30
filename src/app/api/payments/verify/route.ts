import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { triggerCalendarEvent } from '@/lib/calendar'
import { getCashfreeOrder } from '@/lib/cashfree'
import { createNotification } from '@/lib/notifications'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

async function sendWhatsAppNotification(to: string, message: string) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const from = process.env.TWILIO_WHATSAPP_FROM

    if (!accountSid || !authToken || !from) return

    const body = new URLSearchParams({
      From: from,
      To: `whatsapp:+91${to}`,
      Body: message,
    })

    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }
    )
  } catch (error) {
    console.error('WhatsApp send error:', error)
  }
}

async function sendEmailConfirmation(
  resendClient: Resend,
  to: string,
  clientName: string,
  lawyerName: string,
  serviceName: string,
  date: string,
  time: string,
  amount: number
) {
  try {
    await resendClient.emails.send({
      from: 'vakil.bio <noreply@vakil.bio>',
      to,
      subject: `Booking Confirmed — ${serviceName} with ${lawyerName}`,
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff;">
          <div style="background: #0F0C28; padding: 32px 24px; text-align: center;">
            <h1 style="color: white; font-size: 24px; margin: 0; font-family: 'Space Grotesk', sans-serif;">
              vakil<span style="color: #2563EB;">.</span>bio
            </h1>
          </div>
          <div style="padding: 32px 24px;">
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px;">
              <p style="color: #16a34a; font-weight: 600; margin: 0; font-size: 16px;">✓ Booking Confirmed</p>
            </div>
            <p style="color: #374151; margin-bottom: 8px;">Hi ${clientName},</p>
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 24px;">
              Your consultation has been confirmed. Here are your booking details:
            </p>
            <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #6b7280; font-size: 13px; padding: 6px 0;">Service</td>
                  <td style="color: #111827; font-weight: 500; font-size: 13px; text-align: right;">${serviceName}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 13px; padding: 6px 0;">Advocate</td>
                  <td style="color: #111827; font-weight: 500; font-size: 13px; text-align: right;">${lawyerName}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 13px; padding: 6px 0;">Date</td>
                  <td style="color: #111827; font-weight: 500; font-size: 13px; text-align: right;">${date}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 13px; padding: 6px 0;">Time</td>
                  <td style="color: #111827; font-weight: 500; font-size: 13px; text-align: right;">${time}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 13px; padding: 6px 0; border-top: 1px solid #e5e7eb;">Amount Paid</td>
                  <td style="color: #111827; font-weight: 700; font-size: 14px; text-align: right; border-top: 1px solid #e5e7eb;">₹${amount.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>
            <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin-bottom: 24px;">
              The advocate will share the meeting link with you shortly via WhatsApp or email.
              If you need to reschedule, please contact them directly.
            </p>
          </div>
          <div style="background: #f9fafb; padding: 16px 24px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0; text-align: center;">
              vakil.bio is a technology platform. Legal services are provided by independent advocates.
            </p>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Email send error:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, bookingId } = body

    if (!orderId || !bookingId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabase()
    const resend = getResend()

    // Verify payment status with Cashfree
    const cfOrder = await getCashfreeOrder(orderId)
    if (cfOrder.order_status !== 'PAID') {
      return Response.json({ error: `Payment not completed (status: ${cfOrder.order_status})`, success: false }, { status: 400 })
    }

    // Fetch booking with lawyer and service details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(*),
        lawyer:lawyers(*)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return Response.json({ error: 'Booking not found', success: false }, { status: 404 })
    }

    // Update booking status
    await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        razorpay_payment_id: cfOrder.cf_order_id, // storing Cashfree's internal order ID
      })
      .eq('id', bookingId)

    // Trigger calendar events (non-blocking)
    triggerCalendarEvent(booking).catch((e) =>
      console.error('Calendar trigger error:', e)
    )

    // In-app notification to lawyer
    createNotification(supabase, booking.lawyer_id, 'booking', 'New booking received',
      `${booking.client_name} booked a session with you`, '/dashboard/bookings').catch(() => {})

    // Send notifications (non-blocking)
    const lawyerName = booking.lawyer?.full_name || 'Advocate'
    const serviceName = booking.service?.title || 'Consultation'
    const formattedDate = new Date(booking.scheduled_date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // WhatsApp to lawyer
    if (booking.lawyer?.whatsapp_number) {
      const message =
        `🎉 New booking confirmed!\n\n` +
        `Client: ${booking.client_name}\n` +
        `Service: ${serviceName}\n` +
        `Date: ${formattedDate}\n` +
        `Time: ${booking.scheduled_time}\n` +
        `Amount: ₹${booking.amount.toLocaleString('en-IN')}\n` +
        `Phone: ${booking.client_phone}\n\n` +
        `Login to vakil.bio to manage this booking.`

      await sendWhatsAppNotification(booking.lawyer.whatsapp_number, message)
    }

    // WhatsApp to client
    if (booking.client_phone) {
      const clientMsg =
        `✅ Booking confirmed!\n\n` +
        `Service: ${serviceName}\n` +
        `Advocate: ${lawyerName}\n` +
        `Date: ${formattedDate}\n` +
        `Time: ${booking.scheduled_time}\n` +
        `Amount: ₹${booking.amount.toLocaleString('en-IN')}\n\n` +
        `The advocate will share a meeting link with you before the session.`
      await sendWhatsAppNotification(booking.client_phone, clientMsg)
    }

    // Email to client
    if (booking.client_email) {
      await sendEmailConfirmation(
        resend,
        booking.client_email,
        booking.client_name,
        lawyerName,
        serviceName,
        formattedDate,
        booking.scheduled_time,
        booking.amount
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Verify payment error:', error)
    return Response.json({ error: 'Internal server error', success: false }, { status: 500 })
  }
}
