'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
  return {
    value: `${String(h).padStart(2, '0')}:00`,
    label: `${displayH}:00 ${ampm}`,
  }
})

interface DayConfig {
  enabled: boolean
  startTime: string
  endTime: string
  slotId?: string
}

function computeHoursPerWeek(days: DayConfig[]) {
  let total = 0
  days.forEach((d) => {
    if (!d.enabled) return
    const [sh, sm] = d.startTime.split(':').map(Number)
    const [eh, em] = d.endTime.split(':').map(Number)
    const start = sh * 60 + sm
    const end = eh * 60 + em
    if (end > start) total += (end - start) / 60
  })
  return Math.round(total * 10) / 10
}

const selectSt: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(15,23,42,0.15)',
  borderRadius: '8px',
  padding: '6px 8px',
  fontSize: '12px',
  color: 'var(--text-primary)',
  outline: 'none',
  cursor: 'pointer',
}

export default function AvailabilityPage() {
  const supabase = createClient()
  const [lawyerId, setLawyerId] = useState<string | null>(null)
  const [days, setDays] = useState<DayConfig[]>(
    DAYS.map((_, i) => ({
      enabled: i >= 1 && i <= 5,
      startTime: '09:00',
      endTime: '18:00',
    }))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!lawyer) return
      setLawyerId(lawyer.id)

      const { data: slots } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('lawyer_id', lawyer.id)

      if (slots && slots.length > 0) {
        setDays(
          DAYS.map((_, i) => {
            const slot = slots.find((s: { day_of_week: number }) => s.day_of_week === i)
            return {
              enabled: !!slot?.is_active,
              startTime: slot?.start_time || '09:00',
              endTime: slot?.end_time || '18:00',
              slotId: slot?.id,
            }
          })
        )
      }

      setLoading(false)
    }
    init()
  }, [])

  async function handleSave() {
    if (!lawyerId) return
    setSaving(true)

    await supabase.from('availability_slots').delete().eq('lawyer_id', lawyerId)

    const activeDays = days
      .map((day, i) => ({
        lawyer_id: lawyerId,
        day_of_week: i,
        start_time: day.startTime,
        end_time: day.endTime,
        is_active: day.enabled,
      }))
      .filter((d) => d.is_active)

    if (activeDays.length > 0) {
      await supabase.from('availability_slots').insert(activeDays)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function updateDay(index: number, updates: Partial<DayConfig>) {
    setDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...updates } : d))
    )
  }

  const hoursPerWeek = computeHoursPerWeek(days)
  const activeDaysCount = days.filter((d) => d.enabled).length

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
        <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Availability
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Set when you&apos;re available for consultations
        </p>
      </div>

      {/* Summary */}
      <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(79,122,255,0.1)', color: 'var(--blue)' }}
        >
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <div className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {hoursPerWeek}h/week
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Available {activeDaysCount} day{activeDaysCount !== 1 ? 's' : ''} per week
          </div>
        </div>
      </div>

      {/* Day toggles */}
      <div className="space-y-3">
        {DAYS.map((dayName, i) => {
          const day = days[i]
          return (
            <div
              key={i}
              className="glass-card rounded-2xl p-4 transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                    style={day.enabled
                      ? { background: 'var(--blue)', color: '#fff' }
                      : { background: 'rgba(15,23,42,0.06)', color: 'var(--text-muted)' }
                    }
                  >
                    {DAY_ABBR[i]}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{dayName}</span>
                </div>

                <div className="flex items-center gap-3">
                  {day.enabled && (
                    <div className="flex items-center gap-2 text-sm">
                      <select
                        value={day.startTime}
                        onChange={(e) => updateDay(i, { startTime: e.target.value })}
                        style={selectSt}
                      >
                        {HOURS.filter((h) => h.value < day.endTime).map((h) => (
                          <option key={h.value} value={h.value}>
                            {h.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>to</span>
                      <select
                        value={day.endTime}
                        onChange={(e) => updateDay(i, { endTime: e.target.value })}
                        style={selectSt}
                      >
                        {HOURS.filter((h) => h.value > day.startTime).map((h) => (
                          <option key={h.value} value={h.value}>
                            {h.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => updateDay(i, { enabled: !day.enabled })}
                    className="relative w-10 h-6 rounded-full transition-all shrink-0"
                    style={{ background: day.enabled ? 'var(--blue)' : 'rgba(15,23,42,0.15)' }}
                  >
                    <span
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                      style={{ left: day.enabled ? '18px' : '2px' }}
                    />
                  </button>
                </div>
              </div>

              {day.enabled && (
                <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {(() => {
                    const [sh] = day.startTime.split(':').map(Number)
                    const [eh] = day.endTime.split(':').map(Number)
                    const hours = eh - sh
                    return `${hours} hour${hours !== 1 ? 's' : ''} available`
                  })()}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Save */}
      <div className="flex items-center justify-between">
        {saved && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--green)' }}>
            <CheckCircle className="w-4 h-4" />
            Availability saved!
          </div>
        )}
        {!saved && <div />}

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50 ml-auto"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  )
}
