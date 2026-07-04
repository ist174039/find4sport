'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Page() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .not('comment', 'is', null)
        .order('created_at', { ascending: false })
      if (data) setReviews(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleKeep = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  const handleRemove = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (!error) {
      setReviews(prev => prev.filter(r => r.id !== id))
    }
  }

  return (
    <div className="space-y-gutter">
{/*  Header & Filters  */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
<div>
<h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Fila de Moderação</h2>
<p className="font-body-md text-on-surface-variant">Analise denúncias de usuários e mantenha a integridade da comunidade FIND4SPORT.</p>
</div>
<div className="flex bg-surface-container p-1 rounded-xl">
<button className="px-6 py-2 rounded-lg font-label-md transition-all bg-surface-container-lowest text-primary shadow-sm flex items-center gap-2">
                        Avaliações
                        <span className="w-5 h-5 bg-error text-on-error text-[10px] rounded-full flex items-center justify-center font-bold">12</span>
</button>
<button className="px-6 py-2 rounded-lg font-label-md transition-all text-on-surface-variant hover:text-on-surface flex items-center gap-2">
                        Perfis
                        <span className="w-5 h-5 bg-outline text-on-surface-variant text-[10px] rounded-full flex items-center justify-center font-bold bg-opacity-20">5</span>
</button>
</div>
</div>
{/*  Moderation Queue  */}
<div className="grid grid-cols-1 gap-6">
          {loading ? (
            <p className="text-center py-10 text-muted-foreground text-sm">A carregar itens para moderação...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground text-sm">Nenhum item pendente de moderação.</p>
          ) : (
            reviews.map((r) => (
              <article key={r.id} className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg group">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-grow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-error-container text-on-error-container text-[10px] font-bold rounded-full uppercase tracking-wider">Avaliação Reportada</span>
                        <span className="text-on-surface-variant text-[12px]">{r.created_at}</span>
                      </div>
                      <div className="flex gap-1 text-trust-gold">
                        {Array.from({ length: r.rating }).map((_, idx) => (
                          <span key={idx} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                        {Array.from({ length: 5 - r.rating }).map((_, idx) => (
                          <span key={idx} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>star</span>
                        ))}
                      </div>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Comentário do Utilizador</h3>
                    <p className="font-body-md text-on-surface bg-surface p-4 rounded-lg italic mb-4 border-l-4 border-primary">
                      "{r.comment}"
                    </p>
                  </div>
                  {/*  Actions Sidebar  */}
                  <div className="w-full md:w-64 bg-surface-container-low p-6 flex flex-col gap-3 justify-center border-l border-border-subtle">
                    <button 
                      onClick={() => handleKeep(r.id)}
                      className="w-full py-2 bg-primary text-white font-label-md rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined">check_circle</span>
                      Manter
                    </button>
                    <button 
                      onClick={() => handleRemove(r.id)}
                      className="w-full py-2 border border-error text-error font-label-md rounded-lg hover:bg-error-container/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined">delete</span>
                      Remover
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
</div>
{/*  Pagination/Footer Actions  */}
<div className="mt-12 flex items-center justify-between border-t border-outline-variant pt-8">
<p className="font-body-md text-on-surface-variant">Mostrando <strong>{reviews.length}</strong> de {reviews.length} itens pendentes</p>
<div className="flex gap-2">
<button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-all">
<span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
</button>
<button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md active-tab-glow">1</button>
<button className="px-4 py-2 border border-outline-variant rounded-lg font-label-md hover:bg-surface-container">2</button>
<button className="px-4 py-2 border border-outline-variant rounded-lg font-label-md hover:bg-surface-container">3</button>
<button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-all">
<span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
    </div>
  )
}
