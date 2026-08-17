import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FollowButton } from '@/components/follow-button'
import { FollowStats } from '@/components/follow-stats'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Calendar, Users, Activity, Globe, ArrowLeft, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AppImage } from '@/components/ui/app-image'
import { formatDate } from '@/lib/utils'
import { InstagramPhotoGallery } from '@/components/instagram-photo-gallery'

type Community = {
  id: string
  slug: string | null
  name: string
  cover_url: string | null
  sport_category: string | null
  description: string | null
}
type CommunityRelation = { community: Community[] }
type EventCategory = { name: string | null }
type PublicEvent = {
  id: string
  slug: string | null
  title: string
  image_url: string | null
  gallery_urls: unknown
  price_min: number | string | null
  start_date: string | null
  address: string | null
  category: EventCategory[]
}
type EventRelation = { event: PublicEvent[] }
type GalleryItem = { url: string; alt: string; label?: string; href?: string }

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('platform_users')
    .select('id,full_name,avatar_url,banner_url,location,language,type,created_at')
    .eq('id', id)
    .maybeSingle()

  if (!profile) return notFound()

  const [{ data: memberData }, { data: participantData }, { count: followersCount }, { count: followingCount }, { data: authData }] = await Promise.all([
    supabase
      .from('community_members')
      .select('community:communities(id,slug,name,cover_url,sport_category,description)')
      .eq('user_id', id)
      .order('joined_at', { ascending: false }),
    supabase
      .from('event_participants')
      .select('event:events(id,slug,title,image_url,gallery_urls,price_min,start_date,address,category:categories(name))')
      .eq('user_id', id)
      .order('created_at', { ascending: false }),
    supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', id),
    supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('follower_id', id),
    supabase.auth.getUser(),
  ])

  const communities = ((memberData || []) as unknown as CommunityRelation[]).flatMap(row => row.community || [])
  const events = ((participantData || []) as unknown as EventRelation[]).flatMap(row => row.event || [])
  const user = authData.user

  let isFollowing = false
  if (user && user.id !== id) {
    const { data: followRel } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', id)
      .maybeSingle()
    isFollowing = Boolean(followRel)
  }

  const photoGalleryItems: GalleryItem[] = []
  if (profile.banner_url) photoGalleryItems.push({ url: profile.banner_url, alt: `${profile.full_name || 'Utilizador'} - banner`, label: 'Banner' })
  if (profile.avatar_url) photoGalleryItems.push({ url: profile.avatar_url, alt: `${profile.full_name || 'Utilizador'} - perfil`, label: 'Perfil' })
  for (const community of communities) {
    if (!community.cover_url) continue
    photoGalleryItems.push({
      url: community.cover_url,
      alt: `${community.name} - comunidade`,
      label: community.sport_category || 'Comunidade',
      href: `/comunidades/${community.slug || community.id}`,
    })
  }
  for (const event of events) {
    const href = `/eventos/${event.slug || event.id}`
    if (event.image_url) photoGalleryItems.push({ url: event.image_url, alt: `${event.title} - evento`, label: 'Evento', href })
    if (Array.isArray(event.gallery_urls)) {
      for (const galleryUrl of event.gallery_urls.slice(0, 2)) {
        if (typeof galleryUrl !== 'string' || !galleryUrl) continue
        photoGalleryItems.push({ url: galleryUrl, alt: `${event.title} - galeria`, label: 'Evento', href })
      }
    }
  }

  const initials = (profile.full_name || 'U').split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex min-h-screen flex-col bg-background pb-16 animate-in fade-in duration-500">
      <section className="relative h-[200px] w-full bg-gradient-to-r from-primary/20 via-primary/10 to-muted md:h-[280px]">
        {profile.banner_url && <AppImage src={profile.banner_url} alt={`${profile.full_name || 'Utilizador'} - banner`} fill sizes="100vw" className="object-cover" />}
        <div className="absolute left-6 top-6 z-10">
          <Button asChild variant="secondary" size="sm" className="gap-2 bg-background/80 shadow-sm backdrop-blur-md">
            <Link href="/comunidades"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
          </Button>
        </div>
      </section>

      <section className="relative z-10 -mt-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-end md:p-8">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:text-left">
              <div className="relative -mt-16 h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-card bg-muted shadow-md md:-mt-20 md:h-36 md:w-36">
                {profile.avatar_url ? <AppImage src={profile.avatar_url} alt={profile.full_name || 'Utilizador'} fill sizes="144px" className="object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-primary/10 text-4xl font-bold text-primary">{initials}</div>}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                  <h1 className="text-2xl font-bold text-foreground md:text-3xl">{profile.full_name || 'Atleta'}</h1>
                  <Badge variant="outline" className="capitalize text-xs font-semibold">{profile.type === 'professional' ? 'Profissional' : 'Membro / Atleta'}</Badge>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground md:justify-start md:text-sm">
                  {profile.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{profile.location}</span>}
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Membro desde {profile.created_at ? formatDate(profile.created_at, "MMMM 'de' yyyy") : 'Desconhecido'}</span>
                  {profile.language && <span className="flex items-center gap-1.5 uppercase"><Globe className="h-4 w-4" />{profile.language}</span>}
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 border-t border-border pt-4 md:w-auto md:items-end md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <div className="flex items-center justify-center gap-4 md:justify-end">
                <div className="px-4 text-center"><p className="text-2xl font-bold">{communities.length}</p><p className="text-xs text-muted-foreground">Comunidades</p></div>
                <div className="h-8 w-px bg-border" />
                <div className="px-4 text-center"><p className="text-2xl font-bold">{events.length}</p><p className="text-xs text-muted-foreground">Eventos</p></div>
              </div>
              <div className="mt-2 flex flex-col items-center gap-3 md:items-end">
                <FollowStats targetUserId={id} followersCount={followersCount || 0} followingCount={followingCount || 0} variant="light" />
                {user && user.id !== id && <FollowButton targetUserId={id} initialIsFollowing={isFollowing} className="h-10 min-w-[110px] w-full rounded-xl px-4 text-sm md:w-auto" />}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <InstagramPhotoGallery title="Galeria do Perfil" subtitle="Imagens públicas associadas ao perfil, comunidades e eventos visíveis" items={photoGalleryItems} maxItems={12} />

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-indigo-500" />Comunidades visíveis<Badge variant="secondary" className="ml-2 text-xs">{communities.length}</Badge></h2>
            </div>
            {communities.length > 0 ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {communities.map(community => <Link key={community.id} href={`/comunidades/${community.slug || community.id}`} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-md">
                <div className="relative h-32 bg-muted">
                  <AppImage src={community.cover_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop'} alt={community.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur-md">{community.sport_category || 'Desporto'}</span>
                </div>
                <div className="flex flex-1 flex-col justify-between p-5"><div><h3 className="mb-2 line-clamp-1 text-lg font-bold transition-colors group-hover:text-primary">{community.name}</h3><p className="line-clamp-2 text-xs text-muted-foreground">{community.description || 'Sem descrição.'}</p></div><div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs font-semibold text-primary"><span>Ver Comunidade</span><span>→</span></div></div>
              </Link>)}
            </div> : <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground"><Users className="mb-3 h-10 w-10 text-indigo-500 opacity-30" /><p className="font-semibold text-foreground">Não existem comunidades visíveis neste perfil.</p></div>}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold"><Activity className="h-5 w-5 text-teal-500" />Eventos visíveis<Badge variant="secondary" className="ml-2 text-xs">{events.length}</Badge></h2>
            </div>
            {events.length > 0 ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map(event => <div key={event.id} className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md">
                <div><div className="mb-3 flex items-start justify-between"><Badge variant="outline" className="text-xs">{event.category[0]?.name || 'Evento Desportivo'}</Badge>{Number(event.price_min || 0) > 0 ? <span className="text-xs font-bold text-primary">{Number(event.price_min).toFixed(2)}€</span> : <Badge variant="success" className="text-[10px]">Grátis</Badge>}</div>
                  <h3 className="mb-2 line-clamp-1 text-base font-bold transition-colors group-hover:text-primary">{event.title}</h3>
                  <div className="mb-4 space-y-2 text-xs text-muted-foreground"><div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-primary" />{event.start_date ? formatDate(event.start_date, "dd 'de' MMMM 'às' HH:mm") : 'Data a definir'}</div>{event.address && <p className="flex items-center gap-2 line-clamp-1"><MapPin className="h-3.5 w-3.5 text-teal-500" />{event.address}</p>}</div>
                </div>
                <Button asChild variant="secondary" size="sm" className="mt-4 w-full"><Link href={`/eventos/${event.slug || event.id}`}>Ver Evento</Link></Button>
              </div>)}
            </div> : <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground"><Trophy className="mb-3 h-10 w-10 text-teal-500 opacity-30" /><p className="font-semibold text-foreground">Não existem inscrições em eventos visíveis neste perfil.</p></div>}
          </div>
        </div>
      </section>
    </div>
  )
}
