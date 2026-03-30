'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AdminSignOut() {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <button onClick={signOut}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-[#F1F5F9]"
      style={{ color: 'var(--text-muted)' }}>
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  )
}
