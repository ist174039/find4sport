'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useTransition } from 'react'

export function PesquisaFiltros({
  initialQuery = '',
  totalResults = 0
}: {
  initialQuery?: string
  totalResults?: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Local state for immediate input feedback
  const [query, setQuery] = useState(initialQuery)

  // Handle Search Input Change
  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery)
    const params = new URLSearchParams(searchParams.toString())
    if (newQuery) {
      params.set('q', newQuery)
    } else {
      params.delete('q')
    }
    
    startTransition(() => {
      router.push(`/pesquisa?${params.toString()}`)
    })
  }, [searchParams, router])

  // Handle Filter Toggle (mock behavior for now, pushes to URL)
  const toggleFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.get(key)
    
    if (current === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    
    startTransition(() => {
      router.push(`/pesquisa?${params.toString()}`)
    })
  }, [searchParams, router])

  return (
    <div className="p-4 border-b border-border-subtle bg-white z-10 shrink-0">
      <div className="flex flex-col gap-4 mb-4">
        {/* Title & Count */}
        <div className="flex items-center justify-between">
          <h1 className="font-headline-md text-headline-md">
            {initialQuery ? `Resultados para "${initialQuery}"` : 'Todos os Profissionais'}
          </h1>
          <span className="text-text-secondary font-label-md text-label-md">
            {totalResults} {totalResults === 1 ? 'encontrado' : 'encontrados'}
            {isPending && <span className="ml-2 inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>}
          </span>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou modalidade..." 
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg py-2 pl-10 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md text-text-primary"
          />
          {query && (
            <button 
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary hover:text-text-primary text-[18px]"
            >
              close
            </button>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        <button 
          onClick={() => toggleFilter('tipo', 'profissionais')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md border transition-colors ${searchParams.get('tipo') === 'profissionais' ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface-container-high border-border-subtle hover:border-primary text-text-primary'}`}
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
          Profissionais
        </button>
        <button 
          onClick={() => toggleFilter('tipo', 'espacos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md border transition-colors ${searchParams.get('tipo') === 'espacos' ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface-container-high border-border-subtle hover:border-primary text-text-primary'}`}
        >
          <span className="material-symbols-outlined text-[18px]">location_city</span>
          Espaços
        </button>
        <button 
          onClick={() => toggleFilter('raio', '10')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md border transition-colors ${searchParams.get('raio') === '10' ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface-container-high border-border-subtle hover:border-primary text-text-primary'}`}
        >
          <span className="material-symbols-outlined text-[18px]">distance</span>
          Raio (10km)
        </button>
        <button 
          onClick={() => toggleFilter('rating', '4.5')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md border transition-colors ${searchParams.get('rating') === '4.5' ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface-container-high border-border-subtle hover:border-primary text-text-primary'}`}
        >
          <span className="material-symbols-outlined text-[18px]">star</span>
          Top Rated (4.5+)
        </button>
      </div>
    </div>
  )
}
