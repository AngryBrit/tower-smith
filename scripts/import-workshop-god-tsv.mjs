/**
 * Import workshop calculator TSV exports into tables/workshop/<category>/*.json.
 *
 * Usage:
 *   node scripts/import-workshop-god-tsv.mjs <category> <source-dir>
 *   node scripts/import-workshop-god-tsv.mjs attack "H:/The Tower/tables/workshop/attack"
 *   node scripts/import-workshop-god-tsv.mjs enhancements/utility "H:/The Tower/tables/workshop/enhancements/utility"
 *
 * Enhancement TSVs (coins only) and full upgrade TSVs (coins + cash) are both supported.
 * Then: node scripts/sync-workshop-god-tables.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parseWorkshopAmount, parseWorkshopValue } from './lib/parse-workshop-amount.mjs'
import { touchWikiDataStamp } from './lib/wiki-data-stamp.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function slugify(name) {
  const trimmed = name.trim()
  const plusSuffix = trimmed.endsWith('+') ? '-plus' : ''
  const core = trimmed.replace(/\+$/, '').trim()
  return (
    core
      .toLowerCase()
      .replace(/'/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + plusSuffix
  )
}

function parseTsv(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean)
  if (lines.length < 2) throw new Error('TSV needs header + at least one row')
  const headers = lines[0].split('\t').map((h) => h.trim())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t')
    /** @type {Record<string, string>} */
    const row = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (cols[j] ?? '').trim()
    }
    rows.push(row)
  }
  return { headers, rows }
}

/** @param {Record<string, string>} row @param {string} col @param {'coins' | 'cash'} kind */
function amountField(row, col, kind) {
  if (!(col in row)) return undefined
  return parseWorkshopAmount(row[col], kind)
}

function importTsvFile(tsvPath, category, outDir) {
  const baseName = path.basename(tsvPath, '.tsv')
  const { headers, rows } = parseTsv(fs.readFileSync(tsvPath, 'utf8'))
  const hasCash = headers.includes('Next Cash')
  const levels = rows.map((row) => {
    const level = Number(row.Level)
    if (!Number.isFinite(level)) throw new Error(`${baseName}: bad Level ${row.Level}`)
    const valueRow = parseWorkshopValue(row.Value)
    /** @type {Record<string, unknown>} */
    const levelDoc = {
      level,
      value: valueRow.value,
      nextCoins: parseWorkshopAmount(row['Next Coins'], 'coins'),
      additionalCoins: parseWorkshopAmount(row['Additional Coins'], 'coins'),
      totalCoins: parseWorkshopAmount(row['Total Coins'], 'coins'),
    }
    if (hasCash) {
      levelDoc.nextCash = amountField(row, 'Next Cash', 'cash')
      levelDoc.additionalCash = amountField(row, 'Additional Cash', 'cash')
      levelDoc.totalCash = amountField(row, 'Total Cash', 'cash')
      levelDoc.cashToTarget = amountField(row, 'Cash To Target', 'cash')
      levelDoc.cashToMax = amountField(row, 'Cash To Max', 'cash')
    }
    if (valueRow.valueDisplay) levelDoc.valueDisplay = valueRow.valueDisplay
    return levelDoc
  })

  const maxLevel = Math.max(...levels.map((r) => r.level))
  const doc = {
    name: baseName,
    category,
    maxLevel,
    levels,
  }

  const outPath = path.join(outDir, `${slugify(baseName)}.json`)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
  return { name: baseName, outPath, rows: levels.length, maxLevel }
}

function main() {
  const category = process.argv[2]
  const sourceDir = process.argv[3]
  if (!category || !sourceDir) {
    console.error('Usage: node scripts/import-workshop-god-tsv.mjs <category> <source-dir>')
    process.exit(1)
  }

  const absSource = path.resolve(sourceDir)
  if (!fs.existsSync(absSource)) {
    console.error(`Source not found: ${absSource}`)
    process.exit(1)
  }

  const outDir = path.join(root, 'tables', 'workshop', category)
  const tsvFiles = fs
    .readdirSync(absSource)
    .filter((f) => f.endsWith('.tsv'))
    .sort((a, b) => a.localeCompare(b))

  if (tsvFiles.length === 0) {
    console.error(`No .tsv files in ${absSource}`)
    process.exit(1)
  }

  const results = []
  for (const file of tsvFiles) {
    results.push(importTsvFile(path.join(absSource, file), category, outDir))
  }

  touchWikiDataStamp('import-workshop-god-tsv')
  console.log(`Imported ${results.length} workshop ${category} tables → ${outDir}`)
  for (const r of results) {
    console.log(`  ${r.name}: ${r.rows} rows (max Lv.${r.maxLevel})`)
  }
}

main()
