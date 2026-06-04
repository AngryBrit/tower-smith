/**
 * Builds tables/labs/perks/ban-perks.json from screenshot only.
 * maxLevel 8; Include % off; speedup 1.
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
  'ban-perks.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] */
const BY_LEVEL = {
  1: [
    '1.00',
    '2 days, 7h, 33m, 0s',
    '347',
    '10.00M',
    '2 days, 7h, 33m, 0s',
    '347',
    '10.00M',
  ],
  2: [
    '2.00',
    '4 days, 15h, 6m, 0s',
    '670',
    '100.00M',
    '6 days, 22h, 39m, 0s',
    '1.02K',
    '110.00M',
  ],
  3: [
    '3.00',
    '9 days, 6h, 13m, 0s',
    '1.25K',
    '1.00B',
    '16 days, 4h, 52m, 0s',
    '2.27K',
    '1.11B',
  ],
  4: [
    '4.00',
    '20 days, 19h, 59m, 0s',
    '2.53K',
    '15.00B',
    '37 days, 51m, 0s',
    '4.80K',
    '16.11B',
  ],
  5: [
    '5.00',
    '41 days, 16h, 0m, 0s',
    '4.42K',
    '100.00B',
    '78 days, 16h, 51m, 0s',
    '9.22K',
    '116.11B',
  ],
  6: [
    '6.00',
    '83 days, 8h, 0m, 0s',
    '7.51K',
    '1.00T',
    '162 days, 51m, 0s',
    '16.72K',
    '1.12T',
  ],
  7: [
    '7.00',
    '166 days, 15h, 59m, 59s',
    '12.83K',
    '100.00T',
    '328 days, 16h, 50m, 59s',
    '29.55K',
    '101.12T',
  ],
  8: [
    '8.00',
    '333 days, 8h, 0m, 0s',
    '23.32K',
    '1.00q',
    '1 year, 297 days, 50m, 59s',
    '52.87K',
    '1.10q',
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
for (let level = 1; level <= 8; level++) {
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
  name: 'Ban Perks',
  maxLevel: 8,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
