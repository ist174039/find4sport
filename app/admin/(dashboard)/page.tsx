'use client';
import { AlertTriangle, ArrowRight, BellRing, Building2, Database, Dumbbell, Edit, History, Info, PlusCircle, Trash2, Users, ShieldAlert } from 'lucide-react'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type ChartEntry = { label: string; users: number; professionals: number; spaces: number }

export default function Page() {
 const router = useRouter()
 const [loading, setLoading] = useState(true)
 const [stats, setStats] = useState({
  users: 0,
  professionals: 0,
  spaces: 0,
  activeEvents: 0,
  pendingReviews: 0,
  pendingClaims: 0,
 })
 const [auditLogs, setAuditLogs] = useState<any[]>([])
 const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('weekly')
 const [weeklyChart, setWeeklyChart] = useState<ChartEntry[]>([])
 const [monthlyChart, setMonthlyChart] = useState<ChartEntry[]>([])
 
 useEffect(() => {
  async function loadData() {
   const supabase = createClient()

   const safeRpc = async <T,>(rpcCall: PromiseLike<T>) => {
    try {
     return await rpcCall
    } catch {
     return { data: null } as T
    }
   }
   
   const [
    { count: userCount },
    { count: profCount },
    { count: spaceCount },
    { count: eventCount },
    { count: reviewCount },
    { count: claimCount },
    { data: logs },
    { data: weeklyUsers },
    { data: weeklyProfs },
    { data: weeklySpaces },
    { data: monthlyUsers },
    { data: monthlyProfs },
    { data: monthlySpaces },
   ] = await Promise.all([
    supabase.from('platform_users').select('*', { count: 'exact', head: true }),
    supabase.from('professionals').select('*', { count: 'exact', head: true }),
    supabase.from('sport_spaces').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).lte('rating', 2),
    supabase.from('space_claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(6),
    // Weekly growth data (last 8 weeks) using RPC
    safeRpc(supabase.rpc('get_weekly_registrations', { weeks_back: 8, table_name: 'platform_users' })),
    safeRpc(supabase.rpc('get_weekly_registrations', { weeks_back: 8, table_name: 'professionals' })),
    safeRpc(supabase.rpc('get_weekly_registrations', { weeks_back: 8, table_name: 'sport_spaces' })),
    safeRpc(supabase.rpc('get_monthly_registrations', { months_back: 6, table_name: 'platform_users' })),
    safeRpc(supabase.rpc('get_monthly_registrations', { months_back: 6, table_name: 'professionals' })),
    safeRpc(supabase.rpc('get_monthly_registrations', { months_back: 6, table_name: 'sport_spaces' })),
   ])

   setStats({
    users: userCount || 0,
    professionals: profCount || 0,
    spaces: spaceCount || 0,
    activeEvents: eventCount || 0,
    pendingReviews: reviewCount || 0,
    pendingClaims: claimCount || 0,
   })
   
   if (logs) setAuditLogs(logs)

   // Build chart data — merge all weekly series into a single array by period label
   const buildChart = (
     users: any[] | null,
     profs: any[] | null,
     spaces: any[] | null
   ): ChartEntry[] => {
     const map: Record<string, ChartEntry> = {}
     const allPeriods = new Set<string>([
       ...(users || []).map((r: any) => r.period),
       ...(profs || []).map((r: any) => r.period),
       ...(spaces || []).map((r: any) => r.period),
     ])
     allPeriods.forEach(p => {
       map[p] = { label: p, users: 0, professionals: 0, spaces: 0 }
     })
     ;(users || []).forEach((r: any) => { if (map[r.period]) map[r.period].users = Number(r.count) })
     ;(profs || []).forEach((r: any) => { if (map[r.period]) map[r.period].professionals = Number(r.count) })
     ;(spaces || []).forEach((r: any) => { if (map[r.period]) map[r.period].spaces = Number(r.count) })
     return Object.values(map).sort((a, b) => a.label.localeCompare(b.label))
   }

   setWeeklyChart(buildChart(weeklyUsers, weeklyProfs, weeklySpaces))
   setMonthlyChart(buildChart(monthlyUsers, monthlyProfs, monthlySpaces))
   
   setLoading(false)
  }
  
  loadData()
 }, [])

 const chartData = chartPeriod === 'weekly' ? weeklyChart : monthlyChart
 const maxVal = Math.max(...chartData.flatMap(d => [d.users, d.professionals, d.spaces]), 1)

 return (
  <div className="space-y-6">
   <header className="mb-10">
    <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">Dashboard Global</h1>
    <p className="text-base text-muted-foreground">Bem-vindo de volta ao centro de operações da FIND4SPORT.</p>
   </header>

   {/* KPI Cards Grid */}
   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
    <div className="bg-card p-5 rounded-xl border border-border hover:shadow-lg transition-all duration-300 lg:col-span-2">
     <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-blue-500/10 rounded-lg">
       <Users className="text-blue-500 h-5 w-5" />
      </div>
      <p className="text-muted-foreground font-medium text-sm">Utilizadores</p>
     </div>
     <h3 className="text-3xl font-bold text-foreground">{loading ? '...' : stats.users}</h3>
    </div>

    <div className="bg-card p-5 rounded-xl border border-border hover:shadow-lg transition-all duration-300 lg:col-span-2">
     <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-primary/10 rounded-lg">
       <Dumbbell className="text-primary h-5 w-5" />
      </div>
      <p className="text-muted-foreground font-medium text-sm">Profissionais</p>
     </div>
     <h3 className="text-3xl font-bold text-foreground">{loading ? '...' : stats.professionals}</h3>
    </div>

    <div className="bg-card p-5 rounded-xl border border-border hover:shadow-lg transition-all duration-300 lg:col-span-2">
     <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-secondary/50 rounded-lg">
       <Building2 className="text-secondary-foreground h-5 w-5" />
      </div>
      <p className="text-muted-foreground font-medium text-sm">Espaços</p>
     </div>
     <h3 className="text-3xl font-bold text-foreground">{loading ? '...' : stats.spaces}</h3>
    </div>

    <div className="bg-card p-5 rounded-xl border border-border hover:shadow-lg transition-all duration-300 lg:col-span-2">
     <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-green-500/10 rounded-lg">
       <Dumbbell className="text-green-500 h-5 w-5" />
      </div>
      <p className="text-muted-foreground font-medium text-sm">Eventos Ativos</p>
     </div>
     <h3 className="text-3xl font-bold text-foreground">{loading ? '...' : stats.activeEvents}</h3>
    </div>

    <div className={`p-5 rounded-xl border transition-all duration-300 lg:col-span-2 ${stats.pendingReviews > 0 ? 'bg-destructive/10 border-destructive/20 hover:shadow-lg' : 'bg-card border-border'}`}>
     <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-destructive/20 rounded-lg">
       <BellRing className="text-destructive h-5 w-5" />
      </div>
      <p className="text-muted-foreground font-medium text-sm">Avaliações Críticas</p>
     </div>
     <h3 className={`text-3xl font-bold ${stats.pendingReviews > 0 ? 'text-destructive' : 'text-foreground'}`}>
      {loading ? '...' : stats.pendingReviews}
     </h3>
    </div>

    <div className={`p-5 rounded-xl border transition-all duration-300 lg:col-span-2 ${stats.pendingClaims > 0 ? 'bg-amber-500/10 border-amber-500/20 hover:shadow-lg' : 'bg-card border-border'}`}>
     <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-amber-500/20 rounded-lg">
       <ShieldAlert className="text-amber-500 h-5 w-5" />
      </div>
      <p className="text-muted-foreground font-medium text-sm">Reivindicações Pendentes</p>
     </div>
     <h3 className={`text-3xl font-bold ${stats.pendingClaims > 0 ? 'text-amber-500' : 'text-foreground'}`}>
      {loading ? '...' : stats.pendingClaims}
     </h3>
    </div>
   </div>

   {/* Main Dashboard Layout */}
   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Chart Section */}
    <div className="lg:col-span-2 bg-card p-8 rounded-xl border border-border">
     <div className="flex justify-between items-center mb-8">
      <div>
       <h4 className="text-xl font-bold text-foreground">Crescimento da Plataforma</h4>
       <p className="text-sm text-muted-foreground">Novos registos por período (utilizadores, profissionais, espaços).</p>
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

     {loading ? (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">A carregar dados...</div>
     ) : chartData.length === 0 ? (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Sem dados suficientes para o período selecionado.</div>
     ) : (
      <>
       {/* Legend */}
       <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
         <div className="w-3 h-3 rounded-full bg-blue-500"></div> Utilizadores
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
         <div className="w-3 h-3 rounded-full bg-primary"></div> Profissionais
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
         <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Espaços
        </div>
       </div>

       {/* Grouped Bar Chart */}
       <div className="h-56 flex items-end gap-2 px-2 mb-4 overflow-x-auto">
        {chartData.map((entry, i) => (
         <div key={i} className="flex-1 min-w-[36px] flex flex-col items-center gap-1">
          <div className="w-full flex items-end gap-0.5" style={{ height: '200px' }}>
           <div
            className="flex-1 bg-blue-500/80 rounded-t hover:bg-blue-500 transition-colors cursor-default"
            style={{ height: `${maxVal > 0 ? (entry.users / maxVal) * 100 : 0}%`, minHeight: entry.users > 0 ? '4px' : '0' }}
            title={`Utilizadores: ${entry.users}`}
           />
           <div
            className="flex-1 bg-primary/80 rounded-t hover:bg-primary transition-colors cursor-default"
            style={{ height: `${maxVal > 0 ? (entry.professionals / maxVal) * 100 : 0}%`, minHeight: entry.professionals > 0 ? '4px' : '0' }}
            title={`Profissionais: ${entry.professionals}`}
           />
           <div
            className="flex-1 bg-emerald-500/80 rounded-t hover:bg-emerald-500 transition-colors cursor-default"
            style={{ height: `${maxVal > 0 ? (entry.spaces / maxVal) * 100 : 0}%`, minHeight: entry.spaces > 0 ? '4px' : '0' }}
            title={`Espaços: ${entry.spaces}`}
           />
          </div>
          <span className="text-[9px] text-muted-foreground font-medium text-center leading-tight truncate w-full text-center">
           {entry.label.split('-').slice(1).join('/')}
          </span>
         </div>
        ))}
       </div>
      </>
     )}
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
        <History className="text-destructive mt-1 h-5 w-5 shrink-0" />
        <div>
         <p className="font-bold text-sm text-destructive">Avaliações Negativas</p>
         <p className="text-sm text-muted-foreground">{stats.pendingReviews} avaliações com rating ≤2 requerem atenção.</p>
        </div>
       </div>
      )}
      
      {stats.pendingClaims > 0 && (
       <div className="p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-lg flex gap-4 items-start cursor-pointer hover:bg-amber-500/20 transition-colors" onClick={() => router.push('/admin/reivindicacoes')}>
        <ShieldAlert className="text-amber-500 mt-1 h-5 w-5 shrink-0" />
        <div>
         <p className="font-bold text-sm text-amber-600 dark:text-amber-400">Reivindicações Pendentes</p>
         <p className="text-sm text-muted-foreground">{stats.pendingClaims} pedidos de espaços aguardam validação.</p>
        </div>
       </div>
      )}

      {stats.pendingReviews === 0 && stats.pendingClaims === 0 && (
       <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-r-lg flex gap-4 items-start">
        <Info className="text-primary mt-1 h-5 w-5 shrink-0" />
        <div>
         <p className="font-bold text-sm text-primary">Sem Alertas Activos</p>
         <p className="text-sm text-muted-foreground">Tudo está sob controlo no momento.</p>
        </div>
       </div>
      )}

      <div className="p-4 bg-muted/30 border-l-4 border-border rounded-r-lg flex gap-4 items-start">
       <Database className="text-muted-foreground mt-1 h-5 w-5 shrink-0" />
       <div>
        <p className="font-bold text-sm text-foreground">Plataforma</p>
        <p className="text-sm text-muted-foreground">{stats.users} utilizadores · {stats.spaces} espaços · {stats.professionals} profissionais</p>
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
           let colorClass = "bg-primary/10 text-primary"
           
           if (log.action === 'INSERT') {
            colorClass = "bg-green-500/20 text-green-600 dark:text-green-400"
           } else if (log.action === 'DELETE') {
            colorClass = "bg-destructive/10 text-destructive"
           } else if (log.action === 'UPDATE') {
            colorClass = "bg-secondary/50 text-secondary-foreground"
           }

           return (
            <tr key={log.id} className="border-b border-border hover:bg-muted/30 transition-all">
             <td className="py-4 px-2">
              <div className="flex items-center gap-3">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                {log.action === 'INSERT' ? <PlusCircle className="h-4 w-4" /> : log.action === 'DELETE' ? <Trash2 className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
               </div>
               <span className="font-medium">{log.action}</span>
              </div>
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
