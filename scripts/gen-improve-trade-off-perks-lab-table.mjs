/**
 * Builds tables/labs/perks/improve-trade-off-perks.json from screenshot only.
 * maxLevel 10; Include % off; speedup 1.
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
  'improve-trade-off-perks.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] */
const BY_LEVEL = {
  1: [
    '1.00',
    '1 day, 59m, 0s',
    '169',
    '600.00M',
    '1 day, 59m, 0s',
    '169',
    '600.00M',
  ],
  2: [
    '2.00',
    '1 day, 14h, 54m, 0s',
    '250',
    '700.03M',
    '2 days, 15h, 53m, 0s',
    '419',
    '1.30B',
  ],
  3: [
    '3.00',
    '2 days, 5h, 0m, 0s',
    '332',
    '801.18M',
    '4 days, 20h, 53m, 0s',
    '751',
    '2.10B',
  ],
  4: [
    '4.00',
    '2 days, 19h, 40m, 0s',
    '417',
    '910.14M',
    '7 days, 16h, 33m, 0s',
    '1.17K',
    '3.01B',
  ],
  5: [
    '5.00',
    '3 days, 11h, 24m, 0s',
    '509',
    '1.05B',
    '11 days, 3h, 57m, 0s',
    '1.68K',
    '4.06B',
  ],
  6: [
    '6.00',
    '4 days, 4h, 49m, 0s',
    '610',
    '1.25B',
    '15 days, 8h, 46m, 0s',
    '2.29K',
    '5.31B',
  ],
  7: [
    '7.00',
    '5 days, 38m, 0s',
    '725',
    '1.60B',
    '20 days, 9h, 24m, 0s',
    '3.01K',
    '6.91B',
  ],
  8: [
    '8.00',
    '5 days, 23h, 39m, 0s',
    '859',
    '2.20B',
    '26 days, 9h, 3m, 0s',
    '3.87K',
    '9.11B',
  ],
  9: [
    '9.00',
    '7 days, 2h, 46m, 0s',
    '1.01K',
    '3.23B',
    '33 days, 11h, 49m, 0s',
    '4.88K',
    '12.34B',
  ],
  10: [
    '10.00',
    '8 days, 10h, 58m, 0s',
    '1.16K',
    '4.92B',
    '41 days, 22h, 47m, 0s',
    '6.05K',
    '17.26B',
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
for (let level = 1; level <= 10; level++) {
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
  name: 'Improve Trade-off Perks',
  maxLevel: 10,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
