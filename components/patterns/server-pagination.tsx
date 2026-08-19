import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

type ServerPaginationProps = {
  currentPage: number
  totalPages: number
  totalItems: number
  startItem: number
  endItem: number
  previousHref: string
  nextHref: string
  label?: string
}

export function ServerPagination({
  currentPage,
  totalPages,
  totalItems,
  startItem,
  endItem,
  previousHref,
  nextHref,
  label = 'resultados',
}: ServerPaginationProps) {
  if (totalItems <= 0) return null

  const previousDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages

  return (
    <nav aria-label={`Paginação de ${label}`} className="mt-5 flex min-w-0 flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-xs leading-5 text-muted-foreground sm:text-left sm:text-sm">
        <span className="font-medium text-foreground">{startItem}</span>–<span className="font-medium text-foreground">{endItem}</span> de{' '}
        <span className="font-medium text-foreground">{totalItems}</span> {label}
      </p>

      <div className="flex min-w-0 items-center justify-center gap-2">
        <Link
          href={previousDisabled ? '#' : previousHref}
          aria-disabled={previousDisabled}
          tabIndex={previousDisabled ? -1 : undefined}
          aria-label="Página anterior"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'h-11 min-w-11 px-3',
            previousDisabled && 'pointer-events-none opacity-40'
          )}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Anterior</span>
        </Link>

        <div className="min-w-[6.5rem] text-center text-sm font-medium text-muted-foreground" aria-live="polite">
          <span className="text-foreground">{currentPage}</span> / {Math.max(1, totalPages)}
        </div>

        <Link
          href={nextDisabled ? '#' : nextHref}
          aria-disabled={nextDisabled}
          tabIndex={nextDisabled ? -1 : undefined}
          aria-label="Página seguinte"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'h-11 min-w-11 px-3',
            nextDisabled && 'pointer-events-none opacity-40'
          )}
        >
          <span className="hidden sm:inline">Seguinte</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </nav>
  )
}
