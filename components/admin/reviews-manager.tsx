'use client'

import { useMemo, useState } from 'react'
import { Download, Search, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TablePagination } from '@/components/ui/table-pagination'
import { useModal } from '@/components/providers/modal-provider'
import { deleteReviewAdminAction } from '@/app/admin/(dashboard)/avaliacoes/actions'

type ReviewRow = { id: string; rating: number; title: string | null; comment: string | null; created_at: string; author_name: string; author_email: string; entity_name: string; entity_type: 'professional' | 'space' | 'unknown' }
const PAGE_SIZE = 20

export function ReviewsManager({ initialReviews }: { initialReviews: ReviewRow[] }) {
  const { showAlert, showConfirm } = useModal()
  const [reviews, setReviews] = useState(initialReviews)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'high' | 'low'>('all')
  const [page, setPage] = useState(1)
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return reviews.filter(review => {
      if (filter === 'high' && review.rating < 4) return false
      if (filter === 'low' && review.rating > 2) return false
      if (!q) return true
      return [review.title, review.comment, review.author_name, review.author_email, review.entity_name].some(value => value?.toLowerCase().includes(q))
    })
  }, [filter, query, reviews])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const stats = useMemo(() => { const total = reviews.length; const avg = total ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / total : 0; const low = reviews.filter(review => review.rating <= 2).length; return { total, avg, low } }, [reviews])

  function changeQuery(value: string) {
    setQuery(value)
    setPage(1)
  }

  function changeFilter(value: 'all' | 'high' | 'low') {
    setFilter(value)
    setPage(1)
  }

  async function removeReview(review: ReviewRow) {
    const confirmed = await showConfirm('Eliminar avaliação', 'Esta ação remove definitivamente a avaliação. Utilize apenas para conteúdo que viola as regras da plataforma.', { confirmLabel: 'Eliminar', destructive: true })
    if (!confirmed) return
    setBusyId(review.id)
    try { await deleteReviewAdminAction(review.id); setReviews(prev => prev.filter(item => item.id !== review.id)); showAlert('Avaliação eliminada', 'A remoção foi registada no Audit Log.', 'success') }
    catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível eliminar a avaliação.', 'error') }
    finally { setBusyId(null) }
  }

  function exportCsv() {
    const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const rows = [['Data', 'Rating', 'Autor', 'Email', 'Entidade', 'Tipo', 'Título', 'Comentário'], ...filtered.map(review => [new Date(review.created_at).toLocaleString('pt-PT'), review.rating, review.author_name, review.author_email, review.entity_name, review.entity_type, review.title || '', review.comment || ''])]
    const csv = rows.map(row => row.map(escape).join(';')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `avaliacoes-find4sport-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(url)
  }

  const renderStars = (rating: number) => Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-4 w-4 ${index < rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/25'}`} />)

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Avaliações</h1><p className="mt-1 text-sm text-muted-foreground">Visão factual das avaliações publicadas. Denúncias de conteúdo são tratadas em Moderação.</p></div><Button variant="outline" onClick={exportCsv} disabled={!filtered.length} className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" />Exportar CSV</Button></div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3"><div className="rounded-xl border bg-card p-3 sm:p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">Total</p><p className="mt-1 text-xl font-bold sm:text-2xl">{stats.total}</p></div><div className="rounded-xl border bg-card p-3 sm:p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">Média</p><p className="mt-1 text-xl font-bold sm:text-2xl">{stats.avg.toFixed(1)}</p></div><div className="rounded-xl border bg-card p-3 sm:p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">≤ 2 estrelas</p><p className="mt-1 text-xl font-bold sm:text-2xl">{stats.low}</p></div></div>
      <div className="rounded-2xl border bg-card p-3 sm:p-4"><div className="flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="search" value={query} onChange={event => changeQuery(event.target.value)} placeholder="Pesquisar autor, entidade ou comentário..." className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></label><div className="grid grid-cols-3 gap-2 sm:flex">{([['all', 'Todas'], ['high', '4–5 ★'], ['low', '1–2 ★']] as const).map(([value, label]) => <Button key={value} type="button" variant={filter === value ? 'default' : 'outline'} onClick={() => changeFilter(value)} className="min-h-11">{label}</Button>)}</div></div></div>
      {visible.length === 0 ? <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center text-sm text-muted-foreground">Nenhuma avaliação corresponde aos filtros.</div> : <div className="space-y-3">{visible.map(review => <article key={review.id} className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-1">{renderStars(review.rating)}</div><h2 className="mt-2 break-words font-semibold">{review.title || 'Sem título'}</h2>{review.comment && <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{review.comment}</p>}</div><Button variant="ghost" size="icon" disabled={busyId === review.id} onClick={() => void removeReview(review)} className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Eliminar avaliação"><Trash2 className="h-4 w-4" /></Button></div><div className="mt-4 grid min-w-0 gap-2 border-t pt-3 text-xs text-muted-foreground sm:grid-cols-3"><div className="min-w-0 break-words"><span className="font-medium text-foreground">Autor:</span> {review.author_name}{review.author_email ? ` · ${review.author_email}` : ''}</div><div className="min-w-0 break-words"><span className="font-medium text-foreground">Entidade:</span> {review.entity_name}</div><div className="sm:text-right">{new Date(review.created_at).toLocaleString('pt-PT')}</div></div></article>)}</div>}
      <TablePagination currentPage={safePage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={PAGE_SIZE} onPageChange={setPage} />
    </div>
  )
}
