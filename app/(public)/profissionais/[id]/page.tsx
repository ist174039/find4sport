import { 
  BadgeCheck, Building2, Calendar, Car, Coffee, Dumbbell, Globe, Images, 
  Mail, MapPin, Navigation, Phone, ShowerHead, Star, User, Users, Wifi, ExternalLink, Award, ShieldCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ContactarProfissionalBtn } from '@/components/professional-actions'
import { ObterDirecoesBtn } from '@/components/space-actions'
import { ReviewsSection } from '@/components/reviews-section'
import { ProfessionalServices } from '@/components/professional-services'
import { FollowButton } from '@/components/follow-button'
import { FollowStats } from '@/components/follow-stats'

export default async function ProfessionalProfilePage(props: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id: rawId } = await props.params

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)

  let professional = null
  if (isUuid) {
    const { data } = await supabase.from('professionals').select('*').eq('id', rawId).maybeSingle()
    professional = data
  }

  if (!professional) {
    const { data } = await supabase.from('professionals').select('*').eq('public_slug', rawId).maybeSingle()
    professional = data
  }

  if (!professional) {
    return notFound()
  }

  // Fetch categories for this professional
  const { data: catData } = await supabase
    .from('professional_categories')
    .select('category:categories(name)')
    .eq('professional_id', professional.id)

  const categoriesList = catData?.map((c: any) => c.category?.name).filter(Boolean) || []

  // Fetch qualifications
  const { data: qualifications } = await supabase
    .from('qualifications')
    .select('*')
    .eq('professional_id', professional.id)
    .order('created_at', { ascending: false })

  // Fetch communities joined by this professional
  const { data: memberData } = await supabase
    .from('community_members')
    .select('community:communities(*)')
    .eq('user_id', professional.user_id)

  const communities = memberData?.map((m: any) => m.community).filter(Boolean) || []

  // Fetch active services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('professional_id', professional.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Fetch associated sport space (if owner or created_by)
  const { data: associatedSpace } = await supabase
    .from('sport_spaces')
    .select('*')
    .or(`owner_user_id.eq.${professional.user_id},created_by.eq.${professional.user_id}`)
    .maybeSingle()

  // Fetch Follow stats
  const { count: followersCount } = await supabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', professional.user_id)

  const { count: followingCount } = await supabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', professional.user_id)

  let isFollowing = false
  const { data: { user } } = await supabase.auth.getUser()
  if (user && user.id !== professional.user_id) {
    const { data: followRel } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', professional.user_id)
      .maybeSingle()
    if (followRel) isFollowing = true
  }

  // Fallback values
  const coverUrl = professional.cover_url || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1920&auto=format&fit=crop'
  const avatarUrl = professional.avatar_url || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=640&auto=format&fit=crop'
  const bio = professional.bio || 'Este profissional ainda não adicionou uma biografia detalhada. Entre em contacto direto para saber mais sobre os seus serviços e planos de treino.'

  return (
    <main className="flex flex-col min-h-screen bg-background">
      {/* Immersive Cover Section (Full Width Top) */}
      <section className="relative w-full h-[250px] md:h-[350px] bg-muted">
        <img src={coverUrl} alt="Capa do profissional" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        
        {/* Cover Content Bottom Aligned */}
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-6 relative">
            
            <div className="flex-1 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white border-2 border-white flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
                    <img src={avatarUrl} alt={professional.full_name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                        {professional.full_name}
                      </h1>
                      {professional.is_verified && (
                        <BadgeCheck className="text-amber-500 text-[28px] drop-shadow-md" />
                      )}
                    </div>
                    
                    {professional.professional_name && (
                      <p className="text-sm font-semibold text-primary-foreground/90 mt-0.5">
                        {professional.professional_name}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm mt-2">
                      <span className="bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[11px] border border-white/10">
                        Profissional Desportivo
                      </span>
                      {associatedSpace && (
                        <span className="bg-emerald-500/80 backdrop-blur-md text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[11px] border border-emerald-400/30 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {associatedSpace.name}
                        </span>
                      )}
                      {professional.address && (
                        <span className="flex items-center gap-1 font-medium drop-shadow">
                          <MapPin className="text-[18px]" />
                          {professional.address}
                        </span>
                      )}
                      {professional.rating_avg !== null && professional.rating_avg > 0 && (
                        <span className="flex items-center gap-1 text-amber-400 font-bold drop-shadow">
                          <Star className="text-[18px] fill-amber-400" />
                          <span>{Number(professional.rating_avg).toFixed(1)}</span>
                          <span className="text-white/70 font-normal">({professional.review_count || 0})</span>
                        </span>
                      )}
                      <div className="h-4 w-px bg-white/30 hidden sm:block"></div>
                      <FollowStats
                        targetUserId={professional.user_id}
                        followersCount={followersCount || 0}
                        followingCount={followingCount || 0}
                        variant="dark"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pb-1 w-full md:w-auto mt-4 md:mt-0">
                {user && user.id !== professional.user_id && (
                  <FollowButton 
                    targetUserId={professional.user_id} 
                    initialIsFollowing={isFollowing} 
                  />
                )}
                <ContactarProfissionalBtn 
                  profName={professional.full_name} 
                  userId={professional.user_id} 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
          {/* Left Column (Main Info) */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
              <h2 className="font-semibold text-xl md:text-2xl mb-4 text-foreground flex items-center gap-2">
                <User className="text-primary h-5 w-5" />
                Sobre Mim
              </h2>
              <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
                {bio}
              </p>
            </section>

            {/* Services Section */}
            <ProfessionalServices services={services || []} professionalId={professional.id} />

            {/* Specialties & Categories */}
            {categoriesList.length > 0 && (
              <section className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
                <h2 className="font-semibold text-xl md:text-2xl mb-4 text-foreground flex items-center gap-2">
                  <Dumbbell className="text-primary h-5 w-5" />
                  Especialidades & Modalidades
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {categoriesList.map((catName: string, i: number) => (
                    <span key={i} className="bg-primary/10 text-primary border border-primary/20 font-bold px-4 py-2 rounded-xl text-sm shadow-sm">
                      {catName}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Qualifications & Certifications Section */}
            {qualifications && qualifications.length > 0 && (
              <section className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
                <h2 className="font-semibold text-xl md:text-2xl mb-6 text-foreground flex items-center gap-2">
                  <Award className="text-amber-500 h-5 w-5" />
                  Qualificações & Certificações
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {qualifications.map((q: any) => (
                    <div key={q.id} className="p-4 bg-muted/20 border border-border rounded-xl flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">{q.title}</h4>
                          <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-1.5 py-0.2 border-0">
                            Verificado
                          </Badge>
                        </div>
                        {q.issuer && <p className="text-xs text-muted-foreground mt-0.5">{q.issuer}</p>}
                        {q.issue_date && (
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Emitido em: {new Date(q.issue_date).toLocaleDateString('pt-PT', { year: 'numeric', month: 'short' })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Communities Joined Section */}
            {communities.length > 0 && (
              <section className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
                <h2 className="font-semibold text-xl md:text-2xl mb-6 text-foreground flex items-center gap-2">
                  <Users className="text-primary h-5 w-5" />
                  Comunidades em que Participa ({communities.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {communities.map((comm: any) => (
                    <Link 
                      key={comm.id} 
                      href={`/comunidades/${comm.id}`}
                      className="group flex items-center gap-3 p-4 bg-muted/20 border border-border rounded-xl hover:border-primary/50 hover:shadow-sm transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 overflow-hidden border border-border">
                        {comm.cover_image_url ? (
                          <img src={comm.cover_image_url} alt={comm.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                          comm.name?.charAt(0).toUpperCase() || 'C'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                          {comm.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">{comm.sport_category || 'Comunidade Desportiva'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery */}
            {professional.gallery_urls && professional.gallery_urls.length > 0 && (
              <section className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
                <h2 className="font-semibold text-xl md:text-2xl mb-6 text-foreground flex items-center gap-2">
                  <Images className="text-primary h-5 w-5" />
                  Galeria de Fotos
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {professional.gallery_urls.slice(0, 4).map((img: string, i: number) => (
                    <div key={i} className={`rounded-2xl overflow-hidden shadow-sm ${i === 0 ? 'col-span-2 aspect-[21/9]' : 'aspect-square'}`}>
                      <img src={img} alt={`Instalações / Treinos ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (Sidebar Info) */}
          <div className="space-y-6">
            
            {/* Espaço Desportivo Associado */}
            <section className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <Building2 className="text-primary h-5 w-5" />
                Espaço Desportivo
              </h3>

              {associatedSpace ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border">
                    <div className="w-14 h-14 rounded-xl bg-background overflow-hidden shrink-0 border border-border">
                      <img 
                        src={associatedSpace.logo_url || associatedSpace.cover_url || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=200&auto=format&fit=crop'} 
                        alt={associatedSpace.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-foreground truncate">{associatedSpace.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{associatedSpace.address || 'Espaço de Treino'}</p>
                      <span className="inline-block bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded mt-1">
                        Profissional Residente / Gestor
                      </span>
                    </div>
                  </div>

                  <Link 
                    href={`/espacos/${associatedSpace.slug || associatedSpace.id}`} 
                    className="block w-full text-center py-2.5 bg-primary/10 text-primary font-bold rounded-xl text-xs hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    Ver Espaço Desportivo
                  </Link>
                </div>
              ) : (
                <div className="bg-muted/30 p-4 rounded-xl border border-border text-center space-y-1">
                  <span className="inline-block bg-secondary text-secondary-foreground text-xs font-bold px-2.5 py-0.5 rounded-full mb-1">
                    Profissional Independente
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Realiza treinos ao domicílio, em parques/exterior ou instalações parceiras.
                  </p>
                </div>
              )}
            </section>

            {/* Map/Location Section */}
            <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
              <div className="h-40 bg-accent relative">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" alt="Map" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="text-[48px] text-destructive drop-shadow-lg" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-foreground">Localização</h3>
                <p className="text-sm text-muted-foreground mb-4">{professional.address || 'Localização sob consulta'}</p>
                <ObterDirecoesBtn 
                  address={professional.address} 
                  name={professional.full_name} 
                  latitude={professional.latitude} 
                  longitude={professional.longitude} 
                />
              </div>
            </section>

            {/* Contact Section */}
            <section className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Contactos</h3>
              <ul className="space-y-4">
                {professional.phone && (
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <Phone className="text-primary bg-primary/10 p-2.5 rounded-xl h-5 w-5" />
                    {professional.phone}
                  </li>
                )}
                {professional.email && (
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <Mail className="text-primary bg-primary/10 p-2.5 rounded-xl h-5 w-5" />
                    {professional.email}
                  </li>
                )}
                {professional.website && (
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <Globe className="text-primary bg-primary/10 p-2.5 rounded-xl h-5 w-5" />
                    <a href={professional.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary truncate">
                      {professional.website}
                    </a>
                  </li>
                )}
              </ul>
            </section>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <ReviewsSection targetType="professional" targetId={professional.id} />
        </div>
      </section>
    </main>
  )
}
