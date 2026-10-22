import { readFile, readdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const dir = new URL('../supabase/migrations/', import.meta.url)
const baselineUrl = new URL('../supabase/migration-baseline.json', import.meta.url)
const files = (await readdir(dir)).filter((name) => name.endsWith('.sql')).sort()
const baseline = JSON.parse(await readFile(baselineUrl, 'utf8'))
const provenance = JSON.parse(await readFile(new URL('../supabase/migration-provenance.json', import.meta.url), 'utf8'))
const strictPattern = /^(\d{14})_([a-z0-9]+(?:_[a-z0-9]+)*)\.sql$/
const legacyPattern = /^\d{8}(?:_|\.)/

const versions = new Map()
const errors = []
const warnings = []

if (provenance.project !== baseline.project) errors.push('migration provenance project does not match baseline project')
if (!Array.isArray(provenance.history) || !Array.isArray(provenance.migrations)) {
  throw new Error('migration provenance must contain history and recorded SQL arrays')
}
const remoteHistory = new Map(provenance.history.map(entry => [entry.version, entry.name]))
console.log(`Read-only remote history snapshot: ${provenance.retrieved_at}; ${remoteHistory.size} records. This does not verify current production state.`)

for (const file of files) {
  const match = file.match(strictPattern)
  if (!match) {
    if (legacyPattern.test(file)) warnings.push(`legacy migration (reconcile, do not rename/replay blindly): ${file}`)
    else errors.push(`invalid migration filename: ${file}`)
    continue
  }

  const [, version, name] = match
  if (versions.has(version)) errors.push(`duplicate migration version ${version}: ${versions.get(version).file} and ${file}`)
  else versions.set(version, { file, name })
}

if (!/^\d{14}$/.test(String(baseline.cutoff_version || ''))) errors.push('migration baseline cutoff_version must be a 14 digit timestamp')
if (!Array.isArray(baseline.reconciled)) errors.push('migration baseline reconciled must be an array')
else {
  const baselineVersions = new Set()
  for (const entry of baseline.reconciled) {
    const version = String(entry?.version || '')
    const name = String(entry?.name || '')
    if (!/^\d{14}$/.test(version) || !name) {
      errors.push(`invalid baseline entry: ${JSON.stringify(entry)}`)
      continue
    }
    if (baselineVersions.has(version)) errors.push(`duplicate baseline version: ${version}`)
    baselineVersions.add(version)
    if (remoteHistory.get(version) !== name) errors.push(`baseline entry has no matching remote history in snapshot: ${version}_${name}`)
    const git = versions.get(version)
    if (!git) errors.push(`baseline migration missing from Git: ${version}_${name}.sql`)
    else if (git.name !== name) errors.push(`baseline name mismatch for ${version}: expected ${name}, found ${git.name}`)
    else if (entry.sha256) {
      const sql = await readFile(new URL(git.file, dir))
      const hash = createHash('sha256').update(sql).digest('hex')
      if (hash !== entry.sha256) errors.push(`reconciled migration checksum mismatch: ${git.file}`)
      const recorded = provenance.migrations.find(row => row.version === version && row.name === name)
      if (!recorded || sql.toString('utf8').trimEnd() !== recorded.statements.join('\n').trimEnd()) {
        errors.push(`reconciled migration differs from recorded SQL: ${git.file}`)
      }
    }
  }

  for (const [version, git] of versions) {
    if (version >= baseline.cutoff_version && !baselineVersions.has(version)) {
      errors.push(`strict migration ${git.file} is not registered in supabase/migration-baseline.json`)
    }
  }
  for (const [version, name] of remoteHistory) {
    if (version >= baseline.cutoff_version && !versions.has(version)) {
      errors.push(`remote migration SQL missing from Git: ${version}_${name}.sql`)
    }
  }
}

if (!Array.isArray(baseline.pending_forward_reconciliation)) {
  errors.push('migration baseline pending_forward_reconciliation must be an array; unresolved history must be explicit')
} else {
  for (const entry of baseline.pending_forward_reconciliation) {
    const path = String(entry?.path || '')
    const version = String(entry?.version || '')
    const name = String(entry?.name || '')
    if (!path || !/^[a-f0-9]{64}$/.test(String(entry?.sha256 || ''))) {
      errors.push(`invalid pending reconciliation entry: ${JSON.stringify(entry)}`)
      continue
    }
    if (version && remoteHistory.has(version)) errors.push(`pending reconciliation version is already present in remote history: ${version}`)
    errors.push(`forward reconciliation pending: ${path}${version && name ? ` (${version}_${name})` : ''}`)
  }
}

if (warnings.length) {
  console.warn(`Migration reconciliation warnings (${warnings.length}):`)
  for (const warning of warnings) console.warn(`- ${warning}`)
}

if (errors.length) {
  console.error(`Migration gate failed (${errors.length}):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`Migration gate passed: ${files.length} SQL files; ${versions.size} strict timestamped migrations; ${baseline.reconciled.length} reconciled production migrations; ${warnings.length} legacy files.`)
