import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH: update company (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: lawyer } = await supabase.from('lawyers').select('id').eq('user_id', user.id).single()
  if (!lawyer) return Response.json({ error: 'Not found' }, { status: 404 })

  const { id } = await params

  const { data: membership } = await supabase
    .from('company_members')
    .select('role')
    .eq('company_id', id)
    .eq('lawyer_id', lawyer.id)
    .single()
  if (!membership || membership.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, slug: rawSlug, tagline, about, website, email, phone, location, practice_areas, founded_year, team_size, logo_url } = body

  // Validate and check slug uniqueness if changed
  let slug: string | undefined
  if (rawSlug) {
    const cleaned = rawSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '').slice(0, 60)
    if (cleaned.length < 3) return Response.json({ error: 'Handle must be at least 3 characters' }, { status: 400 })
    const { data: existing } = await supabase.from('companies').select('id').eq('slug', cleaned).neq('id', id).single()
    if (existing) return Response.json({ error: 'This handle is already taken' }, { status: 400 })
    slug = cleaned
  }

  const { data: company, error } = await supabase
    .from('companies')
    .update({
      name: name?.trim(),
      ...(slug && { slug }),
      tagline: tagline?.trim() || null,
      about: about?.trim() || null,
      website: website?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      location: location?.trim() || null,
      practice_areas: practice_areas || [],
      founded_year: founded_year ? parseInt(founded_year) : null,
      team_size: team_size || null,
      logo_url: logo_url ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ company })
}

// DELETE: delete company (admin only)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: lawyer } = await supabase.from('lawyers').select('id').eq('user_id', user.id).single()
  if (!lawyer) return Response.json({ error: 'Not found' }, { status: 404 })

  const { id } = await params

  const { data: membership } = await supabase
    .from('company_members')
    .select('role')
    .eq('company_id', id)
    .eq('lawyer_id', lawyer.id)
    .single()
  if (!membership || membership.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await supabase.from('companies').delete().eq('id', id)
  return Response.json({ success: true })
}
