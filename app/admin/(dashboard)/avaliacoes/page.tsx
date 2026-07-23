'use client';
import { Building2, Download, Flag, MessageSquare, Reply, Search, Star, ThumbsDown, ThumbsUp, Trash2, User } from 'lucide-react'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { TablePagination } from '@/components/ui/table-pagination'

export default function Page() {
  const [reviews, setReviews] = useState<any[]>([])
  const [filteredReviews, setFilteredReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'low' | 'pending'>('all')
  const [stats, setStats] = useState({ total: 0, avg: 0, critical: 0 })

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const paginatedData = filteredReviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [filteredReviews.length])

 useEffect(() => {
  async function load() {
   const supabase = createClient()
   
   const { data } = await supabase
    .from('reviews')
    .select(`
     *,
     platform_users:user_id(full_name, email),
     professionals:professional_id(full_name),
     sport_spaces:space_id(name)
    `)
    .order('created_at', { ascending: false })

   const loadedReviews = data || []
   setReviews(loadedReviews)
   setFilteredReviews(loadedReviews)

   const total = loadedReviews.length
   const critical = loadedReviews.filter(r => r.rating <= 2).length
   
   let sum = 0
   loadedReviews.forEach(r => sum += r.rating)
   const avg = total > 0 ? (sum / total).toFixed(1) : 0

   setStats({ total, avg: Number(avg), critical })
   setLoading(false)
  }
  load()
 }, [])

 useEffect(() => {
  if (activeFilter === 'all') {
   setFilteredReviews(reviews)
  } else if (activeFilter === 'high') {
   setFilteredReviews(reviews.filter(r => r.rating >= 4))
  } else if (activeFilter === 'low') {
   setFilteredReviews(reviews.filter(r => r.rating <= 2))
  } else if (activeFilter === 'pending') {
   setFilteredReviews(reviews.filter(r => r.status === 'pending'))
  }
 }, [activeFilter, reviews])

 const handleDelete = async (id: string) => {
  if (!window.confirm('Tem certeza que deseja apagar esta avaliação?')) return
  
  const supabase = createClient()
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (!error) {
   setReviews(prev => prev.filter(r => r.id !== id))
   await supabase.from('audit_logs').insert([{
    action: 'DELETE', table_name: 'reviews', user_email: 'admin@find4sport.pt',
    new_data: { action: `Avaliação ${id} apagada` }
   }])
  }
 }

 const renderStars = (rating: number) => {
  return Array(5).fill(0).map((_, i) => (
   <Star key={i} className={`h-4 w-4 inline ${i < rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />
  ))
 }

 return (
  <div className="space-y-6">
   {/* Page Header */}
   <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    <div>
     <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl tracking-tight">Gestão de Avaliações</h1>
     <p className="text-muted-foreground mt-1 text-sm">Modere comentários, responda a denúncias e mantenha a qualidade.</p>
    </div>
    <div className="flex gap-3">
     <button className="flex items-center gap-2 px-5 py-2.5 bg-muted border border-border rounded-lg font-medium text-sm hover:bg-muted transition-all">
      <Download className="text-[20px]" />
      Exportar CSV
     </button>
    </div>
   </section>

   {/* Stats Overview */}
   <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
      <MessageSquare className="text-[64px]" />
     </div>
     <p className="text-muted-foreground font-medium text-sm mb-2">Total de Avaliações</p>
     <div className="flex items-end gap-2">
      <h3 className="text-2xl font-bold text-foreground">{loading ? '...' : stats.total}</h3>
     </div>
    </div>
    <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-amber-500">
      <Star className="text-[64px]" />
     </div>
     <p className="text-muted-foreground font-medium text-sm mb-2">Média Global</p>
     <div className="flex items-end gap-2">
      <h3 className="text-2xl font-bold text-foreground">{loading ? '...' : stats.avg}</h3>
      <span className="text-amber-500 font-medium text-sm bg-trust-gold/10 px-2 py-0.5 rounded-full mb-1">/ 5.0</span>
     </div>
    </div>
    <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/20 relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-destructive">
      <Flag className="text-[64px]" />
     </div>
     <p className="text-muted-foreground font-medium text-sm mb-2">Críticas (≤ 2 Estrelas)</p>
     <div className="flex items-end gap-2">
      <h3 className="text-2xl font-bold text-destructive">{loading ? '...' : stats.critical}</h3>
      <span className="text-destructive font-medium text-sm">Requerem atenção</span>
     </div>
    </div>
   </section>

   {/* Main List Section */}
   <section className="bg-card rounded-xl border border-border overflow-hidden">
    <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
     <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Tab Filters */}
      <div className="flex bg-muted/30 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
       <button onClick={() => setActiveFilter('all')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${activeFilter === 'all' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Todas</button>
       <button onClick={() => setActiveFilter('high')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${activeFilter === 'high' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
        Positivas <ThumbsUp className="text-[14px]" />
       </button>
       <button onClick={() => setActiveFilter('low')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${activeFilter === 'low' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
        Críticas <ThumbsDown className="text-[14px] text-destructive" />
       </button>
       <button onClick={() => setActiveFilter('pending')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${activeFilter === 'pending' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Denunciadas</button>
      </div>
      
      {/* Quick Search */}
      <div className="relative flex-1 sm:max-w-xs ml-auto">
       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]" />
       <input 
        type="text" 
        placeholder="Pesquisar..." 
        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
       />
      </div>
     </div>
    </div>

    <div className="overflow-x-auto">
     <table className="w-full text-left">
      <thead className="bg-muted/30 border-b border-border">
       <tr>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Avaliação</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Comentário</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Autor</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Entidade</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs text-right">Ações</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-border">
       {loading ? (
        <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">A carregar avaliações...</td></tr>
       ) : filteredReviews.length === 0 ? (
        <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Nenhuma avaliação encontrada.</td></tr>
       ) : (
        paginatedData.map((review) => (
         <tr key={review.id} className="hover:bg-muted/30 transition-colors">
          <td className="px-6 py-4">
           <div className="flex gap-1 mb-1">
            {renderStars(review.rating)}
           </div>
           <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('pt-PT')}</span>
          </td>
          <td className="px-6 py-4">
           <p className="text-sm text-foreground font-bold truncate max-w-[200px]" title={review.title}>{review.title || 'Sem Título'}</p>
           <p className="text-sm text-muted-foreground line-clamp-2 max-w-[250px]" title={review.comment}>{review.comment}</p>
          </td>
          <td className="px-6 py-4">
           <p className="font-semibold text-foreground">{review.platform_users?.full_name || 'Utilizador'}</p>
           <p className="text-xs text-muted-foreground">{review.platform_users?.email || 'Sem email'}</p>
          </td>
          <td className="px-6 py-4">
           {review.professionals && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[11px] font-bold">
             <User className="text-[12px]" /> {review.professionals.full_name}
            </span>
           )}
           {review.sport_spaces && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/10 text-secondary rounded-full text-[11px] font-bold mt-1">
             <Building2 className="text-[12px]" /> {review.sport_spaces.name}
            </span>
           )}
          </td>
          <td className="px-6 py-4 text-right">
           <div className="flex justify-end gap-1">
            <Dialog>
             <DialogTrigger className="p-2 hover:bg-muted text-muted-foreground hover:text-primary rounded-lg transition-colors" title="Responder">
<Reply className="text-[20px]" />
</DialogTrigger>
             <DialogContent>
              <DialogHeader>
               <DialogTitle>Responder à Avaliação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
               <p className="italic text-muted-foreground border-l-4 border-border pl-4">"{review.comment}"</p>
               <div className="space-y-2">
                <Label>Sua Resposta</Label>
                <textarea className="w-full min-h-[100px] p-3 border border-border rounded-lg focus:ring-1 focus:ring-primary" placeholder="Escreva aqui a resposta oficial..."></textarea>
               </div>
               <Button className="w-full bg-primary hover:bg-primary/90 text-white">Publicar Resposta</Button>
              </div>
             </DialogContent>
            </Dialog>
            <button onClick={() => handleDelete(review.id)} className="p-2 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-lg transition-colors" title="Apagar">
             <Trash2 className="text-[20px]" />
            </button>
           </div>
          </td>
         </tr>
        ))
       )}
      </tbody>
     </table>
    </div>
    
    <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredReviews.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
      </section>
  </div>
 )
}
