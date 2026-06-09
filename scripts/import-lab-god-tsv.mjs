/**
 * Import lab calculator TSV exports into tables/labs/<category>/*.json.
 *
 * Usage:
 *   node scripts/import-lab-god-tsv.mjs [source-dir]
 *   node scripts/import-lab-god-tsv.mjs "H:/The Tower/tables/labs"
 *
 * Then: node scripts/sync-lab-god-tables.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parseLabCoinAmount } from './lib/parse-lab-god-amount.mjs'
import { labTimeField, normalizeLabDisplayText } from './lib/parse-lab-god-duration.mjs'
import { touchWikiDataStamp } from './lib/wiki-data-stamp.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

/** Scrape filename → research card display name (when they differ). */
const TSV_BASENAME_TO_DISPLAY_NAME = {
  'Damage - Meter': 'Damage / Meter',
  'Area Of Effect Mastery': 'Area of Effect Mastery',
  'Lab Speed': 'Labs Speed',
  'Module Shard Cost': 'Module Shards Cost',
  'Black Hole disable Ranged Enemies': 'Black Hole Disable Ranged Enemies',
  'Blackhole Coin Bonus': 'Black Hole Coin Bonus',
  'Cash - Wave': 'Cash / Wave',
  'Coins - Kill Bonus': 'Coins / Kill Bonus',
  'Coins - Wave': 'Coins / Wave',
}

function slugify(name) {
  const trimmed = name.trim()
  const plusSuffix = trimmed.endsWith('+') ? '-plus' : ''
  const core = trimmed
    .replace(/\+$/, '')
    .trim()
    .replace(/'s\b/gi, '')
  return (
    core
      .toLowerCase()
      .replace(/'/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + plusSuffix
  )
}

/** @returns {Map<string, string>} display name → `category/file.json` */
function loadCanonicalPathsFromLabGodTables() {
  /** @type {Map<string, string>} */
  const nameToRel = new Map()
  const labsRoot = path.join(root, 'tables/labs')
  function walk(dir, relPrefix = '') {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = relPrefix ? `${relPrefix}/${ent.name}` : ent.name
      const abs = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        walk(abs, rel)
        continue
      }
      if (!ent.name.endsWith('.json') || ent.name === 'lab-order.json') continue
      const doc = JSON.parse(fs.readFileSync(abs, 'utf8'))
      if (doc.name) nameToRel.set(doc.name, rel.replace(/\\/g, '/'))
    }
  }
  if (fs.existsSync(labsRoot)) walk(labsRoot)
  return nameToRel
}

function wipeLabGodJson() {
  const labsRoot = path.join(root, 'tables/labs')
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name)
      if (ent.isDirectory()) walk(p)
      else if (ent.name.endsWith('.json') && ent.name !== 'lab-order.json') {
        fs.unlinkSync(p)
      }
    }
  }
  walk(labsRoot)
}

function displayNameFromTsvBasename(baseName) {
  return TSV_BASENAME_TO_DISPLAY_NAME[baseName] ?? baseName
}

function parseTsv(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean)
  if (lines.length < 2) throw new Error('TSV needs header + at least one row')
  const headers = lines[0].split('\t').map((h) => normalizeLabDisplayText(h))
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t')
    /** @type {Record<string, string>} */
    const row = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = normalizeLabDisplayText(cols[j] ?? '')
    }
    rows.push(row)
  }
  return { headers, rows }
}

function parseLabAmount(raw, label) {
  try {
    return parseLabCoinAmount(raw)
  } catch {
    throw new Error(`bad ${label}: ${raw}`)
  }
}

function parseLabValue(raw, level) {
  const display = normalizeLabDisplayText(raw)
  try {
    const valueRow = parseWorkshopValue(display)
    if (valueRow.maxed || valueRow.value == null || !Number.isFinite(valueRow.value)) {
      throw new Error('not numeric')
    }
    return valueRow.value
  } catch {
    return level
  }
}

function importTsvFile(tsvPath, category, outDir, canonicalPaths) {
  const baseName = path.basename(tsvPath, '.tsv')
  const displayName = displayNameFromTsvBasename(baseName)
  const tsvText = fs.readFileSync(tsvPath, 'utf8')
  const { rows } = parseTsv(tsvText)

  const levels = rows.map((row) => {
    const level = Number(row.Level)
    if (!Number.isFinite(level)) throw new Error(`${baseName}: bad Level ${row.Level}`)
    return {
      level,
      value: parseLabValue(row.Value, level),
      time: labTimeField(row.Time),
      gems: parseLabAmount(row.Gems, 'Gems'),
      coins: parseLabAmount(row.Coins, 'Coins'),
      totalTime: labTimeField(row['Total Time']),
      totalGems: parseLabAmount(row['Total Gems'], 'Total Gems'),
      totalCoins: parseLabAmount(row['Total Coins'], 'Total Coins'),
    }
  })

  const maxLevel = Math.max(...levels.map((r) => r.level))
  const doc = {
    name: displayName,
    maxLevel,
    levels,
  }

  const rel =
    canonicalPaths.get(displayName) ??
    path.join(category, `${slugify(displayName)}.json`).replace(/\\/g, '/')
  const outPath = path.join(root, 'tables/labs', rel)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
  return { name: displayName, outPath, rows: levels.length, maxLevel, category }
}

function collectTsvFiles(sourceRoot) {
  const files = []
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name)
      if (ent.isDirectory()) walk(p)
      else if (ent.name.endsWith('.tsv')) {
        const rel = path.relative(sourceRoot, path.dirname(p)).replace(/\\/g, '/')
        files.push({ path: p, category: rel || '.' })
      }
    }
  }
  walk(sourceRoot)
  return files.sort((a, b) => a.path.localeCompare(b.path))
}

function main() {
  const sourceDir = process.argv[2] ?? 'H:/The Tower/tables/labs'
  const absSource = path.resolve(sourceDir)
  if (!fs.existsSync(absSource)) {
    console.error(`Source not found: ${absSource}`)
    process.exit(1)
  }

  const tsvFiles = collectTsvFiles(absSource)
  if (tsvFiles.length === 0) {
    console.error(`No .tsv files under ${absSource}`)
    process.exit(1)
  }

  const canonicalPaths = loadCanonicalPathsFromLabGodTables()
  wipeLabGodJson()

  const results = []
  for (const file of tsvFiles) {
    const outDir = path.join(root, 'tables', 'labs', file.category)
    results.push(importTsvFile(file.path, file.category, outDir, canonicalPaths))
  }

  touchWikiDataStamp('import-lab-god-tsv')
  console.log(`Imported ${results.length} lab tables → ${path.join(root, 'tables/labs')}`)
  for (const r of results) {
    console.log(`  ${r.name}: ${r.rows} rows (max Lv.${r.maxLevel}) [${r.category}]`)
  }
}

main()
