import type { ReactNode } from 'react'
import Link from 'next/link'
import { SlidersHorizontal } from 'lucide-react'
import { PageContainer, PageHeader, PageSection } from '@/components/patterns/page-shell'
import { Button } from '@/components/ui/button'

export type DiscoveryChip = { label: string; href: string; active?: boolean; group?: string }

export function DiscoveryPage({ title, description, countLabel, search, categories = [], sorts = [], clearHref, action, children }: { title: string; description?: string; countLabel?: string; search?: ReactNode; categories?: DiscoveryChip[]; sorts?: DiscoveryChip[]; clearHref?: string; action?: ReactNode; children: ReactNode }) {
  const hasFilters = categories.length > 0 || sorts.length > 0
  const grouped = categories.some(chip => chip.group)
  const standalone = categories.filter(chip => !chip.group)
  const groups = [...new Set(categories.map(chip => chip.group).filter(Boolean))] as string[]
  const chipClass = (active?: boolean) => `inline-flex min-h-10 items-center rounded-full px-3.5 text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={title} description={description} meta={countLabel} action={action}>{search}</PageHeader>
      {hasFilters && <section className="border-b border-border bg-background py-4 sm:py-5"><PageContainer><div className="space-y-4">
        {categories.length > 0 && (grouped ? <div className="space-y-4">
          {standalone.length > 0 && <div className="flex flex-wrap gap-2">{standalone.map(chip => <Link key={`${chip.label}-${chip.href}`} href={chip.href} className={chipClass(chip.active)}>{chip.label}</Link>)}</div>}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map(group => <div key={group} className="rounded-2xl border border-border bg-muted/15 p-3"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{group}</p><div className="flex flex-wrap gap-2">{categories.filter(chip => chip.group === group).map(chip => <Link key={`${chip.label}-${chip.href}`} href={chip.href} className={chipClass(chip.active)}>{chip.label}</Link>)}</div></div>)}
          </div>
        </div> : <div className="flex flex-wrap gap-2">{categories.map(chip => <Link key={`${chip.label}-${chip.href}`} href={chip.href} className={chipClass(chip.active)}>{chip.label}</Link>)}</div>)}
        {sorts.length > 0 && <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center"><div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><SlidersHorizontal className="h-4 w-4" />Ordenar</div><div className="flex flex-wrap gap-2">{sorts.map(chip => <Link key={`${chip.label}-${chip.href}`} href={chip.href} className={`inline-flex min-h-10 items-center rounded-full border px-3 text-sm font-medium ${chip.active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/50'}`}>{chip.label}</Link>)}{clearHref && <Button asChild variant="ghost" className="min-h-10 rounded-full px-3 text-sm"><Link href={clearHref}>Limpar filtros</Link></Button>}</div></div>}
      </div></PageContainer></section>}
      <PageSection>{children}</PageSection>
    </div>
  )
}

export function DiscoveryEmptyState({ title, description, clearHref }: { title: string; description?: string; clearHref?: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-12 text-center"><h2 className="text-lg font-bold text-foreground">{title}</h2>{description && <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{description}</p>}{clearHref && <Button asChild className="mt-5 min-h-11"><Link href={clearHref}>Limpar filtros</Link></Button>}</div>
}
