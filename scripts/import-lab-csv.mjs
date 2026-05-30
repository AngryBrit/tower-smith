/**
 * Imports Lab Calculator CSV (exported from Community Laboratory spreadsheet)
 * into public/research/sections/*.json using manifest order.
 *
 * Usage: node scripts/import-lab-csv.mjs [path-to.csv]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { touchWikiDataStamp } from './lib/wiki-data-stamp.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function parseCsvLine(line) {
  const result = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuotes = !inQuotes
    } else if (c === ',' && !inQuotes) {
      result.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  result.push(cur)
  return result
}

function normalizeDuration(s) {
  if (!s) return ''
  return s.replace(/\u00a0|\u2009|\u202f/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseCoinTotal(s) {
  if (s == null || s === '') return NaN
  const t = String(s).trim().replace(/,/g, '')
  if (t === '' || /max\s*level/i.test(t)) return NaN
  const n = Number(t)
  return Number.isFinite(n) ? n : NaN
}

function rowToItem(fields) {
  const name = (fields[0] ?? '').trim()
  const levelStr = (fields[2] ?? '0').trim()
  const maxStr = (fields[3] ?? '0').trim()
  const unlocked = (fields[4] ?? '').trim()
  /** Lab sheet “Cph” at current level — only as benefit when Unlocked is blank (not Game Speed; that uses multiplier in UI). */
  const cphCurrent = (fields[10] ?? '').trim()
  const duration = normalizeDuration(fields[6] ?? '')
  /**
   * Coin strings come from evaluated Lab Calculator formulas (not literals), e.g. along the lines of:
   * IF(OR(Level+1>=MaxLevel, Level="Max"), "Max Level",
   *    FORMAT_NUMBER(LABCOST_SINGLE_ADJUSTED(labKey, Level+1)))
   * where labKey uses "Card Mastery" when the lab name contains "Mastery". CSV export stores the
   * computed display values — we persist them as cost / costPlusOne for the snapshot Level column.
   */
  const costRaw = (fields[9] ?? '').trim()
  const costPlusOneRaw = (fields[13] ?? '').trim()

  const levelNum = parseInt(levelStr, 10)
  const maxNum = parseInt(maxStr, 10)
  const maxed =
    Number.isFinite(levelNum) &&
    Number.isFinite(maxNum) &&
    maxNum > 0 &&
    levelNum >= maxNum

  const level = maxed ? 'Lv. Max' : `Lv.${levelStr}`
  const cost = maxed ? 'Max' : costRaw || '—'
  const state = maxed ? 'max' : 'default'
  const benefit =
    name === 'Game Speed'
      ? unlocked || '—'
      : unlocked || cphCurrent || '—'

  const coinsToMax = parseCoinTotal(fields[18])
  const item = {
    name,
    level,
    benefit,
    time: duration || '—',
    cost,
    state,
    currentLevel: Number.isFinite(levelNum) ? levelNum : 0,
    maxLevel: Number.isFinite(maxNum) ? maxNum : 0,
  }
  if (Number.isFinite(coinsToMax) && coinsToMax >= 0) {
    item.coinsToMaxRaw = coinsToMax
  }
  if (!maxed && costPlusOneRaw && !/max\s*level/i.test(costPlusOneRaw)) {
    item.costPlusOne = costPlusOneRaw
  }
  return item
}

const defaultCsv = path.join(
  process.env.USERPROFILE || process.env.HOME || '',
  'Downloads',
  'Copy of Laboratory v3.0 - Lab Calculator.csv',
)

const csvPath = process.argv[2] || defaultCsv

if (!fs.existsSync(csvPath)) {
  console.error('CSV not found:', csvPath)
  process.exit(1)
}

const manifestPath = path.join(root, 'public', 'research', 'manifest.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

const content = fs.readFileSync(csvPath, 'utf8')
const lines = content.split(/\r?\n/).filter((l) => l.length > 0)
const allRows = lines.map(parseCsvLine)
const dataRows = allRows.slice(2).filter((r) => r[0] && String(r[0]).trim())

let cursor = 0

for (const rel of manifest.sectionFiles) {
  const sectionPath = path.join(root, 'public', rel)
  const section = JSON.parse(fs.readFileSync(sectionPath, 'utf8'))
  const n = section.items.length
  const slice = dataRows.slice(cursor, cursor + n)

  if (slice.length !== n) {
    console.error(
      `${rel}: need ${n} data rows, found ${slice.length} (cursor ${cursor})`,
    )
    process.exit(1)
  }

  const items = slice.map((fields, i) => {
    const expected = section.items[i]?.name
    const csvName = String(fields[0] ?? '').trim()
    if (expected && csvName && expected !== csvName) {
      console.warn(`  ${rel}[${i}]: expected "${expected}", CSV has "${csvName}"`)
    }
    return rowToItem(fields)
  })

  fs.writeFileSync(
    sectionPath,
    JSON.stringify({ title: section.title, items }, null, 2) + '\n',
    'utf8',
  )
  console.log(`OK ${rel} (${n})`)
  cursor += n
}

if (cursor !== dataRows.length) {
  console.warn(
    `Note: CSV has ${dataRows.length} lab rows, consumed ${cursor} (trailing rows ignored if fewer).`,
  )
}

console.log('Done.')
touchWikiDataStamp('import-lab-csv')
