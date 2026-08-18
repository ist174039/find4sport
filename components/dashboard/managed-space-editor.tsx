'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { Building2, CheckCircle2, Loader2, MapPin, Plus, Search, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClaimSpaceModal } from '@/components/dashboard/claim-space-modal'
import { SpaceProfessionalLink } from '@/components/dashboard/space-professional-link'
import { useModal } from '@/components/providers/modal-provider'
import { searchUnclaimedSpacesAction, updateManagedSpaceAction } from '@/app/dashboard/espaco/actions'

type ManagedSpace = { id: string; name: string; description?: string | null; email?: string | null; phone?: string | null; website?: string | null; address?: string | null; amenities?: string[] | null; slug?: string | null; is_verified?: boolean | null; status?: string | null }
type ClaimSpace = { id: string; name: string; address?: string | null }
type SpaceForm = { name: string; description: string; email: string; phone: string; website: string; address: string; amenities: string }

const emptyForm: SpaceForm = { name: '', description: '', email: '', phone: '', website: '', address: '', amenities: '' }
const formFromSpace = (space?: ManagedSpace | null): SpaceForm => space ? {
  name: space.name || '',
  description: space.description || '',
  email: space.email || '',
  phone: space.phone || '',
  website: space.website || '',
  address: space.address || '',
  amenities: Array.isArray(space.amenities) ? space.amenities.join(', ') : '',
} : emptyForm

