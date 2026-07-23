'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

export function ComunidadesFilterModal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [category, setCategory] = useState(searchParams.get('category') || '')

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    router.push(`?${params.toString()}`)
  }

  const handleClear = () => {
    setCategory('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    router.push(`?${params.toString()}`)
  }

  return (
    <Dialog>
      <DialogTrigger render={
        <button className="bg-secondary text-secondary-foreground px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-secondary/80 transition-colors border border-border shadow-sm">
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          Filtros
        </button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filtrar Comunidades</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria de Desporto</label>
            <Input 
              placeholder="Ex: Padel, Futebol, etc..." 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" onClick={handleClear}>Limpar</Button>} />
          <DialogClose render={<Button onClick={handleApply}>Aplicar Filtros</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
