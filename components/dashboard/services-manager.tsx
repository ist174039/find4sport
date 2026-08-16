'use client'

import { useMemo, useState } from 'react'
import { Clock, Euro, MoreVertical, Pencil, Plus, Power, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useModal } from '@/components/providers/modal-provider'
import { createService, deleteService, toggleServiceActive, updateService } from '@/app/dashboard/servicos/actions'

type ServiceRow = {
  id: string
  name: string
  description: string | null
  duration_minutes: number | null
  price: number | null
  price_unit: string | null
  modality: string | null
  is_active: boolean | null
  created_at?: string
}

type FormState = { name: string; description: string; duration_minutes: number; price: string; price_unit: string; modality: string }
const emptyForm: FormState = { name: '', description: '', duration_minutes: 60, price: '', price_unit: 'sessao', modality: 'presencial' }

export function ServicesManager({ initialServices }: { initialServices: ServiceRow[] }) {
  const { showAlert, showConfirm } = useModal()
  const [services, setServices] = useState(initialServices)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const stats = useMemo(() => ({ total: services.length, active: services.filter(service => service.is_active !== false).length }), [services])

  function openCreate() { setEditingId(null); setForm(emptyForm); setDialogOpen(true) }
  function openEdit(service: ServiceRow) {
    setEditingId(service.id)
    setForm({ name: service.name, description: service.description || '', duration_minutes: service.duration_minutes || 60, price: service.price == null ? '' : String(service.price), price_unit: service.price_unit || 'sessao', modality: service.modality || 'presencial' })
    setDialogOpen(true)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      const input = { name: form.name, description: form.description || null, duration_minutes: form.duration_minutes, price: form.price === '' ? null : Number(form.price), price_unit: form.price_unit, modality: form.modality }
      if (editingId) {
        const updated = await updateService(editingId, input)
        setServices(prev => prev.map(service => service.id === editingId ? updated as ServiceRow : service))
        showAlert('Serviço atualizado', 'As alterações foram guardadas.', 'success')
      } else {
        const created = await createService(input)
        setServices(prev => [created as ServiceRow, ...prev])
        showAlert('Serviço criado', 'O serviço foi adicionado à sua oferta.', 'success')
      }
      setDialogOpen(false)
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível guardar o serviço.', 'error')
    } finally { setSaving(false) }
  }

  async function toggle(service: ServiceRow) {
    const next = service.is_active === false
    setBusyId(service.id)
    try {
      const updated = await toggleServiceActive(service.id, next)
      setServices(prev => prev.map(item => item.id === service.id ? updated as ServiceRow : item))
      showAlert(next ? 'Serviço ativado' : 'Serviço desativado', next ? 'O serviço voltou a estar disponível.' : 'O serviço deixou de estar disponível publicamente.', 'success')
    } catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível alterar o serviço.', 'error') }
    finally { setBusyId(null) }
  }

  async function remove(service: ServiceRow) {
    const confirmed = await showConfirm('Eliminar serviço', `Eliminar definitivamente “${service.name}”? Se existir histórico associado, utilize Desativar.`, { confirmLabel: 'Eliminar', destructive: true })
    if (!confirmed) return
    setBusyId(service.id)
    try {
      await deleteService(service.id)
      setServices(prev => prev.filter(item => item.id !== service.id))
      showAlert('Serviço eliminado', 'O serviço foi removido.', 'success')
    } catch (error) { showAlert('Não foi possível eliminar', error instanceof Error ? error.message : 'Erro inesperado.', 'error') }
    finally { setBusyId(null) }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Serviços</h1><p className="mt-1 text-sm text-muted-foreground">Defina o que oferece, duração, modalidade, preço e disponibilidade.</p></div>
        <Button onClick={openCreate} className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" />Novo serviço</Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</p><p className="mt-1 text-2xl font-bold">{stats.total}</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ativos</p><p className="mt-1 text-2xl font-bold">{stats.active}</p></div>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-10 text-center"><h2 className="font-semibold">Ainda não existem serviços</h2><p className="mt-2 text-sm text-muted-foreground">Crie o primeiro serviço para o apresentar no seu perfil.</p><Button onClick={openCreate} className="mt-5"><Plus className="mr-2 h-4 w-4" />Criar serviço</Button></div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {services.map(service => {
            const active = service.is_active !== false
            return (
              <article key={service.id} className={`rounded-2xl border bg-card p-4 shadow-sm sm:p-5 ${!active ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{service.name}</h2><Badge variant={active ? 'success' : 'secondary'}>{active ? 'Ativo' : 'Inativo'}</Badge></div>{service.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{service.description}</p>}</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={busyId === service.id} aria-label="Ações do serviço"><MoreVertical className="h-4 w-4" /></Button>} />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(service)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void toggle(service)}><Power className="mr-2 h-4 w-4" />{active ? 'Desativar' : 'Ativar'}</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => void remove(service)}><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 border-t pt-3 text-sm text-muted-foreground">
                  {service.duration_minutes ? <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{service.duration_minutes} min</span> : null}
                  {service.price != null ? <span className="flex items-center gap-1.5 font-medium text-foreground"><Euro className="h-4 w-4" />{Number(service.price).toFixed(2)} / {service.price_unit || 'sessão'}</span> : <span>Preço sob consulta</span>}
                  <span className="capitalize">{service.modality || 'presencial'}</span>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? 'Editar serviço' : 'Novo serviço'}</DialogTitle><DialogDescription>Os dados apresentados aqui são usados no perfil público e na reserva.</DialogDescription></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="service-name">Nome</Label><Input id="service-name" value={form.name} onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))} required maxLength={120} /></div>
            <div className="space-y-2"><Label htmlFor="service-description">Descrição</Label><Textarea id="service-description" value={form.description} onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))} rows={4} maxLength={2000} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Duração</Label><Select value={String(form.duration_minutes)} onValueChange={value => setForm(prev => ({ ...prev, duration_minutes: Number(value) }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[30,45,60,90,120].map(value => <SelectItem key={value} value={String(value)}>{value} min</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Modalidade</Label><Select value={form.modality} onValueChange={value => setForm(prev => ({ ...prev, modality: value || 'presencial' }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="presencial">Presencial</SelectItem><SelectItem value="online">Online</SelectItem><SelectItem value="ambos">Presencial e online</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label htmlFor="service-price">Preço (€)</Label><Input id="service-price" type="number" min="0" step="0.01" value={form.price} onChange={event => setForm(prev => ({ ...prev, price: event.target.value }))} placeholder="Opcional" /></div>
              <div className="space-y-2"><Label>Unidade</Label><Select value={form.price_unit} onValueChange={value => setForm(prev => ({ ...prev, price_unit: value || 'sessao' }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sessao">Por sessão</SelectItem><SelectItem value="hora">Por hora</SelectItem><SelectItem value="mes">Por mês</SelectItem><SelectItem value="pack">Por pack</SelectItem></SelectContent></Select></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? 'A guardar…' : editingId ? 'Guardar alterações' : 'Criar serviço'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
