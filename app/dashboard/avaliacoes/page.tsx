import { redirect } from 'next/navigation'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/avaliacoes')
  const access = await resolveSessionAccess(supabase, user)
  if (!access || !['professional', 'venue_manager'].includes(access.role || '')) redirect('/dashboard')

  let reviews: any[] = []
  if (access.role === 'professional') {
    const { data: professional } = await supabase.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
    if (professional) reviews = (await supabase.from('reviews').select('id, rating, title, comment, created_at, user:user_id(full_name, avatar_url)').eq('professional_id', professional.id).order('created_at', { ascending: false }).limit(100)).data || []
  } else {
    const { data: spaces } = await supabase.from('sport_spaces').select('id').eq('owner_user_id', user.id)
    const ids = (spaces || []).map(space => space.id)
    if (ids.length) reviews = (await supabase.from('reviews').select('id, rating, title, comment, created_at, space_id, user:user_id(full_name, avatar_url)').in('space_id', ids).order('created_at', { ascending: false }).limit(100)).data || []
  }

  const average = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length : null
  const fiveStars = reviews.filter(review => Number(review.rating) === 5).length
  const critical = reviews.filter(review => Number(review.rating) <= 2).length

  return (
    <DashboardPage>
      <DashboardPageHeader title="Avaliações" description="Feedback real recebido no perfil. Esta página não contém ações de moderação fictícias." />

      <DashboardStatGrid>
        <DashboardStat label="Avaliações" value={reviews.length} icon={<Star className="h-5 w-5" />} />
        <DashboardStat label="Média" value={average === null ? '—' : average.toFixed(1)} icon={<Star className="h-5 w-5" />} />
        <DashboardStat label="5 estrelas" value={fiveStars} icon={<Star className="h-5 w-5" />} />
        <DashboardStat label="≤ 2 estrelas" value={critical} hint="Indicador de reputação" icon={<Star className="h-5 w-5" />} />
      </DashboardStatGrid>

      <DashboardSection title="Últimas avaliações" description="Até 100 avaliações mais recentes, ordenadas por data.">
        {reviews.length === 0 ? <DashboardEmptyState icon={<Star className="h-10 w-10" />} title="Sem avaliações" description="As avaliações recebidas aparecerão aqui." /> : <div className="space-y-3">{reviews.map(review => <article key={review.id} className="rounded-2xl border border-border p-4"><div className="flex items-start gap-3"><Avatar className="h-11 w-11 shrink-0"><AvatarImage src={review.user?.avatar_url || undefined} /><AvatarFallback>{review.user?.full_name?.charAt(0) || 'U'}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><p className="truncate text-sm font-semibold">{review.user?.full_name || 'Utilizador'}</p><time className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('pt-PT')}</time></div><div className="mt-1 flex items-center gap-1">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`h-4 w-4 ${index < Number(review.rating) ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'}`} />)}<Badge variant="outline" className="ml-2">{review.rating}/5</Badge></div>{review.title && <p className="mt-2 text-sm font-semibold">{review.title}</p>}{review.comment && <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{review.comment}</p>}</div></div></article>)}</div>}
      </DashboardSection>
    </DashboardPage>
  )
}
