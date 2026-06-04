/**
 * Builds tables/labs/defense/health-regen.json from Health Regen calculator screenshots.
 * Sources: Health Regen screenshots (L1–29, L28–59, L58–89, L69–100).
 * Marginal time/gem/coin rows match Health L1–100; Value column +0.03/level (1.03 … 4.00).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const healthPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'health.json')
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'health-regen.json')

const health = JSON.parse(fs.readFileSync(healthPath, 'utf8'))
const doc = {
  name: 'Health Regen',
  maxLevel: health.maxLevel,
  levels: health.levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${doc.levels.length} levels, screenshot data only)`)
