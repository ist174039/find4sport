import test from 'node:test'
import assert from 'node:assert/strict'
import { assertCanManageSpaces } from '../lib/auth/access-rules.ts'

test('space management access rule allows an authorized manager', () => {
  assert.doesNotThrow(() => assertCanManageSpaces({ canManageSpaces: true }))
})

test('space management access rule fails closed for denied access', () => {
  assert.throws(
    () => assertCanManageSpaces({ canManageSpaces: false }),
    /Sem permissões de gestor de espaço/,
  )
})
