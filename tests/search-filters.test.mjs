import test from 'node:test'
import assert from 'node:assert/strict'
import { parseSearchFilters } from '../lib/search/filters.ts'

test('search date filters accept valid calendar dates, including leap days', () => {
  const filters = parseSearchFilters({ dateFrom: '2024-02-29', dateTo: '2024-03-01' })

  assert.equal(filters.dateFrom, '2024-02-29')
  assert.equal(filters.dateTo, '2024-03-01')
})

test('search date filters reject impossible dates', () => {
  const filters = parseSearchFilters({ dateFrom: '2025-02-29', dateTo: '2025-13-01' })

  assert.equal(filters.dateFrom, '')
  assert.equal(filters.dateTo, '')
})

test('search date filters discard an end date earlier than the start date', () => {
  const filters = parseSearchFilters({ dateFrom: '2025-06-10', dateTo: '2025-06-09' })

  assert.equal(filters.dateFrom, '2025-06-10')
  assert.equal(filters.dateTo, '')
})

test('search numeric filters reject blanks, coercion strings, and out-of-range values', () => {
  const filters = parseSearchFilters({ rating: '', radius: '  ', type: 'events' })
  assert.equal(filters.rating, null)
  assert.equal(filters.radius, null)
  assert.equal(filters.type, 'eventos')
  assert.equal(parseSearchFilters({ rating: '5.5', radius: '251' }).rating, null)
  assert.equal(parseSearchFilters({ rating: '4.5', radius: '12' }).rating, 4.5)
})
