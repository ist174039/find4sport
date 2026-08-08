import { createClient } from '@/lib/supabase/server'
import { getFollowersList, getFollowingList } from '@/app/actions/follow'
import { FollowButton } from '@/components/follow-button'
import { BadgeCheck, Building2, Dumbbell, Users } from 'lucide-react'
import Link from 'next/link'

export default async function SeguidoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Determine the "targetUserId" — for space managers, use their platform_user id
  const targetUserId = user.id

  const [followingRes, followersRes, profRes, spaceRes] = await Promise.all([
    getFollowingList(targetUserId),
    getFollowersList(targetUserId),
    supabase.from('professionals').select('id').eq('user_id', user.id).maybeSingle(),
    supabase.from('sport_spaces').select('id').eq('owner_user_id', user.id).maybeSingle()
  ])

  const following = followingRes.list || []
  const followers = followersRes.list || []
  const canBeFollowed = !!(profRes.data || spaceRes.data)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Rede</h1>
        <p className="text-muted-foreground text-sm">
          {canBeFollowed ? 'Gere quem segues e quem te segue.' : 'Gere os profissionais e espaços que segues.'}
        </p>
      </div>

      <div className={`grid grid-cols-1 ${canBeFollowed ? 'lg:grid-cols-2' : ''} gap-6`}>
        {/* A Seguir */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-base">A Seguir</h2>
            <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{following.length}</span>
          </div>

          {following.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Users className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">Ainda não segues ninguém</p>
              <p className="text-xs text-muted-foreground mb-4">Descobre profissionais e espaços para seguir.</p>
              <Link href="/profissionais" className="text-xs font-bold text-primary hover:underline">
                Explorar Profissionais →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {(following as any[]).map((item: any) => (
                <li key={item.userId} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <Link href={item.href} className="flex items-center gap-3 min-w-0 flex-1 group">
                    <div className={`w-11 h-11 shrink-0 overflow-hidden border border-border bg-muted ${item.type === 'space' ? 'rounded-xl' : 'rounded-full'}`}>
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary">
                          {item.type === 'space' ? <Building2 className="w-5 h-5" /> : (item.type === 'professional' ? <Dumbbell className="w-5 h-5" /> : <Users className="w-5 h-5" />)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{item.name}</p>
                        {item.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        {item.type === 'professional' ? 'Profissional' : (item.type === 'space' ? 'Espaço' : 'Utilizador')}
                      </p>
                    </div>
                  </Link>
                  <div className="ml-3 shrink-0">
                    <FollowButton
                      targetUserId={item.userId}
                      initialIsFollowing={true}
                      variant="outline"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Seguidores */}
        {canBeFollowed && (
          <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-base">Seguidores</h2>
              <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{followers.length}</span>
            </div>

            {followers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Users className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">Ainda sem seguidores</p>
                <p className="text-xs text-muted-foreground">Quando alguém te seguir, aparece aqui.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {(followers as any[]).map((item: any) => (
                  <li key={item.userId} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
                    <Link href={item.href} className="flex items-center gap-3 min-w-0 flex-1 group">
                      <div className={`w-11 h-11 shrink-0 overflow-hidden border border-border bg-muted ${item.type === 'space' ? 'rounded-xl' : 'rounded-full'}`}>
                        {item.avatar ? (
                          <img src={item.avatar} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary">
                            {item.type === 'space' ? <Building2 className="w-5 h-5" /> : (item.type === 'professional' ? <Dumbbell className="w-5 h-5" /> : <Users className="w-5 h-5" />)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{item.name}</p>
                          {item.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                          {item.type === 'professional' ? 'Profissional' : (item.type === 'space' ? 'Espaço' : 'Utilizador')}
                        </p>
                      </div>
                    </Link>
                    {item.userId !== user.id && (
                      <div className="ml-3 shrink-0">
                        <FollowButton
                          targetUserId={item.userId}
                          initialIsFollowing={item.isFollowedByMe}
                          variant="outline"
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
