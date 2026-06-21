'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'

interface PageShellProps {
  children: React.ReactNode
  className?: string
  hideFooter?: boolean
  user?: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
    role?: string
  } | null
  notificationCount?: number
}

/**
 * PageShell — wrapper client-side unificado para todas as páginas públicas.
 * Garante um único <Header>, um único <main> e um único <Footer> por página.
 * 
 * Uso:
 *   <PageShell>
 *     <section className="pt-16 ...">...</section>
 *   </PageShell>
 */
export function PageShell({
  children,
  className,
  hideFooter = false,
  user,
  notificationCount = 0,
}: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header user={user} notificationCount={notificationCount} />
      <main className={cn('flex-1', className)}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}
