'use client'

import { Children, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

type TabItem = {
  id: string
  label: string
}

export function MobileSectionsTabs({
  tabs,
  children,
  className,
}: {
  tabs: TabItem[]
  children: React.ReactNode
  className?: string
}) {
  const panels = useMemo(() => {
    const list = Children.toArray(children)
    return list
  }, [children])

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')

  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeTab)
  )

  return (
    <div className={cn('space-y-4', className)}>
      <div className="sticky top-16 z-20 -mx-4 overflow-x-auto border-y border-border bg-background/95 px-4 py-2 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <div className="flex min-w-max items-center gap-2">
          {tabs.map((tab) => {
            const isActive = tab.id === tabs[activeIndex]?.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary/40'
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>{panels[activeIndex] ?? null}</div>
    </div>
  )
}
