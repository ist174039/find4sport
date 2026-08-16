'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

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
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveId(tab.id)}
              className={cn(
                'min-h-10 shrink-0 rounded-xl px-4 text-sm font-semibold transition-colors',
                active.id === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4 px-3 py-4">{active.content}</div>
    </div>
  )
}
