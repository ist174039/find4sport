'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Dumbbell, Eye, Loader2, Search, ShieldAlert, Star, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { adminCreateProfessional, adminUpdateProfessional } from '@/app/actions/auth'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useModal } from '@/components/providers/modal-provider'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Ativos' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'suspended', label: 'Suspensos' },
] as const

type Filter = typeof FILTERS[number]['id']

export default function AdminProfessionalsPage() {
  const { showAlert, showConfirm } = useModal()
  const [professionals, setProfessionals] = useState<any[]>([])
  const [criticalReviewCount, setCriticalReviewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [invite, setInvite] = useState({ name: '', email: '' })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: profs, error }, { count }] = await Promise.all([
        supabase.from('professionals').select('*').order('full_name', { ascending: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).not('professional_id', 'is', null).lte('rating', 2),
      ])
      if (error) showAlert('Erro', 'Não foi possível carregar os profissionais.', 'error')
      setProfessionals(profs || [])
      setCriticalReviewCount(count || 0)
      setLoading(false)
    }
    void load()
  }, [showAlert])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return professionals.filter(pro => {
      if (filter === 'active' && !(pro.status === 'active' && pro.is_verified)) return false
      if (filter === 'pending' && (pro.status === 'active' || pro.is_verified)) return false
      if (filter === 'suspended' && pro.status !== 'suspended') return false
      if (!q) return true
      return `${pro.full_name || ''} ${pro.professional_name || ''} ${pro.email || ''} ${pro.address || ''}`.toLowerCase().includes(q)
    })
  }, [filter, professionals, search])

  const pending = professionals.filter(pro => !pro.is_verified && pro.status !== 'suspended').length
  const active = professionals.filter(pro => pro.is_verified && pro.status === 'active').length
  const ratingValues = professionals.map(pro => Number(pro.rating_avg)).filter(value => Number.isFinite(value) && value > 0)
  const avgRating = ratingValues.length ? ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length : 0

  async function inviteProfessional() {
    if (!invite.name.trim() || !invite.email.trim()) return showAlert('Dados em falta', 'Nome e email são obrigatórios.', 'error')
    setInviting(true)
    try {
      const result = await adminCreateProfessional({
        full_name: invite.name.trim(),
        email: invite.email.trim(),
        professional_name: invite.name.trim(),
        public_slug: `convidado-${crypto.randomUUID().slice(0, 8)}`,
      })
      if (result.error) throw new Error(result.error)
      if (result.professional) setProfessionals(current => [...current, result.professional])
      setInvite({ name: '', email: '' })
      setInviteOpen(false)
      showAlert('Criado', 'A identidade e o perfil profissional foram criados.', 'success')
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível criar o profissional.', 'error')
    } finally {
      setInviting(false)
    }
  }

  async function approve(pro: any) {
    const result = await adminUpdateProfessional(pro.id, { status: 'active', is_verified: true })
    if (result.error) return showAlert('Erro', result.error, 'error')
    if (result.professional) setProfessionals(current => current.map(item => item.id === pro.id ? result.professional : item))
    showAlert('Aprovado', 'Perfil profissional ativado e verificado.', 'success')
  }

  async function suspend(pro: any) {
    const confirmed = await showConfirm('Suspender profissional', `Suspender o acesso público de “${pro.full_name || pro.professional_name}”?`, { confirmLabel: 'Suspender', destructive: true })
    if (!confirmed) return
    const result = await adminUpdateProfessional(pro.id, { status: 'suspended', is_verified: false })
    if (result.error) return showAlert('Erro', result.error, 'error')
    if (result.professional) setProfessionals(current => current.map(item => item.id === pro.id ? result.professional : item))
    showAlert('Suspenso', 'O perfil profissional foi suspenso.', 'success')
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Profissionais"
        description="Onboarding, aprovação e estado dos perfis profissionais. Avaliações negativas são reputação, não denúncias."
        action={<Dialog open={inviteOpen} onOpenChange={setInviteOpen}><DialogTrigger render={<Button className="min-h-11"><UserPlus className="mr-2 h-4 w-4" />Criar profissional</Button>} /><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Novo profissional</DialogTitle></DialogHeader><div className="grid gap-4 pt-2"><div className="space-y-2"><Label>Nome *</Label><Input className="min-h-11 text-base" value={invite.name} onChange={e => setInvite(v => ({ ...v, name: e.target.value }))} /></div><div className="space-y-2"><Label>Email *</Label><Input type="email" className="min-h-11 text-base" value={invite.email} onChange={e => setInvite(v => ({ ...v, email: e.target.value }))} /></div><Button className="min-h-11" onClick={inviteProfessional} disabled={inviting}>{inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Criar identidade e perfil</Button></div></DialogContent></Dialog>}
      />

      <DashboardStatGrid>
        <DashboardStat label="Total" value={professionals.length} icon={<Dumbbell className="h-5 w-5" />} />
        <DashboardStat label="Ativos" value={active} icon={<CheckCircle2 className="h-5 w-5" />} />
        <DashboardStat label="Pendentes" value={pending} icon={<ShieldAlert className="h-5 w-5" />} />
        <DashboardStat label="Rating médio" value={avgRating ? avgRating.toFixed(1) : '—'} hint={`${criticalReviewCount} avaliações ≤ 2 estrelas`} icon={<Star className="h-5 w-5" />} />
      </DashboardStatGrid>

      <DashboardSection title="Perfis" description="Pesquisa e filtros locais sobre os perfis reais registados.">
        <div className="mb-4 space-y-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="min-h-11 pl-9 text-base" value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar nome, email ou localização" /></div>
          <div className="flex gap-2 overflow-x-auto pb-1">{FILTERS.map(item => <Button key={item.id} variant={filter === item.id ? 'default' : 'outline'} className="min-h-11 shrink-0" onClick={() => setFilter(item.id)}>{item.label}</Button>)}</div>
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : filtered.length === 0 ? <DashboardEmptyState icon={<Dumbbell className="h-10 w-10" />} title="Sem profissionais" description="Não existem resultados para os critérios selecionados." /> : <div className="grid gap-3">{filtered.map(pro => <article key={pro.id} className="flex flex-col gap-4 rounded-2xl border border-border p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">{pro.avatar_url ? <img src={pro.avatar_url} alt="" className="h-full w-full object-cover" /> : (pro.full_name || 'P').charAt(0)}</div><div className="min-w-0"><p className="truncate font-semibold">{pro.full_name || pro.professional_name}</p><p className="truncate text-sm text-muted-foreground">{pro.email || 'Sem email'}{pro.address ? ` · ${pro.address}` : ''}</p><div className="mt-1 flex gap-2"><Badge variant="outline">{pro.status || 'sem estado'}</Badge>{pro.is_verified && <Badge>Verificado</Badge>}</div></div></div><div className="grid grid-cols-2 gap-2 sm:flex"><Button asChild variant="outline" className="min-h-11"><Link href={`/profissionais/${pro.public_slug || pro.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" />Ver</Link></Button>{!pro.is_verified && pro.status !== 'suspended' ? <Button className="min-h-11" onClick={() => approve(pro)}>Aprovar</Button> : pro.status !== 'suspended' ? <Button variant="outline" className="min-h-11 text-destructive" onClick={() => suspend(pro)}>Suspender</Button> : null}</div></article>)}</div>}
      </DashboardSection>
    </DashboardPage>
  )
}
