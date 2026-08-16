import Link from 'next/link'
import { BadgeCheck, Building2, Dumbbell, Images, Mail, MapPin, Phone, Star, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ReserveSpaceBtn, ObterDirecoesBtn } from '@/components/space-actions'
import { ReviewsSection } from '@/components/reviews-section'
import { PublicFollowAction } from '@/components/public-follow-action'
import { EntityHero, EntityDetailLayout, DetailSection, DetailStat } from '@/components/patterns/entity-detail'
import { MobileEntityActions } from '@/components/patterns/mobile-entity-actions'
import { EntityGallery } from '@/components/patterns/entity-gallery'

export default async function SpaceProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id: rawId } = await params
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)

  let space: any = null
  if (isUuid) space = (await supabase.from('sport_spaces').select('*').eq('id', rawId).maybeSingle()).data
  if (!space) space = (await supabase.from('sport_spaces').select('*').eq('slug', rawId).maybeSingle()).data
  if (!space) notFound()

  void supabase.rpc('increment_space_views', { space_id: space.id })
  const targetUserId = space.owner_user_id || space.created_by || null
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: associationRows }, followersResult, followResult] = await Promise.all([
    supabase.from('space_professionals').select('professional:professionals(id,user_id,full_name,professional_name,avatar_url,public_slug,is_verified,rating_avg)').eq('space_id', space.id).eq('status', 'active'),
    targetUserId ? supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', targetUserId) : Promise.resolve({ count: 0 }),
    user && targetUserId && user.id !== targetUserId ? supabase.from('user_follows').select('id').eq('follower_id', user.id).eq('following_id', targetUserId).maybeSingle() : Promise.resolve({ data: null }),
  ])

  const associatedProfessionals = (associationRows || []).map((row: any) => row.professional).filter(Boolean)
  const followersCount = followersResult.count || 0
  const isFollowing = Boolean((followResult as any).data)
  const coverUrl = space.cover_url || space.gallery_urls?.[0] || null
  const logoUrl = space.logo_url || null
  const description = space.description || 'Este espaço ainda não adicionou uma descrição detalhada.'
  const amenities = Array.isArray(space.amenities) ? space.amenities.filter(Boolean) : []
  const gallery = Array.isArray(space.gallery_urls) ? space.gallery_urls.filter(Boolean) : []
  const publicPath = `/espacos/${space.slug || space.id}`

  const followAction = <PublicFollowAction targetUserId={targetUserId} currentUserId={user?.id || null} initialIsFollowing={isFollowing} loginRedirect={publicPath} />
  const reserveAction = <ReserveSpaceBtn spaceName={space.name} ownerUserId={targetUserId} spaceId={space.id} />
  const directionsAction = <ObterDirecoesBtn address={space.address} name={space.name} latitude={space.latitude} longitude={space.longitude} />

  return <main className="min-h-screen bg-background pb-36 sm:pb-0">
    <EntityHero coverUrl={coverUrl} coverAlt={`Capa de ${space.name}`} avatar={<div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-background text-2xl font-bold text-primary shadow-lg sm:h-24 sm:w-24">{logoUrl ? <img src={logoUrl} alt={space.name} className="h-full w-full object-cover" /> : space.name?.charAt(0)?.toUpperCase()}</div>} title={space.name} badges={<><span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">Espaço desportivo</span>{space.is_verified && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-xs font-semibold text-white"><BadgeCheck className="h-3.5 w-3.5" />Verificado</span>}</>} meta={<>{space.address && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{space.address}</span>}{space.rating_avg > 0 && <span className="flex items-center gap-1 text-amber-300"><Star className="h-4 w-4 fill-current" />{Number(space.rating_avg).toFixed(1)} ({space.review_count || 0})</span>}<span className="flex items-center gap-1"><Users className="h-4 w-4" />{followersCount} seguidores</span></>} actions={<>{reserveAction}{followAction}{directionsAction}</>} />

    <EntityDetailLayout main={<>
      <DetailSection title="Sobre o espaço" icon={<Building2 className="h-5 w-5 text-primary" />}><p className="whitespace-pre-line text-sm leading-7 text-foreground sm:text-base">{description}</p></DetailSection>
      <DetailSection title="Infraestruturas e comodidades" description="Informação declarada pelo próprio espaço.">{amenities.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{amenities.map((amenity: string) => <div key={amenity} className="rounded-xl border border-border bg-muted/25 px-3 py-3 text-sm font-medium text-foreground">{amenity}</div>)}</div> : <p className="text-sm text-muted-foreground">O espaço ainda não indicou comodidades.</p>}</DetailSection>
      {associatedProfessionals.length > 0 && <DetailSection title="Profissionais associados" icon={<Dumbbell className="h-5 w-5 text-primary" />} description="Associações aceites pelo espaço e pelo profissional."><div className="grid gap-3 sm:grid-cols-2">{associatedProfessionals.map((professional: any) => <Link key={professional.id} href={`/profissionais/${professional.public_slug || professional.id}`} className="flex min-h-16 min-w-0 items-center gap-3 rounded-xl border border-border p-3 transition hover:border-primary/40"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">{professional.avatar_url ? <img src={professional.avatar_url} alt="" className="h-full w-full object-cover" /> : (professional.professional_name || professional.full_name || 'P').charAt(0)}</div><div className="min-w-0"><p className="truncate font-semibold">{professional.professional_name || professional.full_name}</p>{professional.rating_avg > 0 && <p className="text-xs text-muted-foreground">★ {Number(professional.rating_avg).toFixed(1)}</p>}</div></Link>)}</div></DetailSection>}
      {gallery.length > 0 && <DetailSection title="Galeria" icon={<Images className="h-5 w-5 text-primary" />}><EntityGallery images={gallery} alt={space.name} /></DetailSection>}
      <DetailSection title="Avaliações" icon={<Star className="h-5 w-5 text-amber-500" />}><ReviewsSection targetType="space" targetId={space.id} /></DetailSection>
    </>} aside={<>
      <DetailSection title="Informação"><div className="grid grid-cols-2 gap-4 lg:grid-cols-1"><DetailStat label="Avaliação" value={space.rating_avg > 0 ? `${Number(space.rating_avg).toFixed(1)} / 5` : 'Sem avaliações'} /><DetailStat label="Seguidores" value={followersCount} /><DetailStat label="Profissionais" value={associatedProfessionals.length} />{space.address && <DetailStat label="Localização" value={space.address} />}</div>{space.address && <div className="mt-4">{directionsAction}</div>}</DetailSection>
      {(space.phone || space.email) && <DetailSection title="Contactos"><div className="space-y-3 text-sm">{space.phone && <a href={`tel:${space.phone}`} className="flex min-h-11 items-center gap-3 rounded-xl border border-border px-3 text-foreground hover:border-primary/40"><Phone className="h-4 w-4 text-primary" />{space.phone}</a>}{space.email && <a href={`mailto:${space.email}`} className="flex min-h-11 min-w-0 items-center gap-3 rounded-xl border border-border px-3 text-foreground hover:border-primary/40"><Mail className="h-4 w-4 shrink-0 text-primary" /><span className="truncate">{space.email}</span></a>}</div></DetailSection>}
      <DetailSection title="Reservar"><p className="mb-4 text-sm text-muted-foreground">Consulta disponibilidade e inicia uma reserva neste espaço.</p>{reserveAction}</DetailSection>
    </>} />

    <MobileEntityActions>{reserveAction}{followAction}{directionsAction}</MobileEntityActions>
  </main>
}
