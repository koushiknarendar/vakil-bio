import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      lawyerId,
      clientName,
      clientPhone,
      clientEmail,
      caseType,
      description,
      urgency,
    } = body

    if (!lawyerId || !clientName || !clientPhone || !caseType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Create lead record
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        lawyer_id: lawyerId,
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail || null,
        case_type: caseType,
        description: description || null,
        urgency: urgency || 'medium',
        is_contacted: false,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Lead creation error:', error)
      return Response.json({ error: 'Failed to create lead' }, { status: 500 })
    }

    // Fetch lawyer's WhatsApp number
    const { data: lawyer } = await supabase
      .from('lawyers')
      .select('whatsapp_number, full_name')
      .eq('id', lawyerId)
      .single()

    // Send WhatsApp notification to lawyer
    if (lawyer?.whatsapp_number) {
      const urgencyEmoji = urgency === 'high' ? '🔴' : urgency === 'medium' ? '🟡' : '🟢'
      const message =
        `${urgencyEmoji} New lead on vakil.bio!\n\n` +
        `Name: ${clientName}\n` +
        `Phone: ${clientPhone}\n` +
        `Case Type: ${caseType}\n` +
        (description ? `Details: ${description}\n` : '') +
        `Urgency: ${urgency || 'medium'}\n\n` +
        `Login to vakil.bio/dashboard to view and respond.`

      await sendWhatsAppNotification(lawyer.whatsapp_number, message)
    }

    return Response.json({ leadId: lead.id })
  } catch (error) {
    console.error('Create lead error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
