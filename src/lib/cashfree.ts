// Cashfree Payments API helper (no npm package needed — pure fetch)
const BASE = process.env.NEXT_PUBLIC_CASHFREE_MODE === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg'

const HEADERS = {
  'x-client-id': process.env.CASHFREE_APP_ID!,
  'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
  'x-api-version': '2023-08-01',
  'Content-Type': 'application/json',
}

export interface CashfreeOrderInput {
  orderId: string
  amount: number          // in rupees (not paise)
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  returnUrl?: string
  note?: string
}

export interface CashfreeOrder {
  cf_order_id: string
  order_id: string
  payment_session_id: string
  order_status: string
  order_amount: number
}

export async function createCashfreeOrder(input: CashfreeOrderInput): Promise<CashfreeOrder> {
  const res = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: input.amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: input.customerId,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
      },
      order_meta: input.returnUrl ? { return_url: input.returnUrl } : undefined,
      order_note: input.note,
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Failed to create Cashfree order')
  }
  return res.json()
}

export async function getCashfreeOrder(orderId: string): Promise<CashfreeOrder & { order_status: string }> {
  const res = await fetch(`${BASE}/orders/${orderId}`, { headers: HEADERS })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Failed to fetch Cashfree order')
  }
  return res.json()
}
