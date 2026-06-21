'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  placeholder?: string
  showFilters?: boolean
  showLocation?: boolean
  variant?: 'default' | 'hero'
  className?: string
  defaultQuery?: string
  defaultLocation?: string
  defaultType?: string
  onSearch?: (params: { query: string; location: string; type: string }) => void
}

const searchTypes = [
  { value: 'all', label: 'Tudo' },
  { value: 'profissionais', label: 'Profissionais' },
  { value: 'espacos', label: 'Espacos' },
  { value: 'eventos', label: 'Eventos' },
]

export function SearchBar({
  placeholder = 'Pesquisar profissionais, espacos ou eventos...',
  showFilters = false,
  showLocation = true,
  variant = 'default',
  className,
  defaultQuery = '',
  defaultLocation = '',
  defaultType = 'all',
  onSearch,
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultQuery)
  const [location, setLocation] = useState(defaultLocation)
  const [type, setType] = useState(defaultType)

  const handleSearch = useCallback(() => {
    if (onSearch) {
      onSearch({ query, location, type })
    } else {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (location) params.set('location', location)
      if (type && type !== 'all') params.set('type', type)
      router.push(`/pesquisa?${params.toString()}`)
    }
  }, [query, location, type, onSearch, router])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const isHero = variant === 'hero'

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-3 sm:flex-row sm:items-center',
        isHero && 'rounded-2xl border border-border bg-background p-2 shadow-xl ring-1 ring-black/5 sm:p-3',
        className
      )}
    >
      {/* Search Type */}
      <Select value={type} onValueChange={setType}>
        <SelectTrigger
          className={cn(
            'w-full sm:w-36',
            isHero && 'border-0 bg-transparent focus:ring-0'
          )}
        >
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          {searchTypes.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'pl-10',
            isHero && 'border-0 bg-transparent focus-visible:ring-0'
          )}
        />
      </div>

      {/* Location Input */}
      {showLocation && (
        <div className="relative sm:w-48">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Localizacao"
            className={cn(
              'pl-10',
              isHero && 'border-0 bg-transparent focus-visible:ring-0'
            )}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {showFilters && (
          <Button variant="outline" size="icon" className="shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="sr-only">Filtros</span>
          </Button>
        )}
        <Button onClick={handleSearch} className={cn('shrink-0', isHero && 'px-6')}>
          <Search className="mr-2 h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">Pesquisar</span>
          <span className="sm:hidden">Pesquisar</span>
        </Button>
      </div>
    </div>
  )
}
