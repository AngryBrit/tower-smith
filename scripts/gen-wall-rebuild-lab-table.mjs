/**
 * Builds tables/labs/defense/wall-rebuild.json from Wall Rebuild calculator screenshots only.
 * Sources: Wall Rebuild screenshot (L1–20).
 * Value −10s/level (−10.00 … −200.00).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'wall-rebuild.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–20 */
const BY_LEVEL = {
  1: ['-10.00', '13h, 53m, 0s', '95', '1.60B', '13h, 53m, 0s', '95', '1.60B'],
  2: ['-20.00', '1 day, 1h, 1m, 0s', '169', '1.91B', '1 day, 14h, 54m, 0s', '264', '3.51B'],
  3: ['-30.00', '1 day, 12h, 20m, 0s', '235', '2.23B', '3 days, 3h, 14m, 0s', '499', '5.74B'],
  4: ['-40.00', '2 days, 14m, 0s', '304', '2.61B', '5 days, 3h, 28m, 0s', '803', '8.35B'],
  5: ['-50.00', '2 days, 13h, 11m, 0s', '380', '3.04B', '7 days, 16h, 39m, 0s', '1.18K', '11.39B'],
  6: ['-60.00', '3 days, 3h, 49m, 0s', '465', '3.55B', '10 days, 20h, 28m, 0s', '1.65K', '14.94B'],
  7: ['-70.00', '3 days, 20h, 51m, 0s', '564', '4.15B', '14 days, 17h, 19m, 0s', '2.21K', '19.09B'],
  8: ['-80.00', '4 days, 17h, 6m, 0s', '681', '4.86B', '19 days, 10h, 25m, 0s', '2.89K', '23.95B'],
  9: ['-90.00', '5 days, 17h, 26m, 0s', '823', '5.69B', '25 days, 3h, 51m, 0s', '3.72K', '29.64B'],
  10: ['-100.00', '6 days, 22h, 51m, 0s', '994', '6.65B', '32 days, 2h, 42m, 0s', '4.71K', '36.29B'],
  11: ['-110.00', '8 days, 10h, 24m, 0s', '1.16K', '7.75B', '40 days, 13h, 6m, 0s', '5.87K', '44.04B'],
  12: ['-120.00', '10 days, 5h, 12m, 0s', '1.36K', '9.02B', '50 days, 18h, 18m, 0s', '7.23K', '53.06B'],
  13: ['-130.00', '12 days, 8h, 26m, 0s', '1.59K', '10.46B', '63 days, 2h, 44m, 0s', '8.82K', '63.52B'],
  14: ['-140.00', '14 days, 21h, 23m, 0s', '1.88K', '12.08B', '78 days, 0h, 7m, 0s', '10.70K', '75.60B'],
  15: ['-150.00', '17 days, 21h, 22m, 0s', '2.21K', '13.89B', '95 days, 21h, 29m, 0s', '12.90K', '89.49B'],
  16: ['-160.00', '21 days, 9h, 46m, 0s', '2.60K', '15.92B', '117 days, 7h, 15m, 0s', '15.50K', '105.41B'],
  17: ['-170.00', '25 days, 12h, 1m, 0s', '3.05K', '18.16B', '142 days, 19h, 16m, 0s', '18.55K', '123.57B'],
  18: ['-180.00', '30 days, 5h, 40m, 0s', '3.57K', '20.64B', '173 days, 0h, 56m, 0s', '22.12K', '144.21B'],
  19: ['-190.00', '35 days, 16h, 14m, 0s', '3.97K', '23.36B', '208 days, 17h, 10m, 0s', '26.09K', '167.57B'],
  20: ['-200.00', '41 days, 21h, 23m, 0s', '4.43K', '26.33B', '250 days, 14h, 33m, 0s', '30.52K', '193.90B'],
}

function parseAbbrevNum(raw) {
  const s = String(raw).trim().replace(/,/g, '')
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
  name: 'Wall Rebuild',
  maxLevel: 20,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
