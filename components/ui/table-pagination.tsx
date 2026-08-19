import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export function TablePagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: TablePaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  if (totalItems === 0) return null

  return (
    <nav aria-label="Paginação de resultados" className="mt-4 flex min-w-0 flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-xs leading-5 text-muted-foreground sm:text-left sm:text-sm">
        <span className="font-medium text-foreground">{startItem}</span>–<span className="font-medium text-foreground">{endItem}</span> de{' '}
        <span className="font-medium text-foreground">{totalItems}</span> resultados
      </p>
      <div className="flex min-w-0 items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Página anterior"
          title="Página anterior"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="min-w-[6.5rem] text-center text-sm font-medium text-muted-foreground" aria-live="polite">
          <span className="text-foreground">{currentPage}</span> / {Math.max(1, totalPages)}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Página seguinte"
          title="Página seguinte"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
