'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Page() {
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('professionals')
        .select('*')
        .order('full_name', { ascending: true })
      if (data) setProfessionals(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-gutter">
{/*  Page Header Area  */}
<div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
<div>
<h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Gestão de Profissionais</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant">Aprovação, moderação e monitoramento da base de dados.</p>
</div>
<div className="flex gap-3">
<button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container transition-all">
<span className="material-symbols-outlined" data-icon="filter_list">filter_list</span>
                        Filtros Avançados
                    </button>
<button className="flex items-center gap-2 px-6 py-2.5 bg-brand-emerald text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 shadow-sm transition-all">
<span className="material-symbols-outlined" data-icon="person_add">person_add</span>
                        Convidar Profissional
                    </button>
</div>
</div>
{/*  Stats Overview  */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-section-gap">
<div className="bg-surface-container-lowest p-6 rounded-lg border border-border-subtle hover:shadow-md transition-all">
<div className="flex justify-between items-start mb-4">
<span className="p-2 bg-primary-fixed text-on-primary-fixed-variant rounded-lg material-symbols-outlined" data-icon="group">group</span>
<span className="text-brand-emerald font-label-md text-label-md flex items-center gap-1">+12% <span className="material-symbols-outlined text-[14px]" data-icon="trending_up">trending_up</span></span>
</div>
<p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total de Profissionais</p>
<p className="font-display-lg text-display-lg text-on-surface mt-1">1.284</p>
</div>
<div className="bg-surface-container-lowest p-6 rounded-lg border border-border-subtle hover:shadow-md transition-all">
<div className="flex justify-between items-start mb-4">
<span className="p-2 bg-secondary-fixed text-on-secondary-fixed-variant rounded-lg material-symbols-outlined" data-icon="pending_actions">pending_actions</span>
<span className="bg-error-container text-on-error-container font-label-md text-label-md px-2 py-0.5 rounded-full">Urgente</span>
</div>
<p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Aguardando Aprovação</p>
<p className="font-display-lg text-display-lg text-on-surface mt-1">42</p>
</div>
<div className="bg-surface-container-lowest p-6 rounded-lg border border-border-subtle hover:shadow-md transition-all">
<div className="flex justify-between items-start mb-4">
<span className="p-2 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-lg material-symbols-outlined" data-icon="star">star</span>
<span className="text-trust-gold font-label-md text-label-md">Top 5%</span>
</div>
<p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Média de Avaliação</p>
<p className="font-display-lg text-display-lg text-on-surface mt-1">4.8</p>
</div>
<div className="bg-surface-container-lowest p-6 rounded-lg border border-border-subtle hover:shadow-md transition-all">
<div className="flex justify-between items-start mb-4">
<span className="p-2 bg-surface-container-highest text-on-surface rounded-lg material-symbols-outlined" data-icon="report">report</span>
</div>
<p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Denúncias Ativas</p>
<p className="font-display-lg text-display-lg text-on-surface mt-1">07</p>
</div>
</div>
{/*  Professional Management Table Container  */}
<div className="bg-surface-container-lowest rounded-lg border border-border-subtle shadow-sm overflow-hidden">
<div className="p-6 border-b border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
<h3 className="font-headline-md text-headline-md text-on-surface">Base de Profissionais</h3>
<div className="flex gap-2">
<div className="bg-surface-container-low p-1 rounded-lg flex">
<button className="px-4 py-1.5 bg-white text-brand-emerald font-label-md text-label-md rounded shadow-sm">Todos</button>
<button className="px-4 py-1.5 text-on-surface-variant font-label-md text-label-md hover:text-on-surface">Ativos</button>
<button className="px-4 py-1.5 text-on-surface-variant font-label-md text-label-md hover:text-on-surface">Pendentes</button>
</div>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low/50">
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase">Profissional</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase">Categoria</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase">Localização</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase">Status</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase text-right">Ações</th>
</tr>
</thead>
<tbody className="divide-y divide-border-subtle">
          {loading ? (
            <tr>
              <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">A carregar profissionais...</td>
            </tr>
          ) : professionals.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">Nenhum profissional encontrado.</td>
            </tr>
          ) : (
            professionals.map((prof) => (
              <tr key={prof.id} className="hover:bg-surface-container-lowest/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        alt={prof.full_name} 
                        className="w-12 h-12 rounded-full object-cover border border-outline-variant" 
                        src={prof.avatar_url || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=150"} 
                      />
                    </div>
                    <div>
                      <p className="font-body-lg text-body-lg font-semibold text-on-surface">{prof.full_name}</p>
                      <p className="font-body-md text-body-md text-on-surface-variant">{prof.email || 'Sem email'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-label-md">
                    {prof.title || 'Profissional'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <p className="font-body-md text-body-md text-on-surface-variant">{prof.location || 'N/A'}</p>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md ${
                    prof.is_verified ? 'bg-success-mint text-brand-emerald' : 'bg-secondary-fixed text-on-secondary-fixed-variant'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${prof.is_verified ? 'bg-brand-emerald' : 'bg-secondary'}`}></span>
                    {prof.is_verified ? 'Verificado' : 'Pendente'}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-on-surface-variant hover:text-brand-emerald hover:bg-primary-container/20 rounded-lg transition-all" title="Ver Detalhes">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                    <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-all" title="Bloquear">
                      <span className="material-symbols-outlined">block</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    {/*  Pagination Footer  */}
    <div className="p-6 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-low/30">
      <p className="font-body-md text-body-md text-on-surface-variant">Mostrando <strong>{professionals.length}</strong> profissionais</p>
      <div className="flex gap-2">
        <button className="p-2 border border-border-subtle rounded-lg text-on-surface-variant hover:bg-white transition-all disabled:opacity-50" disabled>
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <button className="p-2 border border-border-subtle rounded-lg text-on-surface-variant hover:bg-white transition-all">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
</div>
{/*  Activity Logs & Report Card  */}
<div className="mt-section-gap grid grid-cols-1 lg:grid-cols-3 gap-gutter">
<div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-lg border border-border-subtle shadow-sm">
<h3 className="font-headline-md text-headline-md text-on-surface mb-6">Logs de Atividade</h3>
<div className="space-y-6">
<div className="flex gap-4">
<div className="mt-1 w-8 h-8 rounded-full bg-success-mint flex items-center justify-center text-brand-emerald">
<span className="material-symbols-outlined text-[18px]" data-icon="check_circle">check_circle</span>
</div>
<div>
<p className="font-body-md text-body-md text-on-surface"><span className="font-bold">Administrador Pedro</span> aprovou o cadastro de <span className="font-bold">Ricardo Silva</span>.</p>
<p className="font-label-md text-label-md text-on-surface-variant mt-1">Hoje, às 14:23</p>
</div>
</div>
<div className="flex gap-4">
<div className="mt-1 w-8 h-8 rounded-full bg-error-container/20 flex items-center justify-center text-error">
<span className="material-symbols-outlined text-[18px]" data-icon="cancel">cancel</span>
</div>
<div>
<p className="font-body-md text-body-md text-on-surface"><span className="font-bold">Administrador Pedro</span> recusou o cadastro de <span className="font-bold">Matheus Oliveira</span> por documentação incompleta.</p>
<p className="font-label-md text-label-md text-on-surface-variant mt-1">Hoje, às 11:45</p>
</div>
</div>
</div>
</div>
<div className="bg-brand-emerald p-8 rounded-lg text-on-primary-container relative overflow-hidden">
<div className="relative z-10">
<h4 className="font-headline-md text-headline-md font-bold mb-4">Relatório Semanal</h4>
<p className="font-body-md text-body-md mb-6 text-white/90">O crescimento da rede superou a meta em 8.2% esta semana. Revise os novos profissionais pendentes para manter o tempo de resposta baixo.</p>
<button className="w-full py-3 bg-white text-brand-emerald font-bold rounded-lg hover:bg-surface-container transition-all">Exportar PDF</button>
</div>
<span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[160px] opacity-10 pointer-events-none" data-icon="monitoring">monitoring</span>
</div>
</div>


    </div>
  )
}
