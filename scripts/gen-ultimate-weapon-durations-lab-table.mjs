/**
 * Builds tables/labs/battle-condition/ultimate-weapon-durations.json from screenshots.
 * Coins: q/Q = 1e15, s = 1e18 (Group 4: Death Defy Down, Energy Shields Down, Enemy Level Skip Reduction).
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
  'battle-condition',
  'ultimate-weapon-durations.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–10 */
const BY_LEVEL = {
  1: ['1.00', '26 days, 23h, 58m, 0s', '3.22K', '2.00Q', '26 days, 23h, 58m, 0s', '3.22K', '2.00Q'],
  2: ['2.00', '44 days, 19h, 37m, 0s', '4.65K', '4.00Q', '71 days, 19h, 35m, 0s', '7.87K', '6.00Q'],
  3: ['3.00', '62 days, 15h, 17m, 0s', '5.97K', '8.00Q', '134 days, 10h, 52m, 0s', '13.84K', '14.00Q'],
  4: ['4.00', '80 days, 10h, 57m, 0s', '7.29K', '16.00Q', '214 days, 21h, 49m, 0s', '21.13K', '30.00Q'],
  5: ['5.00', '98 days, 6h, 36m, 0s', '8.52K', '32.00Q', '313 days, 4h, 25m, 0s', '29.65K', '62.00Q'],
  6: ['6.00', '116 days, 2h, 16m, 0s', '9.64K', '64.00Q', '1 year, 64 days, 6h, 41m, 0s', '39.30K', '126.00Q'],
  7: ['7.00', '133 days, 21h, 56m, 0s', '10.77K', '128.00Q', '1 year, 198 days, 4h, 37m, 0s', '50.06K', '254.00Q'],
  8: ['8.00', '151 days, 17h, 35m, 0s', '11.89K', '256.00Q', '1 year, 349 days, 22h, 12m, 0s', '61.95K', '510.00Q'],
  9: ['9.00', '169 days, 13h, 15m, 0s', '13.01K', '512.00Q', '2 years, 154 days, 11h, 27m, 0s', '74.96K', '1.024s'],
  10: ['10.00', '187 days, 8h, 55m, 0s', '14.13K', '1.024s', '2 years, 341 days, 20h, 22m, 0s', '89.09K', '2.048s'],
}

function parseAbbrevNum(raw) {
  const s = String(raw).trim().replace(/,/g, '')
  if (/s$/.test(s)) return Math.round(parseFloat(s) * 1e18)
  if (/Q$/.test(s)) return Math.round(parseFloat(s) * 1_000_000_000_000_000)
  if (/q$/.test(s)) return Math.round(parseFloat(s) * 1_000_000_000_000_000)
  if (/T$/.test(s)) return Math.round(parseFloat(s) * 1_000_000_000_000)
  if (/B$/.test(s)) return Math.round(parseFloat(s) * 1_000_000_000)
  if (/K$/.test(s)) return Math.round(parseFloat(s) * 1_000)
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
  name: 'Ultimate Weapon Durations',
  maxLevel: 10,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels)`)
console.log('L10 coins', levels[9].coins)
