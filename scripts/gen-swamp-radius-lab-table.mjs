/**
 * Builds tables/labs/ultimate-weapon/swamp-radius.json from Swamp Radius screenshot only.
 * Value +0.04/level (0.04 … 1.20 at L1–30); same cost ladder as Chrono Field Duration.
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
  'swamp-radius.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–30 */
const BY_LEVEL = {
  1: ['0.04', '19h, 59m, 0s', '136', '250.00K', '19h, 59m, 0s', '136', '250.00K'],
  2: ['0.08', '23h, 21m, 0s', '159', '285.00K', '1 day, 19h, 20m, 0s', '295', '535.00K'],
  3: ['0.12', '1 day, 2h, 53m, 0s', '180', '496.98K', '2 days, 22h, 13m, 0s', '475', '1.03M'],
  4: ['0.16', '1 day, 6h, 54m, 0s', '204', '1.45M', '4 days, 5h, 7m, 0s', '679', '2.48M'],
  5: ['0.20', '1 day, 11h, 49m, 0s', '232', '4.23M', '5 days, 16h, 56m, 0s', '911', '6.71M'],
  6: ['0.24', '1 day, 18h, 6m, 0s', '269', '10.50M', '7 days, 11h, 2m, 0s', '1.18K', '17.21M'],
  7: ['0.28', '2 days, 2h, 17m, 0s', '316', '22.58M', '9 days, 13h, 19m, 0s', '1.50K', '39.79M'],
  8: ['0.32', '2 days, 12h, 58m, 0s', '378', '43.47M', '12 days, 2h, 17m, 0s', '1.87K', '83.26M'],
  9: ['0.36', '3 days, 2h, 49m, 0s', '459', '76.88M', '15 days, 5h, 6m, 0s', '2.33K', '160.14M'],
  10: ['0.40', '3 days, 20h, 31m, 0s', '562', '127.31M', '19 days, 1h, 37m, 0s', '2.90K', '287.45M'],
  11: ['0.44', '4 days, 18h, 49m, 0s', '691', '200.03M', '23 days, 20h, 26m, 0s', '3.59K', '487.48M'],
  12: ['0.48', '5 days, 22h, 30m, 0s', '852', '301.12M', '29 days, 18h, 56m, 0s', '4.44K', '788.60M'],
  13: ['0.52', '7 days, 8h, 23m, 0s', '1.04K', '437.55M', '37 days, 3h, 19m, 0s', '5.48K', '1.23B'],
  14: ['0.56', '9 days, 1h, 21m, 0s', '1.23K', '617.11M', '46 days, 4h, 40m, 0s', '6.71K', '1.84B'],
  15: ['0.60', '11 days, 2h, 18m, 0s', '1.46K', '848.51M', '57 days, 6h, 58m, 0s', '8.16K', '2.69B'],
  16: ['0.64', '13 days, 12h, 9m, 0s', '1.72K', '1.14B', '70 days, 19h, 7m, 0s', '9.88K', '3.83B'],
  17: ['0.68', '16 days, 7h, 54m, 0s', '2.04K', '1.51B', '87 days, 3h, 1m, 0s', '11.92K', '5.34B'],
  18: ['0.72', '19 days, 14h, 32m, 0s', '2.40K', '1.95B', '106 days, 17h, 33m, 0s', '14.32K', '7.29B'],
  19: ['0.76', '23 days, 9h, 6m, 0s', '2.82K', '2.50B', '130 days, 2h, 39m, 0s', '17.13K', '9.79B'],
  20: ['0.80', '27 days, 16h, 40m, 0s', '3.30K', '3.15B', '157 days, 19h, 19m, 0s', '20.43K', '12.94B'],
  21: ['0.84', '32 days, 14h, 19m, 0s', '3.74K', '3.93B', '190 days, 9h, 38m, 0s', '24.17K', '16.87B'],
  22: ['0.88', '38 days, 3h, 12m, 0s', '4.15K', '4.85B', '228 days, 12h, 50m, 0s', '28.32K', '21.72B'],
  23: ['0.92', '44 days, 8h, 27m, 0s', '4.62K', '5.92B', '272 days, 21h, 17m, 0s', '32.94K', '27.64B'],
  24: ['0.96', '51 days, 7h, 16m, 0s', '5.13K', '7.17B', '324 days, 4h, 33m, 0s', '38.07K', '34.81B'],
  25: ['1.00', '59 days, 50m, 0s', '5.70K', '8.61B', '1 year, 18 days, 5h, 23m, 0s', '43.77K', '43.42B'],
  26: ['1.04', '67 days, 14h, 25m, 0s', '6.34K', '10.26B', '1 year, 85 days, 19h, 48m, 0s', '50.11K', '53.68B'],
  27: ['1.08', '77 days, 1h, 17m, 0s', '7.04K', '12.15B', '1 year, 162 days, 21h, 5m, 0s', '57.15K', '65.83B'],
  28: ['1.12', '87 days, 10h, 41m, 0s', '7.81K', '14.29B', '1 year, 250 days, 7h, 46m, 0s', '64.96K', '80.12B'],
  29: ['1.16', '98 days, 19h, 58m, 0s', '8.56K', '16.70B', '1 year, 349 days, 3h, 44m, 0s', '73.52K', '96.82B'],
  30: ['1.20', '111 days, 6h, 28m, 0s', '9.34K', '19.42B', '2 years, 95 days, 10h, 12m, 0s', '82.86K', '116.24B'],
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
for (let level = 1; level <= 30; level++) {
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
  name: 'Swamp Radius',
  maxLevel: 30,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
