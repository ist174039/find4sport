'use client'

import { useState, useEffect } from 'react'
import { Map, List } from 'lucide-react'
import { Button } from './ui/button'

export function PesquisaLayout({ 
  resultsPane, 
  mapPane 
}: { 
  resultsPane: React.ReactNode, 
  mapPane: React.ReactNode 
}) {
  const [view, setView] = useState<'list' | 'map'>('list')

  // Force map to update size when toggling views on mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('map-toggle'))
    }
  }, [view])

  return (
    <main className="flex-1 flex flex-col md:flex-row overflow-hidden border-t border-border relative">
      {/* Results Pane */}
      <section className={`w-full md:w-[600px] lg:w-[640px] flex-col bg-background border-r border-border h-[calc(100dvh-64px)] ${view === 'list' ? 'flex' : 'hidden md:flex'}`}>
        {resultsPane}
      </section>
      
      {/* Map Pane */}
      <section className={`z-0 bg-muted ${view === 'map' ? 'absolute inset-0 block md:relative md:inset-auto md:flex-1 md:h-[calc(100dvh-64px)]' : 'hidden md:block md:flex-1 md:relative md:h-[calc(100dvh-64px)]'}`}>
        {mapPane}
      </section>

      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Button 
          onClick={() => setView(view === 'list' ? 'map' : 'list')}
          className="rounded-full shadow-lg bg-foreground text-background hover:bg-foreground/90 flex items-center gap-2 px-6 h-12 font-bold tracking-wide"
        >
          {view === 'list' ? (
            <>
              <span>Mapa</span>
              <Map className="h-4 w-4 ml-1" />
            </>
          ) : (
            <>
              <span>Lista</span>
              <List className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </main>
  )
}
