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

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const companyId = formData.get('companyId') as string | null

    if (!file || !companyId) {
      return Response.json({ error: 'Missing file or companyId' }, { status: 400 })
    }
    if (file.size > 3 * 1024 * 1024) {
      return Response.json({ error: 'Logo must be under 3MB' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Verify user is admin of this company
    const { data: lawyer } = await supabase.from('lawyers').select('id').eq('user_id', user.id).single()
    if (!lawyer) return Response.json({ error: 'Not found' }, { status: 404 })

    const { data: membership } = await supabase
      .from('company_members')
      .select('role')
      .eq('company_id', companyId)
      .eq('lawyer_id', lawyer.id)
      .single()
    if (!membership || membership.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Ensure bucket exists and is public
    await supabase.storage.createBucket('company-logos', { public: true, fileSizeLimit: 3145728 })

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${companyId}/logo.${ext}`
    const bytes = new Uint8Array(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload(path, bytes, { contentType: file.type, upsert: true })

    if (uploadError) {
      return Response.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('company-logos').getPublicUrl(path)
    const url = `${publicUrl}?t=${Date.now()}`

    await supabase.from('companies').update({ logo_url: url }).eq('id', companyId)

    return Response.json({ url })
  } catch (err) {
    console.error('Logo upload error:', err)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
