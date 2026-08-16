import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FavoritesClient } from './favorites-client'

export default async function FavoritosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/favoritos')

  const [{ data: favoriteRows = [] }, { data: communityRows = [] }] = await Promise.all([
    supabase
      .from('favorites')
      .select('id, professional_id, space_id, event_id, professional:professionals(id, full_name, professional_name, address, public_slug), space:sport_spaces(id, name, address, slug), event:events(id, title, start_date, slug)')
      .eq('user_id', user.id),
    supabase
      .from('community_members')
      .select('id, role, community:communities(id, slug, name, sport_category)')
      .eq('user_id', user.id),
  ])

  const rows = favoriteRows || []
  const initial = {
    professionals: rows.filter((row: any) => row.professional_id && row.professional),
    spaces: rows.filter((row: any) => row.space_id && row.space),
    events: rows.filter((row: any) => row.event_id && row.event),
    communities: (communityRows || []).filter((row: any) => row.community).map((row: any) => ({ memberId: row.id, role: row.role, community: row.community })),
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Favoritos e comunidades</h1>
        <p className="mt-1 text-sm text-muted-foreground">Acede rapidamente ao conteúdo que guardaste e às comunidades de que fazes parte.</p>
      </div>
      <FavoritesClient initial={initial} />
    </div>
  )
}
