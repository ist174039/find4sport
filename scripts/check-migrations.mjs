import { readdir } from 'node:fs/promises'

const dir = new URL('../supabase/migrations/', import.meta.url)
const files = (await readdir(dir)).filter((name) => name.endsWith('.sql')).sort()
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

  const [, version] = match
  if (versions.has(version)) errors.push(`duplicate migration version ${version}: ${versions.get(version)} and ${file}`)
  else versions.set(version, file)
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

console.log(`Migration gate passed: ${files.length} SQL files; ${versions.size} strict timestamped migrations; ${warnings.length} legacy files.`)
