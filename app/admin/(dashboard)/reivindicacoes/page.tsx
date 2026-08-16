import { createClient } from '@/lib/supabase/server'
import { SpaceClaimsManager } from '@/components/admin/space-claims-manager'

export default async function Page() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('space_claims')
    .select('id,status,message,documents_url,created_at,space_id,user_id,sport_spaces:space_id(name,address),platform_users:user_id(full_name,email)')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw new Error(`Não foi possível carregar as reivindicações: ${error.message}`)

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
    user_email: claim.platform_users?.email || '',
  }))

  return <SpaceClaimsManager initialClaims={claims} />
}
