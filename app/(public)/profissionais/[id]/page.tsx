import Link from 'next/link'
import { Award, BadgeCheck, Building2, Dumbbell, ExternalLink, Globe2, MapPin, MessageSquare, Star, Users } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ContactarProfissionalBtn } from '@/components/professional-actions'
import { ObterDirecoesBtn } from '@/components/space-actions'
import { ReviewsSection } from '@/components/reviews-section'
import { ProfessionalServices } from '@/components/professional-services'
import { FollowButton } from '@/components/follow-button'
import { EntityGallery } from '@/components/patterns/entity-gallery'
import { EntityHero, EntityDetailLayout, DetailSection, DetailStat, MobileActionBar } from '@/components/patterns/entity-detail'
import { AppImage } from '@/components/ui/app-image'
import { PUBLIC_PROFESSIONAL_STATUS } from '@/lib/domain/public-entities'
import type { Service } from '@/lib/types'

type Professional = {
  id: string
  user_id: string
  status: string | null
  full_name: string | null
  professional_name: string | null
  bio: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  rating_avg: number | string | null
  review_count: number | null
  avatar_url: string | null
  cover_url: string | null
  gallery_urls: unknown
  is_verified: boolean | null
  is_premium: boolean | null
  social_links: unknown
  website: string | null
  whatsapp: string | null
}
type CategoryRelation = { category: { name: string | null } | null }
type Qualification = { id: string; title: string; issuer: string | null }
type Community = { id: string; slug: string | null; name: string }
type CommunityRelation = { community: Community | null }
type Space = { id: string; name: string; slug: string | null; address: string | null; logo_url: string | null; is_verified: boolean | null; status: string | null }
type SpaceRelation = { space: Space | null }
type RpcResult = { data: unknown; error: { message: string } | null }
type RpcCall = (name: string, args: Record<string, unknown>) => PromiseLike<RpcResult>

function safeExternalUrl(value?: string | null) { if (!value) return null; try { return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).toString() } catch { return null } }

