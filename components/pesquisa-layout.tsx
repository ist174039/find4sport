'use client'

import { useState, useEffect } from 'react'
import { Map, List } from 'lucide-react'
import { Button } from './ui/button'

export function PesquisaLayout({ resultsPane, mapPane }: { resultsPane: React.ReactNode; mapPane: React.ReactNode }) {
  const [view, setView] = useState<'list' | 'map'>('list')

  useEffect(() => {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('map-toggle'))
  }, [view])

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden border-t border-border md:flex-row">
      <section className={`h-[calc(100dvh-64px)] w-full flex-col border-r border-border bg-background md:w-[600px] lg:w-[640px] ${view === 'list' ? 'flex' : 'hidden md:flex'}`}>
        {resultsPane}
      </section>

      <section className={`z-0 bg-muted ${view === 'map' ? 'absolute inset-0 block md:relative md:inset-auto md:h-[calc(100dvh-64px)] md:flex-1' : 'hidden md:relative md:block md:h-[calc(100dvh-64px)] md:flex-1'}`}>
        {mapPane}
      </section>

      <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-[60] md:hidden">
        <Button
          onClick={() => setView(view === 'list' ? 'map' : 'list')}
          className="flex h-12 items-center gap-2 rounded-full bg-foreground px-5 font-bold tracking-wide text-background shadow-xl hover:bg-foreground/90"
          aria-label={view === 'list' ? 'Mostrar mapa' : 'Mostrar lista'}
        >
          {view === 'list' ? <><Map className="h-4 w-4" /><span>Mapa</span></> : <><List className="h-4 w-4" /><span>Lista</span></>}
        </Button>
      </div>
    </main>
  )
}
