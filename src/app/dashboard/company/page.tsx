'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Building2, Loader2, CheckCircle, AlertCircle, Plus, Trash2,
  Copy, Check, RefreshCw, LogOut, Camera, Globe, MapPin,
  Mail, Phone, Users, Calendar, ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const PRACTICE_AREAS = [
  'Criminal Law', 'Family Law', 'Property & Real Estate', 'Corporate & Business',
  'Labour & Employment', 'Consumer Protection', 'Civil Litigation', 'Tax Law',
  'Intellectual Property', 'Immigration', 'Banking & Finance', 'Environmental Law',
]

const TEAM_SIZES = ['1–5', '6–20', '21–50', '51–100', '100+']

const inputSt: React.CSSProperties = {
  width: '100%',
  background: '#fff',
  border: '1px solid rgba(15,23,42,0.15)',
  borderRadius: '12px',
  padding: '10px 16px',
  fontSize: '14px',
  color: 'var(--text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
      {children}
    </label>
  )
}

interface Company {
  id: string
  slug: string
  name: string
  logo_url?: string
  tagline?: string
  about?: string
  website?: string
  email?: string
  phone?: string
  location?: string
  practice_areas?: string[]
  founded_year?: number
  team_size?: string
}

interface Member {
  lawyer_id: string
  role: string
  joined_at: string
  lawyer: {
    id: string
    full_name: string
    username: string
    photo_url?: string
    title?: string
  }
}

