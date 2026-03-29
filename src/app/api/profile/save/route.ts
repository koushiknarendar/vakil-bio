import { NextRequest } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const authSupabase = await createServerClient()
    const { data: { user } } = await authSupabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      fullName, title, bio, yearsExperience,
      location, phone, email, whatsappNumber, barCouncilNumber,
      practiceAreas, languages, currentFirm, university, graduationYear,
      showPhone, showWhatsapp,
      linkedinUrl, twitterUrl, instagramUrl, websiteUrl, youtubeUrl,
    } = body

    if (!fullName) {
      return Response.json({ error: 'Full name is required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Look up lawyer by auth user — no client-provided ID needed
    const { data: lawyer, error: lookupError } = await supabase
      .from('lawyers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (lookupError || !lawyer) {
      return Response.json({ error: 'Profile not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {
      full_name: fullName,
      title: title || null,
      bio: bio || null,
      years_experience: yearsExperience || 0,
      location: location || null,
      phone: phone || null,
      email: email || null,
      whatsapp_number: whatsappNumber || null,
      bar_council_number: barCouncilNumber || null,
      practice_areas: practiceAreas || [],
      languages: languages || [],
      updated_at: new Date().toISOString(),
    }

    // Try saving with optional columns first, fall back without them if columns don't exist
    if (currentFirm !== undefined) updateData.current_firm = currentFirm || null
    if (university !== undefined) updateData.university = university || null
    if (graduationYear !== undefined) updateData.graduation_year = graduationYear || null
    if (showPhone !== undefined) updateData.show_phone = showPhone
    if (showWhatsapp !== undefined) updateData.show_whatsapp = showWhatsapp
    if (linkedinUrl !== undefined) updateData.linkedin_url = linkedinUrl || null
    if (twitterUrl !== undefined) updateData.twitter_url = twitterUrl || null
    if (instagramUrl !== undefined) updateData.instagram_url = instagramUrl || null
    if (websiteUrl !== undefined) updateData.website_url = websiteUrl || null
    if (youtubeUrl !== undefined) updateData.youtube_url = youtubeUrl || null

    let { error } = await supabase.from('lawyers').update(updateData).eq('id', lawyer.id)

    if (error?.code === 'PGRST204' || error?.message?.includes('column') || error?.code === '42703') {
      // Column doesn't exist in DB — retry without optional/new columns
      const optionalCols = ['current_firm', 'university', 'graduation_year',
        'show_phone', 'show_whatsapp', 'linkedin_url', 'twitter_url',
        'instagram_url', 'website_url', 'youtube_url']
      optionalCols.forEach(col => delete updateData[col])
      const retry = await supabase.from('lawyers').update(updateData).eq('id', lawyer.id)
      error = retry.error
    }

    if (error) {
      console.error('Profile save error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Save error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
