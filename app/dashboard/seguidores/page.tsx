import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BadgeCheck, Building2, Dumbbell, UserRound, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getFollowersList, getFollowingList } from '@/app/actions/follow'
import { FollowButton } from '@/components/follow-button'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

function RoleAvatar({ item }: { item: any }) {
  const rounded = item.type === 'venue_manager' ? 'rounded-xl' : 'rounded-full'
  return <div className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted ${rounded}`}>{item.avatar ? <img src={item.avatar} alt={item.name} className="h-full w-full object-cover" /> : item.type === 'venue_manager' ? <Building2 className="h-5 w-5 text-primary" /> : item.type === 'professional' ? <Dumbbell className="h-5 w-5 text-primary" /> : <UserRound className="h-5 w-5 text-primary" />}</div>
}

function roleLabel(role: string) {
  if (role === 'professional') return 'Profissional'
  if (role === 'venue_manager') return 'Gestor de espaço'
  return 'Atleta'
}

export default async function NetworkPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/seguidores')

  const [followingResult, followersResult] = await Promise.all([
    getFollowingList(user.id),
    getFollowersList(user.id),
  ])

  const following = followingResult.list || []
  const followers = followersResult.list || []
  const mutualCount = following.filter((item: any) => followers.some((follower: any) => follower.userId === item.userId)).length

  const list = (items: any[], followingMode: boolean) => items.length === 0 ? (
    <DashboardEmptyState icon={<Users className="h-10 w-10" />} title={followingMode ? 'Ainda não segue ninguém' : 'Ainda sem seguidores'} description={followingMode ? 'Explore profissionais, espaços e atletas para construir a sua rede.' : 'Quando alguém seguir o seu perfil, aparecerá aqui.'} action={followingMode ? <Link href="/pesquisa" className="text-sm font-semibold text-primary">Explorar plataforma</Link> : undefined} />
  ) : (
    <div className="divide-y divide-border">{items.map((item: any) => <article key={item.userId} className="flex items-center justify-between gap-3 py-3"><Link href={item.href} className="flex min-w-0 flex-1 items-center gap-3"><RoleAvatar item={item} /><div className="min-w-0"><div className="flex items-center gap-1.5"><p className="truncate text-sm font-semibold">{item.name}</p>{item.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}</div><p className="text-xs text-muted-foreground">{roleLabel(item.type)}</p></div></Link>{item.userId !== user.id && <div className="shrink-0"><FollowButton targetUserId={item.userId} initialIsFollowing={followingMode ? true : Boolean(item.isFollowedByMe)} variant="outline" /></div>}</article>)}</div>
  )

  return (
    <DashboardPage>
      <DashboardPageHeader title="Rede" description="Pessoas e entidades que segue, e utilizadores que seguem o seu perfil." />
      <DashboardStatGrid>
        <DashboardStat label="A seguir" value={following.length} icon={<UserRound className="h-5 w-5" />} />
        <DashboardStat label="Seguidores" value={followers.length} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Mútuos" value={mutualCount} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Rede total" value={new Set([...following.map((item: any) => item.userId), ...followers.map((item: any) => item.userId)]).size} icon={<Users className="h-5 w-5" />} />
      </DashboardStatGrid>
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardSection title="A seguir" description="Perfis que escolheu acompanhar.">{list(following, true)}</DashboardSection>
        <DashboardSection title="Seguidores" description="Perfis que acompanham a sua atividade.">{list(followers, false)}</DashboardSection>
      </div>
    </DashboardPage>
  )
}
