'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Briefcase, BadgeCheck, Search, SlidersHorizontal } from 'lucide-react'

const ALL_AREAS = [
  'Criminal Law', 'Family Law', 'Property & Real Estate', 'Corporate & Business',
  'Labour & Employment', 'Consumer Protection', 'Civil Litigation', 'Tax Law',
  'Intellectual Property', 'Immigration', 'Banking & Finance', 'Environmental Law',
]

interface Lawyer {
  id: string
  username: string
  full_name: string
  title?: string
  photo_url?: string
  location?: string
  years_experience?: number
  practice_areas?: string[]
  languages?: string[]
  is_verified: boolean
  verified_until?: string
  verification_type?: 'advocate' | 'professional'
}

interface Props {
  lawyers: Lawyer[]
  initialArea?: string
  initialVerified?: boolean
  initialQ?: string
}

export function LawyerDirectory({ lawyers, initialArea, initialVerified, initialQ }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(initialQ ?? '')
  const [activeArea, setActiveArea] = useState<string | null>(initialArea ?? null)
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerified ?? false)
  const [showAllAreas, setShowAllAreas] = useState(false)

  const pushParams = useCallback((area: string | null, verified: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (area) params.set('area', area); else params.delete('area')
    if (verified) params.set('verified', 'true'); else params.delete('verified')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, searchParams])

  const setArea = (area: string | null) => {
    setActiveArea(area)
    pushParams(area, verifiedOnly)
  }

  const setVerified = (v: boolean) => {
    setVerifiedOnly(v)
    pushParams(activeArea, v)
  }

  // Client-side search on top of server-filtered data
  const displayed = lawyers.filter(l => {
    if (!q.trim()) return true
    const search = q.toLowerCase()
    return (
      l.full_name.toLowerCase().includes(search) ||
      l.title?.toLowerCase().includes(search) ||
      l.location?.toLowerCase().includes(search) ||
      l.practice_areas?.some(a => a.toLowerCase().includes(search))
    )
  })

  const visibleAreas = showAllAreas ? ALL_AREAS : ALL_AREAS.slice(0, 6)

  return (
    <div>
      {/* Search + verified toggle */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8' }} />
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by name, location or area..."
            style={{
              width: '100%', padding: '10px 14px 10px 40px', borderRadius: '12px',
              border: '1px solid #E2E8F0', background: '#fff', fontSize: '14px',
              color: '#0F172A', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <button
          onClick={() => setVerified(!verifiedOnly)}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
            border: '1px solid',
            borderColor: verifiedOnly ? '#4F7AFF' : '#E2E8F0',
            background: verifiedOnly ? 'rgba(79,122,255,0.08)' : '#fff',
            color: verifiedOnly ? '#4F7AFF' : '#64748B',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          <BadgeCheck style={{ width: '15px', height: '15px' }} />
          Verified only
        </button>
      </div>

      {/* Practice area filters */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <SlidersHorizontal style={{ width: '14px', height: '14px', color: '#94A3B8' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Practice Area</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <FilterPill label="All Areas" active={!activeArea} onClick={() => setArea(null)} />
          {visibleAreas.map(area => (
            <FilterPill key={area} label={area} active={activeArea === area} onClick={() => setArea(activeArea === area ? null : area)} />
          ))}
          <button
            onClick={() => setShowAllAreas(!showAllAreas)}
            style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '999px', border: '1px dashed #CBD5E1', background: 'transparent', color: '#94A3B8', cursor: 'pointer' }}
          >
            {showAllAreas ? 'Show less' : `+${ALL_AREAS.length - 6} more`}
          </button>
        </div>
      </div>

      {/* Results count */}
      <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px', fontWeight: 500 }}>
        {displayed.length === 0 ? 'No advocates found' : `${displayed.length} advocate${displayed.length !== 1 ? 's' : ''} found`}
        {activeArea ? ` in ${activeArea}` : ''}
        {verifiedOnly ? ' · Verified only' : ''}
      </p>

      {displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: '20px', border: '1px solid #EEF0F6' }}>
          <p style={{ color: '#94A3B8', fontSize: '15px' }}>No advocates found matching your filters.</p>
          <button onClick={() => { setArea(null); setVerified(false); setQ('') }}
            style={{ marginTop: '16px', fontSize: '13px', color: '#4F7AFF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Clear all filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {displayed.map(lawyer => <LawyerCard key={lawyer.id} lawyer={lawyer} />)}
        </div>
      )}
    </div>
  )
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: '13px', padding: '6px 14px', borderRadius: '999px', fontWeight: 500,
        border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
        borderColor: active ? '#4F7AFF' : '#E2E8F0',
        background: active ? '#4F7AFF' : '#fff',
        color: active ? '#fff' : '#64748B',
      }}
    >
      {label}
    </button>
  )
}

