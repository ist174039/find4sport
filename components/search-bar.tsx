'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FilterModal } from '@/components/filter-modal'
import { UseMyLocationButton } from '@/components/use-my-location-button'
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
  currentFilters?: Record<string, string | undefined>
}

const searchTypes = [
  { value: 'all', label: 'Tudo' },
  { value: 'profissionais', label: 'Profissionais' },
  { value: 'espacos', label: 'Espaços' },
  { value: 'eventos', label: 'Eventos' },
]

export function SearchBar({ placeholder='Pesquisar profissionais, espaços ou eventos...', showFilters=false, showLocation=true, showType=true, variant='default', className, defaultQuery='', defaultLocation='', defaultType='all', basePath='/pesquisa', onSearch, filterType, currentFilters={} }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultQuery)
  const [location, setLocation] = useState(defaultLocation)
  const [type, setType] = useState(defaultType)

  const handleSearch = useCallback(() => {
    if (onSearch) { onSearch({ query, location, type }); return }
    const params = new URLSearchParams()
    Object.entries(currentFilters).forEach(([key,value]) => { if (value && !['q','location','type'].includes(key)) params.set(key,value) })
    if (query.trim()) params.set('q', query.trim())
    if (location.trim()) params.set('location', location.trim())
    else params.delete('location')
    if (showType && type && type !== 'all') params.set('type', type)
    else params.delete('type')
    router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ''}`)
  }, [query, location, type, showType, basePath, onSearch, router, currentFilters])

  const isHero = variant === 'hero'
  return <div className={cn('flex w-full flex-col gap-3 sm:flex-row sm:items-center', isHero&&'rounded-2xl border border-border bg-background p-2 shadow-xl ring-1 ring-black/5 sm:p-3', className)}>
    {showType&&<Select value={type} onValueChange={value=>setType(value||'')}><SelectTrigger className={cn('w-full sm:w-36',isHero&&'border-0 bg-transparent focus:ring-0')}><SelectValue placeholder="Tipo"/></SelectTrigger><SelectContent>{searchTypes.map(item=><SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select>}
    <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input type="text" value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==='Enter')handleSearch()}} placeholder={placeholder} className={cn('pl-10',isHero&&'border-0 bg-transparent focus-visible:ring-0')}/></div>
    {showLocation&&<div className="flex min-w-0 gap-2 sm:w-[280px]"><div className="relative min-w-0 flex-1"><MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input type="text" value={location} onChange={event=>setLocation(event.target.value)} onKeyDown={event=>{if(event.key==='Enter')handleSearch()}} placeholder="Cidade ou zona" className={cn('pl-10',isHero&&'border-0 bg-transparent focus-visible:ring-0')}/></div><UseMyLocationButton compact/></div>}
    <div className="flex gap-2">{showFilters&&filterType&&<FilterModal type={filterType} currentFilters={currentFilters}/>}<Button onClick={handleSearch} className={cn('shrink-0',isHero&&'px-6')}><Search className="mr-2 h-4 w-4 sm:hidden"/>Pesquisar</Button></div>
  </div>
}
