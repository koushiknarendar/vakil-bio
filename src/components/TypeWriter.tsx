'use client'

import { useState, useEffect } from 'react'

const NAMES = ['vasist', 'parikshith', 'darshan', 'anagha', 'rohan', 'priya']

export function TypeWriter() {
  const [nameIndex, setNameIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = NAMES[nameIndex]

    if (!deleting && displayed === current) {
      const pause = setTimeout(() => setDeleting(true), 1800)
      return () => clearTimeout(pause)
    }

    if (deleting && displayed === '') {
      setDeleting(false)
      setNameIndex((i) => (i + 1) % NAMES.length)
      return
    }

    const speed = deleting ? 60 : 90
    const timer = setTimeout(() => {
      setDisplayed((prev) =>
        deleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1)
      )
    }, speed)

    return () => clearTimeout(timer)
  }, [displayed, deleting, nameIndex])

  return (
    <span className="font-mono grad-brand-text">
      vakil.bio/<span>{displayed}</span>
      <span className="inline-block w-0.5 h-5 ml-0.5 align-middle animate-pulse" style={{ background: 'var(--blue-l)' }} />
    </span>
  )
}