function LawyerCard({ lawyer }: { lawyer: Lawyer }) {
  const initials = lawyer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const now = new Date()
  const isActivelyVerified = lawyer.is_verified &&
    (!lawyer.verified_until || new Date(lawyer.verified_until) > now)
  const verifiedLabel = isActivelyVerified
    ? (lawyer.verification_type === 'advocate' ? 'Verified Advocate'
      : lawyer.verification_type === 'professional' ? 'Verified Professional'
      : 'Verified')
    : null

  return (
    <Link
      href={`/${lawyer.username}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <article style={{
        background: '#fff', border: '1px solid #EEF0F6', borderRadius: '20px',
        padding: '20px', transition: 'box-shadow 0.18s, border-color 0.18s',
        boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(79,122,255,0.1)'
          ;(e.currentTarget as HTMLElement).style.borderColor = '#C7D4FF'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(15,23,42,0.04)'
          ;(e.currentTarget as HTMLElement).style.borderColor = '#EEF0F6'
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
          {lawyer.photo_url ? (
            <img
              src={lawyer.photo_url}
              alt={`${lawyer.full_name} — ${lawyer.title || 'Advocate'}`}
              loading="lazy"
              style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #EEF0F6' }}
            />
          ) : (
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #4F7AFF, #9B6DFF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 700, color: '#fff',
            }}>
              {initials}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
                {lawyer.full_name}
              </h3>
              {isActivelyVerified && (
                <BadgeCheck style={{ width: '16px', height: '16px', color: '#059669', flexShrink: 0 }} aria-label="Verified" />
              )}
            </div>
            {lawyer.title && (
              <p style={{ fontSize: '13px', color: '#6366F1', margin: '2px 0 0', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {lawyer.title}
              </p>
            )}
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
          {lawyer.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94A3B8' }}>
              <MapPin style={{ width: '12px', height: '12px', flexShrink: 0 }} />
              {lawyer.location}
            </div>
          )}
          {(lawyer.years_experience ?? 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94A3B8' }}>
              <Briefcase style={{ width: '12px', height: '12px', flexShrink: 0 }} />
              {lawyer.years_experience}+ years experience
            </div>
          )}
        </div>

        {/* Practice areas */}
        {lawyer.practice_areas && lawyer.practice_areas.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: verifiedLabel ? '12px' : '0' }}>
            {lawyer.practice_areas.slice(0, 3).map(area => (
              <span key={area} style={{
                fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '999px',
                background: 'rgba(79,122,255,0.07)', color: '#4F7AFF', border: '1px solid rgba(79,122,255,0.15)',
              }}>
                {area}
              </span>
            ))}
            {lawyer.practice_areas.length > 3 && (
              <span style={{ fontSize: '11px', color: '#94A3B8', padding: '3px 6px' }}>+{lawyer.practice_areas.length - 3}</span>
            )}
          </div>
        )}

        {/* Verified badge */}
        {verifiedLabel && (
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', fontWeight: 600, color: '#059669',
              background: '#ECFDF5', border: '1px solid #A7F3D0',
              borderRadius: '999px', padding: '3px 10px',
            }}>
              <BadgeCheck style={{ width: '11px', height: '11px' }} />
              {verifiedLabel}
            </span>
          </div>
        )}
      </article>
    </Link>
  )
}
