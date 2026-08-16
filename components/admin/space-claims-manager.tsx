'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Clock3, MapPin, Search, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { TablePagination } from '@/components/ui/table-pagination'
import { useModal } from '@/components/providers/modal-provider'
import { decideSpaceClaimAction } from '@/app/admin/(dashboard)/reivindicacoes/actions'

type Claim = { id: string; status: string; message: string | null; documents_url: string | null; created_at: string; space_id: string; user_id: string; space_name: string; space_address: string; user_name: string; user_email: string }
const PAGE_SIZE = 20

export function SpaceClaimsManager({ initialClaims }: { initialClaims: Claim[] }) {
  const { showAlert, showConfirm } = useModal()
  const [claims, setClaims] = useState(initialClaims)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return claims.filter(claim => {
      if (filter !== 'all' && claim.status !== filter) return false
      if (!q) return true
      return [claim.space_name, claim.space_address, claim.user_name, claim.user_email, claim.message].some(value => value?.toLowerCase().includes(q))
    })
  }, [claims, filter, query])
  useEffect(() => setPage(1), [filter, query])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const counts = useMemo(() => ({ pending: claims.filter(c => c.status === 'pending').length, approved: claims.filter(c => c.status === 'approved').length, rejected: claims.filter(c => c.status === 'rejected').length }), [claims])

  async function decide(claim: Claim, decision: 'approved' | 'rejected') {
    const confirmed = await showConfirm(decision === 'approved' ? 'Aprovar reivindicação' : 'Rejeitar reivindicação', decision === 'approved' ? `Atribuir “${claim.space_name}” a ${claim.user_name}? O espaço ficará verificado e associado a este gestor.` : `Rejeitar a reivindicação de ${claim.user_name} para “${claim.space_name}”?`, { confirmLabel: decision === 'approved' ? 'Aprovar' : 'Rejeitar', destructive: decision === 'rejected' })
    if (!confirmed) return
    setBusyId(claim.id)
    try { const result = await decideSpaceClaimAction(claim.id, decision); setClaims(prev => prev.map(item => item.id === claim.id ? { ...item, status: result.status } : item)); showAlert(decision === 'approved' ? 'Reivindicação aprovada' : 'Reivindicação rejeitada', 'A decisão foi guardada e registada no Audit Log.', 'success') }
    catch (error) { showAlert('Não foi possível concluir', error instanceof Error ? error.message : 'Erro inesperado.', 'error') }
    finally { setBusyId(null) }
  }

  const statusBadge = (status: string) => <Badge variant={status === 'approved' ? 'success' : status === 'rejected' ? 'destructive' : 'secondary'}>{status === 'approved' ? 'Aprovada' : status === 'rejected' ? 'Rejeitada' : 'Pendente'}</Badge>

  return (
    <div className="min-w-0 space-y-5">
      <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reivindicações de espaços</h1><p className="mt-1 text-sm text-muted-foreground">Valide pedidos de gestores antes de atribuir e verificar um espaço.</p></div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3"><button onClick={() => setFilter('pending')} className={`rounded-xl border p-3 text-left sm:p-4 ${filter === 'pending' ? 'border-primary bg-primary/5' : 'bg-card'}`}><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">Pendentes</p><p className="mt-1 text-xl font-bold sm:text-2xl">{counts.pending}</p></button><button onClick={() => setFilter('approved')} className={`rounded-xl border p-3 text-left sm:p-4 ${filter === 'approved' ? 'border-primary bg-primary/5' : 'bg-card'}`}><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">Aprovadas</p><p className="mt-1 text-xl font-bold sm:text-2xl">{counts.approved}</p></button><button onClick={() => setFilter('rejected')} className={`rounded-xl border p-3 text-left sm:p-4 ${filter === 'rejected' ? 'border-primary bg-primary/5' : 'bg-card'}`}><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">Rejeitadas</p><p className="mt-1 text-xl font-bold sm:text-2xl">{counts.rejected}</p></button></div>
      <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"><label className="relative min-w-0"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Pesquisar espaço, requerente ou justificação" className="min-h-11 w-full pl-10" /></label><Button variant="outline" onClick={() => setFilter('all')} className="min-h-11">Ver todas</Button></div>
      {visible.length === 0 ? <div className="rounded-2xl border border-dashed bg-card p-10 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground/35" /><h2 className="mt-3 font-semibold">Sem reivindicações neste estado</h2></div> : <div className="space-y-3">{visible.map(claim => <article key={claim.id} className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm sm:p-5"><div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2">{statusBadge(claim.status)}<span className="text-xs text-muted-foreground"><Clock3 className="mr-1 inline h-3.5 w-3.5" />{new Date(claim.created_at).toLocaleString('pt-PT')}</span></div><h2 className="mt-3 break-words text-lg font-semibold">{claim.space_name}</h2>{claim.space_address && <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{claim.space_address}</span></p>}<div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2"><div className="min-w-0 rounded-xl bg-muted/30 p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Requerente</p><p className="mt-1 break-words text-sm font-medium">{claim.user_name}</p>{claim.user_email && <p className="mt-0.5 break-all text-xs text-muted-foreground">{claim.user_email}</p>}</div><div className="min-w-0 rounded-xl bg-muted/30 p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Justificação</p><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{claim.message || 'Sem justificação registada.'}</p></div></div>{claim.documents_url && <p className="mt-3 break-words text-xs text-amber-700">Existe um documento legado associado a este pedido. O fluxo atual já não aceita documentos até existir armazenamento privado validado.</p>}</div>{claim.status === 'pending' && <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0"><Button variant="outline" disabled={busyId === claim.id} onClick={() => void decide(claim, 'rejected')} className="text-destructive"><X className="mr-2 h-4 w-4" />Rejeitar</Button><Button disabled={busyId === claim.id} onClick={() => void decide(claim, 'approved')}><Check className="mr-2 h-4 w-4" />Aprovar</Button></div>}</div></article>)}</div>}
      <TablePagination currentPage={safePage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={PAGE_SIZE} onPageChange={setPage} />
    </div>
  )
}
