import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { AdminMfa } from './admin-mfa'

export const dynamic = 'force-dynamic'

export default async function AdminMfaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const access = await resolveSessionAccess(supabase, user)
  if (!access || !access.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const { data: assurance, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (!error && assurance.currentLevel === 'aal2') redirect('/admin')

  return <AdminMfa />
}
