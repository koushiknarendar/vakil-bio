import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('name, tagline, location, logo_url, practice_areas, founded_year')
    .eq('slug', slug)
    .single()

  const { count: memberCount } = await supabase
    .from('company_members')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', slug)

  const name = company?.name ?? 'Law Firm'
  const tagline = company?.tagline ?? ''
  const location = company?.location ?? ''
  const areas = (company?.practice_areas ?? []).slice(0, 4)
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0F172A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px 80px',
          position: 'relative',
        }}
      >
        {/* Firm logo / initials */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '24px',
          background: 'rgba(79,122,255,0.15)',
          border: '2px solid rgba(79,122,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          fontWeight: 800,
          color: '#4F7AFF',
          marginBottom: '28px',
          overflow: 'hidden',
        }}>
          {company?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logo_url} style={{ width: '100px', height: '100px', objectFit: 'cover' }} alt={name} />
          ) : initials}
        </div>

        {/* Firm name */}
        <h1 style={{
          fontSize: '52px',
          fontWeight: 900,
          color: '#fff',
          margin: '0 0 12px',
          textAlign: 'center',
          lineHeight: 1.1,
        }}>
          {name}
        </h1>

        {tagline && (
          <p style={{ fontSize: '22px', color: '#94A3B8', margin: '0 0 24px', textAlign: 'center' }}>
            {tagline}
          </p>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '36px' }}>
          {location && (
            <span style={{ fontSize: '18px', color: '#64748B' }}>📍 {location}</span>
          )}
          {company?.founded_year && (
            <span style={{ fontSize: '18px', color: '#64748B' }}>Est. {company.founded_year}</span>
          )}
          {(memberCount ?? 0) > 0 && (
            <span style={{ fontSize: '18px', color: '#64748B' }}>👥 {memberCount} Members</span>
          )}
        </div>

        {/* Practice areas */}
        {areas.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {areas.map((area: string) => (
              <div key={area} style={{
                padding: '8px 18px',
                borderRadius: '999px',
                background: 'rgba(79,122,255,0.1)',
                border: '1px solid rgba(79,122,255,0.25)',
                color: '#93B4FF',
                fontSize: '16px',
                fontWeight: 600,
                display: 'flex',
              }}>
                {area}
              </div>
            ))}
          </div>
        )}

        {/* Branding */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          right: '48px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>vakil</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#4F7AFF' }}>.</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>bio</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
