'use client'

import { useEffect } from 'react'

export function FirmViewTracker({ companyId }: { companyId: string }) {
  useEffect(() => {
    fetch('/api/firm-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId }),
    }).catch(() => {})
  }, [])

  return null
}
