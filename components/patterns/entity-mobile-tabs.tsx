'use client'

import type { KeyboardEvent, ReactNode } from 'react'
import { useState } from 'react'

export type EntityMobileTab = { id: string; label: string; content: ReactNode }

export function EntityMobileTabs({ tabs }: { tabs: EntityMobileTab[] }) {
  const visible = tabs.filter(tab => Boolean(tab.content))
  const [activeId, setActiveId] = useState(visible[0]?.id || '')
  const active = visible.find(tab => tab.id === activeId) || visible[0]
  if (!active) return null

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? visible.length - 1 : event.key === 'ArrowRight' ? (index + 1) % visible.length : (index - 1 + visible.length) % visible.length
    const next = visible[nextIndex]
    setActiveId(next.id)
    requestAnimationFrame(() => document.getElementById(`tab-${next.id}`)?.focus())
  }

  return (
    <div className="md:hidden">
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="overflow-x-auto overscroll-x-contain px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2" role="tablist" aria-label="Secções da página">
            {visible.map((tab, index) => {
              const selected = tab.id === active.id
              return <button id={`tab-${tab.id}`} key={tab.id} type="button" role="tab" aria-selected={selected} aria-controls={`panel-${tab.id}`} tabIndex={selected ? 0 : -1} onKeyDown={event => moveFocus(event, index)} onClick={() => setActiveId(tab.id)} className={`min-h-11 shrink-0 rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${selected ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>{tab.label}</button>
            })}
          </div>
        </div>
      </div>
      <div id={`panel-${active.id}`} role="tabpanel" aria-labelledby={`tab-${active.id}`} tabIndex={0} className="space-y-4 px-3 py-4 focus:outline-none">{active.content}</div>
    </div>
  )
}
