import type { ReactNode } from 'react'
import { Loader2, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DashboardPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('min-w-0 max-w-full space-y-5 overflow-x-hidden pb-6 sm:space-y-6 sm:pb-10', className)}>{children}</div>
}

export function DashboardPageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex min-w-0 max-w-full flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
      <div className="min-w-0 flex-1">
        <h1 className="break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-3xl break-words text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="min-w-0 w-full shrink-0 sm:w-auto [&>*]:min-h-11 [&>*]:max-w-full [&>*]:w-full sm:[&>*]:w-auto">{action}</div>}
    </div>
  )
}

export function DashboardSection({ title, description, action, children, className }: { title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5', className)}>
      {(title || action) && (
        <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            {title && <h2 className="break-words text-lg font-bold text-foreground">{title}</h2>}
            {description && <p className="mt-1 break-words text-sm text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="min-w-0 max-w-full shrink-0">{action}</div>}
        </div>
      )}
      <div className="min-w-0 max-w-full">{children}</div>
    </section>
  )
}

export function DashboardEmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="min-w-0 max-w-full rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-10 text-center sm:py-12">
      {icon && <div className="mx-auto mb-3 flex justify-center text-muted-foreground/50">{icon}</div>}
      <h3 className="break-words font-bold text-foreground">{title}</h3>
      {description && <p className="mx-auto mt-1 max-w-md break-words text-sm leading-6 text-muted-foreground">{description}</p>}
      {action && <div className="mx-auto mt-5 max-w-sm [&>*]:min-h-11 [&>*]:max-w-full [&>*]:w-full sm:[&>*]:w-auto">{action}</div>}
    </div>
  )
}

export function DashboardLoadingState({ label = 'A carregar…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex min-h-48 min-w-0 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/15 px-5 py-10 text-center', className)} role="status" aria-live="polite">
      <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  )
}

export function DashboardErrorState({ title = 'Não foi possível carregar', description, action, className }: { title?: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0 rounded-2xl border border-destructive/25 bg-destructive/5 px-5 py-8 text-center sm:py-10', className)} role="alert">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="break-words font-bold text-foreground">{title}</h3>
      {description && <p className="mx-auto mt-1 max-w-lg break-words text-sm leading-6 text-muted-foreground">{description}</p>}
      {action && <div className="mx-auto mt-5 max-w-sm [&>*]:min-h-11 [&>*]:max-w-full [&>*]:w-full sm:[&>*]:w-auto">{action}</div>}
    </div>
  )
}

export function DashboardStatGrid({ children }: { children: ReactNode }) {
  return <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>
}

export function DashboardStat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: string; icon?: ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-3"><p className="min-w-0 break-words text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>{icon && <div className="shrink-0 text-primary">{icon}</div>}</div>
      <div className="mt-2 min-w-0 break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{value}</div>
      {hint && <p className="mt-1 break-words text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
