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
    // Verify auth
    const authSupabase = await createServerClient()
    const { data: { user } } = await authSupabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const lawyerId = formData.get('lawyerId') as string | null

    if (!file || !lawyerId) {
      return Response.json({ error: 'Missing file or lawyerId' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'File must be under 5MB' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Verify this lawyer belongs to the requesting user
    const { data: lawyer } = await supabase
      .from('lawyers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!lawyer) return Response.json({ error: 'Profile not found' }, { status: 404 })

    // Ensure bucket exists — ignore error if already exists
    const { error: bucketError } = await supabase.storage.createBucket('profiles', {
      public: true,
      fileSizeLimit: 5242880,
    })
    // Only fail if error is not "already exists"
    if (bucketError && !bucketError.message.includes('already exists') && !bucketError.message.includes('duplicate')) {
      console.error('Bucket error:', bucketError)
      return Response.json({ error: `Storage error: ${bucketError.message}` }, { status: 500 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `avatars/${lawyer.id}.${ext}`
    const bytes = new Uint8Array(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(path, bytes, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return Response.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path)

    // Add cache-bust so img tags reload the new photo
    const urlWithBust = `${publicUrl}?t=${Date.now()}`

    // Update lawyer record
    const { error: updateError } = await supabase
      .from('lawyers')
      .update({ photo_url: urlWithBust })
      .eq('id', lawyer.id)

    if (updateError) {
      console.error('DB update error:', updateError)
      return Response.json({ error: updateError.message }, { status: 500 })
    }

    return Response.json({ url: urlWithBust })
  } catch (err) {
    console.error('Upload error:', err)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
