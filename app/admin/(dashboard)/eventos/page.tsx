'use client';
import { AlertTriangle, Calendar, CheckCircle, CheckSquare, Edit, Filter, MapPin, Plus, Search, Trash2, XCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { TablePagination } from '@/components/ui/table-pagination'
import Link from 'next/link'

export default function Page() {
  const [events, setEvents] = useState<any[]>([])
  const [filteredEvents, setFilteredEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past' | 'draft' | 'pending'>('all')
  const [stats, setStats] = useState({ totalMonth: 0, next7Days: 0, pending: 0, cancelled: 0 })
  
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const [createForm, setCreateForm] = useState({
    title: '',
    address: '',
    start_date: new Date().toISOString().split('T')[0],
    price: '0',
    capacity: '50',
    description: ''
  })

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const paginatedData = filteredEvents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [filteredEvents.length])

  const loadEvents = async () => {
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

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    const now = new Date()
    let list = [...events]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(e => 
        (e.title && e.title.toLowerCase().includes(q)) || 
        (e.address && e.address.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q))
      )
    }

    if (activeFilter === 'upcoming') {
      list = list.filter(e => new Date(e.start_date) >= now)
    } else if (activeFilter === 'past') {
      list = list.filter(e => new Date(e.start_date) < now)
    } else if (activeFilter === 'draft') {
      list = list.filter(e => e.status === 'draft')
    } else if (activeFilter === 'pending') {
      list = list.filter(e => e.status === 'pending')
    }

    setFilteredEvents(list)
  }, [activeFilter, events, searchQuery])

  const handleApprove = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('events').update({ status: 'published' }).eq('id', id)
    if (!error) {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'published' } : e))
      showToast('Evento aprovado e publicado com sucesso!')
      
      await supabase.from('audit_logs').insert([{
        action: 'UPDATE', 
        table_name: 'events', 
        user_email: 'admin@find4sport.pt',
        new_data: { action: `Evento ${id} aprovado` }
      }])
    }
  }

  const handleReject = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('events').update({ status: 'cancelled' }).eq('id', id)
    if (!error) {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'cancelled' } : e))
      showToast('Evento rejeitado / cancelado com sucesso!')
      
      await supabase.from('audit_logs').insert([{
        action: 'UPDATE', 
        table_name: 'events', 
        user_email: 'admin@find4sport.pt',
        new_data: { action: `Evento ${id} rejeitado` }
      }])
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este evento?')) return
    const supabase = createClient()
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (!error) {
      setEvents(prev => prev.filter(e => e.id !== id))
      showToast('Evento removido com sucesso.')
    }
  }

  const handleCreateEvent = async () => {
    if (!createForm.title || !createForm.address) return
    setCreating(true)
    const supabase = createClient()

    const newEvent = {
      title: createForm.title,
      address: createForm.address,
      start_date: new Date(createForm.start_date).toISOString(),
      price: parseFloat(createForm.price) || 0,
      capacity: parseInt(createForm.capacity) || 50,
      description: createForm.description || null,
      status: 'published', // Published directly by Admin
      organizer_name: 'Administração Find4Sport',
      image_url: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?q=80&w=600'
    }

    const { data, error } = await supabase.from('events').insert([newEvent]).select()

    if (!error && data) {
      setEvents(prev => [data[0], ...prev])
      showToast('Evento criado e publicado com sucesso!')
      setIsCreateOpen(false)
      setCreateForm({
        title: '',
        address: '',
        start_date: new Date().toISOString().split('T')[0],
        price: '0',
        capacity: '50',
        description: ''
      })
    } else if (error) {
      console.error('Error creating event:', error)
    }

    setCreating(false)
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
        <CheckCircle className="text-emerald-500 h-5 w-5" />
        <span id="toast-text">Ação concluída com sucesso.</span>
      </div>

      {/* Page Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl tracking-tight">Gestão de Eventos</h1>
          <p className="text-base text-muted-foreground mt-1">Aprove torneios reais, crie novos eventos e gira os registos da plataforma.</p>
        </div>

        <div className="flex gap-3">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors">
              <Plus className="h-4 w-4" />
              Criar Novo Evento
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Novo Evento Desportivo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Nome / Título do Evento</Label>
                  <Input 
                    value={createForm.title} 
                    onChange={e => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Torneio Aberto de Padel de Lisboa" 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Localização / Endereço</Label>
                  <Input 
                    value={createForm.address} 
                    onChange={e => setCreateForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Ex: Pavilhão Desportivo de Almada" 
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Data do Evento</Label>
                    <Input 
                      type="date"
                      value={createForm.start_date} 
                      onChange={e => setCreateForm(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço (€)</Label>
                    <Input 
                      type="number"
                      value={createForm.price} 
                      onChange={e => setCreateForm(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lotação</Label>
                    <Input 
                      type="number"
                      value={createForm.capacity} 
                      onChange={e => setCreateForm(prev => ({ ...prev, capacity: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea 
                    value={createForm.description}
                    onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detalhes sobre modalidades, categorias e inscrições..."
                    rows={3}
                  />
                </div>

                <Button className="w-full" onClick={handleCreateEvent} disabled={creating}>
                  {creating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  Publicar Evento
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-lg bg-muted border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors">
              <Filter className="h-4 w-4" />
              Filtros
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
                  <Input placeholder="Ex: Lisboa, Porto, Almada..." />
                </div>
                <Button className="w-full mt-4" onClick={() => setIsAdvancedFiltersOpen(false)}>
                  Aplicar Filtros
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
            <Calendar className="h-16 w-16" />
          </div>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2">Eventos este Mês</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-foreground">{loading ? '...' : stats.totalMonth}</h3>
            <span className="text-primary font-semibold text-xs bg-primary/10 px-2 py-0.5 rounded-full mb-1">Total</span>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
            <Calendar className="h-16 w-16" />
          </div>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2">Próximos 7 Dias</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-foreground">{loading ? '...' : stats.next7Days}</h3>
            <span className="text-emerald-600 font-semibold text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1">Brevemente</span>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-amber-500">
            <CheckSquare className="h-16 w-16" />
          </div>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2">Aguardando Moderação</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-amber-600 dark:text-amber-400">{loading ? '...' : stats.pending}</h3>
            <span className="text-amber-600 font-semibold text-xs bg-amber-500/10 px-2 py-0.5 rounded-full mb-1">Pendentes</span>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-destructive">
            <XCircle className="h-16 w-16" />
          </div>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2">Eventos Cancelados</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-foreground">{loading ? '...' : stats.cancelled}</h3>
          </div>
        </div>
      </section>

      {/* Main List Section */}
      <section className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/20">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {/* Tab Filters */}
            <div className="flex bg-muted p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
              <button 
                onClick={() => setActiveFilter('all')} 
                className={`px-3 py-1 font-medium text-xs rounded-md transition-all whitespace-nowrap ${activeFilter === 'all' ? 'bg-background shadow-sm font-bold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Todos ({events.length})
              </button>
              <button 
                onClick={() => setActiveFilter('upcoming')} 
                className={`px-3 py-1 font-medium text-xs rounded-md transition-all whitespace-nowrap ${activeFilter === 'upcoming' ? 'bg-background shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Próximos
              </button>
              <button 
                onClick={() => setActiveFilter('past')} 
                className={`px-3 py-1 font-medium text-xs rounded-md transition-all whitespace-nowrap ${activeFilter === 'past' ? 'bg-background shadow-sm font-bold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Passados
              </button>
              <button 
                onClick={() => setActiveFilter('pending')} 
                className={`px-3 py-1 font-medium text-xs rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${activeFilter === 'pending' ? 'bg-background shadow-sm font-bold text-amber-600' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Pendentes {stats.pending > 0 && <span className="bg-amber-500 text-white text-[10px] px-1.5 rounded-full">{stats.pending}</span>}
              </button>
            </div>
            
            {/* Quick Search */}
            <div className="relative flex-1 sm:max-w-xs ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por título ou morada..." 
                className="w-full pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Evento / Data</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider hidden md:table-cell">Localização</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Lotação</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-sm">A carregar eventos da base de dados...</p>
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40 text-primary" />
                    <p className="text-sm font-medium">Nenhum evento encontrado na base de dados para o filtro selecionado.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((event) => (
                  <tr key={event.id} className={`hover:bg-muted/30 transition-colors ${event.status === 'pending' ? 'bg-amber-500/5' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl overflow-hidden shrink-0 border border-border relative flex items-center justify-center">
                          {event.image_url ? (
                            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                          ) : (
                            <Calendar className="text-primary h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground leading-tight mb-1 max-w-[240px] truncate" title={event.title}>
                            {event.title}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 text-primary" />
                            <span>
                              {new Date(event.start_date).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-xs text-muted-foreground max-w-[200px] truncate" title={event.address}>
                        <MapPin className="h-3.5 w-3.5 inline mr-1 text-primary" />
                        {event.address || 'Localização não definida'}
                      </p>
                    </td>

                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${Math.min(100, Math.round(((event.current_participants || 0) / (event.capacity || 50)) * 100))}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {event.current_participants || 0}/{event.capacity || 50}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {event.status === 'pending' && (
                        <Badge variant="warning" className="gap-1 font-semibold text-xs">
                          <AlertTriangle className="h-3 w-3" /> Aguardando
                        </Badge>
                      )}
                      {(event.status === 'published' || event.status === 'active' || event.status === 'approved') && (
                        <Badge variant="success" className="gap-1 font-semibold text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Publicado
                        </Badge>
                      )}
                      {event.status === 'draft' && (
                        <Badge variant="secondary" className="text-xs">
                          Rascunho
                        </Badge>
                      )}
                      {event.status === 'cancelled' && (
                        <Badge variant="destructive" className="text-xs">
                          Cancelado
                        </Badge>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {event.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleReject(event.id)}>
                            Rejeitar
                          </Button>
                          <Button size="sm" onClick={() => handleApprove(event.id)}>
                            Aprovar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end items-center gap-1">
                          <Link href={`/eventos/${event.id}`} target="_blank">
                            <Button variant="ghost" size="icon" title="Ver Evento">
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(event.id)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Remover Evento"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          totalItems={filteredEvents.length} 
          itemsPerPage={ITEMS_PER_PAGE} 
          onPageChange={setCurrentPage} 
        />
      </section>
    </div>
  )
}
