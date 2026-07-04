'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Page() {
  const [spaces, setSpaces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('sport_spaces')
        .select('*')
        .order('name', { ascending: true })
      if (data) setSpaces(data)
      setLoading(false)
    }
    load()
  }, [])
  return (
    <div className="space-y-gutter">
{/*  Welcome & Actions  */}
<section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
<div>
<h2 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Gestão de Espaços Esportivos</h2>
<p className="text-text-secondary mt-1 font-body-md">Administre, valide e importe novos locais para o ecossistema.</p>
</div>
<div className="flex gap-3">
<button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high border border-outline-variant rounded-lg font-label-md hover:bg-surface-variant transition-all">
<img alt="Google Logo" className="w-4 h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwFewsTcDPucJ8u_tKlx0Hxt5G2r2qQU4BKY62WYYKr3dmMBs8t8lJDc2-Uj6wWWDzGC_LD9O7eAtMpeCDTf8LsTQK6wKwzCq8lOFy_KQ7VMKPsNPYwJIbCbePvLVhPiOaRhTl1KJZcjjFQwXA5llJxwlEKH_ET50WYouIF76JV_Y3WHms3SZjWjobwekhV2L2KDo3AQ53Qhw9oxRa7aVcAUmnGPDONzM0REp6u0Yb0LtdkV7ysBV6UwmHOQxffYhls1lwgY6A" />
                    Importar do Google Places
                </button>
<button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md hover:shadow-lg hover:shadow-primary/20 transition-all">
<span className="material-symbols-outlined text-[20px]">add</span>
                    Cadastrar Espaço
                </button>
</div>
</section>
{/*  Stats Overview - Bento Grid Style  */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-12">
<div className="bg-white p-6 rounded-xl border border-border-subtle hover:border-primary transition-colors cursor-default group">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-primary-fixed rounded-lg text-primary">
<span className="material-symbols-outlined">home_work</span>
</div>
<span className="text-success-mint bg-primary px-2 py-1 rounded text-[10px] font-bold">+12% mês</span>
</div>
<p className="text-outline font-label-md">Total de Espaços</p>
<h3 className="font-stat-display text-stat-display text-text-primary">1,284</h3>
</div>
<div className="bg-white p-6 rounded-xl border border-border-subtle hover:border-primary transition-colors cursor-default group">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-secondary-fixed rounded-lg text-secondary">
<span className="material-symbols-outlined">pending_actions</span>
</div>
</div>
<p className="text-outline font-label-md">Aguardando Validação</p>
<h3 className="font-stat-display text-stat-display text-text-primary">42</h3>
</div>
<div className="bg-white p-6 rounded-xl border border-border-subtle hover:border-primary transition-colors cursor-default group">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-tertiary-fixed rounded-lg text-tertiary">
<span className="material-symbols-outlined">verified</span>
</div>
</div>
<p className="text-outline font-label-md">Selos de Qualidade</p>
<h3 className="font-stat-display text-stat-display text-text-primary">315</h3>
</div>
<div className="bg-white p-6 rounded-xl border border-border-subtle hover:border-primary transition-colors cursor-default group">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-error-container rounded-lg text-error">
<span className="material-symbols-outlined">report</span>
</div>
</div>
<p className="text-outline font-label-md">Reclamações Ativas</p>
<h3 className="font-stat-display text-stat-display text-text-primary">08</h3>
</div>
</div>
{/*  Ownership Claims Section - Attention Required  */}
<section className="mb-12">
<div className="flex items-center gap-3 mb-6">
<h3 className="font-headline-md text-headline-md text-text-primary">Solicitações de Propriedade</h3>
<span className="px-2 py-0.5 bg-error text-on-error rounded-full text-[10px] font-bold">5 NOVAS</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
{/*  Claim Card 1  */}
<div className="glass-panel p-6 rounded-2xl border-l-4 border-error shadow-sm flex flex-col md:flex-row gap-6 items-start">
<div className="w-16 h-16 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-outline text-3xl">domain_verification</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start">
<div>
<h4 className="font-headline-md text-[18px] text-text-primary">Ginasio Poliesportivo "Olimpo"</h4>
<p className="text-body-md text-outline">Reclamado por: <strong>Marcos Oliveira</strong></p>
</div>
<span className="text-[10px] font-bold text-error uppercase bg-error-container px-2 py-1 rounded">Urgente</span>
</div>
<div className="mt-4 flex gap-2">
<button className="text-primary border border-primary px-4 py-1.5 rounded-lg font-label-md hover:bg-primary hover:text-white transition-all">Ver Documentos</button>
<button className="bg-primary text-white px-4 py-1.5 rounded-lg font-label-md">Aprovar</button>
<button className="text-on-surface-variant hover:text-error px-4 py-1.5 rounded-lg font-label-md">Negar</button>
</div>
</div>
</div>
{/*  Claim Card 2  */}
<div className="glass-panel p-6 rounded-2xl border-l-4 border-trust-gold shadow-sm flex flex-col md:flex-row gap-6 items-start opacity-90 hover:opacity-100 transition-opacity">
<div className="w-16 h-16 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-outline text-3xl">storefront</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start">
<div>
<h4 className="font-headline-md text-[18px] text-text-primary">CrossFit High Intensity</h4>
<p className="text-body-md text-outline">Reclamado por: <strong>Ana K. Fitness Ltd.</strong></p>
</div>
<span className="text-[10px] font-bold text-trust-gold uppercase bg-trust-gold/10 px-2 py-1 rounded">Pendente</span>
</div>
<div className="mt-4 flex gap-2">
<button className="text-primary border border-primary px-4 py-1.5 rounded-lg font-label-md hover:bg-primary hover:text-white transition-all">Ver Documentos</button>
<button className="bg-primary text-white px-4 py-1.5 rounded-lg font-label-md">Aprovar</button>
<button className="text-on-surface-variant hover:text-error px-4 py-1.5 rounded-lg font-label-md">Negar</button>
</div>
</div>
</div>
</div>
</section>
{/*  Filters & Main Table  */}
<section className="bg-white rounded-3xl border border-border-subtle shadow-sm overflow-hidden">
<div className="p-6 border-b border-border-subtle flex flex-wrap items-center justify-between gap-4">
<div className="flex gap-4">
<button className="px-4 py-2 bg-primary-container text-on-primary-container rounded-full font-label-md">Todos</button>
<button className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-full font-label-md transition-colors">Ativos</button>
<button className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-full font-label-md transition-colors">Rascunhos</button>
<button className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-full font-label-md transition-colors">Pendentes</button>
</div>
<div className="flex items-center gap-2">
<span className="font-label-md text-outline">Ordenar por:</span>
<select className="border-none bg-transparent font-label-md text-primary focus:ring-0 cursor-pointer">
<option>Mais recentes</option>
<option>Nome (A-Z)</option>
<option>Capacidade</option>
</select>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full border-collapse">
<thead className="bg-surface-container-low">
<tr>
<th className="text-left px-6 py-4 font-label-md text-outline uppercase tracking-wider">Espaço</th>
<th className="text-left px-6 py-4 font-label-md text-outline uppercase tracking-wider">Localização</th>
<th className="text-left px-6 py-4 font-label-md text-outline uppercase tracking-wider">Capacidade</th>
<th className="text-left px-6 py-4 font-label-md text-outline uppercase tracking-wider">Status</th>
<th className="text-left px-6 py-4 font-label-md text-outline uppercase tracking-wider">Reputação</th>
<th className="px-6 py-4"></th>
</tr>
</thead>
<tbody className="divide-y divide-border-subtle">
          {loading ? (
            <tr>
              <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">A carregar espaços...</td>
            </tr>
          ) : spaces.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">Nenhum espaço encontrado.</td>
            </tr>
          ) : (
            spaces.map((space) => (
              <tr key={space.id} className="hover:bg-surface-container-lowest transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <img 
                      className="w-12 h-12 rounded-lg object-cover" 
                      alt={space.name} 
                      src={space.gallery_urls?.[0] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=150'} 
                    />
                    <div>
                      <h5 className="font-bold text-text-primary">{space.name}</h5>
                      <p className="text-body-md text-outline">Espaço Desportivo</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="text-body-md text-text-primary">{space.address}</p>
                </td>
                <td className="px-6 py-5">
                  <span className="font-label-md px-3 py-1 bg-surface-container-high rounded-full">N/A</span>
                </td>
                <td className="px-6 py-5">
                  <span className={`flex items-center gap-2 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    space.is_verified ? 'text-primary bg-success-mint' : 'text-amber-600 bg-amber-50'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${space.is_verified ? 'bg-primary' : 'bg-amber-500'}`}></span>
                    {space.is_verified ? 'Verificado' : 'Pendente'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-trust-gold text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-bold text-text-primary">{space.rating_avg || '0.0'}</span>
                    <span className="text-xs text-muted-foreground">({space.review_count})</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 hover:bg-surface-container rounded-full transition-colors">
                    <span className="material-symbols-outlined text-outline">more_vert</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
</table>
</div>
{/*  Pagination  */}
<div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
<span className="text-body-md text-outline">Mostrando 1-10 de 1,284 espaços</span>
<div className="flex gap-2">
<button className="p-2 rounded-lg hover:bg-surface-variant transition-all disabled:opacity-30" disabled>
<span className="material-symbols-outlined">chevron_left</span>
</button>
<button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg font-bold">1</button>
<button className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant rounded-lg transition-all">2</button>
<button className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant rounded-lg transition-all">3</button>
<button className="p-2 rounded-lg hover:bg-surface-variant transition-all">
<span className="material-symbols-outlined">chevron_right</span>
</button>
</div>
</div>
</section>
{/*  Contextual FAB (Only on Dashboard/Management)  */}
<button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
<span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">add</span>
<div className="absolute right-full mr-4 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Rápido: Novo Espaço
        </div>
</button>
    </div>
  )
}
