import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ManagedSpaceEditor } from '@/components/dashboard/managed-space-editor'

export default async function EspacoPage({ searchParams }: { searchParams: Promise<{ space?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/espaco')

  const ownerDb = createAdminClient()
  const { data, error } = await ownerDb
    .from('sport_spaces')
    .select('id,name,description,email,phone,website,address,amenities,slug,is_verified,status')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) throw new Error('Não foi possível carregar os espaços.')
  const params = await searchParams
  const { data: claims } = await supabase.from('space_claims').select('id,status,message,decision_reason,created_at,space_id,space:sport_spaces(name)').eq('user_id', user.id).order('created_at', { ascending: false })
  return <ManagedSpaceEditor initialSpaces={data || []} initialSpaceId={params.space} claims={claims || []} />
}
