'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

const FILTERS = [
  { id: 'all', label: 'Todos' }, { id: 'upcoming', label: 'Próximos' }, { id: 'past', label: 'Passados' }, { id: 'pending', label: 'Pendentes' }, { id: 'draft', label: 'Rascunhos' },
] as const
type Filter = typeof FILTERS[number]['id']
const PAGE_SIZE = 20

export default function AdminEventsPage() {
  const { showAlert, showConfirm } = useModal()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', address: '', startDate: '', startTime: '', price: '', capacity: '', description: '' })

  async function reload() {
    setLoading(true)
    try { setEvents(await getAdminEvents()) }
    catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível carregar os eventos.', 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { void reload() }, [])

  const filtered = useMemo(() => {
    const now = new Date(); const q = search.trim().toLowerCase()
    return events.filter(event => {
      const haystack = `${event.title || ''} ${event.address || ''} ${event.description || ''}`.toLowerCase()
      if (q && !haystack.includes(q)) return false
      const date = event.start_date ? new Date(event.start_date) : null
      if (filter === 'upcoming' && (!date || date < now)) return false
      if (filter === 'past' && (!date || date >= now)) return false
      if (filter === 'pending' && event.status !== 'pending') return false
      if (filter === 'draft' && event.status !== 'draft') return false
      return true
    })
  }, [events, filter, search])
  useEffect(() => setPage(1), [filter, search])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)); const safePage = Math.min(page, totalPages); const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const stats = useMemo(() => { const now = new Date(); const next7 = new Date(now.getTime() + 7 * 86400000); return { total: events.length, upcoming: events.filter(e => e.start_date && new Date(e.start_date) >= now).length, next7: events.filter(e => e.start_date && new Date(e.start_date) >= now && new Date(e.start_date) <= next7).length, pending: events.filter(e => e.status === 'pending').length } }, [events])

  async function changeStatus(id: string, action: 'approve' | 'reject') { const result = action === 'approve' ? await approveEventAction(id) : await rejectEventAction(id); if (result.error) return showAlert('Erro', result.error.message || 'Não foi possível atualizar o evento.', 'error'); setEvents(current => current.map(event => event.id === id ? { ...event, status: action === 'approve' ? 'published' : 'cancelled' } : event)); showAlert('Atualizado', action === 'approve' ? 'Evento publicado.' : 'Evento cancelado.', 'success') }
  async function removeEvent(id: string, title: string) { const confirmed = await showConfirm('Eliminar evento', `Eliminar definitivamente “${title}”?`, { confirmLabel: 'Eliminar', destructive: true }); if (!confirmed) return; const result = await deleteEventAction(id); if (result.error) return showAlert('Erro', result.error.message || 'Não foi possível eliminar o evento.', 'error'); setEvents(current => current.filter(event => event.id !== id)); showAlert('Eliminado', 'Evento eliminado com sucesso.', 'success') }
  async function createEvent() { if (!form.title.trim() || !form.startDate) return showAlert('Dados em falta', 'Título e data são obrigatórios.', 'error'); setCreating(true); try { const startDate = new Date(`${form.startDate}T${form.startTime || '00:00'}:00`); const { data, error } = await createAdminEventAction({ title: form.title.trim(), address: form.address.trim() || null, start_date: startDate.toISOString(), price_min: form.price ? Number(form.price) : 0, price_max: form.price ? Number(form.price) : 0, capacity: form.capacity ? Number(form.capacity) : null, description: form.description.trim() || null, status: 'published' }); if (error) throw error; if (data?.[0]) setEvents(current => [data[0], ...current]); setCreateOpen(false); setForm({ title: '', address: '', startDate: '', startTime: '', price: '', capacity: '', description: '' }); showAlert('Criado', 'Evento criado e publicado com os dados fornecidos.', 'success') } catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível criar o evento.', 'error') } finally { setCreating(false) } }

  return <DashboardPage>
    <DashboardPageHeader title="Eventos" description="Aprovação, publicação e manutenção dos eventos registados na plataforma." action={<Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogTrigger render={<Button className="min-h-11"><Plus className="mr-2 h-4 w-4" />Criar evento</Button>} /><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>Criar evento</DialogTitle></DialogHeader><div className="grid gap-4 pt-2"><div className="space-y-2"><Label>Título *</Label><Input className="min-h-11 text-base" value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} /></div><div className="space-y-2"><Label>Localização</Label><Input className="min-h-11 text-base" value={form.address} onChange={e => setForm(v => ({ ...v, address: e.target.value }))} /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Data *</Label><Input type="date" className="min-h-11 text-base" value={form.startDate} onChange={e => setForm(v => ({ ...v, startDate: e.target.value }))} /></div><div className="space-y-2"><Label>Hora</Label><Input type="time" className="min-h-11 text-base" value={form.startTime} onChange={e => setForm(v => ({ ...v, startTime: e.target.value }))} /></div></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Preço (€)</Label><Input type="number" min="0" step="0.01" className="min-h-11 text-base" value={form.price} onChange={e => setForm(v => ({ ...v, price: e.target.value }))} /></div><div className="space-y-2"><Label>Capacidade</Label><Input type="number" min="1" className="min-h-11 text-base" value={form.capacity} onChange={e => setForm(v => ({ ...v, capacity: e.target.value }))} /></div></div><div className="space-y-2"><Label>Descrição</Label><Textarea className="min-h-28 text-base" value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} /></div><Button onClick={createEvent} disabled={creating} className="min-h-11">{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Publicar evento</Button></div></DialogContent></Dialog>} />
    <DashboardStatGrid><DashboardStat label="Total" value={stats.total} icon={<Calendar className="h-5 w-5" />} /><DashboardStat label="Próximos" value={stats.upcoming} icon={<Calendar className="h-5 w-5" />} /><DashboardStat label="Próximos 7 dias" value={stats.next7} icon={<CheckCircle2 className="h-5 w-5" />} /><DashboardStat label="Pendentes" value={stats.pending} icon={<XCircle className="h-5 w-5" />} /></DashboardStatGrid>
    <DashboardSection title="Lista de eventos" description="Pesquisa, filtros e paginação funcional."><div className="mb-4 space-y-3"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar por título, local ou descrição" className="min-h-11 pl-9 text-base" /></div><div className="flex gap-2 overflow-x-auto pb-1">{FILTERS.map(item => <Button key={item.id} type="button" variant={filter === item.id ? 'default' : 'outline'} className="min-h-11 shrink-0" onClick={() => setFilter(item.id)}>{item.label}</Button>)}</div></div>
      {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : visible.length === 0 ? <DashboardEmptyState icon={<Calendar className="h-10 w-10" />} title="Sem eventos" description="Não existem eventos para os critérios selecionados." /> : <div className="grid gap-3">{visible.map(event => <article key={event.id} className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border p-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="break-words font-semibold">{event.title}</h3><Badge variant="outline">{event.status || 'sem estado'}</Badge></div><p className="mt-1 break-words text-sm text-muted-foreground">{event.start_date ? new Date(event.start_date).toLocaleString('pt-PT') : 'Data não indicada'}{event.address ? ` · ${event.address}` : ''}</p></div><div className="grid grid-cols-2 gap-2 sm:flex">{event.status === 'pending' && <><Button variant="outline" className="min-h-11" onClick={() => changeStatus(event.id, 'reject')}>Rejeitar</Button><Button className="min-h-11" onClick={() => changeStatus(event.id, 'approve')}>Aprovar</Button></>}<Button asChild variant="outline" size="icon" className="h-11 w-full sm:w-11"><Link href={`/eventos/${event.slug || event.id}`} target="_blank" aria-label="Ver evento"><Eye className="h-4 w-4" /></Link></Button><Button variant="ghost" size="icon" className="h-11 w-full text-destructive sm:w-11" onClick={() => removeEvent(event.id, event.title)} aria-label="Eliminar evento"><Trash2 className="h-4 w-4" /></Button></div></article>)}</div>}
      <TablePagination currentPage={safePage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={PAGE_SIZE} onPageChange={setPage} />
    </DashboardSection>
  </DashboardPage>
}
