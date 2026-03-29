'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

interface ShareButtonProps {
  url: string
  compact?: boolean  // icon-only button (desktop header)
  full?: boolean     // full-width row in sidebar
}

export function ShareButton({ url, compact, full }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ url }); return } catch { /* fall through */ }
    }
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Fallback for unfocused document
      const el = document.createElement('input')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (compact) {
    return (
      <button
        onClick={handleShare}
        title="Share profile"
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
        style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
      >
        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Share'}
      </button>
    )
  }

  if (full) {
    return (
      <button
        onClick={handleShare}
        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors text-sm font-medium text-[#374151]"
      >
        {copied
          ? <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          : <Share2 className="w-4 h-4 text-[#7C6FFD] shrink-0" />
        }
        {copied ? 'Link copied!' : 'Share Profile'}
      </button>
    )
  }

  // default (original icon+label stacked style)
  return (
    <button
      onClick={handleShare}
      className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors text-xs text-[#475569] font-medium"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-[#7C6FFD]" />}
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}
