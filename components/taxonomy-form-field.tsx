'use client'

import { useState } from 'react'
import { TaxonomyCombobox, type TaxonomyOption } from '@/components/taxonomy-combobox'

export function TaxonomyFormField({ name, options, defaultValue = '', required = false, placeholder = 'Selecionar modalidade' }: { name: string; options: TaxonomyOption[]; defaultValue?: string; required?: boolean; placeholder?: string }) {
  const [value, setValue] = useState(defaultValue)
  return <>
    <input type="hidden" name={name} value={value} />
    <TaxonomyCombobox options={options} value={value} onChange={next => setValue(String(next))} placeholder={placeholder} />
    {required && !value && <p className="text-xs text-muted-foreground">Seleciona uma modalidade da taxonomia.</p>}
  </>
}
