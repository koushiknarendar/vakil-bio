'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, CheckCircle, AlertCircle, Sparkles, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Lawyer } from '@/lib/types'

const PRACTICE_AREAS = [
  'Criminal Law', 'Family Law', 'Property & Real Estate', 'Corporate & Business',
  'Labour & Employment', 'Consumer Protection', 'Civil Litigation', 'Tax Law',
  'Intellectual Property', 'Immigration', 'Banking & Finance', 'Environmental Law',
]

const LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi',
  'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Urdu',
]

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
  transition: 'border-color 0.2s',
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

function Toggle({ label, description, checked, onChange }: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: '44px', height: '24px', borderRadius: '999px', flexShrink: 0,
          background: checked ? 'var(--blue)' : '#D1D5DB',
          border: 'none', cursor: 'pointer', padding: '2px',
          transition: 'background 0.2s',
          display: 'flex', alignItems: 'center',
          justifyContent: checked ? 'flex-end' : 'flex-start',
        }}
      >
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  )
}

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [lawyer, setLawyer] = useState<Lawyer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [generatingBio, setGeneratingBio] = useState(false)
  const [bioError, setBioError] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [saveError, setSaveError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [fullName, setFullName] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [yearsExp, setYearsExp] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [barCouncilNumber, setBarCouncilNumber] = useState('')
  const [practiceAreas, setPracticeAreas] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>(['English'])
  const [photoUrl, setPhotoUrl] = useState('')
  const [currentFirm, setCurrentFirm] = useState('')
  const [university, setUniversity] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [showPhone, setShowPhone] = useState(true)
  const [showWhatsapp, setShowWhatsapp] = useState(true)
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('lawyers').select('*').eq('user_id', user.id).single()
      if (data) {
        setLawyer(data)
        setFullName(data.full_name || '')
        setTitle(data.title || '')
        setBio(data.bio || '')
        setYearsExp(data.years_experience?.toString() || '')
        setLocation(data.location || '')
        setPhone(data.phone || '')
        setEmail(data.email || '')
        setWhatsappNumber(data.whatsapp_number || '')
        setBarCouncilNumber(data.bar_council_number || '')
        setPracticeAreas(data.practice_areas || [])
        setLanguages(data.languages || ['English'])
        setPhotoUrl(data.photo_url || '')
        setCurrentFirm(data.current_firm || '')
        setUniversity(data.university || '')
        setGraduationYear(data.graduation_year?.toString() || '')
        setShowPhone(data.show_phone !== false)
        setShowWhatsapp(data.show_whatsapp !== false)
        setLinkedinUrl(data.linkedin_url || '')
        setTwitterUrl(data.twitter_url || '')
        setInstagramUrl(data.instagram_url || '')
        setWebsiteUrl(data.website_url || '')
        setYoutubeUrl(data.youtube_url || '')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !lawyer) return
    if (file.size > 5 * 1024 * 1024) { setUploadError('File must be under 5MB'); return }
    setUploadingPhoto(true)
    setUploadError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('lawyerId', lawyer.id)
      const res = await fetch('/api/upload-photo', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setPhotoUrl(data.url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    }
    setUploadingPhoto(false)
    e.target.value = ''
  }

  async function handleGenerateBio() {
    setGeneratingBio(true)
    try {
      const res = await fetch('/api/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, title, yearsExp, location, practiceAreas, languages, currentFirm, university }),
      })
      const { bio: generated } = await res.json()
      if (generated) setBio(generated)
    } catch {
      setBioError('Failed to generate bio. Please try again.')
      setTimeout(() => setBioError(''), 4000)
    }
    setGeneratingBio(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!lawyer) return
    if (!phone || phone.length < 10) {
      setSaveError('Please enter a valid 10-digit phone number')
      setSaveStatus('error')
      return
    }
    if (!email) {
      setSaveError('Email is required')
      setSaveStatus('error')
      return
    }
    setSaving(true)
    setSaveStatus('idle')
    setSaveError('')
    try {
      const res = await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lawyerId: lawyer.id,
          fullName, title, bio,
          yearsExperience: yearsExp ? parseInt(yearsExp) : 0,
          location, phone, email,
          whatsappNumber, barCouncilNumber,
          practiceAreas, languages,
          currentFirm, university,
          graduationYear: graduationYear ? parseInt(graduationYear) : null,
          showPhone, showWhatsapp,
          linkedinUrl, twitterUrl, instagramUrl, websiteUrl, youtubeUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setSaveStatus('success')
    } catch (err) {
      console.error(err)
      setSaveError(err instanceof Error ? err.message : 'Save failed')
      setSaveStatus('error')
    }
    setSaving(false)
    setTimeout(() => setSaveStatus('idle'), 3000)
  }

  async function handleDeleteProfile() {
    if (!lawyer || deleteConfirm !== lawyer.username) return
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/profile/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      router.push('/')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed')
      setDeleting(false)
    }
  }

  const toggleArea = (area: string) => {
    setPracticeAreas((prev) => {
      if (prev.includes(area)) return prev.filter((a) => a !== area)
      if (prev.length >= 3) return prev
      return [...prev, area]
    })
  }

  const toggleLanguage = (lang: string) =>
    setLanguages((prev) => prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang])

  const initials = fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-20 lg:pb-6">
      <div>
        <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Edit Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>This is what clients see on your public page</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Photo */}
        <Card title="Profile Photo">
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
              className="relative shrink-0 group cursor-pointer rounded-2xl overflow-hidden"
              style={{ width: 80, height: 80 }}>
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-20 h-20 object-cover" />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center text-lg font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #4F7AFF)' }}>
                  {initials || '?'}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.45)' }}>
                {uploadingPhoto
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Camera className="w-5 h-5 text-white" />}
              </div>
            </button>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Click photo to upload</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>JPG, PNG, WebP · max 5MB</p>
              {uploadError && (
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#DC2626' }}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />{uploadError}
                </p>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
        </Card>

        {/* Basic Info */}
        <Card title="Basic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Full Name *</Label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                style={inputSt} placeholder="Adv. Full Name" required />
            </div>
            <div>
              <Label>Title / Designation</Label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                style={inputSt} placeholder="Advocate, Delhi High Court" />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>e.g., Advocate, Supreme Court</p>
            </div>
            <div>
              <Label>Years of Experience</Label>
              <input type="number" value={yearsExp} onChange={(e) => setYearsExp(e.target.value)}
                min="0" max="60" style={inputSt} placeholder="10" />
            </div>
            <div>
              <Label>Location</Label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                style={inputSt} placeholder="New Delhi" />
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Professional Bio</label>
              <button type="button" onClick={handleGenerateBio} disabled={generatingBio}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                style={{ color: 'var(--blue)' }}>
                {generatingBio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {generatingBio ? 'Writing...' : 'Write with AI'}
              </button>
            </div>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
              style={{ ...inputSt, resize: 'none' }}
              placeholder="Tell clients about your expertise and approach to legal matters..." />
            {bioError && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{bioError}</p>}
          </div>
        </Card>

        {/* Education & Experience */}
        <Card title="Education & Experience">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Current Firm / Organisation</Label>
              <input type="text" value={currentFirm} onChange={(e) => setCurrentFirm(e.target.value)}
                style={inputSt} placeholder="Sharma & Associates" />
            </div>
            <div>
              <Label>Law School / University</Label>
              <input type="text" value={university} onChange={(e) => setUniversity(e.target.value)}
                style={inputSt} placeholder="National Law School, Bangalore" />
            </div>
            <div>
              <Label>Graduation Year</Label>
              <input type="number" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)}
                min="1960" max={new Date().getFullYear()} style={inputSt} placeholder="2015" />
            </div>
            <div>
              <Label>Bar Council Enrollment No.</Label>
              <input type="text" value={barCouncilNumber} onChange={(e) => setBarCouncilNumber(e.target.value)}
                style={inputSt} placeholder="D/1234/2015" />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Helps build client trust</p>
            </div>
          </div>
        </Card>

        {/* Practice Areas */}
        <Card title="Practice Areas">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Select up to 3 areas</p>
            <p className="text-xs font-medium" style={{ color: 'var(--blue)' }}>{practiceAreas.length}/3 selected</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRACTICE_AREAS.map((area) => {
              const selected = practiceAreas.includes(area)
              const maxed = practiceAreas.length >= 3 && !selected
              return (
                <button key={area} type="button" onClick={() => toggleArea(area)} disabled={maxed}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-all"
                  style={selected
                    ? { background: 'rgba(79,122,255,0.1)', border: '1px solid rgba(79,122,255,0.3)', color: 'var(--blue)' }
                    : maxed
                    ? { background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'not-allowed', opacity: 0.5 }
                    : { background: '#fff', border: '1px solid var(--border-md)', color: 'var(--text-secondary)' }
                  }>
                  {area}
                </button>
              )
            })}
          </div>
        </Card>

        {/* Languages */}
        <Card title="Languages">
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                className="text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={languages.includes(lang)
                  ? { background: 'rgba(124,95,212,0.1)', border: '1px solid rgba(124,95,212,0.25)', color: 'var(--purple)' }
                  : { background: '#fff', border: '1px solid var(--border-md)', color: 'var(--text-secondary)' }
                }>
                {lang}
              </button>
            ))}
          </div>
        </Card>

        {/* Contact */}
        <Card title="Contact Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Phone *</Label>
              <input type="tel" value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                style={inputSt} placeholder="9876543210" required />
            </div>
            <div>
              <Label>WhatsApp Number</Label>
              <input type="tel" value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                style={inputSt} placeholder="9876543210" />
            </div>
            <div>
              <Label>Email *</Label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                style={inputSt} placeholder="advocate@email.com" required />
            </div>
          </div>

          {/* Visibility toggles */}
          <div className="pt-2 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Show on public profile</p>
            <Toggle
              label="Show Call button"
              description="Let visitors call you directly from your profile"
              checked={showPhone}
              onChange={setShowPhone}
            />
            <Toggle
              label="Show WhatsApp button"
              description="Let visitors message you on WhatsApp from your profile"
              checked={showWhatsapp}
              onChange={setShowWhatsapp}
            />
          </div>
        </Card>

        {/* Social Links */}
        <Card title="Social Links">
          <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '-8px' }}>Links shown on your public profile so clients can learn more about you</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Website</Label>
              <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
                style={inputSt} placeholder="https://yourwebsite.com" />
            </div>
            <div>
              <Label>LinkedIn</Label>
              <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)}
                style={inputSt} placeholder="https://linkedin.com/in/yourname" />
            </div>
            <div>
              <Label>Twitter / X</Label>
              <input type="url" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)}
                style={inputSt} placeholder="https://x.com/yourhandle" />
            </div>
            <div>
              <Label>Instagram</Label>
              <input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)}
                style={inputSt} placeholder="https://instagram.com/yourhandle" />
            </div>
            <div>
              <Label>YouTube</Label>
              <input type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)}
                style={inputSt} placeholder="https://youtube.com/@yourchannel" />
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <div className="rounded-2xl p-6 space-y-4"
          style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <div>
            <h2 className="font-semibold text-sm flex items-center gap-2" style={{ color: '#DC2626' }}>
              <Trash2 className="w-4 h-4" />
              Delete Profile
            </h2>
            <p className="text-xs mt-1" style={{ color: 'rgba(220,38,38,0.7)' }}>
              This permanently deletes your profile, services, and all data. This cannot be undone.
            </p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#DC2626', marginBottom: '6px' }}>
              Type <strong>{lawyer?.username}</strong> to confirm
            </label>
            <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={lawyer?.username}
              style={{ ...inputSt, border: '1px solid rgba(239,68,68,0.25)' }} />
          </div>
          <button type="button" onClick={handleDeleteProfile}
            disabled={deleteConfirm !== lawyer?.username || deleting}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-white"
            style={{ background: '#DC2626' }}>
            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {deleting ? 'Deleting...' : 'Delete my profile permanently'}
          </button>
          {deleteError && (
            <p className="text-xs flex items-center gap-1.5 mt-1" style={{ color: '#DC2626' }}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{deleteError}
            </p>
          )}
        </div>

        {/* Save */}
        <div className="flex items-center justify-between pt-2">
          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--green)' }}>
              <CheckCircle className="w-4 h-4" />
              Profile saved successfully!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#DC2626' }}>
              <AlertCircle className="w-4 h-4" />
              {saveError || 'Save failed — check your connection'}
            </div>
          )}
          {saveStatus === 'idle' && <div />}

          <button type="submit" disabled={saving}
            className="btn-primary flex items-center gap-2 font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50 ml-auto">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
