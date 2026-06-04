/**
 * Builds BC Group 3 enemy ultimate GOD tables (screenshot ladder, q/Q = 1e15).
 * Run: node scripts/gen-bc-group3-enemy-ultimate-labs.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildBcGroup3UltimateLab } from './lib/build-bc-group3-ultimate-lab.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'tables', 'labs', 'battle-condition')

/** [display name, output filename] */
const LABS = [
  ["Fast's Ultimate", 'fast-ultimate.json'],
  ['Ranged Ultimate', 'ranged-ultimate.json'],
  ["Boss's Ultimate", 'boss-ultimate.json'],
  ["Basic's Ultimate", 'basic-ultimate.json'],
  ["Tank's Ultimate", 'tank-ultimate.json'],
  ["Protector's Ultimate", 'protector-ultimate.json'],
]

fs.mkdirSync(outDir, { recursive: true })
for (const [name, file] of LABS) {
  const doc = buildBcGroup3UltimateLab(name)
  const outPath = path.join(outDir, file)
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
  console.log('Wrote', outPath, `(${doc.levels.length} levels)`)
}
