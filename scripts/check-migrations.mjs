import { readFile, readdir } from 'node:fs/promises'

const dir = new URL('../supabase/migrations/', import.meta.url)
const baselineUrl = new URL('../supabase/migration-baseline.json', import.meta.url)
const files = (await readdir(dir)).filter((name) => name.endsWith('.sql')).sort()
const baseline = JSON.parse(await readFile(baselineUrl, 'utf8'))
const strictPattern = /^(\d{14})_([a-z0-9]+(?:_[a-z0-9]+)*)\.sql$/
const legacyPattern = /^\d{8}(?:_|\.)/

const versions = new Map()
const errors = []
const warnings = []

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
    const git = versions.get(version)
    if (!git) errors.push(`baseline migration missing from Git: ${version}_${name}.sql`)
    else if (git.name !== name) errors.push(`baseline name mismatch for ${version}: expected ${name}, found ${git.name}`)
  }

  for (const [version, git] of versions) {
    if (version >= baseline.cutoff_version && !baselineVersions.has(version)) {
      errors.push(`strict migration ${git.file} is not registered in supabase/migration-baseline.json`)
    }
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
