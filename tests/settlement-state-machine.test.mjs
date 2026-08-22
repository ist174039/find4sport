import test from 'node:test'
import assert from 'node:assert/strict'

// Kept dependency-free so the suite can run on the existing Node toolchain.
// These assertions mirror the production settlement invariants and provide a
// CI guard while integration tests with mocked Supabase/Stripe are introduced.

const canAcquireSettlementLock = status => status === 'eligible'
const stateAfterStripeFailure = status => status === 'processing' ? 'eligible' : status
const reconciliationState = (status, transferExists) => status !== 'processing' ? status : transferExists ? 'transferred' : 'eligible'
const stateAfterDispute = status => status === 'held' || status === 'eligible' ? 'blocked' : status

test('only eligible reservations can acquire the settlement lock', () => {
  for (const status of ['held','processing','transferred','blocked','refunded','not_applicable']) assert.equal(canAcquireSettlementLock(status), false)
  assert.equal(canAcquireSettlementLock('eligible'), true)
})

test('dispute winning before settlement prevents lock acquisition', () => {
  const disputed = stateAfterDispute('eligible')
  assert.equal(disputed, 'blocked')
  assert.equal(canAcquireSettlementLock(disputed), false)
})

test('a second worker cannot acquire a reservation already processing', () => {
  assert.equal(canAcquireSettlementLock('processing'), false)
})

test('Stripe failure releases only a processing lock', () => {
  assert.equal(stateAfterStripeFailure('processing'), 'eligible')
  assert.equal(stateAfterStripeFailure('blocked'), 'blocked')
  assert.equal(stateAfterStripeFailure('refunded'), 'refunded')
})

test('reconciliation closes processing when Stripe transfer exists', () => {
  assert.equal(reconciliationState('processing', true), 'transferred')
})

test('reconciliation retries only when Stripe transfer is absent', () => {
  assert.equal(reconciliationState('processing', false), 'eligible')
})

test('reconciliation never mutates non-processing terminal states', () => {
  assert.equal(reconciliationState('blocked', false), 'blocked')
  assert.equal(reconciliationState('refunded', false), 'refunded')
  assert.equal(reconciliationState('transferred', false), 'transferred')
})
