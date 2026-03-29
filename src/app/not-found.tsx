import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
      <div style={{ textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontSize: '80px', fontWeight: 700, color: '#E2E8F0', lineHeight: 1, marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>404</div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>Page not found</h1>
        <p style={{ color: '#64748B', fontSize: '15px', marginBottom: '28px' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ background: '#2563EB', color: '#fff', fontWeight: 600, padding: '10px 24px', borderRadius: '12px', textDecoration: 'none', fontSize: '14px' }}>
            Go home
          </Link>
          <Link href="/discover" style={{ background: '#fff', color: '#374151', fontWeight: 500, padding: '10px 24px', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', border: '1px solid #E2E8F0' }}>
            Find a lawyer
          </Link>
        </div>
      </div>
    </div>
  )
}
