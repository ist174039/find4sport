'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { TablePagination } from '@/components/ui/table-pagination'

export default function Page() {
  const [events, setEvents] = useState<any[]>([])
  const [filteredEvents, setFilteredEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past' | 'draft' | 'pending'>('all')
  const [stats, setStats] = useState({ totalMonth: 0, next7Days: 0, pending: 0, cancelled: 0 })
  
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const paginatedData = filteredEvents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [filteredEvents.length])

 useEffect(() => {
  async function loadEvents() {
   const supabase = createClient()
   const { data } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: false })
   
   const loadedEvents = data || []
   setEvents(loadedEvents)
   setFilteredEvents(loadedEvents)

   const now = new Date()
   const nextWeek = new Date()
   nextWeek.setDate(now.getDate() + 7)
   const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
   
   const totalMonth = loadedEvents.filter(e => new Date(e.start_date) >= thisMonthStart).length
   const next7Days = loadedEvents.filter(e => {
    const d = new Date(e.start_date)
    return d >= now && d <= nextWeek
   }).length
   const pending = loadedEvents.filter(e => e.status === 'pending').length
   const cancelled = loadedEvents.filter(e => e.status === 'cancelled').length

   setStats({ totalMonth, next7Days, pending, cancelled })
   setLoading(false)
  }
  loadEvents()
 }, [])

 useEffect(() => {
  const now = new Date()
  if (activeFilter === 'all') {
   setFilteredEvents(events)
  } else if (activeFilter === 'upcoming') {
   setFilteredEvents(events.filter(e => new Date(e.start_date) >= now))
  } else if (activeFilter === 'past') {
   setFilteredEvents(events.filter(e => new Date(e.start_date) < now))
  } else if (activeFilter === 'draft') {
   setFilteredEvents(events.filter(e => e.status === 'draft'))
  } else if (activeFilter === 'pending') {
   setFilteredEvents(events.filter(e => e.status === 'pending'))
  }
 }, [activeFilter, events])

 const handleApprove = async (id: string) => {
  const supabase = createClient()
  const { error } = await supabase.from('events').update({ status: 'published' }).eq('id', id)
  if (!error) {
   setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'published' } : e))
   showToast('Evento aprovado (publicado) com sucesso!')
   
   // Log
   await supabase.from('audit_logs').insert([{
    action: 'UPDATE', table_name: 'events', user_email: 'admin@find4sport.pt',
    new_data: { action: `Evento ${id} aprovado` }
   }])
  }
 }

 const handleReject = async (id: string) => {
  const supabase = createClient()
  const { error } = await supabase.from('events').update({ status: 'cancelled' }).eq('id', id)
  if (!error) {
   setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'cancelled' } : e))
   showToast('Evento rejeitado (cancelado) com sucesso!')
   
   // Log
   await supabase.from('audit_logs').insert([{
    action: 'UPDATE', table_name: 'events', user_email: 'admin@find4sport.pt',
    new_data: { action: `Evento ${id} rejeitado/cancelado` }
   }])
  }
 }

 const showToast = (message: string) => {
  const toast = document.getElementById('toast')
  const toastText = document.getElementById('toast-text')
  if (toast) {
   if (toastText) toastText.innerText = message
   toast.classList.remove('translate-y-full', 'opacity-0')
   setTimeout(() => {
    toast.classList.add('translate-y-full', 'opacity-0')
   }, 3000)
  }
 }

 return (
  <div className="space-y-6">
   {/* Toast Notification */}
   <div id="toast" className="fixed bottom-4 right-4 bg-foreground text-background px-6 py-3 rounded-lg shadow-xl font-medium text-sm transition-all duration-300 translate-y-full opacity-0 z-50 flex items-center gap-2">
    <span className="material-symbols-outlined text-green-500">check_circle</span>
    <span id="toast-text">Ação concluída com sucesso.</span>
   </div>

   {/* Page Header */}
   <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    <div>
     <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl tracking-tight">Gestão de Eventos</h1>
     <p className="text-muted-foreground mt-1 text-sm">Aprove torneios, monitorize inscrições e destaque eventos.</p>
    </div>
    <div className="flex gap-3">
     <Dialog open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
      <DialogTrigger className="flex items-center gap-2 px-5 py-2.5 bg-muted border border-border rounded-lg font-medium text-sm hover:bg-muted transition-all">
<span className="material-symbols-outlined text-[20px]">filter_alt</span>
        Filtros Avançados
</DialogTrigger>
      <DialogContent>
       <DialogHeader>
        <DialogTitle>Filtros Avançados de Eventos</DialogTitle>
       </DialogHeader>
       <div className="space-y-4 pt-4">
        <div className="space-y-2">
         <Label>Intervalo de Datas</Label>
         <div className="flex gap-2">
          <Input type="date" className="flex-1" />
          <Input type="date" className="flex-1" />
         </div>
        </div>
        <div className="space-y-2">
         <Label>Localidade</Label>
         <Input placeholder="Ex: Lisboa, Porto..." />
        </div>
        <div className="space-y-2">
         <Label>Preço do Bilhete</Label>
         <div className="flex gap-2">
          <Input type="number" placeholder="Min €" className="flex-1" />
          <Input type="number" placeholder="Max €" className="flex-1" />
         </div>
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90 text-white mt-4" onClick={() => setIsAdvancedFiltersOpen(false)}>
         Aplicar Filtros
        </Button>
       </div>
      </DialogContent>
     </Dialog>
    </div>
   </section>

   {/* Stats Overview */}
   <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
      <span className="material-symbols-outlined text-[64px]" data-icon="event">event</span>
     </div>
     <p className="text-muted-foreground font-medium text-sm mb-2">Eventos este Mês</p>
     <div className="flex items-end gap-2">
      <h3 className="text-2xl font-bold text-foreground">{loading ? '...' : stats.totalMonth}</h3>
      <span className="text-primary font-medium text-sm bg-primary/10 px-2 py-0.5 rounded-full mb-1">Total</span>
     </div>
    </div>
    <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-secondary-foreground">
      <span className="material-symbols-outlined text-[64px]" data-icon="calendar_month">calendar_month</span>
     </div>
     <p className="text-muted-foreground font-medium text-sm mb-2">Próximos 7 Dias</p>
     <div className="flex items-end gap-2">
      <h3 className="text-2xl font-bold text-foreground">{loading ? '...' : stats.next7Days}</h3>
      <span className="text-secondary-foreground font-medium text-sm bg-secondary/50 px-2 py-0.5 rounded-full mb-1">Urgente</span>
     </div>
    </div>
    <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/20 relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-destructive">
      <span className="material-symbols-outlined text-[64px]" data-icon="rule">rule</span>
     </div>
     <p className="text-muted-foreground font-medium text-sm mb-2">Aguardando Moderação</p>
     <div className="flex items-end gap-2">
      <h3 className="text-2xl font-bold text-destructive">{loading ? '...' : stats.pending}</h3>
      <span className="text-destructive font-medium text-sm">Pendentes</span>
     </div>
    </div>
    <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-secondary">
      <span className="material-symbols-outlined text-[64px]" data-icon="cancel">cancel</span>
     </div>
     <p className="text-muted-foreground font-medium text-sm mb-2">Eventos Cancelados</p>
     <div className="flex items-end gap-2">
      <h3 className="text-2xl font-bold text-foreground">{loading ? '...' : stats.cancelled}</h3>
      <span className="text-muted-foreground font-medium text-sm mb-1">Geral</span>
     </div>
    </div>
   </section>

   {/* Main List Section */}
   <section className="bg-card rounded-xl border border-border overflow-hidden">
    <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
     <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Tab Filters */}
      <div className="flex bg-muted/30 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
       <button onClick={() => setActiveFilter('all')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${activeFilter === 'all' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Todos</button>
       <button onClick={() => setActiveFilter('upcoming')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${activeFilter === 'upcoming' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Próximos</button>
       <button onClick={() => setActiveFilter('past')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${activeFilter === 'past' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Passados</button>
       <button onClick={() => setActiveFilter('draft')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${activeFilter === 'draft' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Rascunhos</button>
       <button onClick={() => setActiveFilter('pending')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${activeFilter === 'pending' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
        Pendentes {stats.pending > 0 && <span className="bg-destructive text-white text-[10px] px-1.5 rounded-full">{stats.pending}</span>}
       </button>
      </div>
      
      {/* Quick Search */}
      <div className="relative flex-1 sm:max-w-xs ml-auto">
       <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">search</span>
       <input 
        type="text" 
        placeholder="Pesquisar eventos..." 
        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
       />
      </div>
     </div>
    </div>

    <div className="overflow-x-auto">
     <table className="w-full text-left">
      <thead className="bg-muted/30 border-b border-border">
       <tr>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Evento / Datas</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs hidden md:table-cell">Local / Organização</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs hidden lg:table-cell">Capacidade</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Status</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs text-right">Ações de Moderação</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-border">
       {loading ? (
        <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">A carregar eventos...</td></tr>
       ) : filteredEvents.length === 0 ? (
        <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum evento encontrado para este filtro.</td></tr>
       ) : (
        paginatedData.map((event) => (
         <tr key={event.id} className={`hover:bg-muted/30 transition-colors ${event.status === 'pending' ? 'bg-destructive/5' : ''}`}>
          <td className="px-6 py-4">
           <div className="flex gap-4 items-start">
            <div className="w-14 h-14 bg-muted rounded-lg overflow-hidden shrink-0 border border-border relative">
             {event.image_url ? (
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
             ) : (
              <span className="material-symbols-outlined text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">event</span>
             )}
            </div>
            <div>
             <p className="font-semibold font-bold text-foreground leading-tight mb-1 max-w-[250px] truncate" title={event.title}>{event.title}</p>
             <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              <span>
               {new Date(event.start_date).toLocaleDateString('pt-PT')}
               {event.end_date && event.end_date !== event.start_date && ` - ${new Date(event.end_date).toLocaleDateString('pt-PT')}`}
              </span>
             </div>
            </div>
           </div>
          </td>
          <td className="px-6 py-4 hidden md:table-cell">
           <p className="text-sm text-foreground max-w-[200px] truncate mb-1" title={event.address}>
            <span className="material-symbols-outlined text-[14px] align-middle mr-1 text-muted-foreground">location_on</span>
            {event.address || 'Local não definido'}
           </p>
           <p className="text-xs text-muted-foreground">
            Org: {event.organizer_name || 'Desconhecido'}
           </p>
          </td>
          <td className="px-6 py-4 hidden lg:table-cell">
           <div className="flex items-center gap-2">
            <div className="w-full bg-muted rounded-full h-2 max-w-[100px]">
             {/* Mock progress since current_participants isn't always accurate in seed */}
             <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <span className="text-xs font-bold text-foreground">0/{event.capacity || '?'}</span>
           </div>
          </td>
          <td className="px-6 py-4">
           {event.status === 'pending' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-destructive/20 text-destructive font-semibold rounded-full text-[11px] font-bold uppercase tracking-wider">
             <span className="material-symbols-outlined text-[14px]">warning</span> Aguardando
            </span>
           )}
           {event.status === 'published' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-[11px] font-bold uppercase tracking-wider">
             <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Publicado
            </span>
           )}
           {event.status === 'draft' && (
            <span className="inline-flex items-center px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-[11px] font-bold uppercase tracking-wider">
             Rascunho
            </span>
           )}
           {event.status === 'cancelled' && (
            <span className="inline-flex items-center px-2.5 py-1 bg-destructive/10 text-destructive rounded-full text-[11px] font-bold uppercase tracking-wider">
             Cancelado
            </span>
           )}
          </td>
          <td className="px-6 py-4 text-right">
           {event.status === 'pending' ? (
            <div className="flex justify-end gap-2">
             <button onClick={() => handleReject(event.id)} className="px-3 py-1.5 border border-destructive text-destructive rounded font-medium text-sm text-xs hover:bg-destructive/10 transition-colors">Rejeitar</button>
             <button onClick={() => handleApprove(event.id)} className="px-3 py-1.5 bg-primary text-white rounded font-medium text-sm text-xs hover:bg-primary/90 transition-colors shadow-sm">Aprovar</button>
            </div>
           ) : (
            <div className="flex justify-end gap-1">
             <button className="p-2 hover:bg-muted text-muted-foreground hover:text-primary rounded-lg transition-colors" title="Editar / Ver Detalhes">
              <span className="material-symbols-outlined text-[20px]">edit</span>
             </button>
             {event.status === 'published' && (
              <button onClick={() => handleReject(event.id)} className="p-2 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-lg transition-colors" title="Cancelar Evento">
               <span className="material-symbols-outlined text-[20px]">cancel</span>
              </button>
             )}
            </div>
           )}
          </td>
         </tr>
        ))
       )}
      </tbody>
     </table>
    </div>
    
    <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredEvents.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
      </section>
  </div>
 )
}
