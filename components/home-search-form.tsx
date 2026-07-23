'use client';
import { MapPin, Search } from 'lucide-react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CIDADES_PORTUGAL = [
  'Lisboa', 'Porto', 'Vila Nova de Gaia', 'Amadora', 'Braga',
  'Funchal', 'Coimbra', 'Setúbal', 'Almada', 'Agualva-Cacém',
  'Gondomar', 'Guimarães', 'Leiria', 'Rio Tinto', 'Faro',
  'Évora', 'Ponta Delgada', 'Portimão', 'Aveiro', 'Cascais'
]

export function HomeSearchForm() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const searchParams = new URLSearchParams()
    if (query.trim()) searchParams.append('q', query.trim())
    if (location.trim()) searchParams.append('loc', location.trim())
    
    router.push(`/pesquisa?${searchParams.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center w-full">
      <div className="flex-1 w-full flex items-center bg-muted/50 rounded-xl px-4 border border-border focus-within:ring-2 focus-within:ring-primary/20 transition-all h-12">
        <Search className="text-muted-foreground mr-3 text-[20px]" />
        <input 
          className="w-full bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground outline-none" 
          placeholder="Pesquisar espaços, treinos, modalidades..." 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <div className="flex-1 w-full flex items-center bg-muted/50 rounded-xl px-4 border border-border focus-within:ring-2 focus-within:ring-primary/20 transition-all h-12 relative">
        <MapPin className="text-muted-foreground mr-3 text-[20px]" />
        <input 
          className="w-full bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground outline-none" 
          placeholder="Localização..." 
          type="text" 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          list="cities-portugal"
        />
        <datalist id="cities-portugal">
          {CIDADES_PORTUGAL.map(cidade => (
            <option key={cidade} value={cidade} />
          ))}
        </datalist>
      </div>
      
      <button type="submit" className="w-full md:w-auto h-12 bg-primary text-primary-foreground px-8 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all flex items-center justify-center shadow-sm active:scale-[0.98]">
        Pesquisar
      </button>
    </form>
  )
}
