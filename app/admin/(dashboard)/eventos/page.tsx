'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Page() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEvents() {
      const supabase = createClient()
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: false })
      if (data) setEvents(data)
      setLoading(false)
    }
    loadEvents()
  }, [])

  const handleApprove = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('events').update({ status: 'approved' }).eq('id', id)
    if (!error) {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' } : e))
      showToast('Evento aprovado com sucesso!')
    }
  }

  const handleReject = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('events').update({ status: 'rejected' }).eq('id', id)
    if (!error) {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' } : e))
      showToast('Evento rejeitado com sucesso!')
    }
  }

  const showToast = (message: string) => {
    const toast = document.getElementById('toast')
    const toastText = document.getElementById('toast-text')
    if (toast) {
      if (toastText) toastText.innerText = message
      toast.style.opacity = '1'
      toast.style.transform = 'translateY(0)'
      setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transform = 'translateY(24px)'
      }, 3000)
    }
  }

  return (
    <div className="space-y-gutter">
{/*  Header Section  */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
<div>
<h2 className="font-headline-lg text-headline-lg text-text-primary mb-2">Gerenciamento de Eventos</h2>
<div className="flex items-center gap-4">
<span className="flex items-center gap-1 text-on-surface-variant font-body-md">
<span className="material-symbols-outlined text-[18px]" data-icon="calendar_today">calendar_today</span>
                        {events.filter(e => e.status === 'approved').length} Eventos Ativos
                    </span>
<span className="flex items-center gap-1 text-on-surface-variant font-body-md">
<span className="material-symbols-outlined text-[18px]" data-icon="pending_actions">pending_actions</span>
                        {events.filter(e => e.status === 'pending').length} Aguardando Validação
                    </span>
</div>
</div>
{/*  View Toggles & Filters  */}
<div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant">
<button className="flex items-center gap-2 px-6 py-2 rounded-lg bg-surface-container-lowest text-primary shadow-sm font-label-md text-label-md transition-all" id="listViewBtn">
<span className="material-symbols-outlined text-[20px]" data-icon="list">list</span>
                    Lista
                </button>
<button className="flex items-center gap-2 px-6 py-2 rounded-lg text-on-surface-variant hover:text-primary font-label-md text-label-md transition-all" id="calendarViewBtn">
<span className="material-symbols-outlined text-[20px]" data-icon="calendar_month">calendar_month</span>
                    Calendário
                </button>
</div>
</div>
{/*  Bento Layout Grid  */}
<div className="grid grid-cols-12 gap-gutter">
{/*  Validation Queue  */}
<div className="col-span-12 lg:col-span-4 space-y-gutter">
<section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 h-fit">
<div className="flex items-center justify-between mb-6">
<h3 className="font-headline-md text-headline-md text-text-primary">Fila de Validação</h3>
<span className="bg-primary text-on-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
  {events.filter(e => e.status === 'pending').length}
</span>
</div>
<div className="space-y-4">
  {events.filter(e => e.status === 'pending').length === 0 ? (
    <p className="text-xs text-muted-foreground text-center py-4">Nenhum evento pendente</p>
  ) : (
    events.filter(e => e.status === 'pending').slice(0, 3).map(e => (
      <div key={e.id} className="p-4 rounded-lg bg-background border border-outline-variant hover:border-primary transition-colors group cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-tertiary-fixed-variant bg-tertiary-fixed px-2 py-0.5 rounded">Desporto</span>
          <span className="text-[10px] text-on-surface-variant">Pendente</span>
        </div>
        <h4 className="font-label-md text-label-md text-text-primary group-hover:text-primary transition-colors">{e.title}</h4>
        <p className="text-[12px] text-on-surface-variant mt-1 mb-3">Data: <span className="font-bold">{e.start_date}</span></p>
        <div className="flex gap-2">
          <button 
            onClick={() => handleApprove(e.id)}
            className="flex-1 text-[12px] font-bold py-1.5 rounded bg-primary text-white hover:opacity-90 cursor-pointer"
          >
            Aprovar
          </button>
          <button 
            onClick={() => handleReject(e.id)}
            className="px-2 py-1.5 rounded border border-outline-variant text-on-surface-variant hover:bg-error-container hover:text-error hover:border-error transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    ))
  )}
</div>
<button className="w-full mt-6 py-2 text-on-surface-variant hover:text-primary font-label-md text-label-md border-t border-outline-variant pt-4 flex items-center justify-center gap-1 transition-colors">
                        Ver todas as solicitações
                        <span className="material-symbols-outlined text-[18px]" data-icon="arrow_forward">arrow_forward</span>
</button>
</section>
{/*  Quick Stats  */}
<div className="bg-primary-container rounded-xl p-6 text-on-primary-container">
<h3 className="font-label-md text-label-md uppercase tracking-widest opacity-80 mb-4">Métricas do Mês</h3>
<div className="space-y-4">
<div className="flex justify-between items-end">
<div>
<p className="text-3xl font-black">156</p>
<p className="text-xs opacity-80">Novas Inscrições</p>
</div>
<span className="bg-success-mint text-on-tertiary-fixed-variant px-2 py-0.5 rounded text-[10px] font-bold mb-1">+12%</span>
</div>
<div className="flex justify-between items-end">
<div>
<p className="text-3xl font-black">R$ 12.4k</p>
<p className="text-xs opacity-80">Receita Gerada</p>
</div>
<span className="bg-success-mint text-on-tertiary-fixed-variant px-2 py-0.5 rounded text-[10px] font-bold mb-1">+5.4%</span>
</div>
</div>
</div>
</div>
{/*  Events List Section  */}
<div className="col-span-12 lg:col-span-8">
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
{/*  Filters Bar  */}
<div className="p-4 border-b border-outline-variant flex flex-wrap gap-4 items-center justify-between">
<div className="flex gap-2">
<button className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md">Todos</button>
<button className="px-4 py-1.5 rounded-full hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors">Próximos</button>
<button className="px-4 py-1.5 rounded-full hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors">Passados</button>
<button className="px-4 py-1.5 rounded-full hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors">Rascunhos</button>
</div>
<button className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors">
<span className="material-symbols-outlined text-[20px]" data-icon="filter_list">filter_list</span>
                            Filtros Avançados
                        </button>
</div>
{/*  Events Table  */}
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low border-b border-outline-variant">
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Evento</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Data & Hora</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Status</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Vagas</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant text-right">Ações</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">A carregar eventos...</td>
                      </tr>
                    ) : events.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">Nenhum evento encontrado.</td>
                      </tr>
                    ) : (
                      events.map((e) => (
                        <tr key={e.id} className="hover:bg-surface-bright transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden shrink-0">
                                <img alt={e.title} className="w-full h-full object-cover" src={e.image_url || "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=150"} />
                              </div>
                              <div>
                                <p className="font-label-md text-label-md text-text-primary font-bold">{e.title}</p>
                                <p className="text-[12px] text-on-surface-variant">{e.address || 'Sem localização'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-label-md text-on-surface-variant">
                              <p className="font-bold text-text-primary">{e.start_date}</p>
                              <p className="text-[12px]">{e.start_time || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-[11px] font-bold ${
                              e.status === 'approved' ? 'bg-success-mint text-primary' :
                              e.status === 'rejected' ? 'bg-red-50 text-red-600' :
                              'bg-amber-50 text-amber-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                e.status === 'approved' ? 'bg-primary' :
                                e.status === 'rejected' ? 'bg-red-500' :
                                'bg-amber-500'
                              }`}></span>
                              {e.status === 'approved' ? 'Aprovado' : e.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-full max-w-[80px]">
                              <div className="flex justify-between text-[10px] mb-1">
                                <span className="">{e.current_participants || 0}/{e.capacity || 0}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-all">
                              <span className="material-symbols-outlined text-[20px]">more_vert</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
</table>
</div>
{/*  Pagination  */}
<div className="p-6 border-t border-outline-variant flex items-center justify-between">
<p className="text-on-surface-variant text-[12px]">Mostrando 1-10 de 124 eventos</p>
<div className="flex gap-1">
<button className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-30" disabled>
<span className="material-symbols-outlined text-[20px]" data-icon="chevron_left">chevron_left</span>
</button>
<button className="w-10 h-10 rounded-lg bg-primary text-on-primary font-bold text-[12px]">1</button>
<button className="w-10 h-10 rounded-lg hover:bg-surface-container text-on-surface font-bold text-[12px] transition-colors">2</button>
<button className="w-10 h-10 rounded-lg hover:bg-surface-container text-on-surface font-bold text-[12px] transition-colors">3</button>
<button className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined text-[20px]" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
</div>
{/*  Success Feedback (Hidden by Default)  */}
<div className="fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 translate-y-24 opacity-0 transition-all duration-500 z-[100]" id="toast">
<span className="material-symbols-outlined text-primary-fixed" data-icon="check_circle">check_circle</span>
<p className="font-label-md text-label-md">Evento validado com sucesso!</p>
<button className="ml-4 text-on-surface-variant hover:text-inverse-on-surface" onClick={() => {
  const t = document.getElementById('toast');
  if(t) t.style.opacity = '0';
}}>
<span className="material-symbols-outlined text-[20px]" data-icon="close">close</span>
</button>
</div>
    </div>
  )
}
