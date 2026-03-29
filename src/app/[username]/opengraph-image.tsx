import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: lawyer } = await supabase
    .from('lawyers')
    .select('full_name, title, location, photo_url, practice_areas, is_verified, verified_until, verification_type, years_experience')
    .eq('username', username)
    .single()

  const name = lawyer?.full_name ?? username
  const title = lawyer?.title ?? 'Advocate'
  const location = lawyer?.location ?? ''
  const areas = (lawyer?.practice_areas ?? []).slice(0, 3)
  const now = new Date()
  const isVerified = lawyer?.is_verified && (!lawyer.verified_until || new Date(lawyer.verified_until) > now)
  const verifiedLabel = isVerified
    ? (lawyer?.verification_type === 'advocate' ? 'Verified Advocate' : 'Verified Professional')
    : null

  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#fff',
          display: 'flex',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Left blue strip */}
        <div style={{
          width: '8px',
          height: '100%',
          background: 'linear-gradient(180deg, #4F7AFF, #9B6DFF)',
          display: 'flex',
          flexShrink: 0,
        }} />

        {/* Main content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
        }}>
          {/* Avatar + name row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '32px' }}>
            {/* Avatar */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F7AFF, #9B6DFF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '42px',
              fontWeight: 800,
              color: '#fff',
              flexShrink: 0,
              overflow: 'hidden',
            }}>
              {lawyer?.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lawyer.photo_url} style={{ width: '120px', height: '120px', objectFit: 'cover' }} alt={name} />
              ) : initials}
            </div>

            {/* Name + title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '48px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {name}
                </span>
                {isVerified && (
                  <div style={{
                    background: '#ECFDF5',
                    border: '2px solid #A7F3D0',
                    borderRadius: '999px',
                    padding: '6px 16px',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                  }}>
                    ✓ {verifiedLabel}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '24px', color: '#6366F1', fontWeight: 600 }}>{title}</span>
              {location && (
                <span style={{ fontSize: '20px', color: '#94A3B8' }}>📍 {location}</span>
              )}
            </div>
          </div>

          {/* Practice areas */}
          {areas.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {areas.map((area: string) => (
                <div key={area} style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  background: 'rgba(79,122,255,0.08)',
                  border: '1px solid rgba(79,122,255,0.2)',
                  color: '#4F7AFF',
                  fontSize: '18px',
                  fontWeight: 600,
                  display: 'flex',
                }}>
                  {area}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom branding */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          right: '48px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>vakil</span>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#4F7AFF' }}>.</span>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>bio</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
