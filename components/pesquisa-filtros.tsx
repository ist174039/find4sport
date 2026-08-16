'use client'

import { Building2, CalendarDays, Search, Star, UserRound, Users, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'

const types = [
  { value: 'todos', label: 'Todos', icon: Search },
  { value: 'espacos', label: 'Espaços', icon: Building2 },
  { value: 'profissionais', label: 'Profissionais', icon: UserRound },
  { value: 'eventos', label: 'Eventos', icon: CalendarDays },
  { value: 'comunidades', label: 'Comunidades', icon: Users },
]

export function PesquisaFiltros({ initialQuery = '', totalResults = 0, initialSort = 'relevance' }: { initialQuery?: string; totalResults?: number; initialSort?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const activeType = (searchParams.get('type') || searchParams.get('tipo') || 'todos').toLowerCase()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 350)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.get('q') || ''
    if (debouncedQuery === current) return
    if (debouncedQuery.trim()) params.set('q', debouncedQuery.trim())
    else params.delete('q')
    startTransition(() => router.push(`/pesquisa?${params.toString()}`))
  }, [debouncedQuery, router, searchParams])

  const updateParam = useCallback((key: string, value?: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    if (key === 'type') params.delete('tipo')
    startTransition(() => router.push(`/pesquisa?${params.toString()}`))
  }, [router, searchParams])

  return (
    <div className="shrink-0 border-b border-border bg-card p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0"><h1 className="truncate text-base font-bold sm:text-lg">{initialQuery ? `Resultados para “${initialQuery}”` : 'Pesquisar'}</h1><p className="text-xs text-muted-foreground">{totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}{isPending ? ' · a atualizar…' : ''}</p></div>
        <select value={initialSort} onChange={e => updateParam('sort', e.target.value === 'relevance' ? null : e.target.value)} className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium outline-none sm:text-sm" aria-label="Ordenar resultados">
          <option value="relevance">Relevância</option>
          <option value="rating">Melhor avaliados</option>
          <option value="newest">Mais recentes</option>
        </select>
      </div>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="search" inputMode="search" placeholder="Nome, modalidade ou localização..." value={query} onChange={e => setQuery(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
        {query && <button type="button" onClick={() => { setQuery(''); setDebouncedQuery('') }} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="Limpar pesquisa"><X className="h-4 w-4" /></button>}
      </label>

      <div className="-mx-3 mt-3 overflow-x-auto px-3 pb-1 sm:-mx-0 sm:px-0">
        <div className="flex w-max gap-2">
          {types.map(item => {
            const Icon = item.icon
            const active = activeType === item.value || (item.value === 'todos' && activeType === 'all')
            return <button key={item.value} type="button" onClick={() => updateParam('type', item.value === 'todos' ? null : item.value)} className={`flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground'}`}><Icon className="h-3.5 w-3.5" />{item.label}</button>
          })}
          {(activeType === 'espacos' || activeType === 'profissionais' || activeType === 'todos' || activeType === 'all') && <button type="button" onClick={() => updateParam('rating', searchParams.get('rating') === '4.5' ? null : '4.5')} className={`flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-medium ${searchParams.get('rating') === '4.5' ? 'border-amber-500 bg-amber-500 text-white' : 'border-border bg-background text-foreground'}`}><Star className="h-3.5 w-3.5" />4,5+</button>}
        </div>
      </div>
    </div>
  )
}
