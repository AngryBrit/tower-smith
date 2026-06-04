/**
 * Builds tables/labs/utility/recovery-package-max.json from Recovery Package Max screenshot only.
 * Value +0.01/level (0.01 … 0.20); Include % off in calculator UI.
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
  'recovery-package-max.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–20 */
const BY_LEVEL = {
  1: ['0.01', '2 days, 7h, 33m, 0s', '347', '20.00B', '2 days, 7h, 33m, 0s', '347', '20.00B'],
  2: ['0.02', '2 days, 15h, 54m, 0s', '395', '25.01B', '4 days, 23h, 27m, 0s', '742', '45.01B'],
  3: ['0.03', '3 days, 27m, 0s', '445', '30.07B', '7 days, 23h, 54m, 0s', '1.19K', '75.08B'],
  4: ['0.04', '3 days, 9h, 34m, 0s', '498', '30.07B', '11 days, 9h, 28m, 0s', '1.69K', '105.15B'],
  5: ['0.05', '3 days, 19h, 44m, 0s', '557', '40.97B', '15 days, 5h, 12m, 0s', '2.24K', '146.12B'],
  6: ['0.06', '4 days, 7h, 36m, 0s', '626', '47.26B', '19 days, 12h, 48m, 0s', '2.87K', '193.38B'],
  7: ['0.07', '4 days, 21h, 51m, 0s', '709', '54.53B', '24 days, 10h, 39m, 0s', '3.58K', '247.91B'],
  8: ['0.08', '5 days, 15h, 19m, 0s', '811', '63.13B', '30 days, 1h, 58m, 0s', '4.39K', '311.04B'],
  9: ['0.09', '6 days, 12h, 53m, 0s', '936', '73.51B', '36 days, 14h, 51m, 0s', '5.32K', '384.55B'],
  10: ['0.10', '7 days, 15h, 31m, 0s', '1.07K', '86.14B', '44 days, 6h, 22m, 0s', '6.40K', '470.69B'],
  11: ['0.11', '9 days, 17m, 0s', '1.22K', '101.55B', '53 days, 6h, 39m, 0s', '7.62K', '572.24B'],
  12: ['0.12', '10 days, 16h, 19m, 0s', '1.41K', '120.32B', '63 days, 22h, 58m, 0s', '9.03K', '692.56B'],
  13: ['0.13', '12 days, 16h, 46m, 0s', '1.63K', '143.08B', '76 days, 15h, 44m, 0s', '10.66K', '835.64B'],
  14: ['0.14', '15 days, 2h, 57m, 0s', '1.90K', '170.50B', '91 days, 18h, 41m, 0s', '12.56K', '1.01T'],
  15: ['0.15', '18 days, 9m, 0s', '2.22K', '203.31B', '109 days, 18h, 50m, 0s', '14.78K', '1.21T'],
  16: ['0.16', '21 days, 9h, 46m, 0s', '2.60K', '242.27B', '131 days, 4h, 36m, 0s', '17.38K', '1.45T'],
  17: ['0.17', '25 days, 9h, 15m, 0s', '3.04K', '288.20B', '156 days, 13h, 51m, 0s', '20.42K', '1.74T'],
  18: ['0.18', '30 days, 6m, 0s', '3.55K', '341.96B', '186 days, 13h, 57m, 0s', '23.97K', '2.08T'],
  19: ['0.19', '35 days, 7h, 54m, 0s', '3.95K', '404.45B', '221 days, 21h, 51m, 0s', '27.92K', '2.49T'],
  20: ['0.20', '41 days, 10h, 16m, 0s', '4.40K', '476.60B', '263 days, 8h, 7m, 0s', '32.31K', '2.96T'],
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
  name: 'Recovery Package Max',
  maxLevel: 20,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
