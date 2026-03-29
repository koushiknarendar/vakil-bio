import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// "10:30 AM" → "10:30:00", "2:00 PM" → "14:00:00"
function parseTimeTo24h(time: string): string {
  const [timePart, ampm] = time.split(' ')
  let [hours, minutes] = timePart.split(':').map(Number)
  if (ampm === 'PM' && hours !== 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
}

// "10:30:00" + 30 min → "11:00:00"
function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m + minutesToAdd
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}:00`
}

interface BookingForCalendar {
  id: string
  lawyer_id: string
  client_name: string
  client_email: string
  client_phone: string
  scheduled_date: string
  scheduled_time: string
  amount: number
  description?: string
  case_type?: string
  service?: { title: string; duration_minutes?: number } | null
}

async function refreshGoogleToken(lawyerId: string, refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Google token refresh failed')

  await getSupabase().from('lawyer_calendar_tokens').update({
    access_token: data.access_token,
    expires_at: new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('lawyer_id', lawyerId).eq('provider', 'google')

  return data.access_token
}

async function refreshMicrosoftToken(lawyerId: string, refreshToken: string): Promise<string> {
  const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: 'offline_access https://graph.microsoft.com/Calendars.ReadWrite',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Microsoft token refresh failed')

  await getSupabase().from('lawyer_calendar_tokens').update({
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_at: new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('lawyer_id', lawyerId).eq('provider', 'microsoft')

  return data.access_token
}

async function getValidToken(lawyerId: string, provider: 'google' | 'microsoft'): Promise<string | null> {
  const { data } = await getSupabase()
    .from('lawyer_calendar_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('lawyer_id', lawyerId)
    .eq('provider', provider)
    .single()

  if (!data) return null

  // Refresh if expiring within 5 minutes
  const expiryMs = new Date(data.expires_at).getTime() - Date.now()
  if (expiryMs < 5 * 60 * 1000) {
    if (!data.refresh_token) return null
    try {
      return provider === 'google'
        ? await refreshGoogleToken(lawyerId, data.refresh_token)
        : await refreshMicrosoftToken(lawyerId, data.refresh_token)
    } catch {
      return null
    }
  }

  return data.access_token
}

async function createGoogleCalendarEvent(accessToken: string, booking: BookingForCalendar) {
  const time24 = parseTimeTo24h(booking.scheduled_time)
  const duration = booking.service?.duration_minutes ?? 30
  const endTime = addMinutesToTime(time24, duration)

  const event = {
    summary: `${booking.service?.title ?? 'Consultation'} — ${booking.client_name}`,
    description: [
      `Client: ${booking.client_name}`,
      `Phone: ${booking.client_phone}`,
      `Email: ${booking.client_email}`,
      booking.case_type ? `Case Type: ${booking.case_type}` : '',
      booking.description ? `\n${booking.description}` : '',
      `\nBooking ID: ${booking.id.slice(0, 8).toUpperCase()}`,
      `Amount Paid: ₹${booking.amount.toLocaleString('en-IN')}`,
    ].filter(Boolean).join('\n'),
    start: { dateTime: `${booking.scheduled_date}T${time24}`, timeZone: 'Asia/Kolkata' },
    end: { dateTime: `${booking.scheduled_date}T${endTime}`, timeZone: 'Asia/Kolkata' },
    attendees: [{ email: booking.client_email, displayName: booking.client_name }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  }

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }
  )
  if (!res.ok) throw new Error(`Google Calendar API error: ${await res.text()}`)
}

async function createMicrosoftCalendarEvent(accessToken: string, booking: BookingForCalendar) {
  const time24 = parseTimeTo24h(booking.scheduled_time)
  const duration = booking.service?.duration_minutes ?? 30
  const endTime = addMinutesToTime(time24, duration)

  const event = {
    subject: `${booking.service?.title ?? 'Consultation'} — ${booking.client_name}`,
    body: {
      contentType: 'text',
      content: [
        `Client: ${booking.client_name}`,
        `Phone: ${booking.client_phone}`,
        `Email: ${booking.client_email}`,
        booking.case_type ? `Case Type: ${booking.case_type}` : '',
        booking.description ? `\n${booking.description}` : '',
        `\nBooking ID: ${booking.id.slice(0, 8).toUpperCase()}`,
        `Amount Paid: ₹${booking.amount.toLocaleString('en-IN')}`,
      ].filter(Boolean).join('\n'),
    },
    start: { dateTime: `${booking.scheduled_date}T${time24}`, timeZone: 'India Standard Time' },
    end: { dateTime: `${booking.scheduled_date}T${endTime}`, timeZone: 'India Standard Time' },
    attendees: [{
      emailAddress: { address: booking.client_email, name: booking.client_name },
      type: 'required',
    }],
    isReminderOn: true,
    reminderMinutesBeforeStart: 60,
  }

  const res = await fetch('https://graph.microsoft.com/v1.0/me/calendar/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  })
  if (!res.ok) throw new Error(`Microsoft Graph API error: ${await res.text()}`)
}

export async function triggerCalendarEvent(booking: BookingForCalendar) {
  const [googleToken, microsoftToken] = await Promise.all([
    getValidToken(booking.lawyer_id, 'google').catch(() => null),
    getValidToken(booking.lawyer_id, 'microsoft').catch(() => null),
  ])

  await Promise.all([
    googleToken
      ? createGoogleCalendarEvent(googleToken, booking).catch((e) =>
          console.error('Google Calendar event failed:', e)
        )
      : Promise.resolve(),
    microsoftToken
      ? createMicrosoftCalendarEvent(microsoftToken, booking).catch((e) =>
          console.error('Microsoft Calendar event failed:', e)
        )
      : Promise.resolve(),
  ])
}
