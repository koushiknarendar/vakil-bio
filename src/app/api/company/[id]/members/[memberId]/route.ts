import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DELETE: remove a member (admin removes anyone, member removes self)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: lawyer } = await supabase.from('lawyers').select('id').eq('user_id', user.id).single()
  if (!lawyer) return Response.json({ error: 'Not found' }, { status: 404 })

  const { id: companyId, memberId } = await params

  const { data: myMembership } = await supabase
    .from('company_members')
    .select('role')
    .eq('company_id', companyId)
    .eq('lawyer_id', lawyer.id)
    .single()

  // Admin can remove anyone; member can only remove themselves
  const isSelf = memberId === lawyer.id
  if (!myMembership) return Response.json({ error: 'Forbidden' }, { status: 403 })
  if (myMembership.role !== 'admin' && !isSelf) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Prevent admin from removing themselves if they're the only admin
  if (isSelf && myMembership.role === 'admin') {
    const { count } = await supabase
      .from('company_members')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('role', 'admin')
    if ((count ?? 0) <= 1) {
      return Response.json({ error: 'Transfer admin role before leaving' }, { status: 400 })
    }
  }

  await supabase
    .from('company_members')
    .delete()
    .eq('company_id', companyId)
    .eq('lawyer_id', memberId)

  return Response.json({ success: true })
}
