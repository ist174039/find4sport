'use client'

import { Building2, CalendarDays, ChevronDown, Filter, Search, Star, UserRound, Users, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { TaxonomyCombobox, type TaxonomyOption } from '@/components/taxonomy-combobox'

const types = [
  { value: 'todos', label: 'Tudo', icon: Search },
  { value: 'espacos', label: 'Espaços', icon: Building2 },
  { value: 'profissionais', label: 'Profissionais', icon: UserRound },
  { value: 'eventos', label: 'Eventos', icon: CalendarDays },
  { value: 'comunidades', label: 'Comunidades', icon: Users },
]

export function PesquisaFiltros({ initialQuery = '', totalResults = 0, initialSort = 'relevance', categories = [] }: { initialQuery?: string; totalResults?: number; initialSort?: string; categories?: TaxonomyOption[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [showFilters, setShowFilters] = useState(false)
  const activeType = (searchParams.get('type') || searchParams.get('tipo') || 'todos').toLowerCase()
  const activeCategory = searchParams.get('category') || ''
  const activeLocation = searchParams.get('location') || ''
  const activeRating = searchParams.get('rating') || ''
  const categoryValue = categories.find(category => category.slug === activeCategory || category.id === activeCategory || category.name.toLowerCase() === activeCategory.toLowerCase())?.id || ''

  useEffect(() => { const timer = setTimeout(() => setDebouncedQuery(query), 320); return () => clearTimeout(timer) }, [query])
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.get('q') || ''
    if (debouncedQuery.trim() === current) return
    if (debouncedQuery.trim()) params.set('q', debouncedQuery.trim()); else params.delete('q')
    startTransition(() => router.push(`/pesquisa?${params.toString()}`))
  }, [debouncedQuery, router, searchParams])

  const updateParam = useCallback((key: string, value?: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    if (key === 'type') params.delete('tipo')
    startTransition(() => router.push(`/pesquisa?${params.toString()}`))
  }, [router, searchParams])

  const activeFilterCount = useMemo(() => [activeCategory, activeLocation, activeRating, initialSort !== 'relevance' ? initialSort : ''].filter(Boolean).length, [activeCategory, activeLocation, activeRating, initialSort])
  const clearFilters = () => { const params = new URLSearchParams(); if (query.trim()) params.set('q', query.trim()); if (activeType !== 'todos' && activeType !== 'all') params.set('type', activeType); startTransition(() => router.push(`/pesquisa?${params.toString()}`)) }

  return <div className="shrink-0 border-b border-border bg-card p-3 sm:p-4">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h1 className="truncate text-base font-bold sm:text-lg">{initialQuery ? `Resultados para “${initialQuery}”` : 'Pesquisa'}</h1><p className="mt-0.5 text-xs text-muted-foreground">{totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}{isPending ? ' · a atualizar…' : ''}</p></div><Button type="button" variant={activeFilterCount ? 'default' : 'outline'} size="sm" className="min-h-10 shrink-0 rounded-xl" onClick={() => setShowFilters(value => !value)}><Filter className="mr-2 h-4 w-4" />Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}<ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} /></Button></div>
    <label className="relative mt-3 block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="search" inputMode="search" placeholder="O que procuras? Ex.: padel, fisioterapia, Lisboa…" value={query} onChange={event => setQuery(event.target.value)} className="h-12 w-full rounded-2xl border border-border bg-background pl-10 pr-11 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />{query && <button type="button" onClick={() => { setQuery(''); setDebouncedQuery('') }} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="Limpar pesquisa"><X className="h-4 w-4" /></button>}</label>
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5" role="group" aria-label="Tipo de resultado">{types.map(item => { const Icon=item.icon; const active=activeType===item.value || (item.value==='todos'&&activeType==='all'); return <button key={item.value} type="button" onClick={() => updateParam('type', item.value === 'todos' ? null : item.value)} className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition ${active?'border-primary bg-primary/10 text-primary ring-1 ring-primary/15':'border-border bg-background text-foreground hover:bg-muted'}`}><Icon className="h-4 w-4" />{item.label}</button> })}</div>
    {showFilters && <div className="mt-3 rounded-2xl border border-border bg-muted/20 p-3 sm:p-4"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="relative z-20 space-y-1.5"><span className="text-xs font-semibold text-muted-foreground">Modalidade</span><TaxonomyCombobox options={categories} value={categoryValue} onChange={value => { const option=categories.find(category=>category.id===value); updateParam('category', option?.slug || null) }} placeholder="Todas as modalidades" searchPlaceholder="Ex.: futebol, padel, yoga…" /></label>
      <label className="space-y-1.5"><span className="text-xs font-semibold text-muted-foreground">Localização</span><input defaultValue={activeLocation} onBlur={event => updateParam('location', event.target.value.trim() || null)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); updateParam('location', event.currentTarget.value.trim() || null) } }} placeholder="Cidade ou zona" className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" /></label>
      <label className="space-y-1.5"><span className="text-xs font-semibold text-muted-foreground">Avaliação mínima</span><select value={activeRating} onChange={event => updateParam('rating', event.target.value || null)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"><option value="">Qualquer avaliação</option><option value="4">4,0+</option><option value="4.5">4,5+</option></select></label>
      <label className="space-y-1.5"><span className="text-xs font-semibold text-muted-foreground">Ordenar</span><select value={initialSort} onChange={event => updateParam('sort', event.target.value === 'relevance' ? null : event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"><option value="relevance">Mais relevantes</option><option value="rating">Melhor avaliados</option><option value="newest">Mais recentes</option></select></label>
    </div><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-muted-foreground"><Star className="mr-1 inline h-3.5 w-3.5" />Os filtros combinam-se entre si.</p>{activeFilterCount > 0 && <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>Limpar filtros</Button>}</div></div>}
  </div>
}