export function ManagedSpaceEditor({ initialSpaces }: { initialSpaces: ManagedSpace[] }) {
  const { showAlert } = useModal()
  const [spaces, setSpaces] = useState(initialSpaces)
  const [spaceId, setSpaceId] = useState(initialSpaces[0]?.id || '')
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [claimResults, setClaimResults] = useState<ClaimSpace[]>([])
  const [selectedClaim, setSelectedClaim] = useState<ClaimSpace | null>(null)
  const [claimOpen, setClaimOpen] = useState(false)
  const [searching, startSearchTransition] = useTransition()
  const selected = spaces.find(space => space.id === spaceId) || null
  const [form, setForm] = useState<SpaceForm>(() => formFromSpace(initialSpaces[0]))

  useEffect(() => {
    const timeout = setTimeout(() => {
      startSearchTransition(async () => {
        try { setClaimResults(await searchUnclaimedSpacesAction(query)) } catch { setClaimResults([]) }
      })
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  const selectSpace = (value: string) => {
    const next = spaces.find(space => space.id === value)
    if (!next) return
    setSpaceId(value)
    setForm(formFromSpace(next))
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!selected) return
    setSaving(true)
    try {
      const updated = await updateManagedSpaceAction(selected.id, { name: form.name, description: form.description, email: form.email, phone: form.phone, website: form.website, address: form.address, amenities: form.amenities.split(',').map(item => item.trim()).filter(Boolean) })
      setSpaces(prev => prev.map(space => space.id === updated.id ? updated as ManagedSpace : space))
      showAlert('Espaço atualizado', 'As informações públicas foram guardadas.', 'success')
    } catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível guardar o espaço.', 'error') }
    finally { setSaving(false) }
  }

  if (!selected) return <div className="rounded-2xl border border-dashed bg-card p-10 text-center"><Building2 className="mx-auto h-10 w-10 text-muted-foreground/40" /><h2 className="mt-3 font-semibold">Nenhum espaço associado</h2><p className="mt-2 text-sm text-muted-foreground">Registe um novo espaço ou conclua uma reivindicação aprovada.</p><Button asChild className="mt-5"><Link href="/auth/registar/espaco"><Plus className="mr-2 h-4 w-4" />Registar espaço</Link></Button></div>

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0"><h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">O meu espaço</h1><p className="mt-1 text-sm text-muted-foreground">Informação pública e contactos do espaço. Salas/campos são geridos no módulo próprio.</p></div>
        {spaces.length > 1 && <Select value={spaceId} onValueChange={value => value && selectSpace(value)}><SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger><SelectContent>{spaces.map(space => <SelectItem key={space.id} value={space.id}>{space.name}</SelectItem>)}</SelectContent></Select>}
      </div>

      <div className="flex flex-wrap gap-2">{selected.is_verified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Verificado</span>}{selected.status && <span className="rounded-full border px-3 py-1 text-xs font-medium capitalize">{selected.status}</span>}<Button asChild variant="outline" size="sm"><Link href={`/espacos/${selected.slug || selected.id}`}>Ver página pública</Link></Button></div>

      <form onSubmit={save} className="min-w-0 space-y-5">
        <section className="min-w-0 overflow-hidden rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /><h2 className="font-semibold">Informação geral</h2></div>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div className="min-w-0 space-y-2 sm:col-span-2"><Label htmlFor="space-name">Nome</Label><Input id="space-name" value={form.name} onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))} required maxLength={160} className="w-full" /></div>
            <div className="min-w-0 space-y-2 sm:col-span-2"><Label htmlFor="space-description">Descrição</Label><Textarea id="space-description" value={form.description} onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))} rows={5} maxLength={5000} /></div>
            <div className="min-w-0 space-y-2"><Label htmlFor="space-email">Email</Label><Input id="space-email" type="email" value={form.email} onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))} /></div>
            <div className="min-w-0 space-y-2"><Label htmlFor="space-phone">Telefone</Label><Input id="space-phone" type="tel" value={form.phone} onChange={event => setForm(prev => ({ ...prev, phone: event.target.value }))} /></div>
            <div className="min-w-0 space-y-2 sm:col-span-2"><Label htmlFor="space-address" className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-muted-foreground" />Morada</Label><Input id="space-address" value={form.address} onChange={event => setForm(prev => ({ ...prev, address: event.target.value }))} /></div>
            <div className="min-w-0 space-y-2 sm:col-span-2"><Label htmlFor="space-website">Website</Label><Input id="space-website" type="url" value={form.website} onChange={event => setForm(prev => ({ ...prev, website: event.target.value }))} placeholder="https://" /></div>
          </div>
        </section>
        <section className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm sm:p-5"><h2 className="font-semibold">Comodidades</h2><p className="mt-1 text-xs text-muted-foreground">Separe os itens por vírgulas.</p><Textarea value={form.amenities} onChange={event => setForm(prev => ({ ...prev, amenities: event.target.value }))} rows={3} className="mt-3" placeholder="Balneários, estacionamento, Wi-Fi..." /></section>
        <div className="flex justify-end"><Button type="submit" disabled={saving} className="w-full sm:w-auto">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar alterações</Button></div>
      </form>

      <SpaceProfessionalLink mode="space" targetId={selected.id} />

      <section className="rounded-2xl border bg-muted/20 p-4 sm:p-5">
        <div><h2 className="font-semibold">Adicionar outro espaço existente</h2><p className="text-sm text-muted-foreground">Pesquise espaços sem gestor e submeta uma reivindicação.</p></div>
        <label className="relative mt-4 block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Pesquisar espaço sem gestor..." className="pl-10" /></label>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{searching ? <div className="col-span-full py-5 text-center text-sm text-muted-foreground"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />A pesquisar…</div> : claimResults.length ? claimResults.map(space => <div key={space.id} className="rounded-xl border bg-card p-4"><h3 className="font-semibold">{space.name}</h3><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{space.address || 'Sem morada registada'}</p><Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => { setSelectedClaim(space); setClaimOpen(true) }}><ShieldAlert className="mr-2 h-4 w-4" />Reivindicar</Button></div>) : <p className="col-span-full rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Nenhum espaço sem gestor encontrado.</p>}</div>
        <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">O espaço ainda não existe?</p><Button asChild variant="outline"><Link href="/auth/registar/espaco"><Plus className="mr-2 h-4 w-4" />Registar novo espaço</Link></Button></div>
      </section>

      <ClaimSpaceModal isOpen={claimOpen} onClose={() => setClaimOpen(false)} space={selectedClaim} onSuccess={() => { setClaimResults(prev => prev.filter(item => item.id !== selectedClaim?.id)); setSelectedClaim(null) }} />
    </div>
  )
}
