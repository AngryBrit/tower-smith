/**
 * Builds tables/labs/battle-condition/knockback-resistance.json from lab calculator screenshots.
 * Coins: lowercase q = 1e12, uppercase Q = 1e15 (BC Group 1 resistances share this ladder).
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
  'knockback-resistance.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–20 */
const BY_LEVEL = {
  1: ['1.00', '13 days, 11h, 59m, 0s', '1.72K', '200.00q', '13 days, 11h, 59m, 0s', '1.72K', '200.00q'],
  2: ['2.00', '26 days, 23h, 58m, 0s', '3.22K', '400.00q', '40 days, 11h, 57m, 0s', '4.94K', '600.00q'],
  3: ['3.00', '40 days, 11h, 57m, 0s', '4.33K', '600.00q', '80 days, 23h, 54m, 0s', '9.27K', '1.20Q'],
  4: ['4.00', '53 days, 23h, 56m, 0s', '5.33K', '800.00q', '134 days, 23h, 50m, 0s', '14.60K', '2.00Q'],
  5: ['5.00', '67 days, 11h, 55m, 0s', '6.33K', '1.00Q', '202 days, 11h, 45m, 0s', '20.93K', '3.00Q'],
  6: ['6.00', '80 days, 23h, 54m, 0s', '7.33K', '1.20Q', '283 days, 11h, 39m, 0s', '28.26K', '4.20Q'],
  7: ['7.00', '94 days, 11h, 53m, 0s', '8.28K', '1.40Q', '1 year, 12 days, 23h, 32m, 0s', '36.55K', '5.60Q'],
  8: ['8.00', '107 days, 23h, 53m, 0s', '9.13K', '1.60Q', '1 year, 120 days, 23h, 25m, 0s', '45.68K', '7.20Q'],
  9: ['9.00', '121 days, 11h, 52m, 0s', '9.98K', '1.80Q', '1 year, 242 days, 11h, 17m, 0s', '55.66K', '9.00Q'],
  10: ['10.00', '134 days, 23h, 51m, 0s', '10.83K', '2.00Q', '2 years, 12 days, 11h, 8m, 0s', '66.50K', '11.00Q'],
  11: ['11.00', '148 days, 11h, 50m, 0s', '11.68K', '2.20Q', '2 years, 160 days, 22h, 58m, 0s', '78.18K', '13.20Q'],
  12: ['12.00', '161 days, 23h, 49m, 0s', '12.53K', '2.40Q', '2 years, 322 days, 22h, 47m, 0s', '90.71K', '15.60Q'],
  13: ['13.00', '175 days, 11h, 48m, 0s', '13.38K', '2.60Q', '3 years, 133 days, 10h, 35m, 0s', '104.10K', '18.20Q'],
  14: ['14.00', '188 days, 23h, 47m, 0s', '14.23K', '2.80Q', '3 years, 322 days, 10h, 22m, 0s', '118.33K', '21.00Q'],
  15: ['15.00', '202 days, 11h, 47m, 0s', '15.08K', '3.00Q', '4 years, 159 days, 22h, 9m, 0s', '133.41K', '24.00Q'],
  16: ['16.00', '215 days, 23h, 46m, 0s', '15.93K', '3.20Q', '5 years, 10 days, 21h, 55m, 0s', '149.34K', '27.20Q'],
  17: ['17.00', '229 days, 11h, 45m, 0s', '16.78K', '3.40Q', '5 years, 240 days, 9h, 40m, 0s', '166.13K', '30.60Q'],
  18: ['18.00', '242 days, 23h, 44m, 0s', '17.63K', '3.60Q', '6 years, 118 days, 9h, 24m, 0s', '183.76K', '34.20Q'],
  19: ['19.00', '256 days, 11h, 43m, 0s', '18.48K', '3.80Q', '7 years, 9 days, 21h, 7m, 0s', '202.24K', '38.00Q'],
  20: ['20.00', '269 days, 23h, 42m, 0s', '19.33K', '4.00Q', '7 years, 279 days, 20h, 49m, 0s', '221.58K', '42.00Q'],
}

function parseAbbrevNum(raw) {
  const s = String(raw).trim().replace(/,/g, '')
  if (/Q$/.test(s)) return Math.round(parseFloat(s) * 1_000_000_000_000_000)
  if (/q$/.test(s)) return Math.round(parseFloat(s) * 1_000_000_000_000)
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
for (let level = 1; level <= 20; level++) {
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
  name: 'Knockback Resistance',
  maxLevel: 20,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels)`)
