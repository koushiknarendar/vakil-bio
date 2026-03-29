'use client'

import { useEffect } from 'react'

interface Props {
  lawyerId: string
}

export function ProfileViewTracker({ lawyerId }: Props) {
  useEffect(() => {
    fetch('/api/profile-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lawyerId }),
    }).catch(() => {
      // silently ignore — never block page load
    })
  }, [])

  return null
}
