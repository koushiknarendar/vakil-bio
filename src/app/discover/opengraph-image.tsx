import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Find Lawyers in India — vakil.bio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#F4F6FB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top branding */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>vakil</span>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#4F7AFF' }}>.</span>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>bio</span>
        </div>

        {/* Main heading */}
        <h1 style={{
          fontSize: '64px',
          fontWeight: 900,
          color: '#0F172A',
          margin: '0 0 16px',
          textAlign: 'center',
          lineHeight: 1.1,
        }}>
          Find Lawyers in India
        </h1>

        <p style={{
          fontSize: '22px',
          color: '#64748B',
          margin: '0 0 48px',
          textAlign: 'center',
          maxWidth: '700px',
        }}>
          Browse verified advocates by practice area — Criminal, Family, Corporate & more
        </p>

        {/* Practice area pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '900px' }}>
          {['Criminal Law', 'Family Law', 'Corporate', 'Property', 'Tax Law', 'IP'].map(area => (
            <div key={area} style={{
              padding: '8px 18px',
              borderRadius: '999px',
              background: 'rgba(79,122,255,0.08)',
              border: '1px solid rgba(79,122,255,0.2)',
              color: '#4F7AFF',
              fontSize: '16px',
              fontWeight: 600,
              display: 'flex',
            }}>
              {area}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
