'use client';
import { Building, Calendar, MapPin, Search, Star, User, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useTransition, useEffect } from 'react'

export function PesquisaFiltros({
  initialQuery = '',
  totalResults = 0,
  initialSort = 'relevance',
}: {
  initialQuery?: string
  totalResults?: number
  initialSort?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Local state for immediate input feedback
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const currentQ = params.get('q') || ''
    
    // Trigger push if debounced value is different from URL query
    if (debouncedQuery !== currentQ && !(debouncedQuery === '' && currentQ === '')) {
      if (debouncedQuery.trim()) {
        params.set('q', debouncedQuery.trim())
      } else {
        params.delete('q')
      }
      
      startTransition(() => {
        router.push(`/pesquisa?${params.toString()}`)
      })
    }
  }, [debouncedQuery, searchParams, router])

  const activeType = (searchParams.get('type') || searchParams.get('tipo') || 'todos').toLowerCase()

  // Handle Type Filter Toggle
  const handleTypeSelect = useCallback((typeValue: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (typeValue === 'todos') {
      params.delete('type')
      params.delete('tipo')
    } else {
      params.set('type', typeValue)
      params.delete('tipo')
    }
    
    startTransition(() => {
      router.push(`/pesquisa?${params.toString()}`)
    })
  }, [searchParams, router])

  // Handle Rating Toggle
  const toggleRating = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.get('rating')
    if (current === value) {
      params.delete('rating')
    } else {
      params.set('rating', value)
    }
    
    startTransition(() => {
      router.push(`/pesquisa?${params.toString()}`)
    })
  }, [searchParams, router])

  const handleSortSelect = useCallback((sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (sortValue === 'relevance') {
      params.delete('sort')
    } else {
      params.set('sort', sortValue)
    }

    startTransition(() => {
      router.push(`/pesquisa?${params.toString()}`)
    })
  }, [searchParams, router])

  return (
    <div className="p-4 border-b border-border bg-card z-10 shrink-0">
      <div className="flex flex-col gap-3 mb-4">
        {/* Title & Count */}
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-lg text-foreground">
            {initialQuery ? `Resultados para "${initialQuery}"` : 'Resultados de Pesquisa'}
          </h1>
          <span className="text-muted-foreground font-medium text-xs">
            {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
            {isPending && <span className="ml-2 inline-block w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>}
          </span>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, cidade (ex: Almada, Maratona de Lisboa)..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                setDebouncedQuery(query)
              }
            }}
            className="w-full bg-background border border-border rounded-lg py-2 pl-9 pr-8 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-foreground"
          />
          {query && (
            <button 
              onClick={() => {
                setQuery('')
                const params = new URLSearchParams(searchParams.toString())
                params.delete('q')
                startTransition(() => {
                  router.push(`/pesquisa?${params.toString()}`)
                })
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-end">
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => handleSortSelect('relevance')}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium ${initialSort === 'relevance' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/50'}`}
            >
              Relevancia
            </button>
            <button
              onClick={() => handleSortSelect('rating')}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium ${initialSort === 'rating' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/50'}`}
            >
              Melhor avaliados
            </button>
            <button
              onClick={() => handleSortSelect('newest')}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium ${initialSort === 'newest' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/50'}`}
            >
              Mais recentes
            </button>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        <button 
          onClick={() => handleTypeSelect('todos')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs border transition-colors ${activeType === 'todos' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-muted border-border hover:border-primary text-foreground'}`}
        >
          Todos
        </button>

        <button 
          onClick={() => handleTypeSelect('espacos')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs border transition-colors ${activeType === 'espacos' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-muted border-border hover:border-primary text-foreground'}`}
        >
          <Building className="h-3.5 w-3.5" />
          Espaços
        </button>

        <button 
          onClick={() => handleTypeSelect('eventos')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs border transition-colors ${activeType === 'eventos' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-muted border-border hover:border-primary text-foreground'}`}
        >
          <Calendar className="h-3.5 w-3.5" />
          Eventos
        </button>

        <button 
          onClick={() => handleTypeSelect('profissionais')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs border transition-colors ${activeType === 'profissionais' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-muted border-border hover:border-primary text-foreground'}`}
        >
          <User className="h-3.5 w-3.5" />
          Profissionais
        </button>

        <button 
          onClick={() => toggleRating('4.5')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs border transition-colors ${searchParams.get('rating') === '4.5' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-muted border-border hover:border-amber-500 text-foreground'}`}
        >
          <Star className="h-3.5 w-3.5" />
          Top Rated (4.5+)
        </button>
      </div>
    </div>
  )
}
