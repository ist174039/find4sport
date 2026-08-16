'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária.')
  return { supabase, admin: createAdminClient(), user }
}

export async function deactivateAccountAction() {
  const { supabase, admin, user } = await requireUser()
  const metadata = { ...(user.user_metadata || {}), account_status: 'deactivated', deactivated_at: new Date().toISOString() }
  const { error } = await admin.auth.admin.updateUserById(user.id, { user_metadata: metadata })
  if (error) throw new Error('Não foi possível desativar a conta.')
  await supabase.auth.signOut()
  redirect('/auth/login?account=deactivated')
}

export async function reactivateAccountAction() {
  const { admin, user } = await requireUser()
  const metadata = { ...(user.user_metadata || {}) }
  delete metadata.account_status
  delete metadata.deactivated_at
  delete metadata.deletion_requested_at
  const { error } = await admin.auth.admin.updateUserById(user.id, { user_metadata: metadata })
  if (error) throw new Error('Não foi possível reativar a conta.')
  redirect('/dashboard')
}

export async function deleteOrRequestAccountDeletionAction() {
  const { supabase, admin, user } = await requireUser()

  const [{ count: reservations }, { count: transactions }, { data: subscription }] = await Promise.all([
    admin.from('reservations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    admin.from('transactions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    admin.from('user_subscriptions').select('stripe_customer_id, stripe_subscription_id, status').eq('user_id', user.id).maybeSingle(),
  ])

  const hasFinancialHistory = (reservations || 0) > 0 || (transactions || 0) > 0 || Boolean(subscription?.stripe_customer_id || subscription?.stripe_subscription_id)

  if (hasFinancialHistory) {
    const metadata = {
      ...(user.user_metadata || {}),
      account_status: 'deletion_requested',
      deletion_requested_at: new Date().toISOString(),
    }
    const { error } = await admin.auth.admin.updateUserById(user.id, { user_metadata: metadata })
    if (error) throw new Error('Não foi possível registar o pedido de eliminação.')
    await supabase.auth.signOut()
    redirect('/auth/login?account=deletion-requested')
  }

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) throw new Error('Não foi possível eliminar a conta.')
  await supabase.auth.signOut()
  redirect('/?account=deleted')
}
