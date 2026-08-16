'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function DashboardContentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const immersive = pathname.startsWith('/dashboard/mensagens')

  return (
    <main
      className={cn(
        'ml-0 w-full min-w-0 flex-1 lg:ml-64',
        immersive
          ? 'h-[calc(100dvh-4rem-env(safe-area-inset-bottom))] overflow-hidden p-0 lg:h-screen lg:p-5'
          : 'px-4 pb-24 pt-20 sm:px-6 lg:p-8',
      )}
    >
      <div className={cn('mx-auto w-full', immersive ? 'h-full max-w-none' : 'max-w-6xl')}>
        {children}
      </div>
    </main>
  )
}
