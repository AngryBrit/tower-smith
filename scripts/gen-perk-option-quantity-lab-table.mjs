/**
 * Builds tables/labs/perks/perk-option-quantity.json from screenshot only.
 * maxLevel 2; Include % off; speedup 1.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(
  __dirname,
  '..',
  'tables',
  'labs',
  'perks',
  'perk-option-quantity.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] */
const BY_LEVEL = {
  1: [
    '1.00',
    '4 days, 23h, 26m, 0s',
    '718',
    '200.00M',
    '4 days, 23h, 26m, 0s',
    '718',
    '200.00M',
  ],
  2: [
    '2.00',
    '10 days, 4h, 26m, 0s',
    '1.35K',
    '2.00B',
    '15 days, 3h, 52m, 0s',
    '2.07K',
    '2.20B',
  ],
}

function parseAbbrevNum(raw) {
  const s = String(raw).trim().replace(/,/g, '')
  if (/q$/i.test(s)) return Math.round(parseFloat(s) * 1_000_000_000_000_000)
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

const levels = []
for (let level = 1; level <= 2; level++) {
  const row = BY_LEVEL[level]
  if (!row) throw new Error(`Missing screenshot row for level ${level}`)
  const [value, time, gems, coins, totalTime, totalGems, totalCoins] = row
  levels.push({
    level,
    value: parseFloat(value),
    time: { display: time, seconds: parseTimeToSeconds(time) },
    gems: parseAbbrevNum(gems),
    coins: parseAbbrevNum(coins),
    totalTime: { display: totalTime, seconds: parseTimeToSeconds(totalTime) },
    totalGems: parseAbbrevNum(totalGems),
    totalCoins: parseAbbrevNum(totalCoins),
  })
}

const doc = {
  name: 'Perk Option Quantity',
  maxLevel: 2,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
