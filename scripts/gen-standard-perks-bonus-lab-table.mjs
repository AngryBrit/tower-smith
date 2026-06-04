/**
 * Builds tables/labs/perks/standard-perks-bonus.json from screenshot + tower-labs
 * time/coins (verified L1,5,10,15,20,25). Gems from screenshot/OCR checkpoints.
 * Include % off; speedup 1.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import towerLabs from '../src/data/tower-labs.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(
  __dirname,
  '..',
  'tables',
  'labs',
  'perks',
  'standard-perks-bonus.json',
)

/** Marginal gems — screenshot totals L5=348, L10=1910, L15=6870, L20=18930, L25=42190 */
const MARGINAL_GEMS = [
  12, 39, 66, 97, 134, 178, 229, 294, 377, 484, 617, 781, 981, 1171, 1410, 1680,
  1990, 2360, 2770, 3260, 3720, 4130, 4610, 5110, 5690,
]

const lab = towerLabs['Standard Perks Bonus']

function formatSecondsToDisplay(totalSec) {
  let sec = Math.max(0, Math.floor(totalSec))
  const years = Math.floor(sec / (365 * 86400))
  sec -= years * 365 * 86400
  const days = Math.floor(sec / 86400)
  sec -= days * 86400
  const hours = Math.floor(sec / 3600)
  sec -= hours * 3600
  const mins = Math.floor(sec / 60)
  sec -= mins * 60
  const parts = []
  if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`)
  if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`)
  if (hours > 0) parts.push(`${hours}h`)
  if (mins > 0 || (parts.length === 0 && sec === 0)) parts.push(`${mins}m`)
  parts.push(`${sec}s`)
  return parts.join(', ')
}

function formatCoinsDisplay(n) {
  const v = Math.round(n)
  if (v >= 1_000_000_000_000)
    return `${(v / 1_000_000_000_000).toFixed(2)}T`
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(2)}K`
  return String(v)
}

function formatGemsDisplay(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
  return String(n)
}

const levels = []
let totalTimeSec = 0
let totalGems = 0
let totalCoins = 0

for (let level = 1; level <= 25; level++) {
  const row = lab[String(level)]
  if (!row) throw new Error(`Missing tower-labs row ${level}`)
  const timeSec = row.DURATION
  const coins = row.COST
  const gems = MARGINAL_GEMS[level - 1]
  totalTimeSec += timeSec
  totalGems += gems
  totalCoins += coins
  levels.push({
    level,
    value: level,
    time: { display: formatSecondsToDisplay(timeSec), seconds: timeSec },
    gems,
    coins,
    totalTime: {
      display: formatSecondsToDisplay(totalTimeSec),
      seconds: totalTimeSec,
    },
    totalGems: totalGems,
    totalCoins: totalCoins,
  })
}

// Sanity: screenshot checkpoints
const checks = [
  [1, 5940, 100_000, 12],
  [5, 70920, 31_420_000, 348],
  [10, 285_060, 1_770_000_000, 1910],
  [15, 920_640, 16_140_000_000, 6870],
  [20, 2_364_780, 74_290_000_000, 18_930],
  [25, 5_082_600, 238_880_000_000, 42_190],
]
for (const [lv, t, c, tg] of checks) {
  const L = levels[lv - 1]
  if (L.time.seconds !== t || L.coins !== c || L.totalGems !== tg) {
    throw new Error(
      `Checkpoint L${lv} mismatch: got ${L.time.seconds}/${L.coins}/${L.totalGems}`,
    )
  }
}

const doc = {
  name: 'Standard Perks Bonus',
  maxLevel: 25,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels)`)
