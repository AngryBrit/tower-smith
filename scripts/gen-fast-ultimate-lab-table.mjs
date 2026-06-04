/**
 * Builds tables/labs/battle-condition/fast-ultimate.json.
 * Prefer: node scripts/gen-bc-group3-enemy-ultimate-labs.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildBcGroup3UltimateLab } from './lib/build-bc-group3-ultimate-lab.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(
  __dirname,
  '..',
  'tables',
  'labs',
  'battle-condition',
  'fast-ultimate.json',
)

const doc = buildBcGroup3UltimateLab("Fast's Ultimate")
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${doc.levels.length} levels)`)
