'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Loader2, CheckCircle, AlertCircle, Pencil, Trash2, Clock, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/lib/types'

const inputSt: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(15,23,42,0.15)',
  borderRadius: '10px',
  padding: '8px 12px',
  fontSize: '13px',
  color: 'var(--text-primary)',
  outline: 'none',
  width: '100%',
}

type ServiceKind = 'consultation' | 'service'

interface ServiceForm {
  kind: ServiceKind
  title: string
  price: string
  originalPrice: string
  durationMinutes: string
  description: string
  isActive: boolean
}

const emptyForm: ServiceForm = {
  kind: 'consultation',
  title: '',
  price: '',
  originalPrice: '',
  durationMinutes: '',
  description: '',
  isActive: true,
}

function serviceToForm(s: Service): ServiceForm {
  return {
    kind: s.type === 'consultation' ? 'consultation' : 'service',
    title: s.title,
    price: String(s.price),
    originalPrice: s.original_price ? String(s.original_price) : '',
    durationMinutes: s.duration_minutes ? String(s.duration_minutes) : '',
    description: s.description || '',
    isActive: s.is_active,
  }
}


export default function ServicesPage() {
  const supabase = createClient()
  const [lawyerId, setLawyerId] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: lawyer } = await supabase.from('lawyers').select('id').eq('user_id', user.id).single()
      if (!lawyer) return
      setLawyerId(lawyer.id)
      const { data } = await supabase.from('services').select('*').eq('lawyer_id', lawyer.id).order('created_at')
      setServices(data || [])
      setLoading(false)
    }
    init()
  }, [])

  function startEdit(service: Service) {
    setEditingId(service.id)
    setForm(serviceToForm(service))
    setSaveStatus('idle')
  }

  function startAdd() {
    setEditingId('new')
    setForm(emptyForm)
    setSaveStatus('idle')
  }

  function cancelEdit() {
    setEditingId(null)
    setSaveStatus('idle')
  }

  function setField<K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function save() {
    if (!lawyerId || !form.title.trim()) return
    setSaving(true)
    setSaveStatus('idle')

    const price = parseInt(form.price) || 0
    const payload = {
      type: form.kind,
      title: form.title.trim(),
      price,
      original_price: form.originalPrice && parseInt(form.originalPrice) > price ? parseInt(form.originalPrice) : null,
      duration_minutes: form.kind === 'consultation' && form.durationMinutes ? parseInt(form.durationMinutes) : null,
      description: form.description.trim() || null,
      is_active: form.isActive,
    }

    try {
      if (editingId === 'new') {
        const { data, error } = await supabase.from('services').insert({ ...payload, lawyer_id: lawyerId }).select().single()
        if (error) throw error
        setServices(prev => [...prev, data])
      } else {
        const { data, error } = await supabase.from('services').update(payload).eq('id', editingId!).select().single()
        if (error) throw error
        setServices(prev => prev.map(s => s.id === editingId ? data : s))
      }
      setSaveStatus('success')
      setTimeout(() => { setEditingId(null); setSaveStatus('idle') }, 700)
    } catch (e) {
      console.error('Service save error:', e)
      setSaveStatus('error')
    }
    setSaving(false)
  }

  async function deleteService(id: string) {
    if (!confirm('Delete this service?')) return
    setDeletingId(id)
    await supabase.from('services').delete().eq('id', id)
    setServices(prev => prev.filter(s => s.id !== id))
    setDeletingId(null)
    if (editingId === id) setEditingId(null)
  }

  async function toggleActive(service: Service) {
    const { data } = await supabase.from('services').update({ is_active: !service.is_active }).eq('id', service.id).select().single()
    if (data) setServices(prev => prev.map(s => s.id === service.id ? data : s))
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--text-muted)' }} /></div>
  }

  const consultations = services.filter(s => s.type === 'consultation')
  const otherServices = services.filter(s => s.type !== 'consultation')

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Services</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            vakil.bio retains 10% of every payment. You receive 90%.
          </p>
        </div>
        {editingId !== 'new' && (
          <button onClick={startAdd}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl shrink-0"
            style={{ background: 'var(--blue)', color: '#fff' }}>
            <Plus className="w-4 h-4" /> Add
          </button>
        )}
      </div>

      {/* Add form */}
      {editingId === 'new' && (
        <Form form={form} setField={setField} onSave={save} onCancel={cancelEdit} saving={saving} saveStatus={saveStatus} isNew />
      )}

      {/* Empty state */}
      {services.length === 0 && editingId !== 'new' && (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No services yet. Click <strong>Add</strong> to create your first one.</p>
        </div>
      )}

      {/* Consultations */}
      {consultations.length > 0 && (
        <Section label="Consultations" icon={<Clock className="w-3.5 h-3.5" />}>
          {consultations.map(service => (
            editingId === service.id
              ? <Form key={service.id} form={form} setField={setField} onSave={save} onCancel={cancelEdit} saving={saving} saveStatus={saveStatus} />
              : <ServiceCard key={service.id} service={service} onEdit={() => startEdit(service)} onDelete={() => deleteService(service.id)} onToggle={() => toggleActive(service)} deleting={deletingId === service.id} />
          ))}
        </Section>
      )}

      {/* Other services */}
      {otherServices.length > 0 && (
        <Section label="Services" icon={<Briefcase className="w-3.5 h-3.5" />}>
          {otherServices.map(service => (
            editingId === service.id
              ? <Form key={service.id} form={form} setField={setField} onSave={save} onCancel={cancelEdit} saving={saving} saveStatus={saveStatus} />
              : <ServiceCard key={service.id} service={service} onEdit={() => startEdit(service)} onDelete={() => deleteService(service.id)} onToggle={() => toggleActive(service)} deleting={deletingId === service.id} />
          ))}
        </Section>
      )}

      {/* Add more button */}
      {services.length > 0 && !editingId && (
        <button onClick={startAdd}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium transition-colors"
          style={{ border: '1.5px dashed var(--border)', color: 'var(--text-secondary)', background: 'transparent' }}>
          <Plus className="w-4 h-4" /> Add another service
        </button>
      )}
    </div>
  )
}

