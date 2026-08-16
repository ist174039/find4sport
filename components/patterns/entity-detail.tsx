import { Fragment, isValidElement, type ReactNode } from 'react'
import { PageContainer } from '@/components/patterns/page-shell'
import { EntityMobileTabs } from '@/components/patterns/entity-mobile-tabs'
import { cn } from '@/lib/utils'

export function EntityHero({
  coverUrl,
  coverAlt,
  avatar,
  title,
  subtitle,
  badges,
  meta,
  actions,
}: {
  coverUrl?: string | null
  coverAlt: string
  avatar?: ReactNode
  title: string
  subtitle?: ReactNode
  badges?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
}) {
  return (
    <section className="relative border-b border-border bg-card">
      <div className="relative h-44 overflow-hidden bg-muted sm:h-60 lg:h-72">
        {coverUrl ? <img src={coverUrl} alt={coverAlt} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-primary/20 via-muted to-secondary/20" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      </div>
      <PageContainer className="relative -mt-16 pb-5 sm:-mt-20 sm:pb-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-end gap-3 sm:gap-4">
            {avatar && <div className="shrink-0">{avatar}</div>}
            <div className="min-w-0 pb-1 text-white sm:pb-2">
              <div className="flex flex-wrap items-center gap-2">{badges}</div>
              <h1 className="mt-1 line-clamp-2 text-2xl font-bold tracking-tight drop-shadow sm:text-3xl lg:text-4xl">{title}</h1>
              {subtitle && <div className="mt-1 text-sm text-white/90 sm:text-base">{subtitle}</div>}
              {meta && <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">{meta}</div>}
            </div>
          </div>
          {actions && (
            <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 sm:shrink-0 sm:overflow-visible sm:pb-2 [&>*]:min-h-11 [&>*]:shrink-0">
              {actions}
            </div>
          )}
        </div>
      </PageContainer>
    </section>
  )
}

function flattenSections(node: ReactNode): ReactNode[] {
  if (node == null || typeof node === 'boolean') return []
  if (Array.isArray(node)) return node.flatMap(flattenSections)
  if (isValidElement(node) && node.type === Fragment) return flattenSections((node.props as any).children)
  return [node]
}

function tabLabel(node: ReactNode, index: number) {
  if (isValidElement(node)) {
    const props = node.props as any
    if (typeof props?.title === 'string' && props.title.trim()) return props.title.trim()
  }
  return index === 0 ? 'Detalhes' : `Mais ${index + 1}`
}

export function EntityDetailLayout({ main, aside }: { main: ReactNode; aside?: ReactNode }) {
  const mobileSections = [...flattenSections(main), ...flattenSections(aside)].filter(Boolean)
  const mobileTabs = mobileSections.map((content, index) => ({
    id: `section-${index}`,
    label: tabLabel(content, index),
    content,
  }))

  return (
    <>
      <EntityMobileTabs tabs={mobileTabs} />
      <PageContainer className="hidden py-8 sm:block">
        <div className={cn('grid gap-5 lg:gap-8', aside ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : 'grid-cols-1')}>
          <div className="min-w-0 space-y-5">{main}</div>
          {aside && <aside className="min-w-0 space-y-5 lg:sticky lg:top-24 lg:self-start">{aside}</aside>}
        </div>
      </PageContainer>
    </>
  )
}

export function DetailSection({ title, icon, description, children, className }: { title?: string; icon?: ReactNode; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5', className)}>
      {title && <div className="mb-4 min-w-0"><h2 className="flex min-w-0 items-center gap-2 text-lg font-bold text-foreground sm:text-xl">{icon}<span className="min-w-0 break-words">{title}</span></h2>{description && <p className="mt-1 break-words text-sm text-muted-foreground">{description}</p>}</div>}
      <div className="min-w-0">{children}</div>
    </section>
  )
}

export function MobileActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-lg gap-2 overflow-x-auto [&>*]:min-h-11 [&>*]:min-w-0 [&>*]:flex-1">{children}</div>
    </div>
  )
}

export function DetailStat({ label, value }: { label: string; value: ReactNode }) {
  return <div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><div className="mt-1 break-words font-semibold text-foreground">{value}</div></div>
}
