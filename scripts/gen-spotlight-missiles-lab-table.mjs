/**
 * Builds tables/labs/ultimate-weapon/spotlight-missiles.json from Spotlight Missiles screenshot only.
 * Calculator Value 20.00 − level seconds (19.00 … 2.00 at L1–18); unique cost ladder.
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
  'ultimate-weapon',
  'spotlight-missiles.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–18 */
const BY_LEVEL = {
  1: ['19.00', '6 days, 15h, 58m, 12s', '954', '200.00M', '6 days, 15h, 58m, 12s', '954', '200.00M'],
  2: ['18.00', '7 days, 20m, 2s', '1.00K', '200.31M', '13 days, 16h, 18m, 14s', '1.96K', '400.31M'],
  3: ['17.00', '7 days, 8h, 52m, 5s', '1.04K', '200.85M', '21 days, 1h, 10m, 19s', '3.00K', '601.17M'],
  4: ['16.00', '7 days, 17h, 52m, 41s', '1.08K', '202.55M', '28 days, 19h, 3m, 0s', '4.08K', '803.72M'],
  5: ['15.00', '8 days, 3h, 48m, 22s', '1.13K', '207.50M', '36 days, 22h, 51m, 22s', '5.21K', '1.01B'],
  6: ['14.00', '8 days, 15h, 5m, 38s', '1.18K', '219.29M', '45 days, 13h, 57m, 0s', '6.39K', '1.23B'],
  7: ['13.00', '9 days, 4h, 17m, 10s', '1.24K', '243.33M', '54 days, 18h, 14m, 10s', '7.63K', '1.47B'],
  8: ['12.00', '9 days, 19h, 57m, 36s', '1.31K', '287.16M', '64 days, 14h, 11m, 46s', '8.95K', '1.76B'],
  9: ['11.00', '10 days, 14h, 47m, 46s', '1.40K', '360.66M', '75 days, 4h, 59m, 32s', '10.35K', '2.12B'],
  10: ['10.00', '11 days, 13h, 30m, 29s', '1.51K', '476.37M', '86 days, 18h, 30m, 1s', '11.85K', '2.60B'],
  11: ['9.00', '12 days, 16h, 48m, 36s', '1.63K', '649.69M', '99 days, 11h, 18m, 37s', '13.49K', '3.25B'],
  12: ['8.00', '14 days, 1h, 29m, 2s', '1.78K', '899.09M', '113 days, 12h, 47m, 39s', '15.27K', '4.15B'],
  13: ['7.00', '15 days, 16h, 22m, 48s', '1.96K', '1.24B', '129 days, 5h, 10m, 27s', '17.23K', '5.39B'],
  14: ['6.00', '17 days, 14h, 20m, 53s', '2.17K', '1.72B', '146 days, 19h, 31m, 20s', '19.41K', '7.11B'],
  15: ['5.00', '19 days, 20h, 16m, 19s', '2.42K', '2.34B', '166 days, 15h, 47m, 39s', '21.83K', '9.44B'],
  16: ['4.00', '22 days, 11h, 8m, 17s', '2.72K', '3.15B', '189 days, 2h, 55m, 56s', '24.55K', '12.59B'],
  17: ['3.00', '25 days, 11h, 53m, 53s', '3.05K', '4.17B', '214 days, 14h, 49m, 49s', '27.60K', '16.76B'],
  18: ['2.00', '28 days, 23h, 32m, 17s', '3.44K', '5.47B', '243 days, 14h, 22m, 6s', '31.04K', '22.23B'],
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

const levels = []
for (let level = 1; level <= 18; level++) {
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
  name: 'Spotlight Missiles',
  maxLevel: 18,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
