import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10', className)}>{children}</div>
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
    <section className="border-b border-border/80 bg-gradient-to-b from-muted/45 to-muted/20 py-6 sm:py-8 lg:py-10">
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">{title}</h1>
            {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>}
            {meta && <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm sm:normal-case sm:tracking-normal">{meta}</p>}
          </div>
          {action && <div className="w-full shrink-0 sm:w-auto">{action}</div>}
        </div>
        {children && <div className="mt-5 sm:mt-6">{children}</div>}
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
        {description && <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  )
}
