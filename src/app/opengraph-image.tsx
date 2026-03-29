import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'vakil.bio — Your legal profile, in one link'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
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
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,122,255,0.15) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '56px', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
            vakil
          </span>
          <span style={{ fontSize: '56px', fontWeight: 800, color: '#4F7AFF' }}>.</span>
          <span style={{ fontSize: '56px', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
            bio
          </span>
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: '24px',
          color: '#94A3B8',
          margin: '0 0 40px',
          textAlign: 'center',
          maxWidth: '600px',
        }}>
          Your legal profile, in one link
        </p>

        {/* Pills */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {['Verified Profiles', 'Online Bookings', 'Instant Leads'].map(label => (
            <div key={label} style={{
              padding: '10px 20px',
              borderRadius: '999px',
              border: '1px solid rgba(79,122,255,0.3)',
              background: 'rgba(79,122,255,0.1)',
              color: '#93B4FF',
              fontSize: '16px',
              fontWeight: 500,
              display: 'flex',
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* Bottom label */}
        <p style={{
          position: 'absolute',
          bottom: '32px',
          fontSize: '14px',
          color: '#475569',
        }}>
          For Indian Advocates · Free to get started
        </p>
      </div>
    ),
    { ...size }
  )
}
