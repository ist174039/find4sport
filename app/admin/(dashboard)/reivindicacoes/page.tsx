import { createAdminClient } from '@/lib/supabase/admin'
import { SpaceClaimsManager } from '@/components/admin/space-claims-manager'

export default async function Page() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('space_claims')
    .select('id,status,message,documents_url,created_at,space_id,user_id,sport_spaces:space_id(name,address),platform_users:user_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw new Error(`Não foi possível carregar as reivindicações: ${error.message}`)

  const emailMap = new Map<string, string>()
  const userIds = [...new Set((data || []).map((claim: any) => claim.user_id).filter(Boolean))] as string[]
  await Promise.all(userIds.map(async id => { const { data: authData } = await admin.auth.admin.getUserById(id); if (authData?.user?.email) emailMap.set(id, authData.user.email) }))

  const claims = (data || []).map((claim: any) => ({
    id: claim.id,
    status: claim.status || 'pending',
    message: claim.message || null,
    documents_url: claim.documents_url || null,
    created_at: claim.created_at,
    space_id: claim.space_id,
    user_id: claim.user_id,
    space_name: claim.sport_spaces?.name || 'Espaço indisponível',
    space_address: claim.sport_spaces?.address || '',
    user_name: claim.platform_users?.full_name || 'Utilizador indisponível',
    user_email: emailMap.get(claim.user_id) || '',
  }))

  return <SpaceClaimsManager initialClaims={claims} />
}
