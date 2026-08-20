'use client'

import { Activity, Building2, CalendarDays, MapPin, Search, Users, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CIDADES_PORTUGAL = [
  'Lisboa', 'Porto', 'Vila Nova de Gaia', 'Amadora', 'Braga',
  'Funchal', 'Coimbra', 'Setúbal', 'Almada', 'Agualva-Cacém',
  'Gondomar', 'Guimarães', 'Leiria', 'Rio Tinto', 'Faro',
  'Évora', 'Ponta Delgada', 'Portimão', 'Aveiro', 'Cascais'
]

const ENTITY_TYPES = [
  { id: 'todos', label: 'Tudo', icon: Activity },
  { id: 'espacos', label: 'Espaços', icon: Building2 },
  { id: 'profissionais', label: 'Profissionais', icon: Users },
  { id: 'eventos', label: 'Eventos', icon: CalendarDays },
  { id: 'comunidades', label: 'Comunidades', icon: UsersRound },
] as const

type EntityType = typeof ENTITY_TYPES[number]['id']

export function HomeSearchForm() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState<EntityType>('todos')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const searchParams = new URLSearchParams()
    if (type !== 'todos') searchParams.set('type', type)
    if (query.trim()) searchParams.set('q', query.trim())
    if (location.trim()) searchParams.set('location', location.trim())
    const suffix = searchParams.toString()
    router.push(suffix ? `/pesquisa?${suffix}` : '/pesquisa')
  }

  return (
    <form onSubmit={handleSearch} className="w-full rounded-2xl border border-border bg-card p-4 text-foreground shadow-sm">
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:justify-center" aria-label="Tipo de pesquisa">
        {ENTITY_TYPES.map(item => (
          <button
            key={item.id}
            type="button"
            aria-pressed={type === item.id}
            onClick={() => setType(item.id)}
            className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${type === item.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
          >
            <item.icon className="h-4 w-4" />{item.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex h-12 w-full flex-1 items-center rounded-xl border border-border bg-muted/50 px-4 transition-all focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="mr-3 h-5 w-5 text-muted-foreground" />
          <input className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" placeholder="Pesquisar espaços, treinos, modalidades..." type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="relative flex h-12 w-full flex-1 items-center rounded-xl border border-border bg-muted/50 px-4 transition-all focus-within:ring-2 focus-within:ring-primary/20">
          <MapPin className="mr-3 h-5 w-5 text-muted-foreground" />
          <input className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" placeholder="Localização..." type="text" value={location} onChange={(e) => setLocation(e.target.value)} list="cities-portugal" />
          <datalist id="cities-portugal">{CIDADES_PORTUGAL.map(cidade => <option key={cidade} value={cidade} />)}</datalist>
        </div>
        <button type="submit" className="flex h-12 w-full items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-[0.98] md:w-auto">Pesquisar</button>
      </div>
    </form>
  )
}
