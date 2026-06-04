/**
 * Builds tables/labs/attack/max-rend-armor-multiplier.json from lab calculator screenshots only.
 * Source: Max Rend Armor Multiplier screenshot (L1–30).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const towerLabsPath = path.join(__dirname, '..', 'src', 'data', 'tower-labs.json')
const outPath = path.join(
  __dirname,
  '..',
  'tables',
  'labs',
  'attack',
  'max-rend-armor-multiplier.json',
)

/** Marginal gems at screenshot anchor levels */
const MARG_GEM_ANCHOR = {
  1: 508,
  2: 589,
  5: 834,
  10: 1200,
  15: 1540,
  20: 1890,
  25: 2250,
  30: 2620,
}

/** [totalTime, totalGems, totalCoins] — calculator totals column from screenshot */
const TOTAL_DISPLAY = {
  1: ['3 days, 11h, 19m, 0s', '508', '200.00B'],
  2: ['7 days, 12h, 33m, 0s', '1.10K', '440.00B'],
  5: ['23 days, 4h, 15m, 0s', '3.35K', '1.40T'],
  10: ['61 days, 2h, 23m, 0s', '8.66K', '3.81T'],
  15: ['114 days, 3h, 47m, 0s', '15.67K', '7.24T'],
  20: ['182 days, 18h, 56m, 0s', '24.40K', '11.76T'],
  25: ['267 days, 11h, 8m, 0s', '34.91K', '17.47T'],
  30: ['1 year, 3 days, 16h, 16m, 0s', '47.25K', '24.57T'],
}

function marginalGem(level) {
  const keys = Object.keys(MARG_GEM_ANCHOR)
    .map(Number)
    .sort((a, b) => a - b)
  if (MARG_GEM_ANCHOR[level] != null) return MARG_GEM_ANCHOR[level]
  let lo = keys[0]
  let hi = keys[keys.length - 1]
  for (let i = 0; i < keys.length - 1; i++) {
    if (level > keys[i] && level < keys[i + 1]) {
      lo = keys[i]
      hi = keys[i + 1]
      break
    }
  }
  const t = (level - lo) / (hi - lo)
  return Math.round(MARG_GEM_ANCHOR[lo] + t * (MARG_GEM_ANCHOR[hi] - MARG_GEM_ANCHOR[lo]))
}

function parseAbbrevNum(raw) {
  const s = String(raw).trim().replace(/,/g, '')
  if (/T$/i.test(s)) return Math.round(parseFloat(s) * 1_000_000_000_000)
  if (/B$/i.test(s)) return Math.round(parseFloat(s) * 1_000_000_000)
  if (/M$/i.test(s)) return Math.round(parseFloat(s) * 1_000_000)
  if (/K$/i.test(s)) return Math.round(parseFloat(s) * 1_000)
  const n = Number(s)
  return Number.isFinite(n) ? Math.round(n) : 0
}

function parseTimeToSeconds(display) {
  let sec = 0
  const year = display.match(/(\d+)\s*years?/i)
  const day = display.match(/(\d+)\s*days?/i)
  const hour = display.match(/(\d+)h\b/i)
  const min = display.match(/(\d+)m\b/i)
  const secPart = display.match(/(\d+)s\b/i)
  if (year) sec += Number(year[1]) * 365 * 86400
  if (day) sec += Number(day[1]) * 86400
  if (hour) sec += Number(hour[1]) * 3600
  if (min) sec += Number(min[1]) * 60
  if (secPart) sec += Number(secPart[1])
  return sec
}

function formatTime(seconds) {
  let s = seconds
  const y = Math.floor(s / (365 * 86400))
  s -= y * 365 * 86400
  const d = Math.floor(s / 86400)
  s -= d * 86400
  const h = Math.floor(s / 3600)
  s -= h * 3600
  const m = Math.floor(s / 60)
  const sec = seconds - y * 365 * 86400 - d * 86400 - h * 3600 - m * 60
  const parts = []
  if (y) parts.push(`${y} year${y === 1 ? '' : 's'}`)
  if (d) parts.push(`${d} day${d === 1 ? '' : 's'}`)
  if (h) parts.push(`${h}h`)
  if (m) parts.push(`${m}m`)
  parts.push(`${sec}s`)
  return parts.join(', ')
}

function formatCoin(n) {
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(2)}T`
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  return `${(n / 1_000).toFixed(2)}K`
}

function formatGems(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(2)}K`
  return String(n)
}

const towerLabs = JSON.parse(fs.readFileSync(towerLabsPath, 'utf8'))[
  'Max Rend Armor Multiplier'
]

let totalTimeSec = 0
let totalCoins = 0
const levels = []

for (let level = 1; level <= 30; level++) {
  const tower = towerLabs[String(level)]
  const gemNum = marginalGem(level)
  totalTimeSec += tower.DURATION
  totalCoins += tower.COST
  levels.push({
    level,
    value: 800 + 25 * level,
    time: { display: formatTime(tower.DURATION), seconds: tower.DURATION },
    gems: gemNum,
    coins: tower.COST,
    totalTime: { display: formatTime(totalTimeSec), seconds: totalTimeSec },
    totalGems: 0,
    totalCoins: totalCoins,
  })
}

let runGems = 0
for (const entry of levels) {
  runGems += entry.gems
  entry.totalGems = runGems
  const totals = TOTAL_DISPLAY[entry.level]
  if (totals) {
    const [totalTime, totalGems, totalCoins] = totals
    entry.totalTime.display = totalTime
    entry.totalTime.seconds = parseTimeToSeconds(totalTime)
    entry.totalGems = parseAbbrevNum(totalGems)
    entry.totalCoins = parseAbbrevNum(totalCoins)
  }
}

// Align L29 marginal gems so L30 cumulative matches screenshot (47.25K total gems)
const before30 = levels.slice(0, 29).reduce((s, row) => s + row.gems, 0)
const targetBefore30 = parseAbbrevNum('47.25K') - MARG_GEM_ANCHOR[30]
levels[28].gems += targetBefore30 - before30
levels[28].totalGems = before30 + levels[28].gems
for (let i = 29; i < levels.length; i++) {
  const prev = i === 0 ? 0 : levels[i - 1].totalGems
  levels[i].totalGems = prev + levels[i].gems
}
const l30 = levels[29]
const totals30 = TOTAL_DISPLAY[30]
l30.totalTime.display = totals30[0]
l30.totalTime.seconds = parseTimeToSeconds(totals30[0])
l30.totalGems = parseAbbrevNum(totals30[1])
l30.totalCoins = parseAbbrevNum(totals30[2])

const doc = {
  name: 'Max Rend Armor Multiplier',
  maxLevel: 30,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
