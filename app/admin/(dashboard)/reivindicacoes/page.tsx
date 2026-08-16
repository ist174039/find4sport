import { createAdminClient } from '@/lib/supabase/admin'
import { SpaceClaimsManager } from '@/components/admin/space-claims-manager'

export default async function Page() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('space_claims')
    .select('id,status,message,documents_url,created_at,space_id,user_id')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw new Error(`Não foi possível carregar as reivindicações: ${error.message}`)

  const rows = data || []
  const userIds = [...new Set(rows.map((claim: any) => claim.user_id).filter(Boolean))] as string[]
  const spaceIds = [...new Set(rows.map((claim: any) => claim.space_id).filter(Boolean))] as string[]

  const [{ data: users }, { data: spaces }] = await Promise.all([
    userIds.length ? admin.from('platform_users').select('id,full_name').in('id', userIds) : Promise.resolve({ data: [] as any[] }),
    spaceIds.length ? admin.from('sport_spaces').select('id,name,address').in('id', spaceIds) : Promise.resolve({ data: [] as any[] }),
  ])

  const userMap = new Map((users || []).map((item: any) => [item.id, item]))
  const spaceMap = new Map((spaces || []).map((item: any) => [item.id, item]))
  const emailMap = new Map<string, string>()

  await Promise.all(userIds.map(async id => {
    const { data: authData } = await admin.auth.admin.getUserById(id)
    if (authData?.user?.email) emailMap.set(id, authData.user.email)
  }))

  const claims = rows.map((claim: any) => {
    const profile = userMap.get(claim.user_id) as any
    const space = spaceMap.get(claim.space_id) as any
    return {
      id: claim.id,
      status: claim.status || 'pending',
      message: claim.message || null,
      documents_url: claim.documents_url || null,
      created_at: claim.created_at,
      space_id: claim.space_id,
      user_id: claim.user_id,
      space_name: space?.name || 'Espaço indisponível',
      space_address: space?.address || '',
      user_name: profile?.full_name || 'Utilizador indisponível',
      user_email: emailMap.get(claim.user_id) || '',
    }
  })

  return <SpaceClaimsManager initialClaims={claims} />
}
