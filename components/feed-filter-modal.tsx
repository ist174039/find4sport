'use client';

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, Calendar, Users, Activity, SlidersHorizontal, Check, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const categoriesList = [
  'Padel', 'Futebol', 'Fitness', 'Yoga', 
  'Corrida', 'Ténis', 'Basquetebol', 'Natação', 'Crossfit'
]

export function FeedFilterModal() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [dateRange, setDateRange] = useState(searchParams.get('date') || 'all')
  const [authorType, setAuthorType] = useState(searchParams.get('authorType') || 'all')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  const handleApply = () => {
    const params = new URLSearchParams()
    
    if (dateRange && dateRange !== 'all') params.set('date', dateRange)
    if (authorType && authorType !== 'all') params.set('authorType', authorType)
    if (category) params.set('category', category)
    if (searchTerm) params.set('search', searchTerm)

    router.push(`/feed?${params.toString()}`)
  }

  const handleClear = () => {
    setDateRange('all')
    setAuthorType('all')
    setCategory('')
    setSearchTerm('')
    router.push('/feed')
  }

  const activeCount = [
    dateRange !== 'all',
    authorType !== 'all',
    !!category,
    !!searchTerm
  ].filter(Boolean).length

  return (
    <Dialog>
      <DialogTrigger render={
        <button className="bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-primary/20 cursor-pointer">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Ver Todos & Filtrar
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </button>
      } />
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Filter className="w-5 h-5 text-primary" />
            Filtrar Feed de Publicações
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Filter 1: Modalidade / Categoria */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" /> Modalidade
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categoriesList.map((cat) => {
                const isSelected = category.toLowerCase() === cat.toLowerCase()
                return (
                  <Badge
                    key={cat}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all px-3 py-1.5 text-xs font-semibold rounded-lg ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => setCategory(isSelected ? '' : cat)}
                  >
                    {cat}
                    {isSelected && <Check className="w-3 h-3 ml-1" />}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Filter 2: Tipo de Autor / Profissional */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-500" /> Autor / Origem
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'pro', label: 'Profissionais' },
                { id: 'space', label: 'Espaços' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAuthorType(item.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    authorType === item.id 
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                      : 'bg-card border-border hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter 3: Data da Publicação */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" /> Data
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'all', label: 'Qualquer' },
                { id: 'today', label: 'Hoje' },
                { id: 'week', label: 'Esta Semana' },
                { id: 'month', label: 'Este Mês' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDateRange(item.id)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all text-center cursor-pointer ${
                    dateRange === item.id 
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                      : 'bg-card border-border hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter 4: Pesquisa Livre por Nome / Texto */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pesquisar por Palavra-Chave / Nome
            </label>
            <Input
              placeholder="Ex: PT João, Padel, Treino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl bg-background border-border text-sm"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <DialogClose render={
            <Button variant="ghost" onClick={handleClear} className="rounded-xl text-xs gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Limpar
            </Button>
          } />
          <DialogClose render={
            <Button onClick={handleApply} className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
              Aplicar Filtros
            </Button>
          } />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
