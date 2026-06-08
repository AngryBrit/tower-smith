/**
 * Builds tables/labs/defense/defense-percent.json from Defense % calculator screenshots.
 * Sources: Defense % screenshots (L1–29, L19–50).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'defense-percent.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshots L1–50 */
const BY_LEVEL = {
  1: ['0.20', '59m, 59s', '8', '5.00K', '59m, 59s', '8', '5.00K'],
  2: ['0.40', '1h, 51m, 0s', '14', '7.50K', '2h, 50m, 59s', '22', '12.50K'],
  3: ['0.60', '2h, 51m, 0s', '21', '24.00K', '5h, 41m, 59s', '43', '36.50K'],
  4: ['0.80', '4h, 13m, 0s', '30', '90.50K', '9h, 54m, 59s', '73', '127.00K'],
  5: ['1.00', '6h, 13m, 0s', '43', '267.00K', '16h, 7m, 59s', '116', '394.00K'],
  6: ['1.20', '9h, 6m, 0s', '63', '637.50K', '1 day, 1h, 13m, 59s', '179', '1.03M'],
  7: ['1.40', '13h, 11m, 0s', '90', '1.31M', '1 day, 14h, 24m, 59s', '269', '2.34M'],
  8: ['1.60', '18h, 47m, 0s', '128', '2.42M', '2 days, 9h, 11m, 59s', '397', '4.76M'],
  9: ['1.80', '1 day, 2h, 14m, 0s', '176', '4.11M', '3 days, 11h, 25m, 59s', '573', '8.87M'],
  10: ['2.00', '1 day, 11h, 54m, 0s', '233', '6.58M', '4 days, 23h, 19m, 59s', '806', '15.45M'],
  11: ['2.20', '2 days, 7m, 0s', '304', '10.02M', '6 days, 23h, 26m, 59s', '1.11K', '25.47M'],
  12: ['2.40', '2 days, 15h, 18m, 0s', '392', '14.66M', '9 days, 14h, 44m, 59s', '1.50K', '40.13M'],
  13: ['2.60', '3 days, 9h, 48m, 0s', '499', '20.76M', '13 days, 32m, 59s', '2.00K', '60.89M'],
  14: ['2.80', '4 days, 8h, 2m, 0s', '629', '28.59M', '17 days, 8h, 34m, 59s', '2.63K', '89.48M'],
  15: ['3.00', '5 days, 10h, 25m, 0s', '782', '38.44M', '22 days, 18h, 59m, 59s', '3.41K', '127.92M'],
  16: ['3.20', '6 days, 17h, 22m, 0s', '962', '50.65M', '29 days, 12h, 21m, 59s', '4.37K', '178.57M'],
  17: ['3.40', '8 days, 5h, 18m, 0s', '1.14K', '65.57M', '37 days, 17h, 39m, 59s', '5.51K', '244.14M'],
  18: ['3.60', '9 days, 22h, 39m, 0s', '1.33K', '83.55M', '47 days, 16h, 18m, 59s', '6.84K', '327.69M'],
  19: ['3.80', '11 days, 21h, 53m, 0s', '1.55K', '105.01M', '59 days, 14h, 11m, 59s', '8.38K', '432.70M'],
  20: ['4.00', '14 days, 3h, 26m, 0s', '1.79K', '130.35M', '73 days, 17h, 37m, 59s', '10.17K', '563.05M'],
  21: ['4.20', '16 days, 15h, 46m, 0s', '2.07K', '160.04M', '90 days, 9h, 23m, 59s', '12.25K', '723.09M'],
  22: ['4.40', '19 days, 11h, 22m, 0s', '2.38K', '194.52M', '109 days, 20h, 45m, 59s', '14.63K', '917.61M'],
  23: ['4.60', '22 days, 14h, 40m, 0s', '2.73K', '234.29M', '132 days, 11h, 25m, 59s', '17.36K', '1.15B'],
  24: ['4.80', '26 days, 2h, 12m, 0s', '3.12K', '279.88M', '158 days, 13h, 37m, 59s', '20.48K', '1.43B'],
  25: ['5.00', '29 days, 22h, 25m, 0s', '3.54K', '331.82M', '188 days, 12h, 2m, 59s', '24.02K', '1.76B'],
  26: ['5.20', '34 days, 3h, 49m, 0s', '3.86K', '390.67M', '222 days, 15h, 51m, 59s', '27.88K', '2.15B'],
  27: ['5.40', '38 days, 18h, 55m, 0s', '4.20K', '457.02M', '261 days, 10h, 46m, 59s', '32.08K', '2.61B'],
  28: ['5.60', '43 days, 20h, 13m, 0s', '4.58K', '531.49M', '305 days, 6h, 59m, 59s', '36.66K', '3.14B'],
  29: ['5.80', '49 days, 8h, 13m, 0s', '4.99K', '614.70M', '354 days, 15h, 12m, 59s', '41.64K', '3.76B'],
  30: ['6.00', '55 days, 7h, 27m, 0s', '5.43K', '707.33M', '1 year, 44 days, 22h, 39m, 59s', '47.07K', '4.46B'],
  31: ['6.20', '61 days, 18h, 27m, 0s', '5.91K', '810.05M', '1 year, 106 days, 17h, 6m, 59s', '52.98K', '5.27B'],
  32: ['6.40', '68 days, 17h, 43m, 0s', '6.42K', '923.57M', '1 year, 175 days, 10h, 49m, 59s', '59.40K', '6.20B'],
  33: ['6.60', '76 days, 5h, 48m, 0s', '6.98K', '1.05B', '1 year, 251 days, 16h, 37m, 59s', '66.38K', '7.25B'],
  34: ['6.80', '84 days, 7h, 15m, 0s', '7.58K', '1.19B', '1 year, 335 days, 23h, 52m, 59s', '73.96K', '8.44B'],
  35: ['7.00', '92 days, 22h, 36m, 0s', '8.19K', '1.34B', '2 years, 63 days, 22h, 28m, 59s', '82.15K', '9.78B'],
  36: ['7.20', '102 days, 4h, 25m, 0s', '8.77K', '1.50B', '2 years, 166 days, 2h, 53m, 59s', '90.91K', '11.28B'],
  37: ['7.40', '112 days, 1h, 14m, 0s', '9.39K', '1.68B', '2 years, 278 days, 4h, 7m, 59s', '100.30K', '12.96B'],
  38: ['7.60', '122 days, 13h, 37m, 0s', '10.05K', '1.87B', '3 years, 35 days, 17h, 44m, 59s', '110.35K', '14.83B'],
  39: ['7.80', '133 days, 18h, 8m, 0s', '10.76K', '2.09B', '3 years, 169 days, 11h, 52m, 59s', '121.11K', '16.92B'],
  40: ['8.00', '145 days, 21m, 0s', '11.46K', '2.31B', '3 years, 314 days, 12h, 13m, 59s', '132.57K', '19.23B'],
  41: ['8.20', '158 days, 5h, 50m, 0s', '12.30K', '2.56B', '4 years, 107 days, 18h, 3m, 59s', '144.87K', '21.79B'],
  42: ['8.40', '171 days, 14h, 11m, 0s', '13.14K', '2.83B', '4 years, 279 days, 8h, 14m, 59s', '158.01K', '24.62B'],
  43: ['8.60', '185 days, 16h, 58m, 0s', '14.03K', '3.11B', '5 years, 100 days, 1h, 12m, 59s', '172.03K', '27.73B'],
  44: ['8.80', '200 days, 14h, 46m, 0s', '14.97K', '3.42B', '5 years, 300 days, 15h, 58m, 59s', '187.00K', '31.15B'],
  45: ['9.00', '216 days, 8h, 11m, 0s', '15.96K', '3.75B', '6 years, 152 days, 9m, 59s', '202.95K', '34.90B'],
  46: ['9.20', '232 days, 11h, 49m, 0s', '16.97K', '4.10B', '7 years, 19 days, 11h, 58m, 59s', '219.93K', '39.00B'],
  47: ['9.40', '250 days, 8h, 15m, 0s', '18.10K', '4.48B', '7 years, 269 days, 20h, 13m, 59s', '238.02K', '43.48B'],
  48: ['9.60', '268 days, 16h, 6m, 0s', '19.25K', '4.88B', '8 years, 173 days, 12h, 19m, 59s', '257.27K', '48.36B'],
  49: ['9.80', '287 days, 21h, 58m, 0s', '20.46K', '5.31B', '9 years, 96 days, 10h, 17m, 59s', '277.73K', '53.67B'],
  50: ['10.00', '308 days, 2h, 27m, 0s', '21.73K', '5.76B', '10 years, 39 days, 12h, 44m, 59s', '299.47K', '59.43B'],
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
for (let level = 1; level <= 50; level++) {
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
  name: 'Defense %',
  maxLevel: 50,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
