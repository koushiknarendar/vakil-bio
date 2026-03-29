'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Globe, Check } from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '@/lib/translate'

interface Props {
  currentLang: string
}

export function LanguageSwitcher({ currentLang }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const current = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) ?? SUPPORTED_LANGUAGES[0]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function switchLang(code: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (code === 'en') params.delete('lang')
    else params.set('lang', code)
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '6px 12px', borderRadius: '999px', cursor: 'pointer',
          fontSize: '13px', fontWeight: 500, color: '#374151',
          background: '#fff', border: '1px solid #E9ECF4',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <Globe style={{ width: '13px', height: '13px', color: '#94A3B8' }} />
        {current.native}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ color: '#94A3B8', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: '#fff', border: '1px solid #EEF0F6',
          borderRadius: '16px', boxShadow: '0 8px 32px rgba(15,23,42,0.1)',
          padding: '6px', zIndex: 50, minWidth: '170px',
        }}>
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => switchLang(lang.code)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '8px 10px', borderRadius: '10px', gap: '10px',
                fontSize: '13px', border: 'none', cursor: 'pointer', textAlign: 'left',
                color: lang.code === currentLang ? '#4F7AFF' : '#374151',
                background: lang.code === currentLang ? 'rgba(79,122,255,0.07)' : 'transparent',
                fontWeight: lang.code === currentLang ? 600 : 400,
              }}
            >
              <span>{lang.native}</span>
              <span style={{ fontSize: '11px', color: '#94A3B8', flexShrink: 0 }}>{lang.name}</span>
              {lang.code === currentLang && (
                <Check style={{ width: '12px', height: '12px', color: '#4F7AFF', flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
