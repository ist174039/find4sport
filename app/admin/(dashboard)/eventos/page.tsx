'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, CheckCircle2, Eye, Loader2, Plus, Search, Trash2, XCircle } from 'lucide-react'
import { approveEventAction, createAdminEventAction, deleteEventAction, getAdminEvents, rejectEventAction } from './actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { TablePagination } from '@/components/ui/table-pagination'
import { useModal } from '@/components/providers/modal-provider'
import { DashboardEmptyState, DashboardErrorState, DashboardLoadingState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'upcoming', label: 'Próximos' },
  { id: 'past', label: 'Passados' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'draft', label: 'Rascunhos' },
] as const

type Filter = typeof FILTERS[number]['id']
type AdminEventResult = Awaited<ReturnType<typeof getAdminEvents>>
type AdminEvent = AdminEventResult['items'][number]
const PAGE_SIZE = 20

const emptyStats = { total: 0, upcoming: 0, next7: 0, pending: 0 }

export default function AdminEventsPage() {
  const { showAlert, showConfirm } = useModal()
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [stats, setStats] = useState(emptyStats)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', address: '', startDate: '', startTime: '', price: '', capacity: '', description: '' })

  async function load(targetPage = page, targetSearch = search, targetFilter = filter) {
    setLoading(true)
    setLoadError(null)
    try {
      const result = await getAdminEvents({ page: targetPage, pageSize: PAGE_SIZE, search: targetSearch, filter: targetFilter })
      setEvents(result.items)
      setStats(result.stats)
      setPage(result.page)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (error) {
      setEvents([])
      setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar os eventos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load(1, '', 'all') }, [])

  async function applyFilters(nextFilter = filter) {
    const q = searchInput.trim()
    setSearch(q)
    setFilter(nextFilter)
    setPage(1)
    await load(1, q, nextFilter)
  }

  async function changeStatus(id: string, action: 'approve' | 'reject') {
    try {
      if (action === 'approve') await approveEventAction(id)
      else await rejectEventAction(id)
      showAlert('Atualizado', action === 'approve' ? 'Evento publicado.' : 'Evento cancelado.', 'success')
      await load(page, search, filter)
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível atualizar o evento.', 'error')
    }
  }

  async function removeEvent(id: string, title: string) {
    const confirmed = await showConfirm('Eliminar evento', `Eliminar definitivamente “${title}”?`, { confirmLabel: 'Eliminar', destructive: true })
    if (!confirmed) return
    try {
      await deleteEventAction(id)
      showAlert('Eliminado', 'Evento eliminado com sucesso e registado no Audit Log.', 'success')
      await load(page, search, filter)
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível eliminar o evento.', 'error')
    }
  }

  async function createEvent() {
    if (!form.title.trim() || !form.startDate) return showAlert('Dados em falta', 'Título e data são obrigatórios.', 'error')
    const startDate = new Date(`${form.startDate}T${form.startTime || '00:00'}:00`)
    if (Number.isNaN(startDate.getTime())) return showAlert('Data inválida', 'Indique uma data e hora válidas.', 'error')

    setCreating(true)
    try {
      await createAdminEventAction({
        title: form.title.trim(),
        address: form.address.trim() || null,
        start_date: startDate.toISOString(),
        price_min: form.price ? Number(form.price) : 0,
        price_max: form.price ? Number(form.price) : 0,
        capacity: form.capacity ? Number(form.capacity) : null,
        description: form.description.trim() || null,
      })
      setCreateOpen(false)
      setForm({ title: '', address: '', startDate: '', startTime: '', price: '', capacity: '', description: '' })
      showAlert('Criado', 'Evento criado, publicado e registado no Audit Log.', 'success')
      await load(1, search, filter)
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível criar o evento.', 'error')
    } finally {
      setCreating(false)
    }
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Eventos"
        description="Aprovação, publicação e manutenção dos eventos, com pesquisa, filtros e paginação processados no servidor."
        action={(
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button className="min-h-11"><Plus className="mr-2 h-4 w-4" />Criar evento</Button>} />
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
              <DialogHeader><DialogTitle>Criar evento</DialogTitle></DialogHeader>
              <div className="grid gap-4 pt-2">
                <div className="space-y-2"><Label htmlFor="admin-event-title">Título *</Label><Input id="admin-event-title" required maxLength={160} className="min-h-11 text-base" value={form.title} onChange={event => setForm(value => ({ ...value, title: event.target.value }))} /></div>
                <div className="space-y-2"><Label htmlFor="admin-event-address">Localização</Label><Input id="admin-event-address" maxLength={500} className="min-h-11 text-base" value={form.address} onChange={event => setForm(value => ({ ...value, address: event.target.value }))} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="admin-event-date">Data *</Label><Input id="admin-event-date" type="date" required className="min-h-11 text-base" value={form.startDate} onChange={event => setForm(value => ({ ...value, startDate: event.target.value }))} /></div>
                  <div className="space-y-2"><Label htmlFor="admin-event-time">Hora</Label><Input id="admin-event-time" type="time" className="min-h-11 text-base" value={form.startTime} onChange={event => setForm(value => ({ ...value, startTime: event.target.value }))} /></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="admin-event-price">Preço (€)</Label><Input id="admin-event-price" type="number" min="0" max="1000000" step="0.01" className="min-h-11 text-base" value={form.price} onChange={event => setForm(value => ({ ...value, price: event.target.value }))} /></div>
                  <div className="space-y-2"><Label htmlFor="admin-event-capacity">Capacidade</Label><Input id="admin-event-capacity" type="number" min="1" max="1000000" step="1" className="min-h-11 text-base" value={form.capacity} onChange={event => setForm(value => ({ ...value, capacity: event.target.value }))} /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="admin-event-description">Descrição</Label><Textarea id="admin-event-description" maxLength={2000} className="min-h-28 text-base" value={form.description} onChange={event => setForm(value => ({ ...value, description: event.target.value }))} /></div>
                <Button onClick={createEvent} disabled={creating} className="min-h-11">{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Publicar evento</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      />

      <DashboardStatGrid>
        <DashboardStat label="Total" value={stats.total} icon={<Calendar className="h-5 w-5" />} />
        <DashboardStat label="Próximos" value={stats.upcoming} icon={<Calendar className="h-5 w-5" />} />
        <DashboardStat label="Próximos 7 dias" value={stats.next7} icon={<CheckCircle2 className="h-5 w-5" />} />
        <DashboardStat label="Pendentes" value={stats.pending} icon={<XCircle className="h-5 w-5" />} />
      </DashboardStatGrid>

      <DashboardSection title="Lista de eventos" description="Pesquisa por título, local ou descrição; filtros e paginação são aplicados na base de dados.">
        <div className="mb-4 space-y-3">
          <form onSubmit={event => { event.preventDefault(); void applyFilters() }} className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label className="relative min-w-0">
              <span className="sr-only">Pesquisar eventos</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Pesquisar por título, local ou descrição" className="min-h-11 w-full pl-9 text-base" maxLength={100} />
            </label>
            <Button type="submit" variant="outline" className="min-h-11">Pesquisar</Button>
          </form>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map(item => <Button key={item.id} type="button" variant={filter === item.id ? 'default' : 'outline'} className="min-h-11 shrink-0" onClick={() => void applyFilters(item.id)}>{item.label}</Button>)}
          </div>
        </div>

        {loading ? (
          <DashboardLoadingState label="A carregar eventos…" />
        ) : loadError ? (
          <DashboardErrorState title="Não foi possível carregar os eventos" description={loadError} action={<Button variant="outline" onClick={() => void load(page, search, filter)}>Tentar novamente</Button>} />
        ) : events.length === 0 ? (
          <DashboardEmptyState icon={<Calendar className="h-10 w-10" />} title="Sem eventos" description="Não existem eventos para os critérios selecionados." />
        ) : (
          <div className="grid gap-3">
            {events.map(event => (
              <article key={event.id} className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="break-words font-semibold">{event.title}</h3><Badge variant="outline">{event.status || 'sem estado'}</Badge></div>
                  <p className="mt-1 break-words text-sm text-muted-foreground">{event.start_date ? new Date(event.start_date).toLocaleString('pt-PT') : 'Data não indicada'}{event.address ? ` · ${event.address}` : ''}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  {event.status === 'pending' && <><Button variant="outline" className="min-h-11" onClick={() => void changeStatus(event.id, 'reject')}>Rejeitar</Button><Button className="min-h-11" onClick={() => void changeStatus(event.id, 'approve')}>Aprovar</Button></>}
                  <Button asChild variant="outline" size="icon" className="h-11 w-full sm:w-11"><Link href={`/eventos/${event.slug || event.id}`} target="_blank" aria-label="Ver evento"><Eye className="h-4 w-4" /></Link></Button>
                  <Button variant="ghost" size="icon" className="h-11 w-full text-destructive sm:w-11" onClick={() => void removeEvent(event.id, event.title)} aria-label="Eliminar evento"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !loadError && total > 0 && (
          <TablePagination currentPage={page} totalPages={totalPages} totalItems={total} itemsPerPage={PAGE_SIZE} onPageChange={nextPage => void load(nextPage, search, filter)} />
        )}
      </DashboardSection>
    </DashboardPage>
  )
}
