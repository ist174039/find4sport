import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateActivationMetrics } from '../lib/analytics/activation-metrics.ts'

const account = (id, registeredAt = '2026-01-01T00:00:00Z', extra = {}) => ({ id, registeredAt, segment: 'athlete', isTest: false, ...extra })
const action = (id, accountId, occurredAt, extra = {}) => ({ id, accountId, occurredAt, action: 'booking_confirmed', isTest: false, ...extra })
const run = (accounts, actions = [], extra = {}) => calculateActivationMetrics({ accounts, actions, cohortStart: '2026-01-01T00:00:00Z', cohortEnd: '2026-02-01T00:00:00Z', asOf: '2026-02-15T00:00:00Z', ...extra })

test('distinguishes registration from activation and repeat useful action', () => {
  const result = run([account('a'), account('b'), account('c')], [action('1', 'a', '2026-01-02T00:00:00Z'), action('2', 'a', '2026-01-08T00:00:00Z'), action('3', 'a', '2026-01-31T00:00:00Z'), action('4', 'b', '2026-01-04T00:00:00Z')])
  assert.equal(result.registered, 3)
  assert.deepEqual(result.activation, { eligible: 3, achieved: 2, rate: 2 / 3 })
  assert.deepEqual(result.retention7, { eligible: 2, achieved: 1, rate: 0.5 })
  assert.deepEqual(result.retention30, { eligible: 2, achieved: 1, rate: 0.5 })
})
test('excludes immature cohorts from rates and returns null for missing denominator', () => {
  const result = run([account('new', '2026-01-30T00:00:00Z')], [action('1', 'new', '2026-01-30T01:00:00Z')], { asOf: '2026-02-01T00:00:00Z' })
  assert.equal(result.registered, 1)
  assert.deepEqual(result.activation, { eligible: 0, achieved: 0, rate: null })
  assert.equal(result.retention30.rate, null)
})
test('excludes test accounts/actions, unknown accounts, pre-registration and future events', () => {
  const result = run([account('real'), account('test', undefined, { isTest: true })], [action('1', 'test', '2026-01-02T00:00:00Z'), action('2', 'real', '2026-01-02T00:00:00Z', { isTest: true }), action('3', 'missing', '2026-01-02T00:00:00Z'), action('4', 'real', '2025-12-31T00:00:00Z'), action('5', 'real', '2026-02-16T00:00:00Z')])
  assert.equal(result.registered, 1)
  assert.equal(result.activation.achieved, 0)
})
test('uses half-open cohort and activation boundaries and timezone-independent instants', () => {
  const result = run([account('a'), account('outside', '2026-02-01T00:00:00Z')], [action('1', 'a', '2026-01-08T00:00:00Z')])
  assert.equal(result.registered, 1)
  assert.equal(result.activation.achieved, 0)
  const equivalent = run([account('a', '2026-01-01T01:00:00+01:00')], [action('1', 'a', '2026-01-01T00:00:00Z')])
  assert.equal(equivalent.activation.achieved, 1)
})
test('retention requires complete observation window and does not count its exclusive end', () => {
  const actions = [action('1', 'a', '2026-01-01T00:00:00Z'), action('2', 'a', '2026-01-15T00:00:00Z')]
  assert.deepEqual(run([account('a')], actions).retention7, { eligible: 1, achieved: 0, rate: 0 })
  assert.equal(run([account('a')], actions, { cohortEnd: '2026-01-02T00:00:00Z', asOf: '2026-01-14T00:00:00Z' }).retention7.eligible, 0)
})
test('filters segments and counts each account only once despite multiple actions', () => {
  const result = run([account('a'), account('b', undefined, { segment: 'professional' })], [action('1', 'a', '2026-01-02T00:00:00Z'), action('2', 'a', '2026-01-03T00:00:00Z')], { segment: 'athlete' })
  assert.equal(result.registered, 1)
  assert.equal(result.activation.achieved, 1)
})
test('fails explicitly on duplicate exports, unclassified data and invalid windows', () => {
  assert.throws(() => run([account('a'), account('a')]), /unique/)
  assert.throws(() => run([account('a')], [action('same', 'a', '2026-01-02T00:00:00Z'), action('same', 'a', '2026-01-02T00:00:00Z')]), /unique/)
  assert.throws(() => run([account('a', undefined, { isTest: undefined })]), /classification/)
  assert.throws(() => run([], [], { cohortEnd: '2027-01-01T00:00:00Z' }), /Cohort/)
  assert.throws(() => run([account('a', '2026-01-01')]), /timezone/)
  assert.throws(() => run([account('a', '2026-02-30T00:00:00Z')]), /calendar/)
})

test('rejects normalized midnight and invalid clock fields rather than shifting cohorts', () => {
  for (const value of ['2026-01-01T24:00:00Z', '2026-01-01T00:60:00Z', '2026-01-01T00:00:60Z']) {
    assert.throws(() => run([account('a', value)]), /clock time/)
  }
})
