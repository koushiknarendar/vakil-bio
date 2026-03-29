import { NextRequest } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const authSupabase = await createServerClient()
    const { data: { user } } = await authSupabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const slot = formData.get('slot') as string // 'doc1' | 'doc2'
    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > 10 * 1024 * 1024) return Response.json({ error: 'File must be under 10MB' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: lawyer } = await supabase
      .from('lawyers').select('id').eq('user_id', user.id).single()
    if (!lawyer) return Response.json({ error: 'Profile not found' }, { status: 404 })

    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${lawyer.id}/${slot}_${Date.now()}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const { error } = await supabase.storage
      .from('verification-docs')
      .upload(path, arrayBuffer, { contentType: file.type, upsert: true })

    if (error) {
      console.error('Storage upload error:', error)
      return Response.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Return the storage path (not a public URL — admin will generate signed URL)
    return Response.json({ path })
  } catch (err) {
    console.error('Upload doc error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
