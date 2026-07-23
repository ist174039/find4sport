'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function Page() {
 const [stats, setStats] = useState<any>(null)
 const [loading, setLoading] = useState(true)

 useEffect(() => {
  async function load() {
   const supabase = createClient()
   const [
    { count: users },
    { count: professionals },
    { count: spaces },
    { count: events },
    { count: reviews },
   ] = await Promise.all([
    supabase.from('platform_users').select('*', { count: 'exact', head: true }),
    supabase.from('professionals').select('*', { count: 'exact', head: true }),
    supabase.from('sport_spaces').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
   ])

   setStats({
    users: users || 0,
    professionals: professionals || 0,
    spaces: spaces || 0,
    events: events || 0,
    reviews: reviews || 0
   })
   setLoading(false)
  }
  load()
 }, [])

 const exportPDF = () => {
  window.print()
 }

 return (
  <div className="space-y-6 print:m-0 print:p-0">
   <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
    <div>
     <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl tracking-tight">Relatórios de Desempenho</h1>
     <p className="text-muted-foreground mt-1 text-sm">Métricas globais da plataforma e geração de relatórios oficiais.</p>
    </div>
    <div className="flex gap-3">
     <button onClick={exportPDF} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium text-sm hover:opacity-90 shadow-sm transition-all">
      <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
      Exportar Relatório Global
     </button>
    </div>
   </section>

   {/* Report Container to print */}
   <div className="bg-card rounded-xl border border-border p-8 print:border-none print:p-0">
    <div className="hidden print:block mb-8 border-b border-border pb-6">
     <h1 className="font-headline-lg text-3xl font-bold text-foreground">Find4Sport - Relatório Global de Plataforma</h1>
     <p className="text-muted-foreground mt-2">Gerado em: {new Date().toLocaleDateString('pt-PT')}</p>
    </div>

    <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
     <span className="material-symbols-outlined text-primary">monitoring</span> Resumo de Métricas Atuais
    </h3>

    {loading ? (
     <div className="flex items-center justify-center p-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
     </div>
    ) : (
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-muted/30 p-6 rounded-xl border border-border print:border-border">
       <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
         <span className="material-symbols-outlined">group</span>
        </div>
        <h4 className="text-lg font-semibold">Utilizadores Registados</h4>
       </div>
       <p className="text-3xl font-bold text-foreground">{stats?.users}</p>
      </div>
      
      <div className="bg-muted/30 p-6 rounded-xl border border-border print:border-border">
       <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-secondary/50 text-secondary-foreground rounded-lg flex items-center justify-center">
         <span className="material-symbols-outlined">store</span>
        </div>
        <h4 className="text-lg font-semibold">Profissionais & Entidades</h4>
       </div>
       <p className="text-3xl font-bold text-foreground">{stats?.professionals}</p>
      </div>

      <div className="bg-muted/30 p-6 rounded-xl border border-border print:border-border">
       <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center">
         <span className="material-symbols-outlined">stadium</span>
        </div>
        <h4 className="text-lg font-semibold">Espaços Desportivos</h4>
       </div>
       <p className="text-3xl font-bold text-foreground">{stats?.spaces}</p>
      </div>

      <div className="bg-muted/30 p-6 rounded-xl border border-border print:border-border">
       <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center">
         <span className="material-symbols-outlined">event</span>
        </div>
        <h4 className="text-lg font-semibold">Eventos & Torneios</h4>
       </div>
       <p className="text-3xl font-bold text-foreground">{stats?.events}</p>
      </div>

      <div className="bg-muted/30 p-6 rounded-xl border border-border print:border-border">
       <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-trust-gold/10 text-trust-gold rounded-lg flex items-center justify-center">
         <span className="material-symbols-outlined">star</span>
        </div>
        <h4 className="text-lg font-semibold">Avaliações Recebidas</h4>
       </div>
       <p className="text-3xl font-bold text-foreground">{stats?.reviews}</p>
      </div>
     </div>
    )}

    <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20 print:border-border">
     <h4 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
      <span className="material-symbols-outlined text-[20px]">insights</span>
      Resumo Executivo
     </h4>
     <p className="text-sm text-muted-foreground leading-relaxed">
      A plataforma encontra-se num estado saudável. Existem {stats?.spaces} espaços cadastrados que servem como pilar de retenção dos utilizadores. A taxa de avaliações reflete um forte engajamento da comunidade (total de {stats?.reviews} avaliações processadas).
     </p>
    </div>
   </div>
  </div>
 )
}
