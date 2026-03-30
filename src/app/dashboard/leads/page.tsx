'use client'

import { useState, useEffect } from 'react'
import { Users, MessageCircle, Download, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UrgencyBadge } from '@/components/ui/Badge'
import type { Lead } from '@/lib/types'

export default function LeadsPage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [lawyerId, setLawyerId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: lawyer } = await supabase.from('lawyers').select('id').eq('user_id', user.id).single()
      if (!lawyer) return
      setLawyerId(lawyer.id)
      await fetchLeads(lawyer.id)
    }
    init()
  }, [])

  async function fetchLeads(lid: string) {
    setLoading(true)
    const { data } = await supabase.from('leads').select('*').eq('lawyer_id', lid).order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  async function toggleContacted(leadId: string, current: boolean) {
    await supabase.from('leads').update({ is_contacted: !current }).eq('id', leadId)
    if (lawyerId) fetchLeads(lawyerId)
  }

  function exportCSV() {
    const rows = [
      ['Name', 'Phone', 'Email', 'Case Type', 'Urgency', 'Description', 'Contacted', 'Date'],
      ...leads.map((l) => [
        l.client_name, l.client_phone, l.client_email || '', l.case_type, l.urgency,
        (l.description || '').replace(/,/g, ';'), l.is_contacted ? 'Yes' : 'No',
        new Date(l.created_at).toLocaleDateString('en-IN'),
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `leads-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Leads</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Potential clients who contacted you</p>
        </div>
        {leads.length > 0 && (
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-all glass"
            style={{ color: 'var(--text-secondary)' }}>
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--border-lg)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No leads yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Leads from your profile page will appear here</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Client', 'Phone', 'Case Type', 'Urgency', 'Date', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium"
                        style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} style={{ borderBottom: '1px solid var(--border)', opacity: lead.is_contacted ? 0.6 : 1 }}>
                      <td className="px-5 py-3">
                        <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{lead.client_name}</div>
                        {lead.client_email && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{lead.client_email}</div>}
                      </td>
                      <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{lead.client_phone}</td>
                      <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{lead.case_type}</td>
                      <td className="px-5 py-3"><UrgencyBadge urgency={lead.urgency} /></td>
                      <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(lead.created_at)}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => toggleContacted(lead.id, lead.is_contacted)}
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all"
                          style={lead.is_contacted
                            ? { borderColor: 'rgba(16,185,129,0.3)', color: 'var(--green)', background: 'rgba(16,185,129,0.06)' }
                            : { borderColor: 'var(--border-md)', color: 'var(--text-muted)' }
                          }>
                          <CheckCircle className="w-3.5 h-3.5" />
                          {lead.is_contacted ? 'Contacted' : 'Mark contacted'}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <a
                          href={`https://wa.me/91${lead.client_phone}?text=Hi ${encodeURIComponent(lead.client_name)}, I'm contacting you regarding your enquiry about ${encodeURIComponent(lead.case_type)} on vakil.bio.`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all"
                          style={{ color: 'var(--green)', borderColor: 'rgba(16,185,129,0.3)' }}>
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden">
              {leads.map((lead) => (
                <div key={lead.id} className="p-4 space-y-2"
                  style={{ borderBottom: '1px solid var(--border)', opacity: lead.is_contacted ? 0.6 : 1 }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{lead.client_name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{lead.client_phone}</div>
                    </div>
                    <UrgencyBadge urgency={lead.urgency} />
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>{lead.case_type}</span>
                    <span>·</span>
                    <span>{formatDate(lead.created_at)}</span>
                  </div>
                  {lead.description && (
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{lead.description}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => toggleContacted(lead.id, lead.is_contacted)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg border transition-all"
                      style={lead.is_contacted
                        ? { borderColor: 'rgba(16,185,129,0.3)', color: 'var(--green)', background: 'rgba(16,185,129,0.06)' }
                        : { borderColor: 'var(--border-md)', color: 'var(--text-muted)' }
                      }>
                      <CheckCircle className="w-3.5 h-3.5" />
                      {lead.is_contacted ? 'Contacted' : 'Mark done'}
                    </button>
                    <a
                      href={`https://wa.me/91${lead.client_phone}?text=Hi ${encodeURIComponent(lead.client_name)}, I'm contacting you about your ${encodeURIComponent(lead.case_type)} query on vakil.bio.`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg border transition-all"
                      style={{ color: 'var(--green)', borderColor: 'rgba(16,185,129,0.3)' }}>
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
