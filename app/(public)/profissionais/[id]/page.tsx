import Link from 'next/link'
import { Award, BadgeCheck, Building2, Dumbbell, ExternalLink, Globe2, MapPin, MessageSquare, Star, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { ContactarProfissionalBtn } from '@/components/professional-actions'
import { ObterDirecoesBtn } from '@/components/space-actions'
import { ReviewsSection } from '@/components/reviews-section'
import { ProfessionalServices } from '@/components/professional-services'
import { FollowButton } from '@/components/follow-button'
import { EntityGallery } from '@/components/patterns/entity-gallery'
import { EntityHero, EntityDetailLayout, DetailSection, DetailStat, MobileActionBar } from '@/components/patterns/entity-detail'

function safeExternalUrl(value?: string | null) {
  if (!value) return null
  try { return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).toString() } catch { return null }
}

export default async function ProfessionalProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { id: rawId } = await params
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)
  let professional: any = null
  if (isUuid) professional = (await admin.from('professionals').select('*').eq('id', rawId).maybeSingle()).data
  if (!professional) professional = (await admin.from('professionals').select('*').eq('public_slug', rawId).maybeSingle()).data
  if (!professional || professional.status !== 'active') notFound()
  void supabase.rpc('increment_professional_views', { prof_id: professional.id })

  const [{ data: catData }, { data: qualifications }, { data: memberData }, { data: services }, { data: associationRows }, { count: followersCount }, { data: subscription }, { data: { user } }] = await Promise.all([
    admin.from('professional_categories').select('category:categories(name)').eq('professional_id', professional.id),
    admin.from('qualifications').select('*').eq('professional_id', professional.id).order('created_at', { ascending: false }),
    admin.from('community_members').select('community:communities(*)').eq('user_id', professional.user_id),
    admin.from('services').select('*').eq('professional_id', professional.id).eq('is_active', true).order('created_at', { ascending: false }),
    admin.from('space_professionals').select('space:sport_spaces(id,name,slug,address,logo_url,is_verified,status)').eq('professional_id', professional.id).eq('status', 'active'),
    admin.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', professional.user_id),
    admin.from('user_subscriptions').select('tier,status').eq('user_id', professional.user_id).maybeSingle(),
    supabase.auth.getUser(),
  ])

  const categories = catData?.map((item: any) => item.category?.name).filter(Boolean) || []
  const communities = memberData?.map((item: any) => item.community).filter(Boolean) || []
  const associatedSpaces = (associationRows || []).map((row: any) => row.space).filter((space: any) => space && (space.is_verified || space.status === 'active'))
  const gallery = Array.isArray(professional.gallery_urls) ? professional.gallery_urls.filter(Boolean) : []
  const displayName = professional.professional_name || professional.full_name
  const coverUrl = professional.cover_url || gallery[0] || null
  const avatarUrl = professional.avatar_url || null
  const bio = professional.bio || 'Este profissional ainda não adicionou uma biografia detalhada.'
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
  const bookingAction = <Link href="#servicos" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Dumbbell className="mr-2 h-4 w-4" />Ver serviços</Link>
  const social = professional.social_links && typeof professional.social_links === 'object' ? professional.social_links as Record<string, unknown> : {}
  const website = safeExternalUrl(professional.website)
  const instagramRaw = typeof social.instagram === 'string' ? social.instagram : null
  const instagram = instagramRaw ? safeExternalUrl(instagramRaw.includes('instagram.com') ? instagramRaw : `instagram.com/${instagramRaw.replace(/^@/, '')}`) : null
  const whatsappValue = professional.whatsapp || (typeof social.whatsapp === 'string' ? social.whatsapp : null)
  const whatsapp = whatsappValue ? `https://wa.me/${String(whatsappValue).replace(/\D/g, '')}` : null
  const hasPremiumContacts = isPremium && Boolean(website || instagram || whatsapp)

  return <main className="min-h-screen bg-background pb-36 sm:pb-0">
    <EntityHero coverUrl={coverUrl} coverAlt={`Capa de ${displayName}`} avatar={<div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-background text-2xl font-bold text-primary shadow-lg sm:h-24 sm:w-24">{avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" /> : displayName?.charAt(0)?.toUpperCase()}</div>} title={displayName} subtitle={professional.professional_name && professional.full_name !== professional.professional_name ? professional.full_name : undefined} badges={<><span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">Profissional</span>{professional.is_verified && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-xs font-semibold text-white"><BadgeCheck className="h-3.5 w-3.5" />Verificado</span>}{isPremium && <span className="rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-primary-foreground">Premium</span>}</>} meta={<>{professional.address && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{professional.address}</span>}{professional.rating_avg > 0 && <span className="flex items-center gap-1 text-amber-300"><Star className="h-4 w-4 fill-current" />{Number(professional.rating_avg).toFixed(1)} ({professional.review_count || 0})</span>}<span className="flex items-center gap-1"><Users className="h-4 w-4" />{followersCount || 0} seguidores</span></>} actions={<>{messageAction || bookingAction}{followAction}</>} />

    <EntityDetailLayout main={<>
      <DetailSection title="Sobre" description="Apresentação pública do profissional."><p className="whitespace-pre-line text-sm leading-7 text-foreground sm:text-base">{bio}</p></DetailSection>
      <div id="servicos"><DetailSection title="Serviços" icon={<Dumbbell className="h-5 w-5 text-primary" />}><ProfessionalServices services={services || []} professionalId={professional.id} /></DetailSection></div>
      {categories.length > 0 && <DetailSection title="Especialidades"><div className="flex flex-wrap gap-2">{categories.map((category: string) => <span key={category} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">{category}</span>)}</div></DetailSection>}
      {qualifications && qualifications.length > 0 && <DetailSection title="Qualificações" icon={<Award className="h-5 w-5 text-amber-500" />}><div className="grid gap-3 sm:grid-cols-2">{qualifications.map((qualification: any) => <div key={qualification.id} className="rounded-xl border border-border bg-muted/20 p-4"><p className="font-semibold text-foreground">{qualification.title}</p>{qualification.issuer && <p className="mt-1 text-sm text-muted-foreground">{qualification.issuer}</p>}</div>)}</div></DetailSection>}
      {gallery.length > 0 && <DetailSection title="Galeria"><EntityGallery images={gallery} alt={displayName} /></DetailSection>}
      <DetailSection title="Avaliações" icon={<Star className="h-5 w-5 text-amber-500" />}><ReviewsSection targetType="professional" targetId={professional.id} /></DetailSection>
    </>} aside={<>
      <DetailSection title="Resumo"><div className="grid grid-cols-2 gap-4 lg:grid-cols-1"><DetailStat label="Avaliação" value={professional.rating_avg > 0 ? `${Number(professional.rating_avg).toFixed(1)} / 5` : 'Sem avaliações'} /><DetailStat label="Seguidores" value={followersCount || 0} /><DetailStat label="Serviços ativos" value={(services || []).length} />{professional.address && <DetailStat label="Localização" value={professional.address} />}</div>{professional.address && <div className="mt-4"><ObterDirecoesBtn address={professional.address} name={displayName} latitude={professional.latitude} longitude={professional.longitude} /></div>}</DetailSection>
      {associatedSpaces.length > 0 && <DetailSection title={associatedSpaces.length === 1 ? 'Espaço associado' : 'Espaços associados'} icon={<Building2 className="h-5 w-5 text-primary" />}><div className="space-y-2">{associatedSpaces.map((space: any) => <Link key={space.id} href={`/espacos/${space.slug || space.id}`} className="flex min-h-14 items-center gap-3 rounded-xl border border-border p-3 transition hover:border-primary/40">{space.logo_url ? <img src={space.logo_url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>}<div className="min-w-0"><p className="truncate font-semibold text-foreground">{space.name}</p><p className="truncate text-sm text-muted-foreground">{space.address || 'Ver espaço'}</p></div></Link>)}</div></DetailSection>}
      {communities.length > 0 && <DetailSection title="Comunidades"><div className="space-y-2">{communities.slice(0, 5).map((community: any) => <Link key={community.id} href={`/comunidades/${community.slug || community.id}`} className="flex min-h-11 items-center rounded-xl border border-border px-3 text-sm font-medium hover:border-primary/40">{community.name}</Link>)}</div></DetailSection>}
      {(messageAction || hasPremiumContacts) && <DetailSection title="Contacto">{messageAction && <div className="mb-3"><p className="mb-2 text-sm text-muted-foreground">Chat disponível porque existe uma reserva ativa.</p>{messageAction}</div>}{hasPremiumContacts && <div className="space-y-2 border-t border-border pt-3"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contactos externos · Premium</p>{website&&<a href={website} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium hover:border-primary/40"><Globe2 className="h-4 w-4 text-primary"/>Website<ExternalLink className="ml-auto h-3.5 w-3.5"/></a>}{instagram&&<a href={instagram} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium hover:border-primary/40"><Globe2 className="h-4 w-4 text-primary"/>Instagram<ExternalLink className="ml-auto h-3.5 w-3.5"/></a>}{whatsapp&&<a href={whatsapp} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium hover:border-primary/40"><MessageSquare className="h-4 w-4 text-primary"/>WhatsApp<ExternalLink className="ml-auto h-3.5 w-3.5"/></a>}</div>}</DetailSection>}
    </>} />
    <MobileActionBar>{messageAction || bookingAction}{followAction || <Link href="/profissionais" className="inline-flex items-center justify-center rounded-xl border border-border px-4 text-sm font-medium">Ver profissionais</Link>}</MobileActionBar>
  </main>
}
