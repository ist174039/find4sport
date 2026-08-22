import test from 'node:test'
import assert from 'node:assert/strict'

import {
  ADMIN_PERMISSIONS,
  adminHasPermission,
  parseAdminType,
} from '../lib/auth/admin-permissions.ts'

test('general admin retains all declared permissions', () => {
  for (const permission of ADMIN_PERMISSIONS.general) {
    assert.equal(adminHasPermission('general', permission), true)
  }
})

test('operational admin can perform day-to-day platform operations', () => {
  for (const permission of [
    'platform_users.manage',
    'professionals.manage',
    'spaces.manage',
    'events.manage',
    'communities.manage',
    'content.moderate',
    'reports.read',
  ]) {
    assert.equal(adminHasPermission('operacional', permission), true)
  }
})

test('operational admin cannot manage administrators or financial/platform configuration', () => {
  for (const permission of [
    'admin.manage',
    'finance.read',
    'finance.operate',
    'finance.configure',
    'platform.configure',
    'audit.read',
  ]) {
    assert.equal(adminHasPermission('operacional', permission), false)
  }
})

test('admin type parser fails closed for unknown or missing values', () => {
  assert.equal(parseAdminType('general'), 'general')
  assert.equal(parseAdminType('operacional'), 'operacional')
  assert.equal(parseAdminType('finance'), null)
  assert.equal(parseAdminType(''), null)
  assert.equal(parseAdminType(null), null)
  assert.equal(parseAdminType(undefined), null)
})
