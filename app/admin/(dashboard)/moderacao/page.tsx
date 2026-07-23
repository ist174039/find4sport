'use client';
import { Gavel } from 'lucide-react'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TablePagination } from '@/components/ui/table-pagination'

export default function Page() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const paginatedData = reports.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(reports.length / ITEMS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [reports.length])

 useEffect(() => {
  async function load() {
   // For now, load bad reviews as moderation queue
   const supabase = createClient()
   const { data } = await supabase
    .from('reviews')
    .select('*, platform_users:user_id(full_name)')
    .lte('rating', 2)
    .order('created_at', { ascending: false })
   
   setReports(data || [])
   setLoading(false)
  }
  load()
 }, [])

 return (
  <div className="space-y-6">
   <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    <div>
     <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl tracking-tight">Centro de Moderação</h1>
     <p className="text-muted-foreground mt-1 text-sm">Gestão unificada de denúncias, conteúdos sinalizados e bloqueios.</p>
    </div>
   </section>

   <section className="bg-card rounded-xl border border-border overflow-hidden">
    <div className="p-6 border-b border-border flex items-center gap-2">
     <Gavel className="text-destructive h-5 w-5" />
     <h3 className="text-xl font-bold text-foreground">Fila de Moderação (Conteúdo Sensível)</h3>
    </div>
    
    <div className="overflow-x-auto">
     <table className="w-full text-left">
      <thead className="bg-muted/30 border-b border-border">
       <tr>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Tipo</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Conteúdo</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Denunciante</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs text-right">Ação Rápida</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-border">
       {loading ? (
        <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">A carregar fila...</td></tr>
       ) : reports.length === 0 ? (
        <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">Nenhum item na fila de moderação.</td></tr>
       ) : (
        reports.map((report) => (
         <tr key={report.id} className="hover:bg-destructive/5 transition-colors">
          <td className="px-6 py-4">
           <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-[11px] font-bold uppercase">
            Avaliação ({report.rating}★)
           </span>
          </td>
          <td className="px-6 py-4">
           <p className="text-sm text-foreground max-w-[300px] truncate">"{report.comment || report.title}"</p>
          </td>
          <td className="px-6 py-4">
           <p className="font-semibold text-foreground">{report.platform_users?.full_name || 'Utilizador'}</p>
           <p className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleDateString('pt-PT')}</p>
          </td>
          <td className="px-6 py-4 text-right">
           <div className="flex justify-end gap-2">
            <button className="px-3 py-1.5 border border-border rounded font-medium text-sm text-xs hover:bg-muted">Ignorar</button>
            <button className="px-3 py-1.5 bg-destructive text-white rounded font-medium text-sm text-xs hover:bg-destructive/90">Remover</button>
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
