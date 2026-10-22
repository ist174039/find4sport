import test from 'node:test'
import assert from 'node:assert/strict'
import { isPublicAccountEligible } from '../lib/auth/public-account-eligibility.ts'

const now = Date.parse('2026-10-22T12:00:00.000Z')

test('active owners are eligible regardless of stale suspension timestamp', () => {
  assert.equal(isPublicAccountEligible('active', null, now), true)
  assert.equal(isPublicAccountEligible('active', '2026-10-23T12:00:00.000Z', now), true)
})

test('blocked owners and suspensions without a valid expiry remain ineligible', () => {
  assert.equal(isPublicAccountEligible('blocked', null, now), false)
  assert.equal(isPublicAccountEligible('suspended', null, now), false)
  assert.equal(isPublicAccountEligible('suspended', 'invalid', now), false)
})

test('suspended owners become eligible only when their suspension has expired', () => {
  assert.equal(isPublicAccountEligible('suspended', '2026-10-22T12:00:01.000Z', now), false)
  assert.equal(isPublicAccountEligible('suspended', '2026-10-22T12:00:00.000Z', now), true)
  assert.equal(isPublicAccountEligible('suspended', '2026-10-21T12:00:00.000Z', now), true)
})
