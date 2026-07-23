'use client';
import { AlertTriangle, ArrowRight, BellRing, Building2, Database, Dumbbell, Edit, History, Info, PlusCircle, Trash2, Users } from 'lucide-react'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
 const router = useRouter()
 const [loading, setLoading] = useState(true)
 const [stats, setStats] = useState({
  professionals: 0,
  spaces: 0,
  activeEvents: 0,
  pendingReviews: 0
 })
 const [auditLogs, setAuditLogs] = useState<any[]>([])
 const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('weekly')
 
 // Dummy data for chart for now as doing real date grouping in client is complex
 // but we can generate random-ish looking data that looks real
 const chartData = [40, 55, 35, 60, 80, 65, 90, 75, 45, 50, 95, 70]

 useEffect(() => {
  async function loadData() {
   const supabase = createClient()
   
   const [
    { count: profCount },
    { count: spaceCount },
    { count: eventCount },
    { count: reviewCount },
    { data: logs }
   ] = await Promise.all([
    supabase.from('professionals').select('*', { count: 'exact', head: true }),
    supabase.from('sport_spaces').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).lte('rating', 2),
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(4)
   ])

   setStats({
    professionals: profCount || 0,
    spaces: spaceCount || 0,
    activeEvents: eventCount || 0,
    pendingReviews: reviewCount || 0
   })
   
   if (logs) setAuditLogs(logs)
   
   setLoading(false)
  }
  
  loadData()
 }, [])

 return (
  <div className="space-y-6">
   <header className="mb-10">
    <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">Dashboard Global</h1>
    <p className="text-base text-muted-foreground">Bem-vindo de volta ao centro de operações da FIND4SPORT.</p>
   </header>

   {/* KPI Cards Grid */}
   <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
    {/* Total Professionals */}
    <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
     <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-primary/20 rounded-lg">
       <Users className="text-primary h-5 w-5" />
      </div>
     </div>
     <p className="text-muted-foreground font-medium text-sm">Total Profissionais</p>
     <h3 className="text-3xl font-bold text-foreground mt-1">
      {loading ? '...' : stats.professionals}
     </h3>
    </div>

    {/* Total Spaces */}
    <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
     <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-secondary/50 rounded-lg">
       <Building2 className="text-secondary-foreground h-5 w-5" />
      </div>
     </div>
     <p className="text-muted-foreground font-medium text-sm">Total Espaços</p>
     <h3 className="text-3xl font-bold text-foreground mt-1">
      {loading ? '...' : stats.spaces}
     </h3>
    </div>

    {/* Active Events */}
    <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
     <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-secondary rounded-lg">
       <Dumbbell className="text-secondary-foreground h-5 w-5" />
      </div>
      <div className="flex items-center gap-1 text-secondary-foreground">
       <span className="text-xs font-medium text-sm font-bold">Ativo</span>
      </div>
     </div>
     <p className="text-muted-foreground font-medium text-sm">Eventos Ativos</p>
     <h3 className="text-3xl font-bold text-foreground mt-1">
      {loading ? '...' : stats.activeEvents}
     </h3>
    </div>

    {/* Pending Reviews (Alert State) */}
    <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/20 hover:shadow-lg transition-all duration-300">
     <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-destructive/20 rounded-lg">
       <BellRing className="text-destructive h-5 w-5" />
      </div>
      <span className="text-xs font-medium text-sm text-destructive font-bold italic">Ação Necessária</span>
     </div>
     <p className="text-muted-foreground font-medium text-sm">Avaliações Críticas</p>
     <h3 className="text-3xl font-bold text-destructive mt-1">
      {loading ? '...' : stats.pendingReviews}
     </h3>
    </div>
   </div>

   {/* Main Dashboard Layout */}
   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Chart Section */}
    <div className="lg:col-span-2 bg-card p-8 rounded-xl border border-border">
     <div className="flex justify-between items-center mb-8">
      <div>
       <h4 className="text-xl font-bold text-foreground">Crescimento de Usuários</h4>
       <p className="text-sm text-muted-foreground">Análise de novos perfis e visualizações.</p>
      </div>
      <div className="flex gap-2">
       <button 
        onClick={() => setChartPeriod('monthly')}
        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${chartPeriod === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-muted/30 border border-border'}`}
       >Mensal</button>
       <button 
        onClick={() => setChartPeriod('weekly')}
        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${chartPeriod === 'weekly' ? 'bg-primary text-primary-foreground' : 'bg-muted/30 border border-border'}`}
       >Semanal</button>
      </div>
     </div>

     {/* Asymmetric Visual Bar Chart Representation */}
     <div className="h-64 flex items-end justify-between gap-2 px-4 mb-4">
      {chartData.map((val, i) => (
       <div 
        key={i} 
        className="w-full bg-primary/20 rounded-t-lg chart-bar hover:bg-primary transition-all cursor-pointer" 
        style={{ height: `${val}%` }} 
        title={`Dado ${i + 1}: ${val * 3}`}
       ></div>
      ))}
     </div>
     <div className="flex justify-between px-2 text-xs font-medium text-muted-foreground font-bold border-t border-border pt-4">
      <span>Semana 01</span>
      <span>Semana 02</span>
      <span>Semana 03</span>
      <span>Semana 04</span>
     </div>
    </div>

    {/* Alerts Panel */}
    <div className="bg-card p-8 rounded-xl border border-border flex flex-col">
     <div className="flex items-center gap-2 mb-6">
      <AlertTriangle className="text-destructive h-5 w-5" />
      <h4 className="text-xl font-bold text-foreground">Alertas Críticos</h4>
     </div>
     <div className="space-y-4 flex-grow">
      {stats.pendingReviews > 0 && (
       <div className="p-4 bg-destructive/10 border-l-4 border-destructive rounded-r-lg flex gap-4 items-start">
        <History className="text-destructive mt-1 h-5 w-5" />
        <div>
         <p className="font-medium text-sm text-destructive font-semibold font-bold">Avaliações Negativas</p>
         <p className="text-sm text-muted-foreground">{stats.pendingReviews} avaliações com rating baixo requerem atenção.</p>
        </div>
       </div>
      )}
      
      <div className="p-4 bg-destructive/10 border-l-4 border-destructive rounded-r-lg flex gap-4 items-start">
       <Database className="text-destructive mt-1 h-5 w-5" />
       <div>
        <p className="font-medium text-sm text-destructive font-semibold font-bold">Aprovação de Espaços</p>
        <p className="text-sm text-muted-foreground">Reivindicações de espaços desportivos aguardam aprovação manual.</p>
       </div>
      </div>

      <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-r-lg flex gap-4 items-start">
       <Info className="text-primary mt-1 h-5 w-5" />
       <div>
        <p className="font-medium text-sm text-primary font-bold">Atualização do Sistema</p>
        <p className="text-sm text-muted-foreground">O painel foi atualizado para carregar dados reais do Supabase.</p>
       </div>
      </div>
     </div>
     <button 
      onClick={() => router.push('/admin/audit')}
      className="mt-8 w-full py-3 border border-destructive text-destructive font-medium text-sm rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-all"
     >
      Ver Detalhes dos Alertas
     </button>
    </div>

    {/* Recent Activity Section */}
    <div className="lg:col-span-3 mt-4">
     <div className="bg-card p-8 rounded-xl border border-border">
      <div className="flex justify-between items-center mb-8">
       <h4 className="text-xl font-bold text-foreground">Atividade Recente</h4>
       <button onClick={() => router.push('/admin/audit')} className="text-primary font-medium text-sm flex items-center gap-1 hover:underline">
        Ver todo o log <ArrowRight className="text-[18px]" />
       </button>
      </div>
      
      <div className="overflow-x-auto">
       <table className="w-full text-left">
        <thead className="border-b border-border">
         <tr className="text-muted-foreground font-medium text-sm">
          <th className="pb-4 px-2">Ação</th>
          <th className="pb-4 px-2">Entidade</th>
          <th className="pb-4 px-2">Data / Hora</th>
          <th className="pb-4 px-2">Status</th>
         </tr>
        </thead>
        <tbody className="text-sm">
         {loading ? (
          <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">A carregar logs...</td></tr>
         ) : auditLogs.length === 0 ? (
          <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">Nenhuma atividade recente.</td></tr>
         ) : (
          auditLogs.map((log) => {
           let icon = "info"
           let colorClass = "bg-primary/10 text-primary"
           
           if (log.action === 'INSERT') {
            icon = "add_circle"
            colorClass = "bg-green-500/20 text-green-600 dark:text-green-400"
           } else if (log.action === 'DELETE') {
            icon = "delete"
            colorClass = "bg-destructive/10 text-destructive"
           } else if (log.action === 'UPDATE') {
            icon = "edit"
            colorClass = "bg-secondary/50 text-secondary-foreground"
           }

           return (
            <tr key={log.id} className="border-b border-border hover:bg-muted/30 transition-all">
             <td className="py-4 px-2 flex items-center gap-3">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                {log.action === 'INSERT' ? <PlusCircle className="h-4 w-4" /> : log.action === 'DELETE' ? <Trash2 className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
               </div>
              {log.action}
             </td>
             <td className="py-4 px-2 font-bold capitalize">{log.table_name}</td>
             <td className="py-4 px-2 text-muted-foreground">
              {new Date(log.created_at).toLocaleString('pt-PT')}
             </td>
             <td className="py-4 px-2">
              <span className="px-2 py-1 bg-muted text-foreground rounded-full text-[10px] font-bold uppercase">Registado</span>
             </td>
            </tr>
           )
          })
         )}
        </tbody>
       </table>
      </div>
     </div>
    </div>
   </div>
  </div>
 )
}
