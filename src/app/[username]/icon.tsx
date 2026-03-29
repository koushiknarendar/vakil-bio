import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default async function Icon({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: lawyer } = await supabase
    .from('lawyers')
    .select('full_name, photo_url')
    .eq('username', username)
    .single()

  const initials = (lawyer?.full_name ?? username)
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return new ImageResponse(
    lawyer?.photo_url ? (
      <div style={{ width: 32, height: 32, display: 'flex', overflow: 'hidden', borderRadius: '50%' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={lawyer.photo_url} style={{ width: 32, height: 32, objectFit: 'cover' }} alt={initials} />
      </div>
    ) : (
      <div style={{
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #4F7AFF, #9B6DFF)',
        borderRadius: '50%',
        fontSize: 13,
        fontWeight: 700,
        color: '#fff',
        fontFamily: 'sans-serif',
      }}>
        {initials}
      </div>
    ),
    { ...size }
  )
}
