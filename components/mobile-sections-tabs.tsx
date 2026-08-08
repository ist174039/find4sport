'use client'

import { Children, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

type TabItem = {
  id: string
  label: string
  icon?: React.ReactNode
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
      <div className="sticky top-16 z-20 -mx-4 border-b border-border bg-background/95 backdrop-blur-sm sm:-mx-6">
        <div className="flex w-full items-center justify-between">
          {tabs.map((tab) => {
            const isActive = tab.id === tabs[activeIndex]?.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center py-3 border-b-[2px] transition-all',
                  isActive
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
                aria-label={tab.label}
              >
                {tab.icon ? (
                  <div className={cn("transition-transform", isActive ? "scale-105" : "")}>
                    {tab.icon}
                  </div>
                ) : (
                  <span className={cn("text-[13px] uppercase", isActive ? "font-bold" : "font-semibold")}>
                    {tab.label}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div>{panels[activeIndex] ?? null}</div>
    </div>
  )
}
