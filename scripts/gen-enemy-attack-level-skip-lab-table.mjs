/**
 * Builds tables/labs/utility/enemy-attack-level-skip.json from Enemy Attack Level Skip screenshot only.
 * Value +0.10/level (0.10 … 2.00); Include % off in calculator UI.
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
  'utility',
  'enemy-attack-level-skip.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–20 */
const BY_LEVEL = {
  1: ['0.10', '16h, 39m, 0s', '114', '900.00M', '16h, 39m, 0s', '114', '900.00M'],
  2: ['0.20', '1 day, 1h, 1m, 0s', '169', '1.01B', '1 day, 17h, 40m, 0s', '283', '1.91B'],
  3: ['0.30', '1 day, 9h, 30m, 0s', '219', '1.16B', '3 days, 3h, 10m, 0s', '502', '3.07B'],
  4: ['0.40', '1 day, 18h, 19m, 0s', '270', '1.43B', '4 days, 21h, 29m, 0s', '772', '4.50B'],
  5: ['0.50', '2 days, 3h, 38m, 0s', '324', '1.94B', '7 days, 1h, 7m, 0s', '1.10K', '6.44B'],
  6: ['0.60', '2 days, 13h, 41m, 0s', '383', '2.80B', '9 days, 14h, 48m, 0s', '1.48K', '9.24B'],
  7: ['0.70', '3 days, 40m, 0s', '446', '4.15B', '12 days, 15h, 28m, 0s', '1.93K', '13.39B'],
  8: ['0.80', '3 days, 12h, 50m, 0s', '517', '6.14B', '16 days, 4h, 18m, 0s', '2.44K', '19.53B'],
  9: ['0.90', '4 days, 2h, 25m, 0s', '596', '8.94B', '20 days, 6h, 43m, 0s', '3.04K', '28.47B'],
  10: ['1.00', '4 days, 17h, 39m, 0s', '685', '12.73B', '25 days, 22m, 0s', '3.72K', '41.20B'],
  11: ['1.10', '5 days, 10h, 49m, 0s', '784', '17.71B', '30 days, 11h, 11m, 0s', '4.51K', '58.91B'],
  12: ['1.20', '6 days, 6h, 8m, 0s', '897', '24.07B', '36 days, 17h, 19m, 0s', '5.40K', '82.98B'],
  13: ['1.30', '7 days, 3h, 53m, 0s', '1.02K', '32.03B', '43 days, 21h, 12m, 0s', '6.42K', '115.01B'],
  14: ['1.40', '8 days, 4h, 21m, 0s', '1.13K', '41.81B', '52 days, 1h, 33m, 0s', '7.55K', '156.82B'],
  15: ['1.50', '9 days, 7h, 46m, 0s', '1.26K', '53.64B', '61 days, 9h, 19m, 0s', '8.81K', '210.46B'],
  16: ['1.60', '10 days, 14h, 27m, 0s', '1.40K', '67.76B', '71 days, 23h, 46m, 0s', '10.21K', '278.22B'],
  17: ['1.70', '12 days, 40m, 0s', '1.56K', '84.42B', '84 days, 26m, 0s', '11.77K', '362.64B'],
  18: ['1.80', '13 days, 14h, 41m, 0s', '1.73K', '103.88B', '97 days, 15h, 7m, 0s', '13.50K', '466.52B'],
  19: ['1.90', '15 days, 8h, 48m, 0s', '1.93K', '126.42B', '112 days, 23h, 55m, 0s', '15.43K', '592.94B'],
  20: ['2.00', '17 days, 7h, 19m, 0s', '2.14K', '152.29B', '130 days, 7h, 14m, 0s', '17.57K', '745.23B'],
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
  name: 'Enemy Attack Level Skip',
  maxLevel: 20,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
