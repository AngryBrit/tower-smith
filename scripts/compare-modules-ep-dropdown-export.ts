/**
 * Compare Modules v6.1.2 Dropdown Export TSV against our sheet label helpers.
 * Usage: npx tsx scripts/compare-modules-ep-dropdown-export.ts "path/to/export.tsv"
 */
import { readFileSync } from 'node:fs'
import { WORKSHOP_SUBMODULE_SECTIONS } from '../src/data/workshopSubmoduleCatalog'
import {
  MODULE_EP_SUBMODULE_RARITY_SHEET_LABELS,
  moduleEpMergeTierSheetLabel,
  moduleEpSubmoduleSheetLabel,
} from '../src/effectivePaths/moduleEpSheetNames'
import type { WorkshopChassisModuleMergeTier } from '../src/data/workshopChassisModuleShared'

const tsvPath = process.argv[2]
if (!tsvPath) {
  console.error('Usage: npx tsx scripts/compare-modules-ep-dropdown-export.ts <tsv-path>')
  process.exit(1)
}

const MERGE_TIERS: WorkshopChassisModuleMergeTier[] = [
  'rare',
  'rare_plus',
  'epic',
  'epic_plus',
  'legendary',
  'legendary_plus',
  'mythic',
  'mythic_plus',
  'ancestral',
  'star_1',
  'star_2',
  'star_3',
  'star_4',
  'star_5',
]

const OUR_MERGE_LABELS = ['None', ...MERGE_TIERS.map((tier) => moduleEpMergeTierSheetLabel(tier))]

const OUR_SUBSTAT_LABELS = [
  ...new Set(
    Object.values(WORKSHOP_SUBMODULE_SECTIONS).flatMap((section) =>
      section.rows.map((row) => moduleEpSubmoduleSheetLabel(row.label)),
    ),
  ),
].sort((a, b) => b.length - a.length)

function extractKnownLabels(payload: string, known: readonly string[]): string[] {
  const sorted = [...known].sort((a, b) => b.length - a.length)
  let rest = payload.trim()
  const out: string[] = []
  while (rest.length > 0) {
    let matched: string | null = null
    for (const label of sorted) {
      if (!rest.startsWith(label)) continue
      const tail = rest.slice(label.length)
      if (tail !== '' && !tail.startsWith(' ')) continue
      matched = label
      break
    }
    if (!matched) break
    out.push(matched)
    rest = rest.slice(matched.length).trimStart()
  }
  return out
}

let mergeChecked = 0
let mergeMismatches = 0
let substatChecked = 0
let substatMismatches = 0
let rarityChecked = 0
let rarityMismatches = 0

const tsv = readFileSync(tsvPath, 'utf-8')
for (const line of tsv.split(/\r?\n/).filter(Boolean)) {
  const m = line.match(/^([A-Za-z_]+)(\d+)\s+(.+)$/)
  if (!m) continue
  const col = m[1]!
  const row = Number.parseInt(m[2]!, 10)
  const payload = m[3]!

  if (row === 5 && ['F', 'K', 'P', 'U', 'Z', '_'].includes(col)) {
    const options = extractKnownLabels(payload, OUR_MERGE_LABELS)
    mergeChecked += options.length
    for (const opt of options) {
      if (!OUR_MERGE_LABELS.includes(opt)) mergeMismatches += 1
    }
    const consumed = options.join(' ')
    if (consumed !== payload.trim()) mergeMismatches += 1
    continue
  }

  if (row === 7 && ['F', 'K', 'P', 'U', 'Z', '_', 'd', 'i'].includes(col)) {
    const options = extractKnownLabels(payload, OUR_SUBSTAT_LABELS)
    substatChecked += options.length
    for (const opt of options) {
      if (!OUR_SUBSTAT_LABELS.includes(opt)) substatMismatches += 1
    }
    continue
  }

  if (row === 8 && col === 'G') {
    const options = payload.trim().split(/\s+/)
    for (const opt of options) {
      rarityChecked += 1
      if (!MODULE_EP_SUBMODULE_RARITY_SHEET_LABELS.includes(opt)) rarityMismatches += 1
    }
    if (options.join(' ') !== MODULE_EP_SUBMODULE_RARITY_SHEET_LABELS.join(' ')) {
      rarityMismatches += 1
    }
  }
}

console.log('Merge tier options checked:', mergeChecked)
console.log('Merge tier mismatches:', mergeMismatches)
console.log('Substat name options checked:', substatChecked)
console.log('Substat name mismatches:', substatMismatches)
console.log('Substat rarity options checked:', rarityChecked)
console.log('Substat rarity mismatches:', rarityMismatches)

if (mergeMismatches + substatMismatches + rarityMismatches > 0) {
  process.exit(1)
}

console.log('All sampled dropdown labels match.')
