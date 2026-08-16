import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>
}

export function PageHeader({
  title,
  description,
  meta,
  action,
  children,
}: {
  title: string
  description?: string
  meta?: string
  action?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="border-b border-border bg-muted/30 py-7 sm:py-10">
      <PageContainer>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">{title}</h1>
            {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>}
            {meta && <p className="mt-2 text-sm font-medium text-muted-foreground">{meta}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {children && <div className="mt-6">{children}</div>}
      </PageContainer>
    </section>
  )
}

export function PageSection({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn('py-7 sm:py-10', className)}>
      <PageContainer>{children}</PageContainer>
    </section>
  )
}

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
