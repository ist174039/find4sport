'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CalendarDays, Check, LocateFixed, SlidersHorizontal, X } from 'lucide-react'

interface FilterModalProps {
  type: 'espacos' | 'profissionais' | 'eventos'
  currentFilters?: Record<string, string | undefined>
}

const SORT_OPTIONS = [
  { value: 'rating', label: 'Melhor avaliação' },
  { value: 'recent', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Preço ↑' },
  { value: 'price_desc', label: 'Preço ↓' },
]
const RATING_OPTIONS = [{ value: '4', label: '4,0+' }, { value: '3', label: '3,0+' }]
const RADIUS_OPTIONS = ['5','10','25','50','100']

export function FilterModal({ type, currentFilters = {} }: FilterModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [sort, setSort] = useState(currentFilters.sort || '')
  const [rating, setRating] = useState(currentFilters.rating || '')
  const [priceMin, setPriceMin] = useState(currentFilters.priceMin || '')
  const [priceMax, setPriceMax] = useState(currentFilters.priceMax || '')
  const [radius, setRadius] = useState(currentFilters.radius || '')
  const [dateFrom, setDateFrom] = useState(currentFilters.dateFrom || '')
  const [dateTo, setDateTo] = useState(currentFilters.dateTo || '')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const activeCount = [sort, rating, priceMin, priceMax, radius, type === 'eventos' ? dateFrom : '', type === 'eventos' ? dateTo : ''].filter(Boolean).length

  useEffect(() => {
    if (!open) return

    const dialog = dialogRef.current
    if (!dialog) return
    const selector = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    const focusables = () => Array.from(dialog.querySelectorAll<HTMLElement>(selector)).filter(element => !element.hasAttribute('hidden'))
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => focusables()[0]?.focus())

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const elements = focusables()
      if (!elements.length) {
        event.preventDefault()
        return
      }
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = previousOverflow
      requestAnimationFrame(() => triggerRef.current?.focus())
    }
  }, [open])

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    const set = (key:string, value:string) => value ? params.set(key,value) : params.delete(key)
    set('sort', sort); set('rating', rating); set('priceMin', priceMin); set('priceMax', priceMax); set('radius', radius)
    if (type === 'eventos') { set('dateFrom', dateFrom); set('dateTo', dateTo) }
    router.push(`/${type}?${params.toString()}`); setOpen(false)
  }
  function resetFilters() {
    setSort(''); setRating(''); setPriceMin(''); setPriceMax(''); setRadius(''); setDateFrom(''); setDateTo('')
    const params = new URLSearchParams(searchParams.toString()); ['sort','rating','priceMin','priceMax','radius','dateFrom','dateTo','page'].forEach(key=>params.delete(key))
    router.push(`/${type}?${params.toString()}`); setOpen(false)
  }

  return <>
    <button ref={triggerRef} id="filter-modal-trigger" type="button" aria-label="Abrir filtros de pesquisa" aria-expanded={open} aria-controls="filter-modal-dialog" onClick={()=>setOpen(true)} className="relative flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"><SlidersHorizontal className="h-4 w-4"/><span className="hidden sm:inline">Filtros</span>{activeCount>0&&<span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">{activeCount}</span>}</button>
    {open&&<>
      <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" aria-hidden="true" onClick={()=>setOpen(false)}/>
      <div ref={dialogRef} id="filter-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="filter-modal-title" className="fixed bottom-0 left-0 right-0 z-[80] max-h-[88dvh] overflow-y-auto rounded-t-3xl border-t border-border bg-background shadow-2xl sm:bottom-auto sm:left-auto sm:right-8 sm:top-24 sm:w-[420px] sm:rounded-2xl sm:border">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background p-5"><div className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-primary"/><h2 id="filter-modal-title" className="text-lg font-bold">Filtros</h2>{activeCount>0&&<span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{activeCount}</span>}</div><button type="button" aria-label="Fechar filtros de pesquisa" onClick={()=>setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"><X className="h-4 w-4"/></button></div>
      <div className="space-y-6 p-5">
        <section><h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Raio de procura</h3><div className="flex flex-wrap gap-2">{RADIUS_OPTIONS.map(value=><button key={value} type="button" onClick={()=>setRadius(radius===value?'':value)} className={`min-h-11 rounded-xl border px-3 text-sm font-medium ${radius===value?'border-primary bg-primary/10 text-primary':'border-border hover:bg-muted'}`}>{value} km</button>)}</div><p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><LocateFixed className="h-3.5 w-3.5"/>Requer permissão de localização. Sem localização, o raio não exclui resultados.</p></section>
        {type==='eventos'&&<section><h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"><CalendarDays className="h-4 w-4"/>Intervalo de datas</h3><div className="grid grid-cols-2 gap-3"><label className="space-y-1"><span className="text-xs text-muted-foreground">De</span><input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"/></label><label className="space-y-1"><span className="text-xs text-muted-foreground">Até</span><input type="date" value={dateTo} min={dateFrom||undefined} onChange={e=>setDateTo(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"/></label></div></section>}
        <section><h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Ordenar</h3><div className="grid grid-cols-2 gap-2">{SORT_OPTIONS.map(opt=><button key={opt.value} type="button" onClick={()=>setSort(sort===opt.value?'':opt.value)} className={`flex min-h-11 items-center justify-between rounded-xl border px-3 text-sm font-medium ${sort===opt.value?'border-primary bg-primary/10 text-primary':'border-border hover:bg-muted'}`}><span>{opt.label}</span>{sort===opt.value&&<Check className="h-3.5 w-3.5"/>}</button>)}</div></section>
        {type!=='eventos'&&<section><h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Avaliação mínima</h3><div className="flex flex-wrap gap-2">{RATING_OPTIONS.map(opt=><button key={opt.value} type="button" onClick={()=>setRating(rating===opt.value?'':opt.value)} className={`min-h-11 rounded-xl border px-3 text-sm font-medium ${rating===opt.value?'border-primary bg-primary/10 text-primary':'border-border hover:bg-muted'}`}>{opt.label}</button>)}</div></section>}
        <section><h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{type==='espacos'?'Preço por hora (€)':type==='eventos'?'Preço do bilhete (€)':'Preço da sessão (€)'}</h3><div className="grid grid-cols-2 gap-3"><input type="number" aria-label="Preço mínimo em euros" placeholder="Mínimo" value={priceMin} onChange={e=>setPriceMin(e.target.value)} min={0} className="h-11 rounded-xl border border-border bg-background px-3 text-sm"/><input type="number" aria-label="Preço máximo em euros" placeholder="Máximo" value={priceMax} onChange={e=>setPriceMax(e.target.value)} min={0} className="h-11 rounded-xl border border-border bg-background px-3 text-sm"/></div></section>
      </div>
      <div className="sticky bottom-0 flex gap-3 border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"><button type="button" onClick={resetFilters} className="min-h-12 flex-1 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Limpar</button><button type="button" onClick={applyFilters} className="min-h-12 flex-1 rounded-xl bg-primary text-sm font-bold text-primary-foreground">Ver resultados</button></div>
      </div>
    </>}
  </>
}
