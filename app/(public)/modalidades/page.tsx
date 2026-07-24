import { Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SuggestModalityModal } from '@/components/suggest-modality-modal'

export default async function ModalitiesPage() {
  const supabase = await createClient()

  // Fetch all sports categories
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  const safeCategories = categories || []

  // Fallback beautiful colors if not provided by DB
  const gradients = [
    'from-blue-500 to-cyan-400',
    'from-emerald-500 to-teal-400',
    'from-orange-500 to-amber-400',
    'from-purple-500 to-fuchsia-400',
    'from-rose-500 to-pink-400',
    'from-indigo-500 to-blue-400',
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="border-b border-border bg-muted/30 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl text-center md:text-left mb-4">
            Modalidades
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl text-center md:text-left">
            Explora o desporto ideal para ti. Temos dezenas de opções disponíveis na plataforma para te manteres ativo, com acompanhamento profissional.
          </p>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-8 sm:py-12 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {safeCategories.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                Nenhuma modalidade encontrada.
              </div>
            ) : (
              safeCategories.map((cat, index) => {
                const gradient = gradients[index % gradients.length]
                return (
                  <Link 
                    key={cat.id} 
                    href={`/pesquisa?category=${cat.slug}`}
                    className={`relative group aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-primary/50 bg-gradient-to-br ${gradient}`}
                  >
                    {/* Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
                    
                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-white text-center z-10">
                      <span className="text-5xl md:text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                        {cat.emoji || '🏅'}
                      </span>
                      <h3 className="font-semibold text-lg md:text-xl drop-shadow-sm group-hover:text-white/90">
                        {cat.name}
                      </h3>
                    </div>
                  </Link>
                )
              })
            )}
          </div>

          {/* Hero CTA below grid */}
          <div className="mt-16 bg-card border border-border rounded-2xl p-8 md:p-12 text-center relative overflow-hidden shadow-sm">
            <div className="absolute -right-16 -top-16 opacity-[0.03] text-foreground">
              <Activity className="text-[300px]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 relative z-10">Não encontras o que procuras?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8 relative z-10">
              A nossa plataforma está em constante expansão. Diz-nos qual é a modalidade que gostarias de ver aqui.
            </p>
            <SuggestModalityModal />
          </div>
        </div>
      </section>
    </div>
  )
}
