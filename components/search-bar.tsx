'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FilterModal } from '@/components/filter-modal'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  placeholder?: string
  showFilters?: boolean
  showLocation?: boolean
  showType?: boolean
  variant?: 'default' | 'hero'
  className?: string
  defaultQuery?: string
  defaultLocation?: string
  defaultType?: string
  basePath?: string
  onSearch?: (params: { query: string; location: string; type: string }) => void
  filterType?: 'espacos' | 'profissionais' | 'eventos'
  currentFilters?: Record<string, string>
}

const searchTypes = [
  { value: 'all', label: 'Tudo' },
  { value: 'profissionais', label: 'Profissionais' },
  { value: 'espacos', label: 'Espaços' },
  { value: 'eventos', label: 'Eventos' },
]

export function SearchBar({
  placeholder = 'Pesquisar profissionais, espaços ou eventos...',
  showFilters = false,
  showLocation = true,
  showType = true,
  variant = 'default',
  className,
  defaultQuery = '',
  defaultLocation = '',
  defaultType = 'all',
  basePath = '/pesquisa',
  onSearch,
  filterType,
  currentFilters = {},
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
      if (showType && type && type !== 'all') params.set('type', type)
      router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ''}`)
    }
  }, [query, location, type, showType, basePath, onSearch, router])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const isHero = variant === 'hero'

  return (
    <div className={cn('flex w-full flex-col gap-3 sm:flex-row sm:items-center', isHero && 'rounded-2xl border border-border bg-background p-2 shadow-xl ring-1 ring-black/5 sm:p-3', className)}>
      {showType && (
        <Select value={type} onValueChange={(v) => setType(v || '')}>
          <SelectTrigger className={cn('w-full sm:w-36', isHero && 'border-0 bg-transparent focus:ring-0')}>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>{searchTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
      )}

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className={cn('pl-10', isHero && 'border-0 bg-transparent focus-visible:ring-0')} />
      </div>

      {showLocation && (
        <div className="relative sm:w-48">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="text" value={location} onChange={(e) => setLocation(e.target.value)} onKeyDown={handleKeyDown} placeholder="Localização" className={cn('pl-10', isHero && 'border-0 bg-transparent focus-visible:ring-0')} />
        </div>
      )}

      <div className="flex gap-2">
        {showFilters && filterType && <FilterModal type={filterType} currentFilters={currentFilters} />}
        <Button onClick={handleSearch} className={cn('shrink-0', isHero && 'px-6')}>
          <Search className="mr-2 h-4 w-4 sm:hidden" />Pesquisar
        </Button>
      </div>
    </div>
  )
}
