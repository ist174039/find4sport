import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function DiscoveryCard({
  href,
  image,
  overlay,
  title,
  titleAdornment,
  meta,
  tags,
  footer,
  className,
}: {
  href: string
  image: ReactNode
  overlay?: ReactNode
  title: string
  titleAdornment?: ReactNode
  meta?: ReactNode
  tags?: ReactNode
  footer?: ReactNode
  className?: string
}) {
  return (
    <article className={cn('group h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-primary/35 hover:shadow-md', className)}>
      <Link href={href} className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted sm:aspect-[16/11]">
          {image}
          {overlay}
        </div>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <h2 className="flex min-w-0 items-center gap-1.5 text-base font-bold leading-6 text-foreground group-hover:text-primary sm:text-lg">
              <span className="line-clamp-2">{title}</span>
              {titleAdornment}
            </h2>
          </div>
          {meta && <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">{meta}</div>}
          {tags && <div className="mt-3 flex flex-wrap gap-1.5">{tags}</div>}
          {footer && <div className="mt-auto pt-4">{footer}</div>}
        </div>
      </Link>
    </article>
  )
}

export function DiscoveryCardGrid({ children, columns = 3, className }: { children: ReactNode; columns?: 2 | 3 | 4; className?: string }) {
  const cols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }
  return <div className={cn('grid grid-cols-1 gap-4 sm:gap-5', cols[columns], className)}>{children}</div>
}
