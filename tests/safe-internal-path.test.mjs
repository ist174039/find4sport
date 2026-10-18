import test from 'node:test'
import assert from 'node:assert/strict'
import { safeInternalPath } from '../lib/http/safe-internal-path.ts'

test('accepts same-origin paths and keeps their query and fragment', () => {
  assert.equal(safeInternalPath('/dashboard?tab=events#upcoming', '/fallback'), '/dashboard?tab=events#upcoming')
})

test('rejects absolute, protocol-relative, and backslash-based redirects', () => {
  for (const value of ['https://evil.example', '//evil.example', '/\\evil.example', '/%5c%5cevil.example']) {
    assert.equal(safeInternalPath(value, '/fallback'), '/fallback')
  }
})

test('rejects control characters and non-path values', () => {
  for (const value of ['dashboard', '/\nhttps://evil.example', '']) {
    assert.equal(safeInternalPath(value, '/fallback'), '/fallback')
  }
})
