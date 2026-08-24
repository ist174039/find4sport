'use client'

import { ModalityIcon } from '@/components/modality-icon'
import { groupSports } from '@/lib/sports-taxonomy'

type Category = {
  id: string
  name: string
  emoji?: string | null
  slug?: string | null
  icon_key?: string | null
}

export function GroupedSportSelect({
  categories,
  name,
  id,
  defaultValue = '',
  value,
  onChange,
  required = false,
  className = '',
  placeholder = 'Selecionar modalidade',
}: {
  categories: Category[]
  name: string
  id?: string
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  className?: string
  placeholder?: string
}) {
  const groups = groupSports(categories)
  const controlled = value !== undefined

  return (
    <select
      id={id}
      name={name}
      {...(controlled ? { value } : { defaultValue })}
      onChange={(event) => onChange?.(event.target.value)}
      required={required}
      className={`min-h-11 w-full rounded-xl border border-input bg-background px-3 text-base ${className}`}
    >
      <option value="" disabled={required}>{placeholder}</option>
      {groups.map((group) => (
        <optgroup key={group.id} label={group.name}>
          {group.sports.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

export function GroupedSportCheckboxes({ categories, name, selectedIds = [] }: { categories: Category[]; name: string; selectedIds?: string[] }) {
  const groups = groupSports(categories)

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <fieldset key={group.id} className="rounded-2xl border border-border bg-muted/10 p-3 sm:p-4">
          <legend className="px-1 text-sm font-bold text-foreground">{group.name}</legend>
          <p className="mb-3 mt-1 text-xs text-muted-foreground">{group.description}</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {group.sports.map((category) => (
              <label key={category.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-sm transition hover:border-primary/35">
                <input type="checkbox" name={name} value={category.id} defaultChecked={selectedIds.includes(category.id)} className="h-5 w-5 shrink-0" />
                <span className="flex min-w-0 items-center gap-2 break-words">
                  <ModalityIcon iconKey={category.icon_key} name={category.name} className="h-5 w-5 shrink-0 text-primary" />
                  <span>{category.name}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
