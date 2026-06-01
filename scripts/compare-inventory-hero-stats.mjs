/**
 * Compare hero stat implementation vs Modules sheet Inventory tab.
 * Usage: node scripts/compare-inventory-hero-stats.mjs
 */
import fs from 'fs'
import os from 'os'
import path from 'path'
import { pathToFileURL } from 'url'

const SHEET_ID = '14lyOMBbO8WZd4q-lFvpeYHhJi1g-oJOA6jCEF6aQHkQ'
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Inventory`

const RARITY_MAP = {
  Common: 'common',
  Rare: 'rare',
  'Rare+': 'rare_plus',
  Epic: 'epic',
  'Epic+': 'epic_plus',
  Legendary: 'legendary',
  'Legendary+': 'legendary_plus',
  Mythic: 'mythic',
  'Mythic+': 'mythic_plus',
  Ancestral: 'ancestral',
  'Ancestral 1*': 'star_1',
  'Ancestral 2*': 'star_2',
  'Ancestral 3*': 'star_3',
  'Ancestral 4*': 'star_4',
  'Ancestral 5*': 'star_5',
  None: null,
}

function parseCsvLine(line) {
  const cells = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i]
    if (c === '"') {
      inQ = !inQ
      continue
    }
    if (c === ',' && !inQ) {
      cells.push(cur)
      cur = ''
      continue
    }
    cur += c
  }
  cells.push(cur)
  return cells
}

function parseStat(s) {
  if (!s || !/^x[\d.]+$/i.test(s.trim())) return null
  return Number(s.trim().slice(1))
}

function extractInventoryStats(csv) {
  const lines = csv.split(/\r?\n/)
  const results = []
  let slot = null

  for (const line of lines) {
    if (!line.trim()) continue
    const cells = parseCsvLine(line)
    const c0 = (cells[0] || '').replace(/[^\x20-\x7E]/g, '').trim()
    const c1 = (cells[1] || '').trim()

    if (c0.includes('CANNON') || c1 === 'Tower Damage') slot = 'cannon'
    else if (c0.includes('ARMOR') || c1 === 'Tower Health') slot = 'armor'
    else if (c0.includes('GENERATOR') || c1 === 'Coin Bonus') slot = 'generator'
    else if (c0.includes('CORE') || c1 === 'UW Damage') slot = 'core'

    // Scan triplets: Rarity, Level, Stat across row
    for (let i = 0; i < cells.length - 2; i += 1) {
      const rarity = cells[i]?.trim()
      const levelRaw = cells[i + 1]?.trim()
      const statRaw = cells[i + 2]?.trim()
      const merge = RARITY_MAP[rarity]
      const stat = parseStat(statRaw)
      const level = levelRaw === '' ? NaN : Number(levelRaw)
      if (!slot || !merge || !Number.isFinite(level) || stat == null) continue
      if (level === 0 && stat === 1) continue // None placeholder
      results.push({ slot, merge, level, stat: statRaw, statNum: stat })
    }
  }

  // dedupe
  const key = (r) => `${r.slot}|${r.merge}|${r.level}`
  const seen = new Set()
  return results.filter((r) => {
    const k = key(r)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

const repoRoot = path.resolve(import.meta.dirname, '..')
const anchorsUrl = pathToFileURL(
  path.join(repoRoot, 'src/data/workshopChassisModuleHeroStatAnchors.ts'),
).href

const {
  formatWorkshopChassisModuleHeroStatMilli,
  workshopChassisModuleHeroStatCommonMilli,
  workshopChassisModuleHeroStatMilli,
} = await import(anchorsUrl)

let csv
const localPath = path.join(os.tmpdir(), 'inventory.csv')
try {
  csv = fs.readFileSync(localPath, 'utf8')
} catch {
  const res = await fetch(CSV_URL)
  csv = await res.text()
  fs.writeFileSync(localPath, csv)
}

const inventory = extractInventoryStats(csv)
console.log(`Inventory checkpoints: ${inventory.length}\n`)

const mismatches = []
const matches = []

for (const row of inventory) {
  const { slot, merge, level, stat } = row
  let milli
  if (merge === 'common') {
    milli = workshopChassisModuleHeroStatCommonMilli(slot, level)
  } else {
    milli = workshopChassisModuleHeroStatMilli(slot, merge, level)
  }
  const got = `x${formatWorkshopChassisModuleHeroStatMilli(milli)}`
  const expected = stat.startsWith('x') ? stat : `x${stat}`
  if (got !== expected) {
    mismatches.push({ ...row, got, expected })
  } else {
    matches.push({ ...row, got })
  }
}

console.log(`MATCH: ${matches.length}`)
for (const m of matches) {
  console.log(`  OK  ${m.slot.padEnd(10)} ${m.merge.padEnd(14)} L${String(m.level).padStart(3)} ${m.got}`)
}

console.log(`\nMISMATCH: ${mismatches.length}`)
for (const m of mismatches) {
  console.log(
    `  FAIL ${m.slot.padEnd(10)} ${m.merge.padEnd(14)} L${String(m.level).padStart(3)} sheet=${m.expected} impl=${m.got}`,
  )
}

if (mismatches.length > 0) process.exit(1)
