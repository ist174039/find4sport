import { BadgeCheck, CalendarCheck, Dumbbell, Globe, Images, Mail, MapPin, MessageSquare, Phone, Star, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

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

  // Fallback values if fields are null
  const avatarUrl = professional.avatar_url || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=640&auto=format&fit=crop'
  const bio = professional.bio || 'Este profissional ainda não adicionou uma biografia. Entre em contacto para saber mais sobre as suas especialidades e métodos de treino.'
  
  return (
    <main className="pt-24 pb-20 max-w-[1280px] mx-auto px-4 md:px-12 md:pl-64">
      {/* Top Cover & Header */}
      <div className="relative rounded-2xl overflow-hidden mb-8 shadow-sm border border-border bg-card">
        <div className="h-48 bg-gradient-to-r from-primary/80 to-primary w-full relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-16 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              <div className="w-32 h-32 rounded-full border-4 border-surface-container-lowest bg-muted shadow-md overflow-hidden shrink-0">
                <img src={avatarUrl} alt={professional.full_name} className="w-full h-full object-cover" />
              </div>
              
              <div className="mb-2">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="font-bold text-2xl text-3xl font-bold text-foreground">
                    {professional.full_name}
                  </h1>
                  {professional.is_verified && (
                    <BadgeCheck className="text-primary text-[24px]" />
                  )}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-4 text-muted-foreground text-sm">
                  <span className="bg-emerald-500/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold">
                    Profissional
                  </span>
                  {professional.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="text-[16px]" />
                      {professional.address}
                    </span>
                  )}
                  {professional.rating_avg && (
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="text-[16px]" />
                      <span className="font-bold text-foreground">{professional.rating_avg}</span>
                      <span className="text-muted-foreground font-normal">({professional.review_count || 0})</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mb-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none bg-muted text-muted-foreground px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-accent hover:text-foreground transition-all flex items-center justify-center gap-2">
                <MessageSquare className="text-[20px]" />
                Mensagem
              </button>
              <button className="flex-1 md:flex-none bg-primary text-primary-foreground px-8 py-2.5 rounded-lg font-medium text-sm shadow-sm hover:shadow-md hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-2">
                <CalendarCheck className="text-[20px]" />
                Marcar Aula
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card p-8 rounded-2xl border border-border shadow-sm">
            <h2 className="font-semibold text-xl text-xl mb-4 text-foreground flex items-center gap-2">
              <User className="text-primary h-5 w-5" />
              Sobre Mim
            </h2>
            <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
              {bio}
            </p>
          </section>

          {professional.gallery_urls && professional.gallery_urls.length > 0 && (
            <section className="bg-card p-8 rounded-2xl border border-border shadow-sm">
              <h2 className="font-semibold text-xl text-xl mb-4 text-foreground flex items-center gap-2">
                <Images className="text-primary h-5 w-5" />
                Galeria
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {professional.gallery_urls.map((img: string, i: number) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-sm">
                    <img src={img} alt={`Galeria ${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column (Sidebar Info) */}
        <div className="space-y-8">
          <section className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="font-semibold text-lg text-lg mb-4 text-foreground">Contactos & Links</h3>
            <ul className="space-y-4">
              {professional.phone && (
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Phone className="text-primary bg-primary/10 p-2 rounded-lg h-5 w-5" />
                  {professional.phone}
                </li>
              )}
              {professional.email && (
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Mail className="text-primary bg-primary/10 p-2 rounded-lg h-5 w-5" />
                  {professional.email}
                </li>
              )}
              {professional.social_links && (
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Globe className="text-primary bg-primary/10 p-2 rounded-lg h-5 w-5" />
                  Redes Sociais Disponíveis
                </li>
              )}
            </ul>
          </section>
          
          <section className="bg-gradient-to-br from-primary-container to-surface-container-lowest p-6 rounded-2xl border border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <Dumbbell className="text-[120px]" />
            </div>
            <h3 className="font-semibold text-lg text-lg mb-2 text-primary relative z-10">Especialidades</h3>
            <div className="flex flex-wrap gap-2 relative z-10 mt-4">
              <span className="bg-card text-foreground px-3 py-1 rounded-full text-xs border border-border shadow-sm">Musculação</span>
              <span className="bg-card text-foreground px-3 py-1 rounded-full text-xs border border-border shadow-sm">Perda de Peso</span>
              <span className="bg-card text-foreground px-3 py-1 rounded-full text-xs border border-border shadow-sm">Nutrição Desportiva</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
