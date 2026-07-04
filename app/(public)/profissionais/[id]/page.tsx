import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ProfessionalProfilePage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // 1. Fetch professional data
  const { data: professional, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !professional) {
    return notFound()
  }

  // Fallback values if fields are null
  const avatarUrl = professional.avatar_url || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=640&auto=format&fit=crop'
  const bio = professional.bio || 'Este profissional ainda não adicionou uma biografia. Entre em contacto para saber mais sobre as suas especialidades e métodos de treino.'
  
  return (
    <main className="pt-24 pb-20 max-w-[1280px] mx-auto px-4 md:px-12 md:pl-64">
      {/* Top Cover & Header */}
      <div className="relative rounded-2xl overflow-hidden mb-8 shadow-sm border border-border-subtle bg-surface-container-lowest">
        <div className="h-48 bg-gradient-to-r from-primary/80 to-primary w-full relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-16 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              <div className="w-32 h-32 rounded-full border-4 border-surface-container-lowest bg-surface-container shadow-md overflow-hidden shrink-0">
                <img src={avatarUrl} alt={professional.full_name} className="w-full h-full object-cover" />
              </div>
              
              <div className="mb-2">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="font-display-md text-3xl font-bold text-text-primary">
                    {professional.full_name}
                  </h1>
                  {professional.is_verified && (
                    <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-4 text-on-surface-variant text-label-md">
                  <span className="bg-success-mint text-primary px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold">
                    Profissional
                  </span>
                  {professional.address && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {professional.address}
                    </span>
                  )}
                  {professional.rating_avg && (
                    <span className="flex items-center gap-1 text-trust-gold">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-bold text-text-primary">{professional.rating_avg}</span>
                      <span className="text-on-surface-variant font-normal">({professional.review_count || 0})</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mb-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none bg-surface-container-high text-on-surface-variant px-6 py-2.5 rounded-lg font-label-md hover:bg-surface-container-highest hover:text-text-primary transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">chat</span>
                Mensagem
              </button>
              <button className="flex-1 md:flex-none bg-primary text-on-primary px-8 py-2.5 rounded-lg font-label-md shadow-sm hover:shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">event_available</span>
                Marcar Aula
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-surface-container-lowest p-8 rounded-2xl border border-border-subtle shadow-sm">
            <h2 className="font-headline-md text-xl mb-4 text-text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span>
              Sobre Mim
            </h2>
            <p className="text-body-lg text-on-surface leading-relaxed whitespace-pre-line">
              {bio}
            </p>
          </section>

          {professional.gallery_urls && professional.gallery_urls.length > 0 && (
            <section className="bg-surface-container-lowest p-8 rounded-2xl border border-border-subtle shadow-sm">
              <h2 className="font-headline-md text-xl mb-4 text-text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">photo_library</span>
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
          <section className="bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle shadow-sm">
            <h3 className="font-headline-sm text-lg mb-4 text-text-primary">Contactos & Links</h3>
            <ul className="space-y-4">
              {professional.phone && (
                <li className="flex items-center gap-3 text-body-md text-on-surface">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">call</span>
                  {professional.phone}
                </li>
              )}
              {professional.email && (
                <li className="flex items-center gap-3 text-body-md text-on-surface">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">mail</span>
                  {professional.email}
                </li>
              )}
              {professional.social_links && (
                <li className="flex items-center gap-3 text-body-md text-on-surface">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">language</span>
                  Redes Sociais Disponíveis
                </li>
              )}
            </ul>
          </section>
          
          <section className="bg-gradient-to-br from-primary-container to-surface-container-lowest p-6 rounded-2xl border border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <span className="material-symbols-outlined text-[120px]">fitness_center</span>
            </div>
            <h3 className="font-headline-sm text-lg mb-2 text-on-primary-container relative z-10">Especialidades</h3>
            <div className="flex flex-wrap gap-2 relative z-10 mt-4">
              <span className="bg-surface-container-lowest text-text-primary px-3 py-1 rounded-full text-label-sm border border-border-subtle shadow-sm">Musculação</span>
              <span className="bg-surface-container-lowest text-text-primary px-3 py-1 rounded-full text-label-sm border border-border-subtle shadow-sm">Perda de Peso</span>
              <span className="bg-surface-container-lowest text-text-primary px-3 py-1 rounded-full text-label-sm border border-border-subtle shadow-sm">Nutrição Desportiva</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
