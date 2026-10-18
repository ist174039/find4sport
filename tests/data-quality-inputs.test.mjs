import test from 'node:test'
import assert from 'node:assert/strict'
import { cleanText, optionalContact, parseEventDate } from '../lib/data-quality/inputs.ts'

test('text normalization removes control characters and canonicalizes Unicode', () => {
  assert.equal(cleanText('  Cafe\u0301\u0000  da\n  vila ', 40), 'Café da vila')
})

test('optional contacts normalize blanks and reject malformed values', () => {
  assert.equal(optionalContact('  ', 'email', 'Email'), null)
  assert.equal(optionalContact('person@example.pt', 'email', 'Email'), 'person@example.pt')
  assert.throws(() => optionalContact('person@invalid', 'email', 'Email'), /Email inválido/)
  assert.throws(() => optionalContact('abc', 'phone', 'Telefone'), /Telefone inválido/)
  assert.equal(optionalContact('example.pt', 'url', 'Website'), 'https://example.pt/')
  assert.throws(() => optionalContact('javascript:alert(1)', 'url', 'Website'), /Website inválido/)
})

test('event date parser accepts supported date values and rejects rollover or malformed time', () => {
  assert.equal(parseEventDate('2024-02-29', 'Data').toISOString(), '2024-02-29T00:00:00.000Z')
  assert.throws(() => parseEventDate('2025-02-29T18:30', 'Data'), /Data inválida/)
  assert.throws(() => parseEventDate('2025-06-01T25:10', 'Data'), /Data inválida/)
  assert.throws(() => parseEventDate('06/01/2025', 'Data'), /Data inválida/)
})
