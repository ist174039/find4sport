'use client';
import { Download, Edit, PlusCircle, Search, Shield, Trash2 } from 'lucide-react'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TablePagination } from '@/components/ui/table-pagination'

export default function Page() {
  const [logs, setLogs] = useState<any[]>([])
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'INSERT' | 'UPDATE' | 'DELETE'>('all')

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const paginatedData = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [filteredLogs.length])

 useEffect(() => {
  async function load() {
   const supabase = createClient()
   const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

   const loadedLogs = data || []
   setLogs(loadedLogs)
   setFilteredLogs(loadedLogs)
   setLoading(false)
  }
  load()
 }, [])

 useEffect(() => {
  let result = logs
  if (activeFilter !== 'all') {
   result = result.filter(l => l.action === activeFilter)
  }
  if (search) {
   const lower = search.toLowerCase()
   result = result.filter(l => 
    (l.user_email && l.user_email.toLowerCase().includes(lower)) || 
    (l.table_name && l.table_name.toLowerCase().includes(lower)) ||
    (l.new_data && JSON.stringify(l.new_data).toLowerCase().includes(lower))
   )
  }
  setFilteredLogs(result)
 }, [search, activeFilter, logs])

 return (
  <div className="space-y-6">
   {/* Page Header */}
   <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    <div>
     <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl tracking-tight">Audit Logs (Auditoria)</h1>
     <p className="text-muted-foreground mt-1 text-sm">Registo imutável de todas as ações administrativas na plataforma.</p>
    </div>
    <div className="flex gap-3">
     <button className="flex items-center gap-2 px-5 py-2.5 bg-muted border border-border rounded-lg font-medium text-sm hover:bg-muted transition-all">
      <Download className="text-[20px]" />
      Exportar Logs
     </button>
    </div>
   </section>

   {/* Main List Section */}
   <section className="bg-card rounded-xl border border-border overflow-hidden">
    <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
     <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Tab Filters */}
      <div className="flex bg-muted/30 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
       <button onClick={() => setActiveFilter('all')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${activeFilter === 'all' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Todos</button>
       <button onClick={() => setActiveFilter('INSERT')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${activeFilter === 'INSERT' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Criações</button>
       <button onClick={() => setActiveFilter('UPDATE')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${activeFilter === 'UPDATE' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Edições</button>
       <button onClick={() => setActiveFilter('DELETE')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${activeFilter === 'DELETE' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Remoções</button>
      </div>
      
      {/* Quick Search */}
      <div className="relative flex-1 sm:max-w-xs ml-auto">
       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]" />
       <input 
        type="text" 
        placeholder="Pesquisar por email, tabela..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
       />
      </div>
     </div>
    </div>

    <div className="overflow-x-auto">
     <table className="w-full text-left">
      <thead className="bg-muted/30 border-b border-border">
       <tr>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Ação</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Entidade (Tabela)</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Autor (Admin)</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Detalhes</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-border">
       {loading ? (
        <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">A carregar logs de auditoria...</td></tr>
       ) : filteredLogs.length === 0 ? (
        <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">Nenhum log encontrado para os filtros selecionados.</td></tr>
       ) : (
        paginatedData.map((log) => (
         <tr key={log.id} className="hover:bg-muted/30 transition-colors">
          <td className="px-6 py-4">
           {log.action === 'INSERT' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[11px] font-bold uppercase tracking-wider">
             <PlusCircle className="text-[12px]" /> Insert
            </span>
           )}
           {log.action === 'UPDATE' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[11px] font-bold uppercase tracking-wider">
             <Edit className="text-[12px]" /> Update
            </span>
           )}
           {log.action === 'DELETE' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-destructive/10 text-destructive rounded-full text-[11px] font-bold uppercase tracking-wider">
             <Trash2 className="text-[12px]" /> Delete
            </span>
           )}
          </td>
          <td className="px-6 py-4">
           <span className="font-mono text-sm bg-muted px-2 py-1 rounded text-muted-foreground">{log.table_name}</span>
           <p className="text-xs text-muted-foreground mt-1">{new Date(log.created_at).toLocaleString('pt-PT')}</p>
          </td>
          <td className="px-6 py-4">
           <div className="flex items-center gap-2">
            <Shield className="text-muted-foreground text-[18px]" />
            <span className="text-sm font-bold text-foreground">{log.user_email || log.user_id || 'Sistema'}</span>
           </div>
          </td>
          <td className="px-6 py-4">
           <div className="max-w-md">
            <p className="text-sm text-muted-foreground truncate">
             {log.new_data?.action || JSON.stringify(log.new_data)}
            </p>
           </div>
          </td>
         </tr>
        ))
       )}
      </tbody>
     </table>
    </div>
   </section>
  </div>
 )
}
