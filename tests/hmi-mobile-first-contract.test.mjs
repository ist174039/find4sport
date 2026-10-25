import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const search = readFileSync(new URL('../components/search-bar.tsx', import.meta.url), 'utf8')
const filters = readFileSync(new URL('../components/pesquisa-filtros.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
const contract = readFileSync(new URL('../docs/HMI_MOBILE_FIRST.md', import.meta.url), 'utf8')
const dashboard = readFileSync(new URL('../components/dashboard/overview-dashboard.tsx', import.meta.url), 'utf8')
const tabs = readFileSync(new URL('../components/ui/tabs.tsx', import.meta.url), 'utf8')

test('global search covers the four public entity families and has search semantics', () => {
  for (const entity of ['profissionais', 'espacos', 'eventos', 'comunidades']) assert.match(search, new RegExp(entity))
  assert.match(search, /role="search"/)
  assert.match(search, /type="submit"/)
})

test('mobile discovery exposes accessible state and minimum primary control sizing', () => {
  assert.match(filters, /aria-live="polite"/)
  assert.match(filters, /aria-pressed=/)
  assert.match(filters, /min-h-11/)
  assert.match(search, /min-h-11/)
})

test('global interaction baseline preserves visible focus and reduced motion', () => {
  assert.match(css, /:focus-visible/)
  assert.match(css, /prefers-reduced-motion:\s*reduce/)
})

test('HMI contract records mobile-first, states, PT-PT and evidence requirements', () => {
  for (const term of ['Mobile first', 'loading', 'vazio', 'erro', 'sucesso', 'disabled', 'PT-PT', 'E2E desktop e mobile']) assert.ok(contract.includes(term), term)
})


test('dashboard pilot uses semantic feedback tokens and mobile-sized primary actions', () => {
  assert.doesNotMatch(dashboard, /bg-amber-|text-amber-/)
  assert.match(dashboard, /bg-warning\/10/)
  assert.match(dashboard, /min-h-11/)
  assert.match(dashboard, /focus-visible:ring-2/)
})


test('shared tabs remain usable on narrow viewports', () => {
  assert.match(tabs, /min-h-11/)
  assert.match(tabs, /overflow-x-auto/)
  assert.match(tabs, /min-h-10/)
  assert.match(tabs, /focus-visible:ring/)
})
