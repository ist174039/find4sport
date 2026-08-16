'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Building2, CheckCircle2, Eye, Loader2, Plus, Search, ShieldAlert, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useModal } from '@/components/providers/modal-provider'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'
import { createAdminSpaceAction, getAdminSpacesAction, setAdminSpaceStatusAction } from './actions'

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Ativos' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'managed', label: 'Com gestor' },
  { id: 'unmanaged', label: 'Sem gestor' },
] as const

type Filter = typeof FILTERS[number]['id']

export default function AdminSpacesPage() {
  const { showAlert, showConfirm } = useModal()
  const [spaces, setSpaces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', address: '' })

  useEffect(() => {
    getAdminSpacesAction()
      .then(setSpaces)
      .catch(error => showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível carregar os espaços.', 'error'))
      .finally(() => setLoading(false))
  }, [showAlert])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return spaces.filter(space => {
      const isActive = space.status === 'active' && space.is_verified
      if (filter === 'active' && !isActive) return false
      if (filter === 'pending' && isActive) return false
      if (filter === 'managed' && !space.owner_user_id) return false
      if (filter === 'unmanaged' && space.owner_user_id) return false
      if (!q) return true
      return `${space.name || ''} ${space.address || ''} ${space.owner?.full_name || ''} ${space.owner?.email || ''}`.toLowerCase().includes(q)
    })
  }, [filter, search, spaces])

  const activeCount = spaces.filter(space => space.status === 'active' && space.is_verified).length
  const unmanagedCount = spaces.filter(space => !space.owner_user_id).length
  const pendingCount = spaces.length - activeCount

  async function createSpace() {
    if (!form.name.trim() || !form.address.trim()) return showAlert('Dados em falta', 'Nome e localização são obrigatórios.', 'error')
    setCreating(true)
    try {
      const created = await createAdminSpaceAction(form)
      setSpaces(current => [created, ...current])
      setForm({ name: '', address: '' })
      setCreateOpen(false)
      showAlert('Criado', 'Espaço criado em estado pendente para curadoria.', 'success')
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível criar o espaço.', 'error')
    } finally {
      setCreating(false)
    }
  }

  async function changeStatus(space: any, active: boolean) {
    if (!active) {
      const confirmed = await showConfirm('Desativar espaço', `Retirar “${space.name}” da listagem pública?`, { confirmLabel: 'Desativar', destructive: true })
      if (!confirmed) return
    }
    try {
      const updated = await setAdminSpaceStatusAction(space.id, active)
      setSpaces(current => current.map(item => item.id === space.id ? { ...item, ...updated } : item))
      showAlert('Atualizado', active ? 'Espaço ativado e verificado.' : 'Espaço colocado como pendente.', 'success')
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível alterar o espaço.', 'error')
    }
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Espaços"
        description="Catálogo e estado dos espaços. Reivindicações de propriedade são tratadas no módulo Reivindicações."
        action={<Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogTrigger render={<Button className="min-h-11"><Plus className="mr-2 h-4 w-4" />Adicionar espaço</Button>} /><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Novo espaço</DialogTitle></DialogHeader><div className="grid gap-4 pt-2"><div className="space-y-2"><Label>Nome *</Label><Input className="min-h-11 text-base" value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} /></div><div className="space-y-2"><Label>Localização *</Label><Input className="min-h-11 text-base" value={form.address} onChange={e => setForm(v => ({ ...v, address: e.target.value }))} /></div><Button onClick={createSpace} disabled={creating} className="min-h-11">{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Criar como pendente</Button></div></DialogContent></Dialog>}
      />

      <DashboardStatGrid>
        <DashboardStat label="Total" value={spaces.length} icon={<Building2 className="h-5 w-5" />} />
        <DashboardStat label="Ativos" value={activeCount} icon={<CheckCircle2 className="h-5 w-5" />} />
        <DashboardStat label="Pendentes" value={pendingCount} icon={<ShieldAlert className="h-5 w-5" />} />
        <DashboardStat label="Sem gestor" value={unmanagedCount} icon={<UserRound className="h-5 w-5" />} />
      </DashboardStatGrid>

      <DashboardSection title="Catálogo" description="Pesquisa e filtros reais sobre os espaços persistidos.">
        <div className="mb-4 space-y-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="min-h-11 pl-9 text-base" value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar espaço, localização ou gestor" /></div>
          <div className="flex gap-2 overflow-x-auto pb-1">{FILTERS.map(item => <Button key={item.id} variant={filter === item.id ? 'default' : 'outline'} className="min-h-11 shrink-0" onClick={() => setFilter(item.id)}>{item.label}</Button>)}</div>
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : filtered.length === 0 ? <DashboardEmptyState icon={<Building2 className="h-10 w-10" />} title="Sem espaços" description="Não existem resultados para os critérios selecionados." /> : <div className="grid gap-3">{filtered.map(space => <article key={space.id} className="flex flex-col gap-4 rounded-2xl border border-border p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 font-bold text-primary">{space.logo_url ? <img src={space.logo_url} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-5 w-5" />}</div><div className="min-w-0"><p className="truncate font-semibold">{space.name}</p><p className="truncate text-sm text-muted-foreground">{space.address || 'Sem localização'}</p><div className="mt-1 flex flex-wrap gap-2"><Badge variant="outline">{space.status || 'sem estado'}</Badge>{space.is_verified && <Badge>Verificado</Badge>}<Badge variant="secondary">{space.owner ? `Gestor: ${space.owner.full_name || space.owner.email}` : 'Sem gestor'}</Badge></div></div></div><div className="grid grid-cols-2 gap-2 sm:flex"><Button asChild variant="outline" className="min-h-11"><Link href={`/espacos/${space.slug || space.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" />Ver</Link></Button>{space.status === 'active' && space.is_verified ? <Button variant="outline" className="min-h-11 text-destructive" onClick={() => changeStatus(space, false)}>Desativar</Button> : <Button className="min-h-11" onClick={() => changeStatus(space, true)}>Ativar</Button>}</div></article>)}</div>}
      </DashboardSection>
    </DashboardPage>
  )
}
