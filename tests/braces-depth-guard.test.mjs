import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const braces = require('braces')
const glob = require('fast-glob')

function isControlledRejection(error) {
  return error instanceof SyntaxError && /nesting exceeds|acyclic tree/.test(error.message)
}

test('normal brace expansion, ranges, escaping and quoted literals preserve the upstream contract', () => {
  assert.deepEqual(braces.expand('apps/{web,admin}'), ['apps/web', 'apps/admin'])
  assert.deepEqual(braces.expand('file-{01..03}.txt'), ['file-01.txt', 'file-02.txt', 'file-03.txt'])
  assert.deepEqual(braces.expand('{a,{b,c}}'), ['a', 'b', 'c'])
  assert.deepEqual(braces.expand('a/\\{b,c\\}'), ['a/{b,c}'])
  assert.deepEqual(braces.expand('"{literal,brace}"'), ['{literal,brace}'])
  assert.equal(braces.stringify(braces.parse('apps/{web,admin}')), 'apps/{web,admin}')
  assert.deepEqual(braces(['{a,b}', '{b,c}'], { expand: true, nodupes: true }), ['a', 'b', 'c'])
})

test('all string entrypoints reject deeply nested braces, parentheses and unclosed groups before stack exhaustion', () => {
  for (const pattern of [
    '{'.repeat(2000) + 'a,b' + '}'.repeat(2000),
    '('.repeat(2000) + 'a' + ')'.repeat(2000),
    '{'.repeat(2000),
    '({'.repeat(1000) + 'a,b' + '})'.repeat(1000),
  ]) {
    for (const entrypoint of [braces, braces.create, braces.parse, braces.stringify, braces.compile, braces.expand]) {
      assert.throws(() => entrypoint(pattern), isControlledRejection)
    }
  }
})

test('nesting boundary is bounded and cannot be raised by caller options', () => {
  assert.doesNotThrow(() => braces.compile('{'.repeat(127) + 'x' + '}'.repeat(127)))
  assert.throws(() => braces.parse('{'.repeat(128) + 'x' + '}'.repeat(128), { maxDepth: 1000000 }), isControlledRejection)
})

test('escaped and quoted braces do not count as nested AST groups', () => {
  assert.doesNotThrow(() => braces.parse('\\{'.repeat(1000)))
  assert.doesNotThrow(() => braces.parse('"' + '{'.repeat(1000) + '"'))
  assert.doesNotThrow(() => braces.parse('[' + '{'.repeat(1000) + ']'))
  assert.doesNotThrow(() => braces.compile('{'.repeat(32) + 'a,b' + '}'.repeat(32)))
})

test('public AST entrypoints reject deep or cyclic ASTs supplied by a caller', () => {
  const deep = { type: 'root', nodes: [] }
  let cursor = deep
  for (let index = 0; index < 1000; index++) {
    const child = { type: 'brace', nodes: [] }
    cursor.nodes.push(child)
    cursor = child
  }
  const cyclic = { type: 'root', nodes: [] }
  cyclic.nodes.push(cyclic)
  for (const entrypoint of [braces.stringify, braces.compile, braces.expand]) {
    assert.throws(() => entrypoint(deep), isControlledRejection)
    assert.throws(() => entrypoint(cyclic), isControlledRejection)
  }
})

test('the existing fast-glob contract still handles root directories, globs, absolute paths, arrays and ignores', () => {
  const root = mkdtempSync(join(tmpdir(), 'f4s-brace-contract-'))
  try {
    for (const dir of ['apps/web', 'apps/admin', 'apps/.hidden', 'packages/ui']) mkdirSync(join(root, dir), { recursive: true })
    writeFileSync(join(root, 'apps/file.txt'), 'fixture')
    const options = { onlyDirectories: true, cwd: root }
    assert.deepEqual(glob.globSync('apps/{web,admin}', options).sort(), ['apps/admin', 'apps/web'])
    assert.deepEqual(glob.globSync('apps/*', options).sort(), ['apps/admin', 'apps/web'])
    assert.deepEqual(glob.globSync('apps', options), ['apps'])
    assert.deepEqual(glob.globSync(join(root, 'apps/*'), options).sort(), [join(root, 'apps/admin'), join(root, 'apps/web')])
    assert.deepEqual(glob.globSync(['apps/*', 'packages/*'], { ...options, ignore: ['apps/admin'] }).sort(), ['apps/web', 'packages/ui'])
    assert.deepEqual(glob.globSync('apps/**', options).sort(), ['apps/admin', 'apps/web'])
    assert.throws(() => glob.globSync('apps/' + '{'.repeat(2000) + 'a,b' + '}'.repeat(2000), options), isControlledRejection)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
