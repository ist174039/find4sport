'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'

export type EntityMobileTab = {
  id: string
  label: string
  content: ReactNode
}

export function EntityMobileTabs({ tabs }: { tabs: EntityMobileTab[] }) {
  const visibleTabs = tabs.filter(tab => Boolean(tab.content))
  const [activeId, setActiveId] = useState(visibleTabs[0]?.id || '')
  const active = visibleTabs.find(tab => tab.id === activeId) || visibleTabs[0]

  if (!active) return null

  return (
    <div className="sm:hidden">
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 px-3 py-2.5 backdrop-blur">
        <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-muted/60 p-1.5" role="tablist" aria-label="Secções da página">
          {visibleTabs.map(tab => {
            const selected = tab.id === active.id
            return <button key={tab.id} type="button" role="tab" aria-selected={selected} onClick={() => setActiveId(tab.id)} className={`min-h-10 min-w-0 rounded-xl px-2 py-2 text-xs font-semibold leading-tight transition ${selected ? 'bg-background text-primary shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'}`}><span className="line-clamp-1">{tab.label}</span></button>
          })}
        </div>
      </div>
      <div className="space-y-4 px-3 py-4">{active.content}</div>
    </div>
  )
}
