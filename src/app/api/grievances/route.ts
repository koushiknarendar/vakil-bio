import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(req: NextRequest) {
  const { name, email, phone, subject, description } = await req.json()

  if (!name || !email || !phone || !subject || !description) {
    return Response.json({ error: 'All fields are required' }, { status: 400 })
  }

  const supabase = getServiceSupabase()
  const { error } = await supabase.from('grievances').insert({ name, email, phone, subject, description, status: 'open' })

  if (error) {
    console.error('Grievance insert error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
