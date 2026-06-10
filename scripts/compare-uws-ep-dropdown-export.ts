/**
 * Compare UWs v3.1.2 Dropdown Export TSV against our milestone tables.
 * Usage: npx tsx scripts/compare-uws-ep-dropdown-export.ts "path/to/export.tsv"
 */
import { readFileSync } from 'node:fs'
import { uwEpFarmingLevelDropdownLabel } from '../src/effectivePaths/buildUwSheetUpdates'
import {
  UW_EP_V31_LEVEL_KEY_ORDER,
  UW_EP_V31_LEVEL_START_ROWS,
  type UwEpLevelKey,
} from '../src/effectivePaths/uwEpSheetNames'
import type { WorkshopUltimateWeaponId } from '../src/data/workshopUltimateData'

const tsvPath = process.argv[2]
if (!tsvPath) {
  console.error('Usage: npx tsx scripts/compare-uws-ep-dropdown-export.ts <tsv-path>')
  process.exit(1)
}

const ROW_TO_LEVEL_KEY: Record<number, UwEpLevelKey> = {}
for (const weaponId of Object.keys(UW_EP_V31_LEVEL_START_ROWS) as WorkshopUltimateWeaponId[]) {
  const start = UW_EP_V31_LEVEL_START_ROWS[weaponId]
  const keys = UW_EP_V31_LEVEL_KEY_ORDER[weaponId]
  keys.forEach((key, i) => {
    ROW_TO_LEVEL_KEY[start + i] = key
  })
}

function parseDropdownOptions(raw: string): string[] {
  const text = raw.replace(/^Lo\s*\|\s*Locked\s*/i, '').trim()
  const re =
    /\d{2} \| .+? \| Cost \d+ ⧌ \| (?:Next \d+ ⧌|Maxed)/g
  return [...text.matchAll(re)].map((m) => m[0]!)
}

type Mismatch = {
  row: number
  levelKey: string
  level: number
  tsv: string
  ours: string
}

const mismatches: Mismatch[] = []
const rowStats = new Map<number, { checked: number; levelKey: string }>()

const tsv = readFileSync(tsvPath, 'utf-8')
for (const line of tsv.split(/\r?\n/).filter(Boolean)) {
  const m = line.match(/^([GH])(\d+)\s+(.+)$/)
  if (!m) continue
  const col = m[1]!
  if (col !== 'G') continue
  const row = Number.parseInt(m[2]!, 10)
  const payload = m[3]!
  const levelKey = ROW_TO_LEVEL_KEY[row]
  if (!levelKey) continue

  const options = parseDropdownOptions(payload)
  const stat = rowStats.get(row) ?? { checked: 0, levelKey }
  stat.checked += options.length
  rowStats.set(row, stat)

  for (const opt of options) {
    const level = Number.parseInt(opt.slice(0, 2), 10)
    const ours = uwEpFarmingLevelDropdownLabel(levelKey, level)
    if (ours !== opt) {
      mismatches.push({ row, levelKey, level, tsv: opt, ours })
    }
  }

  if (payload.trimStart().toLowerCase().startsWith('lo | locked')) {
    const lockedOurs = uwEpFarmingLevelDropdownLabel(levelKey, -1)
    const lockedTsv = parseDropdownOptions(payload)[0] ?? payload.trim()
    const lockedTsvFull = `Lo | Locked ${lockedTsv}`
    if (lockedOurs !== lockedTsvFull) {
      mismatches.push({ row, levelKey, level: -1, tsv: lockedTsvFull, ours: lockedOurs })
    }
  }
}

const totalOptions = [...rowStats.values()].reduce((n, s) => n + s.checked, 0)
console.log('Rows compared (column G):', rowStats.size)
console.log('Dropdown options checked:', totalOptions)

if (mismatches.length === 0) {
  console.log('\nAll dropdown options match our milestone tables.')
} else {
  const byTrack = new Map<string, Mismatch[]>()
  for (const mm of mismatches) {
    const list = byTrack.get(mm.levelKey) ?? []
    list.push(mm)
    byTrack.set(mm.levelKey, list)
  }
  console.log(`\n${mismatches.length} mismatches across ${byTrack.size} tracks:`)
  for (const [key, list] of byTrack) {
    console.log(`\n${key} (${list.length}):`)
    for (const mm of list.slice(0, 5)) {
      console.log(`  row ${mm.row} L${mm.level}:`)
      console.log(`    TSV:  ${mm.tsv}`)
      console.log(`    ours: ${mm.ours}`)
    }
    if (list.length > 5) console.log(`  ... and ${list.length - 5} more`)
  }
  process.exit(1)
}
