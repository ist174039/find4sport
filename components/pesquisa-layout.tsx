'use client'

import { useState } from 'react'
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

  return (
    <main className="flex-1 flex flex-col md:flex-row overflow-hidden border-t border-border relative">
      {/* Results Pane */}
      <section className={`w-full md:w-[600px] lg:w-[640px] flex-col bg-background border-r border-border h-[calc(100vh-64px)] ${view === 'list' ? 'flex' : 'hidden md:flex'}`}>
        {resultsPane}
      </section>
      
      {/* Map Pane */}
      <section className={`flex-1 relative bg-muted h-[calc(100vh-64px)] z-0 ${view === 'map' ? 'flex' : 'hidden md:flex'}`}>
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
