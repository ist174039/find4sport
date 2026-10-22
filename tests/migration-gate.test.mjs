import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, copyFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'

const version = '20260819211506'
const name = 'example'
const sql = 'select 1;\n'

async function runGate(change) {
  const root = await mkdtemp(join(tmpdir(), 'f4s-migration-gate-'))
  try {
    await mkdir(join(root, 'scripts'))
    await mkdir(join(root, 'supabase', 'migrations'), { recursive: true })
    await mkdir(join(root, 'supabase', 'reconciliation-proposals'), { recursive: true })
    await copyFile(new URL('../scripts/check-migrations.mjs', import.meta.url), join(root, 'scripts', 'check-migrations.mjs'))
    const fixture = {
      sql,
      baseline: { project: 'fixture', cutoff_version: version, reconciled: [{ version, name, sha256: createHash('sha256').update(sql).digest('hex') }], pending_forward_reconciliation: [] },
      provenance: { project: 'fixture', retrieved_at: '2026-10-21', history: [{ version, name }], migrations: [{ version, name, statements: [sql.trimEnd()] }] },
    }
    change?.(fixture)
    await writeFile(join(root, 'supabase', 'migrations', `${version}_${name}.sql`), fixture.sql)
    await writeFile(join(root, 'supabase', 'migration-baseline.json'), JSON.stringify(fixture.baseline))
    await writeFile(join(root, 'supabase', 'migration-provenance.json'), JSON.stringify(fixture.provenance))
    if (fixture.proposalPath) {
      await writeFile(join(root, fixture.proposalPath), fixture.proposalSql)
    }
    const result = spawnSync(process.execPath, [join(root, 'scripts', 'check-migrations.mjs')], { encoding: 'utf8' })
    return { status: result.status, output: result.stdout + result.stderr }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test('migration gate accepts matching history, SQL and checksum', async () => {
  const result = await runGate()
  assert.equal(result.status, 0, result.output)
})

test('migration gate rejects an incorrect project snapshot', async () => {
  const result = await runGate(f => { f.provenance.project = 'other-project' })
  assert.equal(result.status, 1)
  assert.match(result.output, /project does not match/)
})

test('migration gate rejects a baseline entry absent from remote history', async () => {
  const result = await runGate(f => { f.provenance.history = [] })
  assert.equal(result.status, 1)
  assert.match(result.output, /no matching remote history/)
})

test('migration gate rejects recorded remote migrations missing from Git', async () => {
  const result = await runGate(f => { f.provenance.history.push({ version: '20260819211507', name: 'missing' }) })
  assert.equal(result.status, 1)
  assert.match(result.output, /remote migration SQL missing from Git/)
})

test('migration gate detects SQL changed after checksum reconciliation', async () => {
  const result = await runGate(f => { f.sql = 'select 2;\n' })
  assert.equal(result.status, 1)
  assert.match(result.output, /checksum mismatch/)
})

test('migration gate rejects a matching checksum when recorded SQL differs', async () => {
  const result = await runGate(f => { f.provenance.migrations[0].statements = ['select 2;'] })
  assert.equal(result.status, 1)
  assert.match(result.output, /differs from recorded SQL/)
})

test('migration gate remains blocked while history reconciliation is pending', async () => {
  const result = await runGate(f => {
    f.baseline.pending_forward_reconciliation = [{
      path: 'supabase/reconciliation-proposals/untracked.sql',
      sha256: createHash('sha256').update('select 2;\n').digest('hex'),
      status: 'live_state_observed_without_history',
      remote_version: null,
      remote_name: null,
    }]
    f.proposalPath = 'supabase/reconciliation-proposals/untracked.sql'
    f.proposalSql = 'select 2;\n'
  })
  assert.equal(result.status, 1)
  assert.match(result.output, /forward reconciliation pending/)
})

test('migration gate detects edits to archived reconciliation proposals', async () => {
  const result = await runGate(f => {
    f.baseline.pending_forward_reconciliation = [{
      path: 'supabase/reconciliation-proposals/untracked.sql',
      sha256: createHash('sha256').update('select 2;\n').digest('hex'),
      status: 'live_state_observed_without_history',
      remote_version: null,
      remote_name: null,
    }]
    f.proposalPath = 'supabase/reconciliation-proposals/untracked.sql'
    f.proposalSql = 'select 3;\n'
  })
  assert.equal(result.status, 1)
  assert.match(result.output, /pending reconciliation checksum mismatch/)
})
