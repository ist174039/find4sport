'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'

export type TaxonomyOption = {
  id: string
  name: string
  slug: string
  parent_id?: string | null
  emoji?: string | null
}

type Props = {
  options: TaxonomyOption[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  maxSelected?: number
  placeholder?: string
  searchPlaceholder?: string
  emptyLabel?: string
  disabled?: boolean
  className?: string
}

const normalize = (value: string) => value.toLocaleLowerCase('pt-PT').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

export function TaxonomyCombobox({
  options,
  value,
  onChange,
  multiple = false,
  maxSelected,
  placeholder = 'Selecionar modalidade',
  searchPlaceholder = 'Pesquisar modalidade…',
  emptyLabel = 'Nenhuma modalidade encontrada.',
  disabled = false,
  className = '',
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selectedIds = useMemo(() => multiple ? (Array.isArray(value) ? value : value ? [value] : []) : (typeof value === 'string' && value ? [value] : []), [multiple, value])
  const optionById = useMemo(() => new Map(options.map(option => [option.id, option])), [options])

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    if (open) requestAnimationFrame(() => searchRef.current?.focus())
    else setQuery('')
  }, [open])

  const rows = useMemo(() => {
    const parents = options.filter(option => !option.parent_id || !optionById.has(option.parent_id))
    const childrenByParent = new Map<string, TaxonomyOption[]>()
    for (const option of options) {
      if (!option.parent_id || !optionById.has(option.parent_id)) continue
      const items = childrenByParent.get(option.parent_id) || []
      items.push(option)
      childrenByParent.set(option.parent_id, items)
    }
    const q = normalize(query)
    const matches = (option: TaxonomyOption, parent?: TaxonomyOption) => !q || normalize(`${option.name} ${option.slug} ${parent?.name || ''}`).includes(q)
    const result: Array<{ option: TaxonomyOption; parent?: TaxonomyOption; depth: number }> = []

    for (const parent of parents.sort((a, b) => a.name.localeCompare(b.name, 'pt-PT'))) {
      const children = (childrenByParent.get(parent.id) || []).sort((a, b) => a.name.localeCompare(b.name, 'pt-PT'))
      const matchingChildren = children.filter(child => matches(child, parent))
      const parentMatches = matches(parent)
      if (parentMatches || matchingChildren.length) {
        result.push({ option: parent, depth: 0 })
        for (const child of q && !parentMatches ? matchingChildren : children) result.push({ option: child, parent, depth: 1 })
      }
    }

    const attached = new Set(result.map(row => row.option.id))
    for (const option of options) if (!attached.has(option.id) && matches(option, option.parent_id ? optionById.get(option.parent_id) : undefined)) result.push({ option, parent: option.parent_id ? optionById.get(option.parent_id) : undefined, depth: option.parent_id ? 1 : 0 })
    return result
  }, [optionById, options, query])

  const choose = (id: string) => {
    if (!multiple) {
      onChange(id)
      setOpen(false)
      return
    }
    const selected = selectedIds.includes(id)
    if (selected) onChange(selectedIds.filter(item => item !== id))
    else if (!maxSelected || selectedIds.length < maxSelected) onChange([...selectedIds, id])
  }

  const selectedOptions = selectedIds.map(id => optionById.get(id)).filter(Boolean) as TaxonomyOption[]
  const singleLabel = selectedOptions[0]?.name

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(current => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-input bg-background px-3 py-2 text-left text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={singleLabel ? 'truncate font-medium text-foreground' : 'truncate text-muted-foreground'}>{multiple ? (selectedOptions.length ? `${selectedOptions.length} selecionada${selectedOptions.length === 1 ? '' : 's'}` : placeholder) : (singleLabel || placeholder)}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && <div className="absolute z-50 mt-2 w-full min-w-[280px] overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
        <div className="border-b p-2"><label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input ref={searchRef} value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') setOpen(false) }} placeholder={searchPlaceholder} className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-9 text-base outline-none focus:border-primary" />{query && <button type="button" onClick={() => setQuery('')} className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="Limpar pesquisa"><X className="h-4 w-4" /></button>}</label></div>
        <div role="listbox" aria-multiselectable={multiple || undefined} className="max-h-[min(52vh,360px)] overflow-y-auto p-1.5">
          {rows.length === 0 ? <p className="px-3 py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p> : rows.map(({ option, parent, depth }) => {
            const selected = selectedIds.includes(option.id)
            const blocked = multiple && !selected && !!maxSelected && selectedIds.length >= maxSelected
            return <button key={option.id} type="button" role="option" aria-selected={selected} disabled={blocked} onClick={() => choose(option.id)} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${selected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'} ${blocked ? 'opacity-40' : ''}`}>
              <span className={`flex min-w-0 flex-1 items-center gap-2 ${depth ? 'pl-5' : 'font-semibold'}`}>
                {depth > 0 && <span className="text-muted-foreground">↳</span>}
                {option.emoji && <span aria-hidden="true">{option.emoji}</span>}
                <span className="min-w-0"><span className="block truncate">{option.name}</span>{depth > 0 && parent && <span className="block truncate text-[11px] font-normal text-muted-foreground">{parent.name}</span>}</span>
              </span>
              {selected && <Check className="h-4 w-4 shrink-0" />}
            </button>
          })}
        </div>
        {multiple && maxSelected && <div className="border-t px-3 py-2 text-xs text-muted-foreground">{selectedIds.length}/{maxSelected} selecionadas</div>}
      </div>}

      {multiple && selectedOptions.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{selectedOptions.map(option => <span key={option.id} className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-primary/10 px-3 text-xs font-semibold text-primary"><span>{option.emoji || ''}</span>{option.name}<button type="button" onClick={() => choose(option.id)} className="ml-0.5 rounded-full p-0.5 hover:bg-primary/10" aria-label={`Remover ${option.name}`}><X className="h-3.5 w-3.5" /></button></span>)}</div>}
    </div>
  )
}
