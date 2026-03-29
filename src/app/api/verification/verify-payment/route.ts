import { NextRequest } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { getCashfreeOrder } from '@/lib/cashfree'

export async function POST(req: NextRequest) {
  try {
    const authSupabase = await createServerClient()
    const { data: { user } } = await authSupabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { orderId, plan } = await req.json()
    if (!orderId || !plan) {
      return Response.json({ error: 'Missing orderId or plan' }, { status: 400 })
    }

    // Verify payment status with Cashfree
    const order = await getCashfreeOrder(orderId)
    if (order.order_status !== 'PAID') {
      return Response.json({ error: `Payment not completed (status: ${order.order_status})` }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: lawyer } = await supabase
      .from('lawyers')
      .select('id, verified_until')
      .eq('user_id', user.id)
      .single()
    if (!lawyer) return Response.json({ error: 'Profile not found' }, { status: 404 })

    // Extend from current expiry if still active, else start from now
    const base = lawyer.verified_until && new Date(lawyer.verified_until) > new Date()
      ? new Date(lawyer.verified_until)
      : new Date()

    const verifiedUntil = new Date(base)
    if (plan === 'yearly') {
      verifiedUntil.setFullYear(verifiedUntil.getFullYear() + 1)
    } else {
      verifiedUntil.setMonth(verifiedUntil.getMonth() + 1)
    }

    const { error } = await supabase
      .from('lawyers')
      .update({
        is_verified: true,
        verified_until: verifiedUntil.toISOString(),
        verification_plan: plan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lawyer.id)

    if (error) {
      console.error('Verification update error:', error)
      return Response.json({ error: 'Failed to activate verification' }, { status: 500 })
    }

    return Response.json({ success: true, verifiedUntil: verifiedUntil.toISOString() })
  } catch (err) {
    console.error('Verification verify-payment error:', err)
    return Response.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}
