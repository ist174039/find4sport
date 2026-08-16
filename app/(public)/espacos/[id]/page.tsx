import Link from 'next/link'
import { BadgeCheck, Building2, Dumbbell, Images, Mail, MapPin, Phone, Star, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { ReserveSpaceBtn, ObterDirecoesBtn } from '@/components/space-actions'
import { ReviewsSection } from '@/components/reviews-section'
import { PublicFollowAction } from '@/components/public-follow-action'
import { EntityHero, EntityDetailLayout, DetailSection, DetailStat } from '@/components/patterns/entity-detail'
import { MobileEntityActions } from '@/components/patterns/mobile-entity-actions'
import { EntityGallery } from '@/components/patterns/entity-gallery'
import { PUBLIC_SPACE_STATUS } from '@/lib/domain/public-entities'

export default async function SpaceProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { id: rawId } = await params
  const isUuid = /^[0-9a-f-]{36}$/i.test(rawId)

  let space: any = null
  if (isUuid) space = (await admin.from('sport_spaces').select('*').eq('id', rawId).maybeSingle()).data
  if (!space) space = (await admin.from('sport_spaces').select('*').eq('slug', rawId).maybeSingle()).data
  if (!space || space.status !== PUBLIC_SPACE_STATUS) notFound()

  void (admin as any).rpc('increment_space_views', { space_id: space.id })
  const targetUserId = space.owner_user_id || null
  const { data: { user } } = await supabase.auth.getUser()

  const [associationResult, followersResult, followResult, subscriptionResult, roomsResult] = await Promise.all([
    admin.from('space_professionals').select('professional:professionals(id,user_id,full_name,professional_name,avatar_url,public_slug,is_verified,rating_avg,status)').eq('space_id', space.id).eq('status', 'active'),
    targetUserId ? admin.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', targetUserId) : Promise.resolve({ count: 0 }),
    user && targetUserId && user.id !== targetUserId ? admin.from('user_follows').select('id').eq('follower_id', user.id).eq('following_id', targetUserId).maybeSingle() : Promise.resolve({ data: null }),
    targetUserId ? admin.from('user_subscriptions').select('tier,status').eq('user_id', targetUserId).maybeSingle() : Promise.resolve({ data: null }),
    admin.from('space_rooms').select('id,name,price_per_hour,is_active').eq('space_id', space.id).eq('is_active', true).order('price_per_hour', { ascending: true }),
  ])

  const professionals = (associationResult.data || []).map((row: any) => row.professional).filter((professional: any) => professional?.status === 'active')
  const isPremium = subscriptionResult.data?.tier === 'premium' && ['active', 'trialing'].includes(String(subscriptionResult.data?.status))
  const gallery = Array.isArray(space.gallery_urls) ? space.gallery_urls.filter(Boolean) : []
  const amenities = Array.isArray(space.amenities) ? space.amenities.filter(Boolean) : []
  const rooms = roomsResult.data || []
  const prices = rooms.map((room: any) => Number(room.price_per_hour)).filter((price: number) => Number.isFinite(price))
  const minPrice = prices.length ? Math.min(...prices) : null
  const followersCount = followersResult.count || 0
  const publicPath = `/espacos/${space.slug || space.id}`

  const followAction = <PublicFollowAction targetUserId={targetUserId} currentUserId={user?.id || null} initialIsFollowing={Boolean((followResult as any).data)} loginRedirect={publicPath} />
  const reserveAction = <ReserveSpaceBtn spaceName={space.name} ownerUserId={targetUserId} spaceId={space.id} />
  const directionsAction = <ObterDirecoesBtn address={space.address} name={space.name} latitude={space.latitude} longitude={space.longitude} />

  return (
    <main className="min-h-screen bg-background pb-36 sm:pb-0">
      <EntityHero
        coverUrl={space.cover_url || gallery[0]}
        coverAlt={`Capa de ${space.name}`}
        avatar={<div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-background text-2xl font-bold text-primary shadow-lg sm:h-24 sm:w-24">{space.logo_url ? <img src={space.logo_url} alt={space.name} className="h-full w-full object-cover" /> : space.name?.charAt(0)?.toUpperCase()}</div>}
        title={space.name}
        badges={<><span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">Espaço desportivo</span>{space.is_verified && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-xs font-semibold text-white"><BadgeCheck className="h-3.5 w-3.5" />Verificado</span>}</>}
        meta={<>{space.address && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{space.address}</span>}{Number(space.rating_avg) > 0 && <span className="flex items-center gap-1 text-amber-300"><Star className="h-4 w-4 fill-current" />{Number(space.rating_avg).toFixed(1)} ({space.review_count || 0})</span>}<span className="flex items-center gap-1"><Users className="h-4 w-4" />{followersCount} seguidores</span>{minPrice !== null && <span className="font-semibold">Desde {minPrice.toFixed(2)} €/h</span>}</>}
        actions={<>{reserveAction}{followAction}{directionsAction}</>}
      />

      <EntityDetailLayout
        main={<>
          <DetailSection title="Sobre o espaço" icon={<Building2 className="h-5 w-5 text-primary" />}><p className="whitespace-pre-line text-sm leading-7 sm:text-base">{space.description || 'Este espaço ainda não adicionou uma descrição detalhada.'}</p></DetailSection>
          {rooms.length > 0 && <DetailSection title="Salas e campos"><div className="grid gap-2 sm:grid-cols-2">{rooms.map((room: any) => <div key={room.id} className="flex items-center justify-between rounded-xl border p-3"><span className="font-medium">{room.name}</span><span className="text-sm font-bold">{Number(room.price_per_hour).toFixed(2)} €/h</span></div>)}</div></DetailSection>}
          <DetailSection title="Infraestruturas e comodidades">{amenities.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{amenities.map((amenity: string) => <div key={amenity} className="rounded-xl border bg-muted/25 px-3 py-3 text-sm font-medium">{amenity}</div>)}</div> : <p className="text-sm text-muted-foreground">O espaço ainda não indicou comodidades.</p>}</DetailSection>
          {professionals.length > 0 && <DetailSection title="Profissionais associados" icon={<Dumbbell className="h-5 w-5 text-primary" />}><div className="grid gap-3 sm:grid-cols-2">{professionals.map((professional: any) => <Link key={professional.id} href={`/profissionais/${professional.public_slug || professional.id}`} className="flex min-h-16 items-center gap-3 rounded-xl border p-3"><div className="min-w-0"><p className="truncate font-semibold">{professional.professional_name || professional.full_name}</p>{Number(professional.rating_avg) > 0 && <p className="text-xs text-muted-foreground">★ {Number(professional.rating_avg).toFixed(1)}</p>}</div></Link>)}</div></DetailSection>}
          {gallery.length > 0 && <DetailSection title="Galeria" icon={<Images className="h-5 w-5 text-primary" />}><EntityGallery images={gallery} alt={space.name} /></DetailSection>}
          <DetailSection title="Avaliações" icon={<Star className="h-5 w-5 text-amber-500" />}><ReviewsSection targetType="space" targetId={space.id} /></DetailSection>
        </>}
        aside={<>
          <DetailSection title="Informação"><div className="grid grid-cols-2 gap-4 lg:grid-cols-1"><DetailStat label="Avaliação" value={Number(space.rating_avg) > 0 ? `${Number(space.rating_avg).toFixed(1)} / 5` : 'Sem avaliações'} /><DetailStat label="Seguidores" value={followersCount} /><DetailStat label="Salas/campos" value={rooms.length} />{minPrice !== null && <DetailStat label="Preço" value={`Desde ${minPrice.toFixed(2)} €/h`} />}</div>{space.address && <div className="mt-4">{directionsAction}</div>}</DetailSection>
          {isPremium && Boolean(space.phone || space.email) && <DetailSection title="Contactos externos · Premium"><div className="space-y-3 text-sm">{space.phone && <a href={`tel:${space.phone}`} className="flex min-h-11 items-center gap-3 rounded-xl border px-3"><Phone className="h-4 w-4 text-primary" />{space.phone}</a>}{space.email && <a href={`mailto:${space.email}`} className="flex min-h-11 items-center gap-3 rounded-xl border px-3"><Mail className="h-4 w-4 text-primary" /><span className="truncate">{space.email}</span></a>}</div></DetailSection>}
          <DetailSection title="Reservar"><p className="mb-4 text-sm text-muted-foreground">Consulta disponibilidade e inicia uma reserva.</p>{reserveAction}</DetailSection>
        </>}
      />
      <MobileEntityActions>{reserveAction}{followAction}{directionsAction}</MobileEntityActions>
    </main>
  )
}
