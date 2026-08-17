'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type MetadataUser = {
  app_metadata?: Record<string, unknown> | null
}

async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária.')
  return { supabase, admin: createAdminClient(), user }
}

function nextAppMetadata(user: MetadataUser, patch: Record<string, unknown>, remove: string[] = []) {
  const metadata: Record<string, unknown> = { ...(user.app_metadata || {}) }
  for (const key of remove) delete metadata[key]
  return { ...metadata, ...patch }
}

export async function deactivateAccountAction() {
  const { supabase, admin, user } = await requireUser()
  const appMetadata = nextAppMetadata(user, { account_status: 'deactivated', deactivated_at: new Date().toISOString() }, ['deletion_requested_at'])
  const { error } = await admin.auth.admin.updateUserById(user.id, { app_metadata: appMetadata })
  if (error) throw new Error('Não foi possível desativar a conta.')
  await supabase.auth.signOut()
  redirect('/auth/login?account=deactivated')
}

export async function reactivateAccountAction() {
  const { admin, user } = await requireUser()
  const appMetadata = nextAppMetadata(user, {}, ['account_status', 'deactivated_at', 'deletion_requested_at'])
  const legacyUserMetadata = { ...(user.user_metadata || {}) }
  delete legacyUserMetadata.account_status
  delete legacyUserMetadata.deactivated_at
  delete legacyUserMetadata.deletion_requested_at
  const { error } = await admin.auth.admin.updateUserById(user.id, { app_metadata: appMetadata, user_metadata: legacyUserMetadata })
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
    const appMetadata = nextAppMetadata(user, { account_status: 'deletion_requested', deletion_requested_at: new Date().toISOString() }, ['deactivated_at'])
    const { error } = await admin.auth.admin.updateUserById(user.id, { app_metadata: appMetadata })
    if (error) throw new Error('Não foi possível registar o pedido de eliminação.')
    await supabase.auth.signOut()
    redirect('/auth/login?account=deletion-requested')
  }

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) throw new Error('Não foi possível eliminar a conta.')
  await supabase.auth.signOut()
  redirect('/?account=deleted')
}
