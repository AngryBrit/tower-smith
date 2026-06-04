/**
 * Builds tables/labs/battle-condition/armored-enemies.json from lab calculator screenshots.
 * Coins: lowercase q = 1e12, uppercase Q = 1e15 (BC Group 2 enemy buffs share this ladder).
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
  'armored-enemies.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–20 */
const BY_LEVEL = {
  1: ['1.00', '16 days, 4h, 46m, 0s', '2.02K', '500.00q', '16 days, 4h, 46m, 0s', '2.02K', '500.00q'],
  2: ['2.00', '32 days, 9h, 33m, 0s', '3.73K', '1.00Q', '48 days, 14h, 19m, 0s', '5.75K', '1.50Q'],
  3: ['3.00', '48 days, 14h, 20m, 0s', '4.93K', '1.50Q', '97 days, 4h, 39m, 0s', '10.68K', '3.00Q'],
  4: ['4.00', '64 days, 19h, 7m, 0s', '6.13K', '2.00Q', '161 days, 23h, 46m, 0s', '16.81K', '5.00Q'],
  5: ['5.00', '80 days, 23h, 54m, 0s', '7.33K', '2.50Q', '242 days, 23h, 40m, 0s', '24.14K', '7.50Q'],
  6: ['6.00', '97 days, 4h, 41m, 0s', '8.45K', '3.00Q', '340 days, 4h, 21m, 0s', '32.60K', '10.50Q'],
  7: ['7.00', '113 days, 9h, 28m, 0s', '9.47K', '3.50Q', '1 year, 88 days, 13h, 49m, 0s', '42.07K', '14.00Q'],
  8: ['8.00', '129 days, 14h, 15m, 0s', '10.49K', '4.00Q', '1 year, 218 days, 4h, 4m, 0s', '52.56K', '18.00Q'],
  9: ['9.00', '145 days, 19h, 2m, 0s', '11.51K', '4.50Q', '1 year, 363 days, 23h, 6m, 0s', '64.08K', '22.50Q'],
  10: ['10.00', '161 days, 23h, 49m, 0s', '12.53K', '5.00Q', '2 years, 160 days, 22h, 55m, 0s', '76.61K', '27.50Q'],
  11: ['11.00', '178 days, 4h, 36m, 0s', '13.55K', '5.50Q', '2 years, 339 days, 3h, 31m, 0s', '90.16K', '33.00Q'],
  12: ['12.00', '194 days, 9h, 23m, 0s', '14.57K', '6.00Q', '3 years, 168 days, 12h, 54m, 0s', '104.73K', '39.00Q'],
  13: ['13.00', '210 days, 14h, 10m, 0s', '15.59K', '6.50Q', '4 years, 14 days, 3h, 4m, 0s', '120.33K', '45.50Q'],
  14: ['14.00', '226 days, 18h, 57m, 0s', '16.61K', '7.00Q', '4 years, 240 days, 22h, 1m, 0s', '136.94K', '52.50Q'],
  15: ['15.00', '242 days, 23h, 44m, 0s', '17.63K', '7.50Q', '5 years, 118 days, 21h, 45m, 0s', '154.57K', '60.00Q'],
  16: ['16.00', '259 days, 4h, 31m, 0s', '18.65K', '8.00Q', '6 years, 13 days, 2h, 16m, 0s', '173.23K', '68.00Q'],
  17: ['17.00', '275 days, 9h, 18m, 0s', '19.67K', '8.50Q', '6 years, 288 days, 11h, 34m, 0s', '192.90K', '76.50Q'],
  18: ['18.00', '291 days, 14h, 5m, 0s', '20.69K', '9.00Q', '7 years, 215 days, 1h, 39m, 0s', '213.59K', '85.50Q'],
  19: ['19.00', '307 days, 18h, 52m, 0s', '21.71K', '9.50Q', '8 years, 157 days, 20h, 31m, 0s', '235.31K', '95.00Q'],
  20: ['20.00', '323 days, 23h, 39m, 0s', '22.73K', '10.00Q', '9 years, 116 days, 20h, 10m, 0s', '258.04K', '105.00Q'],
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
  name: 'Armored Enemies',
  maxLevel: 20,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels)`)
