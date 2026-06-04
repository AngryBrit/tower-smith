/**
 * Builds tables/workshop/enemy-level-skip-plus.json from enhancement utility
 * calculator screenshots (Enemy Level Skip +).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'workshop', 'enemy-level-skip-plus.json')

const MULT = { B: 1e9, T: 1e12, q: 1e15, Q: 1e18, s: 1e21 }

/** [value, nextCoins, additionalCoins, totalCoins] — display strings from screenshots */
const BY_LEVEL = {
  0: ['1.00', '5.00B', '0.00', '0.00'],
  1: ['1.01', '15.50B', '5.00B', '5.00B'],
  2: ['1.02', '202.98B', '20.50B', '20.50B'],
  3: ['1.03', '1.13T', '223.48B', '223.48B'],
  4: ['1.04', '3.89T', '1.36T', '1.36T'],
  5: ['1.05', '10.14T', '5.24T', '5.24T'],
  6: ['1.06', '22.19T', '15.38T', '15.38T'],
  7: ['1.07', '43.05T', '37.57T', '37.57T'],
  8: ['1.08', '76.44T', '80.63T', '80.63T'],
  9: ['1.09', '126.85T', '157.07T', '157.07T'],
  10: ['1.10', '199.54T', '283.91T', '283.91T'],
  11: ['1.11', '300.61T', '483.45T', '483.45T'],
  12: ['1.12', '437.01T', '784.06T', '784.06T'],
  13: ['1.13', '616.54T', '1.22q', '1.22q'],
  14: ['1.14', '847.92T', '1.84q', '1.84q'],
  15: ['1.15', '1.14q', '2.69q', '2.69q'],
  16: ['1.16', '1.51q', '3.83q', '3.83q'],
  17: ['1.17', '3.91q', '5.33q', '5.33q'],
  18: ['1.18', '7.50q', '9.24q', '9.24q'],
  19: ['1.19', '12.61q', '16.74q', '16.74q'],
  20: ['1.20', '19.65q', '29.35q', '29.35q'],
  21: ['1.21', '29.09q', '49.00q', '49.00q'],
  22: ['1.22', '41.45q', '78.08q', '78.08q'],
  23: ['1.23', '57.35q', '119.53q', '119.53q'],
  24: ['1.24', '77.47q', '176.88q', '176.88q'],
  25: ['1.25', '102.60q', '254.35q', '254.35q'],
  26: ['1.26', '133.59q', '356.95q', '356.95q'],
  27: ['1.27', '171.41q', '490.55q', '490.55q'],
  28: ['1.28', '217.13q', '661.96q', '661.96q'],
  29: ['1.29', '271.92q', '879.09q', '879.09q'],
  30: ['1.30', '337.06q', '1.15Q', '1.15Q'],
  31: ['1.31', '496.77q', '1.49Q', '1.49Q'],
  32: ['1.32', '705.87q', '1.98Q', '1.98Q'],
  33: ['1.33', '975.00q', '2.69Q', '2.69Q'],
  34: ['1.34', '1.32Q', '3.67Q', '3.67Q'],
  35: ['1.35', '1.74Q', '4.98Q', '4.98Q'],
  36: ['1.36', '2.27Q', '6.73Q', '6.73Q'],
  37: ['1.37', '2.92Q', '9.00Q', '9.00Q'],
  38: ['1.38', '3.71Q', '11.92Q', '11.92Q'],
  39: ['1.39', '4.67Q', '15.64Q', '15.64Q'],
  40: ['1.40', '5.81Q', '20.30Q', '20.30Q'],
  41: ['1.41', '7.16Q', '26.11Q', '26.11Q'],
  42: ['1.42', '8.77Q', '33.27Q', '33.27Q'],
  43: ['1.43', '10.65Q', '42.04Q', '42.04Q'],
  44: ['1.44', '12.85Q', '52.69Q', '52.69Q'],
  45: ['1.45', '15.42Q', '65.54Q', '65.54Q'],
  46: ['1.46', '18.39Q', '80.96Q', '80.96Q'],
  47: ['1.47', '21.81Q', '99.35Q', '99.35Q'],
  48: ['1.48', '25.74Q', '121.15Q', '121.15Q'],
  49: ['1.49', '30.24Q', '146.89Q', '146.89Q'],
  50: ['1.50', '35.37Q', '177.13Q', '177.13Q'],
  51: ['1.51', '47.38Q', '212.50Q', '212.50Q'],
  52: ['1.52', '62.14Q', '259.88Q', '259.88Q'],
  53: ['1.53', '80.12Q', '322.01Q', '322.01Q'],
  54: ['1.54', '101.84Q', '402.13Q', '402.13Q'],
  55: ['1.55', '127.88Q', '503.97Q', '503.97Q'],
  56: ['1.56', '158.91Q', '631.85Q', '631.85Q'],
  57: ['1.57', '195.63Q', '790.75Q', '790.75Q'],
  58: ['1.58', '238.88Q', '986.39Q', '986.39Q'],
  59: ['1.59', '289.53Q', '1.23s', '1.23s'],
  60: ['1.60', 'Maxed', '1.51s', '1.51s'],
}

function parseCoinDisplay(raw) {
  const s = String(raw).trim()
  if (/^maxed$/i.test(s)) return { display: s, coins: null, maxed: true }
  const m = s.match(/^([\d.]+)([BTqQs])?$/)
  if (!m) throw new Error(`bad coin: ${raw}`)
  if (!m[2]) {
    const n = parseFloat(m[1])
    return { display: s, coins: n === 0 ? 0 : n }
  }
  return { display: s, coins: parseFloat(m[1]) * MULT[m[2]] }
}

const levels = []
for (let level = 0; level <= 60; level++) {
  const row = BY_LEVEL[level]
  if (!row) throw new Error(`Missing screenshot row for level ${level}`)
  const [value, nextCoins, additionalCoins, totalCoins] = row
  levels.push({
    level,
    value: Number(value),
    nextCoins: parseCoinDisplay(nextCoins),
    additionalCoins: parseCoinDisplay(additionalCoins),
    totalCoins: parseCoinDisplay(totalCoins),
  })
}

const doc = {
  name: 'Enemy Level Skip +',
  maxLevel: 60,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} rows, screenshot data only)`)
