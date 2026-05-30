#!/usr/bin/env node
/**
 * Ensures dictionary.es.ts and dictionary.de.ts define the same StringId keys as dictionary.ts.
 * Usage: node scripts/check-i18n-keys.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function extractKeys(filePath, exportName) {
  const text = fs.readFileSync(filePath, 'utf8')
  const patterns = [
    new RegExp(
      `export const ${exportName} = \\{([\\s\\S]*?)\\} satisfies Record<StringId, string>`,
    ),
    new RegExp(`export const ${exportName} = \\{([\\s\\S]*?)\\} as const`),
  ]
  let match = null
  for (const re of patterns) {
    match = text.match(re)
    if (match) break
  }
  if (!match) {
    throw new Error(`Could not parse ${filePath} (${exportName})`)
  }
  const keys = new Set()
  for (const m of match[1].matchAll(/^\s+([a-zA-Z0-9_]+):/gm)) {
    keys.add(m[1])
  }
  return keys
}

function diff(missing, extra) {
  return [...missing].sort().filter((k) => !extra.has(k))
}

const enPath = path.join(root, 'src/i18n/dictionary.ts')
const esPath = path.join(root, 'src/i18n/dictionary.es.ts')
const dePath = path.join(root, 'src/i18n/dictionary.de.ts')

const en = extractKeys(enPath, 'STRINGS_EN')
const es = extractKeys(esPath, 'STRINGS_ES')
const de = extractKeys(dePath, 'STRINGS_DE')

let failed = false

for (const [label, locale] of [
  ['es', es],
  ['de', de],
]) {
  const missing = diff(en, locale)
  const extra = diff(locale, en)
  if (missing.length > 0) {
    failed = true
    console.error(`dictionary.${label}.ts missing ${missing.length} keys (vs EN):`)
    for (const k of missing.slice(0, 20)) console.error(`  - ${k}`)
    if (missing.length > 20) console.error(`  … and ${missing.length - 20} more`)
  }
  if (extra.length > 0) {
    failed = true
    console.error(`dictionary.${label}.ts has ${extra.length} unknown keys (not in EN):`)
    for (const k of extra.slice(0, 20)) console.error(`  - ${k}`)
    if (extra.length > 20) console.error(`  … and ${extra.length - 20} more`)
  }
}

if (failed) {
  process.exit(1)
}

console.log(`i18n keys OK: ${en.size} EN keys matched in ES and DE`)
