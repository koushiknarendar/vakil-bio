import Link from 'next/link'
import Image from 'next/image'

export function Footer({ minimal = false }: { minimal?: boolean }) {
  return (
    <footer style={{ borderTop: '1px solid #E9ECF4', background: minimal ? '#F4F6FB' : 'var(--bg-base)' }}
      className="py-10 px-4 sm:px-6">
      <div className={minimal ? 'max-w-xl mx-auto' : 'max-w-6xl mx-auto'}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="vakil.bio"
              width={120}
              height={36}
              className="h-7 w-auto object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/discover" className="transition-colors hover:opacity-70">Discover Lawyers</Link>
            {!minimal && (
              <>
                <Link href="/bci-compliance" className="transition-colors hover:opacity-70">BCI Compliance</Link>
                <Link href="/grievance" className="transition-colors hover:opacity-70">Grievances</Link>
              </>
            )}
            <Link href="/privacy" className="transition-colors hover:opacity-70">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:opacity-70">Terms</Link>
            <Link href="/auth/login" className="transition-colors hover:opacity-70">Login</Link>
          </div>
        </div>
        <div className="pt-6 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
          style={{ borderTop: '1px solid #E9ECF4' }}>
          <p className="text-xs max-w-2xl leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Disclaimer:</strong> vakil.bio is a technology platform that helps advocates maintain an online professional profile. This does not constitute solicitation of work. Advocates are responsible for compliance with Bar Council of India rules.
          </p>
          <p className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} vakil.bio</p>
        </div>
      </div>
    </footer>
  )
}
