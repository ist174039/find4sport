import test from 'node:test'
import assert from 'node:assert/strict'
import { getAccountStatus, isAccountUnavailable } from '../lib/auth/account-status.ts'

test('account lifecycle status is read only from server-managed app metadata', () => {
  assert.equal(getAccountStatus({ app_metadata: {}, user_metadata: { account_status: 'deactivated' } }), '')
  assert.equal(getAccountStatus({ app_metadata: { account_status: 'active' }, user_metadata: { account_status: 'blocked' } }), 'active')
})

test('missing or malformed app metadata status is treated as unset', () => {
  assert.equal(getAccountStatus({ app_metadata: null, user_metadata: { account_status: 'deletion_requested' } }), '')
  assert.equal(getAccountStatus({ app_metadata: { account_status: true } }), '')
})

test('deactivated and deletion-requested accounts are unavailable regardless of account role', () => {
  assert.equal(isAccountUnavailable({ app_metadata: { account_status: 'deactivated' } }), true)
  assert.equal(isAccountUnavailable({ app_metadata: { account_status: 'deletion_requested' } }), true)
  assert.equal(isAccountUnavailable({ app_metadata: { account_status: 'active' } }), false)
})
