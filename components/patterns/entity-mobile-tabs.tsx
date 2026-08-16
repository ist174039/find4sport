'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

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
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 px-3 py-2 backdrop-blur">
        <label className="relative block">
          <span className="sr-only">Secção</span>
          <select
            value={active.id}
            onChange={event => setActiveId(event.target.value)}
            className="min-h-11 w-full appearance-none rounded-xl border border-border bg-card px-4 pr-10 text-sm font-semibold text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            {visibleTabs.map(tab => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </label>
      </div>
      <div className="space-y-4 px-3 py-4">{active.content}</div>
    </div>
  )
}
