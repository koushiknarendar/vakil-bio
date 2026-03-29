import Link from 'next/link'
import Image from 'next/image'

interface NavbarProps {
  showCTA?: boolean
  dark?: boolean
}

export function Navbar({ showCTA = true, dark }: NavbarProps) {
  return (
    <nav
      className="w-full"
      style={dark
        ? { background: 'rgba(6,13,31,0.7)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', position: 'relative', zIndex: 10 }
        : { background: '#fff', borderBottom: '1px solid #E2E8F0' }
      }
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="vakil.bio"
            width={110}
            height={32}
            className="h-7 w-auto object-contain"
            style={dark ? { mixBlendMode: 'screen', opacity: 0.85 } : { mixBlendMode: 'multiply' }}
            priority
          />
        </Link>

        <div className="flex items-center gap-4">
          {showCTA && (
            <Link
              href="/auth/login"
              className="text-sm font-semibold sm:hidden px-4 py-2 rounded-lg transition-colors"
              style={dark
                ? { background: 'rgba(79,122,255,0.15)', color: '#93C5FD', border: '1px solid rgba(79,122,255,0.3)' }
                : { background: '#2563EB', color: '#fff' }
              }
            >
              Lawyer? Get your profile
            </Link>
          )}

          {showCTA && (
            <Link
              href="/auth/login"
              className="hidden sm:flex items-center gap-1 text-sm transition-colors"
              style={dark ? { color: 'rgba(241,245,249,0.5)' } : { color: '#475569' }}
            >
              Are you a lawyer?{' '}
              <span className="font-semibold ml-1" style={dark ? { color: '#93C5FD' } : { color: '#2563EB' }}>
                Get your profile →
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
