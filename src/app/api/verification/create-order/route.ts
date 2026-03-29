import { NextRequest } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { createCashfreeOrder } from '@/lib/cashfree'

const PLANS = {
  monthly: { amount: 99,  label: 'Verification – Monthly' },
  yearly:  { amount: 999, label: 'Verification – Yearly'  },
}

export async function POST(req: NextRequest) {
  try {
    const authSupabase = await createServerClient()
    const { data: { user } } = await authSupabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await req.json()
    if (!plan || !(plan in PLANS)) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: lawyer } = await supabase
      .from('lawyers')
      .select('id, full_name, email, phone')
      .eq('user_id', user.id)
      .single()
    if (!lawyer) return Response.json({ error: 'Profile not found' }, { status: 404 })

    const { amount } = PLANS[plan as keyof typeof PLANS]
    const orderId = `verify_${lawyer.id}_${Date.now()}`

    const order = await createCashfreeOrder({
      orderId,
      amount,
      customerId: lawyer.id,
      customerName: lawyer.full_name,
      customerEmail: lawyer.email || user.email || '',
      customerPhone: lawyer.phone || '9999999999',
      note: `vakil.bio Verification – ${plan}`,
    })

    return Response.json({
      orderId: order.order_id,
      paymentSessionId: order.payment_session_id,
      amount,
      plan,
    })
  } catch (err) {
    console.error('Verification create-order error:', err)
    return Response.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}
