'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, SlidersHorizontal, Check } from 'lucide-react'

interface FilterModalProps {
  type: 'espacos' | 'profissionais' | 'eventos'
  currentFilters?: {
    q?: string
    location?: string
    category?: string
    priceMin?: string
    priceMax?: string
    rating?: string
    sort?: string
  }
}

const SORT_OPTIONS = [
  { value: 'rating', label: 'Melhor Avaliação' },
  { value: 'recent', label: 'Mais Recentes' },
  { value: 'price_asc', label: 'Preço ↑' },
  { value: 'price_desc', label: 'Preço ↓' },
]

const RATING_OPTIONS = [
  { value: '4', label: '4+ estrelas' },
  { value: '3', label: '3+ estrelas' },
  { value: '2', label: '2+ estrelas' },
]

export function FilterModal({ type, currentFilters = {} }: FilterModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(false)
  const [sort, setSort] = useState(currentFilters.sort || '')
  const [rating, setRating] = useState(currentFilters.rating || '')
  const [priceMin, setPriceMin] = useState(currentFilters.priceMin || '')
  const [priceMax, setPriceMax] = useState(currentFilters.priceMax || '')

  const activeCount = [sort, rating, priceMin, priceMax].filter(Boolean).length

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString())
    if (sort) params.set('sort', sort); else params.delete('sort')
    if (rating) params.set('rating', rating); else params.delete('rating')
    if (priceMin) params.set('priceMin', priceMin); else params.delete('priceMin')
    if (priceMax) params.set('priceMax', priceMax); else params.delete('priceMax')
    router.push(`/${type}?${params.toString()}`)
    setOpen(false)
  }

  function resetFilters() {
    setSort('')
    setRating('')
    setPriceMin('')
    setPriceMax('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('sort')
    params.delete('rating')
    params.delete('priceMin')
    params.delete('priceMax')
    router.push(`/${type}?${params.toString()}`)
    setOpen(false)
  }

  return (
    <>
      <button
        id="filter-modal-trigger"
        type="button"
        onClick={() => setOpen(true)}
        className="relative shrink-0 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="hidden sm:inline">Filtros</span>
        {activeCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filtros de pesquisa"
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-background border-t border-border shadow-2xl transition-all duration-300 ease-out sm:bottom-auto sm:left-auto sm:right-8 sm:top-24 sm:w-96 sm:rounded-2xl sm:border ${
          open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none sm:translate-y-4'
        }`}
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div className="sticky top-0 bg-background flex items-center justify-between p-5 border-b border-border rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-lg text-foreground">Filtros</h2>
            {activeCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <section>
            <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Ordenar por</h3>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSort(sort === opt.value ? '' : opt.value)}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                    sort === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-foreground hover:border-primary/40 hover:bg-muted'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sort === opt.value && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </section>

          {type !== 'eventos' && (
            <section>
              <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Avaliação Mínima</h3>
              <div className="flex gap-2 flex-wrap">
                {RATING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRating(rating === opt.value ? '' : opt.value)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                      rating === opt.value
                        ? 'border-amber-400 bg-amber-400/10 text-amber-600 dark:text-amber-400'
                        : 'border-border text-foreground hover:border-amber-400/50 hover:bg-muted'
                    }`}
                  >
                    ⭐ {opt.label}
                    {rating === opt.value && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
              {type === 'espacos' ? 'Preço por hora (€)' : type === 'eventos' ? 'Preço do bilhete (€)' : 'Preço da sessão (€)'}
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                <input
                  type="number"
                  placeholder="Mín"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  min={0}
                  className="w-full rounded-xl border border-border bg-muted/50 pl-7 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <span className="text-muted-foreground text-sm font-medium">—</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  min={0}
                  className="w-full rounded-xl border border-border bg-muted/50 pl-7 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 bg-background border-t border-border p-4 flex gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Limpar tudo
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </>
  )
}