function Section({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      {children}
    </div>
  )
}

function ServiceCard({ service, onEdit, onDelete, onToggle, deleting }: {
  service: Service
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  deleting: boolean
}) {
  const isFree = service.price === 0
  const pct = service.original_price ? discountPct(service.original_price, service.price) : 0

  return (
    <div className="rounded-2xl p-4" style={{
      background: 'var(--bg-base)', border: '1px solid var(--border)',
      boxShadow: '0 1px 4px rgba(15,23,42,0.05)', opacity: service.is_active ? 1 : 0.55,
    }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title + badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{service.title}</span>
            {!service.is_active && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(15,23,42,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Hidden</span>
            )}
          </div>

          {/* Price + discount */}
          <div className="flex items-center gap-2 flex-wrap">
            {isFree ? (
              <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.2)' }}>
                Free
              </span>
            ) : (
              <>
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  ₹{service.price.toLocaleString('en-IN')}
                </span>
                {service.original_price && pct > 0 && (
                  <>
                    <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                      ₹{service.original_price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.15)' }}>
                      {pct}% off
                    </span>
                  </>
                )}
              </>
            )}
            {service.duration_minutes && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-3 h-3" />{service.duration_minutes} min
              </span>
            )}
          </div>

          {service.description && (
            <p className="text-xs mt-1.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{service.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onToggle} className="p-1.5 rounded-lg text-base leading-none" title={service.is_active ? 'Hide' : 'Show'}>
            {service.is_active ? '👁' : '🙈'}
          </button>
          <button onClick={onEdit} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} disabled={deleting} className="p-1.5 rounded-lg" style={{ color: '#EF4444' }}>
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

function Form({ form, setField, onSave, onCancel, saving, saveStatus, isNew = false }: {
  form: ServiceForm
  setField: <K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  saveStatus: 'idle' | 'success' | 'error'
  isNew?: boolean
}) {
  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-base)', border: '1.5px solid rgba(37,99,235,0.25)', boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}>
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{isNew ? 'New Service' : 'Edit Service'}</p>
        <button onClick={onCancel} style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
      </div>

      {/* Type toggle */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Type</label>
        <div className="flex gap-2">
          {(['consultation', 'service'] as ServiceKind[]).map(kind => (
            <button key={kind} type="button"
              onClick={() => setField('kind', kind)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize"
              style={form.kind === kind
                ? { background: '#2563EB', color: '#fff' }
                : { background: 'rgba(15,23,42,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              {kind === 'consultation' ? <Clock className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
              {kind === 'consultation' ? 'Consultation' : 'Service'}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Name *</label>
        <input type="text" value={form.title} onChange={e => setField('title', e.target.value)}
          placeholder={form.kind === 'consultation' ? 'e.g. 30-min Video Consultation' : 'e.g. Document Review, Legal Notice Drafting...'}
          style={inputSt} />
      </div>

      {/* Duration — only for consultation */}
      {form.kind === 'consultation' && (
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Duration (minutes)</label>
          <input type="number" value={form.durationMinutes} onChange={e => setField('durationMinutes', e.target.value)}
            placeholder="30" min="1" style={{ ...inputSt, width: '140px' }} />
        </div>
      )}

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Price (₹) *</label>
          <input type="number" value={form.price} onChange={e => setField('price', e.target.value)}
            placeholder="0 = Free" min="0" style={inputSt} />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Set 0 for free</p>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>MRP / Original Price (₹)</label>
          <input type="number" value={form.originalPrice} onChange={e => setField('originalPrice', e.target.value)}
            placeholder="e.g. 1499" min="0" style={inputSt} />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Shows discount % badge</p>
        </div>
      </div>

      {/* Live discount preview */}
      {form.originalPrice && form.price && parseInt(form.originalPrice) > parseInt(form.price) && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Preview:</span>
          <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>₹{parseInt(form.originalPrice).toLocaleString('en-IN')}</span>
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>₹{parseInt(form.price).toLocaleString('en-IN')}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.2)' }}>
            {discountPct(parseInt(form.originalPrice), parseInt(form.price))}% off
          </span>
        </div>
      )}
      {form.price === '0' && (
        <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <span className="text-xs font-bold" style={{ color: 'var(--green)' }}>✓ This service will show as Free</span>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Description (optional)</label>
        <textarea value={form.description} onChange={e => setField('description', e.target.value)}
          placeholder="What's included, what to expect..." rows={2}
          style={{ ...inputSt, resize: 'none' }} />
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Active on profile</label>
        <button type="button" onClick={() => setField('isActive', !form.isActive)}
          className="relative w-10 h-6 rounded-full transition-all"
          style={{ background: form.isActive ? 'var(--blue)' : 'rgba(15,23,42,0.15)' }}>
          <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
            style={{ left: form.isActive ? '18px' : '2px' }} />
        </button>
      </div>

      {/* Save / Cancel */}
      <div className="flex items-center justify-between pt-1">
        <div>
          {saveStatus === 'success' && <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--green)' }}><CheckCircle className="w-3.5 h-3.5" /> Saved</span>}
          {saveStatus === 'error' && <span className="flex items-center gap-1 text-xs" style={{ color: '#DC2626' }}><AlertCircle className="w-3.5 h-3.5" /> Error saving</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="text-sm px-4 py-2 rounded-xl"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button onClick={onSave} disabled={saving || !form.title.trim() || form.price === ''}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
            style={{ background: 'var(--blue)', color: '#fff' }}>
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function discountPct(original: number, current: number) {
  return Math.round(((original - current) / original) * 100)
}