export default async function ProfessionalProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const admin = supabase
  const { id: rawId } = await params
  const isUuid = /^[0-9a-f-]{36}$/i.test(rawId)

  let professional: Professional | null = null
  const publicFields = 'id,user_id,status,full_name,professional_name,bio,address,latitude,longitude,rating_avg,review_count,avatar_url,cover_url,gallery_urls,is_verified,is_premium,social_links,website,whatsapp'
  if (isUuid) professional = (await admin.from('professionals').select(publicFields).eq('id', rawId).maybeSingle()).data as Professional | null
  if (!professional) professional = (await admin.from('professionals').select(publicFields).eq('public_slug', rawId).maybeSingle()).data as Professional | null
  if (!professional || professional.status !== PUBLIC_PROFESSIONAL_STATUS) notFound()
  const { data: publicOwner } = await admin.from('platform_users').select('id').eq('id', professional.user_id).eq('account_status', 'active').maybeSingle()
  if (!publicOwner) notFound()

  const rpc = admin.rpc.bind(admin) as unknown as RpcCall
  void rpc('increment_professional_views', { prof_id: professional.id })

  const [{ data: catData }, { data: qualifications }, { data: memberData }, { data: services }, { data: associationRows }, { count: followersCount }, { data: subscription }, { data: { user } }] = await Promise.all([
    admin.from('professional_categories').select('category:categories(name)').eq('professional_id', professional.id),
    admin.from('qualifications').select('id,title,issuer').eq('professional_id', professional.id).order('created_at', { ascending: false }),
    admin.from('community_members').select('community:communities(id,slug,name)').eq('user_id', professional.user_id),
    admin.from('services').select('*').eq('professional_id', professional.id).eq('is_active', true).order('price', { ascending: true }),
    admin.from('space_professionals').select('space:sport_spaces(id,name,slug,address,logo_url,is_verified,status)').eq('professional_id', professional.id).eq('status', 'active'),
    admin.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', professional.user_id),
    admin.from('user_subscriptions').select('tier,status').eq('user_id', professional.user_id).maybeSingle(),
    supabase.auth.getUser(),
  ])

  const categories = ((catData || []) as CategoryRelation[]).flatMap(row => row.category?.name ? [row.category.name] : [])
  const communities = ((memberData || []) as CommunityRelation[]).flatMap(row => row.community ? [row.community] : [])
  const qualificationsList = (qualifications || []) as Qualification[]
  const associatedSpaces = ((associationRows || []) as SpaceRelation[]).flatMap(row => row.space ? [row.space] : []).filter(space => space.status === 'active')
  const gallery = Array.isArray(professional.gallery_urls) ? professional.gallery_urls.filter((value): value is string => typeof value === 'string' && value.length > 0) : []
  const activeServices = (services || []) as Service[]
  const displayName = professional.professional_name || professional.full_name || 'Profissional'
  const isPremium = Boolean(professional.is_premium) || (subscription?.tier === 'premium' && ['active', 'trialing'].includes(String(subscription?.status)))

  let isFollowing = false
  let hasActiveReservation = false
  if (user && user.id !== professional.user_id) {
    const [{ data: follow }, { data: reservation }] = await Promise.all([
      admin.from('user_follows').select('id').eq('follower_id', user.id).eq('following_id', professional.user_id).maybeSingle(),
      admin.from('reservations').select('id').eq('user_id', user.id).eq('professional_id', professional.id).in('status', ['paid', 'confirmed']).limit(1).maybeSingle(),
    ])
    isFollowing = Boolean(follow)
    hasActiveReservation = Boolean(reservation)
  }

  const followAction = user && user.id !== professional.user_id ? <FollowButton targetUserId={professional.user_id} initialIsFollowing={isFollowing} className="min-h-11 rounded-xl px-4" /> : null
  const messageAction = hasActiveReservation ? <ContactarProfissionalBtn profName={displayName} userId={professional.user_id} /> : null
  const bookingAction = <Link href="#servicos" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"><Dumbbell className="mr-2 h-4 w-4" />Ver serviços</Link>
  const social = professional.social_links && typeof professional.social_links === 'object' ? professional.social_links as Record<string, unknown> : {}
  const website = safeExternalUrl(professional.website)
  const instagramRaw = typeof social.instagram === 'string' ? social.instagram : null
  const instagram = instagramRaw ? safeExternalUrl(instagramRaw.includes('instagram.com') ? instagramRaw : `instagram.com/${instagramRaw.replace(/^@/, '')}`) : null
  const whatsappValue = professional.whatsapp || (typeof social.whatsapp === 'string' ? social.whatsapp : null)
  const whatsapp = whatsappValue ? `https://wa.me/${String(whatsappValue).replace(/\D/g, '')}` : null

  return <main className="min-h-screen bg-background pb-36 sm:pb-0"><EntityHero coverUrl={professional.cover_url || gallery[0]} coverAlt={`Capa de ${displayName}`} avatar={<div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-background text-2xl font-bold text-primary shadow-lg sm:h-24 sm:w-24">{professional.avatar_url ? <AppImage src={professional.avatar_url} alt={displayName} fill sizes="96px" className="object-cover" /> : displayName.charAt(0).toUpperCase()}</div>} title={displayName} subtitle={professional.professional_name && professional.full_name !== professional.professional_name ? professional.full_name : undefined} badges={<><span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">Profissional</span>{professional.is_verified && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-xs font-semibold text-white"><BadgeCheck className="h-3.5 w-3.5" />Verificado</span>}{isPremium && <span className="rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-primary-foreground">Premium</span>}</>} meta={<>{professional.address && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{professional.address}</span>}{Number(professional.rating_avg) > 0 && <span className="flex items-center gap-1 text-amber-300"><Star className="h-4 w-4 fill-current" />{Number(professional.rating_avg).toFixed(1)} ({professional.review_count || 0})</span>}<span className="flex items-center gap-1"><Users className="h-4 w-4" />{followersCount || 0} seguidores</span></>} actions={<>{messageAction}{bookingAction}{followAction}</>} />
    <EntityDetailLayout main={<><DetailSection title="Sobre"><p className="whitespace-pre-line text-sm leading-7 sm:text-base">{professional.bio || 'Este profissional ainda não adicionou uma biografia detalhada.'}</p></DetailSection><div id="servicos"><DetailSection title="Serviços" icon={<Dumbbell className="h-5 w-5 text-primary" />}><ProfessionalServices services={activeServices} professionalId={professional.id} /></DetailSection></div>{categories.length > 0 && <DetailSection title="Especialidades"><div className="flex flex-wrap gap-2">{categories.map(category => <span key={category} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">{category}</span>)}</div></DetailSection>}{qualificationsList.length > 0 && <DetailSection title="Qualificações" icon={<Award className="h-5 w-5 text-amber-500" />}><div className="grid gap-3 sm:grid-cols-2">{qualificationsList.map(qualification => <div key={qualification.id} className="rounded-xl border p-4"><p className="font-semibold">{qualification.title}</p>{qualification.issuer && <p className="mt-1 text-sm text-muted-foreground">{qualification.issuer}</p>}</div>)}</div></DetailSection>}{gallery.length > 0 && <DetailSection title="Galeria"><EntityGallery images={gallery} alt={displayName} /></DetailSection>}<DetailSection title="Avaliações" icon={<Star className="h-5 w-5 text-amber-500" />}><ReviewsSection targetType="professional" targetId={professional.id} /></DetailSection></>} aside={<><DetailSection title="Resumo"><div className="grid grid-cols-2 gap-4 lg:grid-cols-1"><DetailStat label="Avaliação" value={Number(professional.rating_avg) > 0 ? `${Number(professional.rating_avg).toFixed(1)} / 5` : 'Sem avaliações'} /><DetailStat label="Seguidores" value={followersCount || 0} /><DetailStat label="Serviços ativos" value={activeServices.length} />{professional.address && <DetailStat label="Localização" value={professional.address} />}</div>{professional.address && <div className="mt-4"><ObterDirecoesBtn address={professional.address} name={displayName} latitude={professional.latitude} longitude={professional.longitude} /></div>}</DetailSection>{associatedSpaces.length > 0 && <DetailSection title="Espaços associados" icon={<Building2 className="h-5 w-5 text-primary" />}><div className="space-y-2">{associatedSpaces.map(space => <Link key={space.id} href={`/espacos/${space.slug || space.id}`} className="flex min-h-14 items-center gap-3 rounded-xl border p-3"><div className="min-w-0"><p className="truncate font-semibold">{space.name}</p><p className="truncate text-sm text-muted-foreground">{space.address || 'Ver espaço'}</p></div></Link>)}</div></DetailSection>}{communities.length > 0 && <DetailSection title="Comunidades"><div className="space-y-2">{communities.slice(0, 5).map(community => <Link key={community.id} href={`/comunidades/${community.slug || community.id}`} className="flex min-h-11 items-center rounded-xl border px-3 text-sm font-medium">{community.name}</Link>)}</div></DetailSection>}{(messageAction || isPremium && (website || instagram || whatsapp)) && <DetailSection title="Contacto">{messageAction && <div className="mb-3">{messageAction}</div>}{isPremium && <div className="space-y-2">{website && <a href={website} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"><Globe2 className="h-4 w-4" />Website<ExternalLink className="ml-auto h-3.5 w-3.5" /></a>}{instagram && <a href={instagram} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"><Globe2 className="h-4 w-4" />Instagram<ExternalLink className="ml-auto h-3.5 w-3.5" /></a>}{whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"><MessageSquare className="h-4 w-4" />WhatsApp<ExternalLink className="ml-auto h-3.5 w-3.5" /></a>}</div>}</DetailSection>}</>} /><MobileActionBar>{messageAction}{bookingAction}{followAction}</MobileActionBar></main>
}
