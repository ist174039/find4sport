import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function DashboardPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-5 pb-6 sm:space-y-6 sm:pb-10', className)}>{children}</div>
}

export function DashboardPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="w-full shrink-0 sm:w-auto [&>*]:min-h-11 [&>*]:w-full sm:[&>*]:w-auto">{action}</div>}
    </div>
  )
}

export function DashboardSection({ title, description, action, children, className }: { title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5', className)}>
      {(title || action) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-lg font-bold text-foreground">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function DashboardEmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-10 text-center sm:py-12">
      {icon && <div className="mx-auto mb-3 flex justify-center text-muted-foreground/50">{icon}</div>}
      <h3 className="font-bold text-foreground">{title}</h3>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mx-auto mt-5 max-w-sm [&>*]:min-h-11 [&>*]:w-full sm:[&>*]:w-auto">{action}</div>}
    </div>
  )
}

export function DashboardStatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>
}

export function DashboardStat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: string; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{value}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