export default function CompanyPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [lawyerId, setLawyerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState<Company | null>(null)
  const [myRole, setMyRole] = useState<string | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [inviteExpiry, setInviteExpiry] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [tagline, setTagline] = useState('')
  const [about, setAbout] = useState('')
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [practiceAreas, setPracticeAreas] = useState<string[]>([])
  const [foundedYear, setFoundedYear] = useState('')
  const [teamSize, setTeamSize] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [saveError, setSaveError] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatingInvite, setGeneratingInvite] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://vakil.bio'

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: lawyer } = await supabase.from('lawyers').select('id').eq('user_id', user.id).single()
      if (!lawyer) return
      setLawyerId(lawyer.id)

      const { data: membership } = await supabase
        .from('company_members')
        .select('role, company:companies(*)')
        .eq('lawyer_id', lawyer.id)
        .single()

      if (membership?.company) {
        const c = membership.company as unknown as Company
        setCompany(c)
        setMyRole(membership.role)
        populateForm(c)

        // Load members
        const { data: membersData } = await supabase
          .from('company_members')
          .select('lawyer_id, role, joined_at, lawyer:lawyers(id, full_name, username, photo_url, title)')
          .eq('company_id', c.id)
          .order('joined_at')
        setMembers((membersData as unknown as Member[]) ?? [])

        // Load invite (admin only)
        if (membership.role === 'admin') {
          const res = await fetch(`/api/company/${c.id}/invite`)
          const { invite } = await res.json()
          if (invite) {
            setInviteToken(invite.token)
            setInviteExpiry(invite.expires_at)
          }
        }
      }

      setLoading(false)
    }
    init()
  }, [])

  // Slug availability check — depends on [slug] only, skips when editing existing firm
  useEffect(() => {
    if (company) return // don't check when editing existing firm
    if (!slug || slug.length < 3) { setSlugAvailable(null); return }
    const timer = setTimeout(async () => {
      setCheckingSlug(true)
      const { data } = await supabase.from('companies').select('id').eq('slug', slug).single()
      setSlugAvailable(!data)
      setCheckingSlug(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [slug])

  function populateForm(c: Company) {
    setName(c.name || '')
    setSlug(c.slug || '')
    setTagline(c.tagline || '')
    setAbout(c.about || '')
    setWebsite(c.website || '')
    setEmail(c.email || '')
    setPhone(c.phone || '')
    setLocation(c.location || '')
    setPracticeAreas(c.practice_areas || [])
    setFoundedYear(c.founded_year?.toString() || '')
    setTeamSize(c.team_size || '')
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !company) return
    setUploadingLogo(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('companyId', company.id)
    const res = await fetch('/api/upload-company-logo', { method: 'POST', body: formData })
    const json = await res.json()
    if (!res.ok) { alert(json.error || 'Upload failed'); setUploadingLogo(false); return }
    setCompany(prev => prev ? { ...prev, logo_url: json.url } : prev)
    setUploadingLogo(false)
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    setSaveStatus('idle')
    setSaveError('')

    const body = { name, slug, tagline, about, website, email, phone, location, practice_areas: practiceAreas, founded_year: foundedYear, team_size: teamSize }

    try {
      if (company) {
        const res = await fetch(`/api/company/${company.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setCompany(json.company)
      } else {
        const res = await fetch('/api/company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setCompany(json.company)
        setMyRole('admin')
        populateForm(json.company)

        // Load members (just self)
        const { data: membersData } = await supabase
          .from('company_members')
          .select('lawyer_id, role, joined_at, lawyer:lawyers(id, full_name, username, photo_url, title)')
          .eq('company_id', json.company.id)
          .order('joined_at')
        setMembers((membersData as unknown as Member[]) ?? [])
      }
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err: unknown) {
      setSaveStatus('error')
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    }
    setSaving(false)
  }

  async function generateInvite() {
    if (!company) return
    setGeneratingInvite(true)
    const res = await fetch(`/api/company/${company.id}/invite`, { method: 'POST' })
    const json = await res.json()
    if (res.ok) {
      setInviteToken(json.token)
      setInviteExpiry(json.expires_at)
    }
    setGeneratingInvite(false)
  }

  async function removeMember(memberId: string) {
    if (!company) return
    if (!confirm('Remove this member?')) return
    setRemovingId(memberId)
    await fetch(`/api/company/${company.id}/members/${memberId}`, { method: 'DELETE' })
    setMembers(prev => prev.filter(m => m.lawyer_id !== memberId))
    setRemovingId(null)
  }

  async function leaveCompany() {
    if (!company || !lawyerId) return
    if (!confirm('Leave this firm?')) return
    setRemovingId(lawyerId)
    const res = await fetch(`/api/company/${company.id}/members/${lawyerId}`, { method: 'DELETE' })
    if (res.ok) {
      setCompany(null)
      setMyRole(null)
      setMembers([])
      setInviteToken(null)
      setName(''); setTagline(''); setAbout(''); setWebsite('')
      setEmail(''); setPhone(''); setLocation(''); setPracticeAreas([])
      setFoundedYear(''); setTeamSize('')
    } else {
      const json = await res.json()
      alert(json.error || 'Could not leave')
    }
    setRemovingId(null)
  }

  async function deleteFirm() {
    if (!company) return
    if (!confirm('Are you sure you want to delete this firm? This action cannot be undone.')) return
    setDeleting(true)
    const res = await fetch(`/api/company/${company.id}`, { method: 'DELETE' })
    if (res.ok) {
      setCompany(null)
      setMyRole(null)
      setMembers([])
      setInviteToken(null)
      setInviteExpiry(null)
      setName(''); setSlug(''); setTagline(''); setAbout(''); setWebsite('')
      setEmail(''); setPhone(''); setLocation(''); setPracticeAreas([])
      setFoundedYear(''); setTeamSize('')
      setSlugAvailable(null)
    } else {
      const json = await res.json()
      alert(json.error || 'Could not delete firm')
    }
    setDeleting(false)
  }

  function copyInviteLink() {
    if (!inviteToken) return
    navigator.clipboard.writeText(`${BASE}/join/${inviteToken}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function toggleArea(area: string) {
    const selected = practiceAreas.includes(area)
    setPracticeAreas(prev => {
      if (prev.length >= 5 && !selected) return prev
      return selected ? prev.filter(a => a !== area) : [...prev, area]
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--text-muted)' }} /></div>
  }

  const isAdmin = myRole === 'admin'

  return (
    <div className="max-w-2xl mx-auto space-y-5 lg:pb-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {company ? 'Firm Profile' : 'Create Firm'}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {company
              ? <>Public page at <a href={`/firm/${company.slug}`} target="_blank" className="underline" style={{ color: 'var(--blue)' }}>/firm/{company.slug}</a></>
              : 'Create a public page for your law firm or chambers'}
          </p>
        </div>
        {company && (
          <a
            href={`/firm/${company.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl shrink-0"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Page
          </a>
        )}
      </div>

      {/* Stats cards (only when firm exists) */}
      {company && (
        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{members.length}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Members</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{practiceAreas.length}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Practice Areas</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{foundedYear || '—'}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Founded</div>
          </div>
        </div>
      )}

      {/* Logo (admin, edit only) */}
      {company && isAdmin && (
        <Card title="Logo">
          <div className="flex items-center gap-4">
            <div className="relative">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name}
                  className="w-16 h-16 rounded-2xl object-cover"
                  style={{ border: '1px solid var(--border)' }} />
              ) : (
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(79,122,255,0.08)', border: '1px solid var(--border)' }}>
                  <Building2 className="w-7 h-7" style={{ color: '#4F7AFF' }} />
                </div>
              )}
              {uploadingLogo && (
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.8)' }}>
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--blue)' }} />
                </div>
              )}
            </div>
            <div>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl"
                style={{ background: 'rgba(79,122,255,0.08)', color: '#4F7AFF', border: '1px solid rgba(79,122,255,0.2)' }}>
                <Camera className="w-4 h-4" /> Upload Logo
              </button>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>PNG, JPG or SVG · Max 3MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>
        </Card>
      )}

      {/* Basic Info */}
      <Card title="Basic Info">
        <div>
          <Label>Firm / Chambers Name *</Label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Sharma & Associates" style={inputSt} disabled={!isAdmin && !!company} />
        </div>

        <div>
          <Label>Firm Handle *</Label>
          {company ? (
            // Read-only after creation
            <div className="flex items-center">
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: '42px', background: 'var(--bg-surface)', border: '1px solid rgba(15,23,42,0.15)', borderRight: 'none', borderRadius: '12px 0 0 12px', color: 'var(--text-muted)', fontSize: '14px', flexShrink: 0 }}>
                vakil.bio/firm/
              </div>
              <input value={slug} readOnly
                style={{ ...inputSt, borderRadius: '0 12px 12px 0', background: 'var(--bg-surface)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
            </div>
          ) : (
            // Editable at creation with availability check
            <>
              <div className="flex items-center">
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: '42px', background: 'var(--bg-surface)', border: '1px solid rgba(15,23,42,0.15)', borderRight: 'none', borderRadius: '12px 0 0 12px', color: 'var(--text-muted)', fontSize: '14px', flexShrink: 0 }}>
                  vakil.bio/firm/
                </div>
                <div className="relative flex-1">
                  <input
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 50))}
                    placeholder="sharma-associates"
                    style={{ ...inputSt, borderRadius: '0 12px 12px 0', paddingRight: '36px' }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingSlug && <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-muted)' }} />}
                    {!checkingSlug && slugAvailable === true && <CheckCircle className="w-4 h-4" style={{ color: '#059669' }} />}
                    {!checkingSlug && slugAvailable === false && <AlertCircle className="w-4 h-4" style={{ color: '#DC2626' }} />}
                  </div>
                </div>
              </div>
              {slugAvailable === true && slug.length >= 3 && (
                <p className="text-xs mt-1" style={{ color: '#059669' }}>✓ vakil.bio/firm/{slug} is available</p>
              )}
              {slugAvailable === false && (
                <p className="text-xs mt-1" style={{ color: '#DC2626' }}>This handle is already taken. Try another.</p>
              )}
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Lowercase letters, numbers and hyphens only. Can&apos;t be changed later.
              </p>
            </>
          )}
        </div>

        <div>
          <Label>Tagline</Label>
          <input value={tagline} onChange={e => setTagline(e.target.value)}
            placeholder="e.g. Trusted legal counsel since 2005" style={inputSt} disabled={!isAdmin && !!company} />
        </div>
        <div>
          <Label>About</Label>
          <textarea value={about} onChange={e => setAbout(e.target.value)}
            placeholder="Describe the firm, its history and approach..." rows={4}
            style={{ ...inputSt, resize: 'none' }} disabled={!isAdmin && !!company} />
        </div>
      </Card>

      {/* Contact & Location */}
      <Card title="Contact & Location">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label><span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />Location</span></Label>
            <input value={location} onChange={e => setLocation(e.target.value)}
              placeholder="e.g. New Delhi" style={inputSt} disabled={!isAdmin && !!company} />
          </div>
          <div>
            <Label><span className="flex items-center gap-1.5"><Globe className="w-3 h-3" />Website</span></Label>
            <input value={website} onChange={e => setWebsite(e.target.value)}
              placeholder="https://firmwebsite.com" style={inputSt} disabled={!isAdmin && !!company} />
          </div>
          <div>
            <Label><span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />Email</span></Label>
            <input value={email} onChange={e => setEmail(e.target.value)}
              placeholder="contact@firm.com" style={inputSt} disabled={!isAdmin && !!company} />
          </div>
          <div>
            <Label><span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />Phone</span></Label>
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210" style={inputSt} disabled={!isAdmin && !!company} />
          </div>
        </div>
      </Card>

      {/* Practice Areas */}
      <Card title={`Practice Areas (${practiceAreas.length}/5)`}>
        <div className="flex flex-wrap gap-2">
          {PRACTICE_AREAS.map(area => {
            const active = practiceAreas.includes(area)
            const maxed = practiceAreas.length >= 5 && !active
            return (
              <button key={area} type="button"
                onClick={() => (isAdmin || !company) && !maxed
                  ? toggleArea(area)
                  : undefined}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                style={{
                  border: '1px solid',
                  borderColor: active ? '#4F7AFF' : 'var(--border)',
                  background: active ? '#4F7AFF' : 'transparent',
                  color: active ? '#fff' : maxed ? 'var(--text-muted)' : 'var(--text-secondary)',
                  cursor: (isAdmin || !company) && !maxed ? 'pointer' : 'default',
                  opacity: maxed ? 0.5 : 1,
                }}>
                {area}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Details */}
      <Card title="Details">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label><span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />Founded Year</span></Label>
            <input type="number" value={foundedYear} onChange={e => setFoundedYear(e.target.value)}
              placeholder="e.g. 2005" min="1900" max={new Date().getFullYear()}
              style={inputSt} disabled={!isAdmin && !!company} />
          </div>
          <div>
            <Label><span className="flex items-center gap-1.5"><Users className="w-3 h-3" />Team Size</span></Label>
            <select value={teamSize} onChange={e => setTeamSize(e.target.value)}
              style={inputSt} disabled={!isAdmin && !!company}>
              <option value="">Select...</option>
              {TEAM_SIZES.map(s => <option key={s} value={s}>{s} people</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Save button (admin or creating) */}
      {(isAdmin || !company) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            {saveStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--green)' }}>
                <CheckCircle className="w-4 h-4" /> {company ? 'Saved' : 'Firm created!'}
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-sm" style={{ color: '#DC2626' }}>
                <AlertCircle className="w-4 h-4" /> {saveError || 'Save failed'}
              </span>
            )}
          </div>
          <button onClick={handleSave} disabled={saving || !name.trim() || (!company && slugAvailable !== true)}
            className="flex items-center justify-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50 w-full sm:w-auto"
            style={{ background: 'var(--blue)', color: '#fff' }}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {company ? 'Save Changes' : 'Create Firm'}
          </button>
        </div>
      )}

      {/* Members section */}
      {company && (
        <Card title={`Team (${members.length})`}>
          <div className="space-y-3">
            {members.map(m => {
              const l = m.lawyer
              const initials = l.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
              const isSelf = m.lawyer_id === lawyerId
              return (
                <div key={m.lawyer_id} className="flex items-center gap-3">
                  {l.photo_url ? (
                    <img src={l.photo_url} alt={l.full_name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                      style={{ border: '1px solid var(--border)' }} />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #4F7AFF, #9B6DFF)' }}>
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {l.full_name} {isSelf && <span style={{ color: 'var(--text-muted)' }}>(you)</span>}
                    </div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      @{l.username}{l.title ? ` · ${l.title}` : ''}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                    style={m.role === 'admin'
                      ? { background: 'rgba(79,122,255,0.1)', color: '#4F7AFF', border: '1px solid rgba(79,122,255,0.2)' }
                      : { background: 'rgba(15,23,42,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    {m.role}
                  </span>
                  {(isAdmin && !isSelf) && (
                    <button onClick={() => removeMember(m.lawyer_id)} disabled={removingId === m.lawyer_id}
                      className="p-1.5 rounded-lg shrink-0" style={{ color: '#EF4444' }}>
                      {removingId === m.lawyer_id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Invite link (admin only) */}
      {company && isAdmin && (
        <Card title="Invite Team Members">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Share this link with colleagues. Anyone with a vakil.bio account can join using it. Link expires in 7 days.
          </p>
          {inviteToken ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 text-sm font-mono px-3 py-2.5 rounded-xl overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ background: 'rgba(15,23,42,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  {`${BASE}/join/${inviteToken}`}
                </div>
                <button onClick={copyInviteLink}
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-2.5 rounded-xl shrink-0"
                  style={{ background: copied ? 'rgba(5,150,105,0.1)' : 'rgba(79,122,255,0.08)', color: copied ? '#059669' : '#4F7AFF', border: `1px solid ${copied ? 'rgba(5,150,105,0.2)' : 'rgba(79,122,255,0.2)'}` }}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              {inviteExpiry && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Expires {new Date(inviteExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
              <button onClick={generateInvite} disabled={generatingInvite}
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <RefreshCw className={`w-3 h-3 ${generatingInvite ? 'animate-spin' : ''}`} /> Regenerate link
              </button>
            </div>
          ) : (
            <button onClick={generateInvite} disabled={generatingInvite}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(79,122,255,0.08)', color: '#4F7AFF', border: '1px solid rgba(79,122,255,0.2)' }}>
              {generatingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Generate Invite Link
            </button>
          )}
        </Card>
      )}

      {/* Leave firm (non-admin members) */}
      {company && myRole === 'member' && (
        <div className="flex justify-end">
          <button onClick={leaveCompany} disabled={removingId === lawyerId}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl"
            style={{ color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.04)' }}>
            {removingId === lawyerId ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Leave Firm
          </button>
        </div>
      )}

      {/* Danger zone — delete firm (admin only) */}
      {company && isAdmin && (
        <div className="glass rounded-2xl p-6 space-y-3" style={{ border: '1px solid rgba(220,38,38,0.2)' }}>
          <h2 className="font-semibold text-sm" style={{ color: '#DC2626' }}>Danger Zone</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Permanently delete this firm and remove all members. This cannot be undone.
          </p>
          <button
            onClick={deleteFirm}
            disabled={deleting}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl"
            style={{ color: '#DC2626', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.06)' }}
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete Firm
          </button>
        </div>
      )}
    </div>
  )
}
