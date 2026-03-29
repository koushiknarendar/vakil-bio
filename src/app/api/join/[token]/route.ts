import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: preview company info for this invite
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const supabase = await createClient()
  const { token } = await params

  const { data: invite } = await supabase
    .from('company_invites')
    .select('company_id, expires_at, company:companies(id, name, slug, logo_url, tagline, location)')
    .eq('token', token)
    .single()

  if (!invite) return Response.json({ error: 'Invalid or expired invite' }, { status: 404 })
  if (new Date(invite.expires_at) < new Date()) {
    return Response.json({ error: 'This invite link has expired' }, { status: 410 })
  }

  return Response.json({ invite })
}

// POST: accept invite and join company
export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: lawyer } = await supabase.from('lawyers').select('id').eq('user_id', user.id).single()
  if (!lawyer) return Response.json({ error: 'No lawyer profile found' }, { status: 404 })

  const { token } = await params

  const { data: invite } = await supabase
    .from('company_invites')
    .select('company_id, expires_at')
    .eq('token', token)
    .single()

  if (!invite) return Response.json({ error: 'Invalid invite' }, { status: 404 })
  if (new Date(invite.expires_at) < new Date()) {
    return Response.json({ error: 'This invite link has expired' }, { status: 410 })
  }

  // Check not already in a company
  const { data: existing } = await supabase
    .from('company_members')
    .select('id')
    .eq('lawyer_id', lawyer.id)
    .single()
  if (existing) return Response.json({ error: 'Already in a company' }, { status: 400 })

  const { error } = await supabase.from('company_members').insert({
    company_id: invite.company_id,
    lawyer_id: lawyer.id,
    role: 'member',
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true, company_id: invite.company_id })
}
