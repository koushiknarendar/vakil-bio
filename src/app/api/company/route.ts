import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

// GET: fetch current lawyer's company membership
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: lawyer } = await supabase
    .from('lawyers')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!lawyer) return Response.json({ error: 'Not found' }, { status: 404 })

  const { data: membership } = await supabase
    .from('company_members')
    .select('role, company:companies(*)')
    .eq('lawyer_id', lawyer.id)
    .single()

  return Response.json({ membership: membership ?? null })
}

// POST: create a new company
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: lawyer } = await supabase
    .from('lawyers')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!lawyer) return Response.json({ error: 'Not found' }, { status: 404 })

  // Check not already in a company
  const { data: existing } = await supabase
    .from('company_members')
    .select('id')
    .eq('lawyer_id', lawyer.id)
    .single()
  if (existing) return Response.json({ error: 'Already in a company' }, { status: 400 })

  const body = await req.json()
  const { name, slug: rawSlug, tagline, about, website, email, phone, location, practice_areas, founded_year, team_size } = body

  if (!name?.trim()) return Response.json({ error: 'Name is required' }, { status: 400 })
  if (!rawSlug?.trim()) return Response.json({ error: 'Firm handle is required' }, { status: 400 })

  const slug = slugify(rawSlug)
  if (slug.length < 3) return Response.json({ error: 'Handle must be at least 3 characters' }, { status: 400 })

  const { data: existing_slug } = await supabase.from('companies').select('id').eq('slug', slug).single()
  if (existing_slug) return Response.json({ error: 'This handle is already taken' }, { status: 400 })

  const { data: company, error } = await supabase
    .from('companies')
    .insert({
      name: name.trim(),
      slug,
      tagline: tagline?.trim() || null,
      about: about?.trim() || null,
      website: website?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      location: location?.trim() || null,
      practice_areas: practice_areas || [],
      founded_year: founded_year ? parseInt(founded_year) : null,
      team_size: team_size || null,
      created_by: lawyer.id,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Add creator as admin member
  await supabase.from('company_members').insert({
    company_id: company.id,
    lawyer_id: lawyer.id,
    role: 'admin',
  })

  return Response.json({ company })
}
