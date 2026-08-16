import type { ReactNode } from 'react'
import Link from 'next/link'
import { SlidersHorizontal } from 'lucide-react'
import { PageContainer, PageHeader, PageSection } from '@/components/patterns/page-shell'
import { Button } from '@/components/ui/button'

export type DiscoveryChip = { label: string; href: string; active?: boolean }

export function DiscoveryPage({
  title,
  description,
  countLabel,
  search,
  categories = [],
  sorts = [],
  clearHref,
  action,
  children,
}: {
  title: string
  description?: string
  countLabel?: string
  search?: ReactNode
  categories?: DiscoveryChip[]
  sorts?: DiscoveryChip[]
  clearHref?: string
  action?: ReactNode
  children: ReactNode
}) {
  const hasFilters = categories.length > 0 || sorts.length > 0

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={title} description={description} meta={countLabel} action={action}>
        {search}
      </PageHeader>

      {hasFilters && (
        <section className="border-b border-border bg-background py-4 sm:py-5">
          <PageContainer>
            <div className="space-y-3">
              {categories.length > 0 && (
                <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                  <div className="flex w-max min-w-full gap-2">
                    {categories.map((chip) => (
                      <Link
                        key={`${chip.label}-${chip.href}`}
                        href={chip.href}
                        className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors ${
                          chip.active
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {chip.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {sorts.length > 0 && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <SlidersHorizontal className="h-4 w-4" />
                    Ordenar
                  </div>
                  <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                    <div className="flex w-max gap-2">
                      {sorts.map((chip) => (
                        <Link
                          key={`${chip.label}-${chip.href}`}
                          href={chip.href}
                          className={`inline-flex min-h-10 shrink-0 items-center rounded-full border px-3 text-sm font-medium ${
                            chip.active
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-foreground hover:border-primary/50'
                          }`}
                        >
                          {chip.label}
                        </Link>
                      ))}
                      {clearHref && (
                        <Button asChild variant="ghost" className="min-h-10 rounded-full px-3 text-sm">
                          <Link href={clearHref}>Limpar filtros</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </PageContainer>
        </section>
      )}

      <PageSection>{children}</PageSection>
    </div>
  )
}

export function DiscoveryEmptyState({
  title,
  description,
  clearHref,
}: {
  title: string
  description?: string
  clearHref?: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-12 text-center">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{description}</p>}
      {clearHref && (
        <Button asChild className="mt-5 min-h-11">
          <Link href={clearHref}>Limpar filtros</Link>
        </Button>
      )}
    </div>
  )
}
