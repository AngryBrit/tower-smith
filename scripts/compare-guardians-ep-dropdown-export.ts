/**
 * Compare Guardians v3.0.2 Dropdown Export TSV against our label builder.
 * Usage: npx tsx scripts/compare-guardians-ep-dropdown-export.ts "path/to/export.tsv"
 */
import { readFileSync } from 'node:fs'
import { guardianEpLevelDropdownLabel } from '../src/effectivePaths/buildGuardianSheetUpdates'
import {
  GUARDIAN_EP_CHIP_START_ROWS,
  GUARDIAN_EP_CHIP_TRACK_ORDER,
} from '../src/effectivePaths/guardianEpSheetNames'
import type { GuardianChipId } from '../src/data/guardianChips'

const tsvPath = process.argv[2]
if (!tsvPath) {
  console.error('Usage: npx tsx scripts/compare-guardians-ep-dropdown-export.ts <tsv-path>')
  process.exit(1)
}

const ROW_TO_TRACK: Record<number, { chipId: GuardianChipId; trackId: string }> = {}
for (const chipId of Object.keys(GUARDIAN_EP_CHIP_START_ROWS) as GuardianChipId[]) {
  const start = GUARDIAN_EP_CHIP_START_ROWS[chipId]
  GUARDIAN_EP_CHIP_TRACK_ORDER[chipId].forEach((trackId, index) => {
    ROW_TO_TRACK[start + index] = { chipId, trackId }
  })
}

function parseDropdownOptions(raw: string): string[] {
  const text = raw.trim()
  // Summon duration (F15) omits the space before "| Cost" (e.g. `5s| Cost`).
  const re = /\d{2} \| .+? Cost \d+ ⧈ \| (?:Next \d+ ⧈|Maxed)/g
  return [...text.matchAll(re)].map((m) => m[0]!)
}

type Mismatch = {
  row: number
  chipId: GuardianChipId
  trackId: string
  level: number
  tsv: string
  ours: string
}

const mismatches: Mismatch[] = []
let totalOptions = 0
let rowsCompared = 0

const tsv = readFileSync(tsvPath, 'utf-8')
for (const line of tsv.split(/\r?\n/).filter(Boolean)) {
  const m = line.match(/^F(\d+)\s+(.+)$/)
  if (!m) continue
  const row = Number.parseInt(m[1]!, 10)
  const track = ROW_TO_TRACK[row]
  if (!track) continue
  rowsCompared += 1

  const options = parseDropdownOptions(m[2]!)
  for (const opt of options) {
    totalOptions += 1
    const epLevel = Number.parseInt(opt.slice(0, 2), 10)
    const gameLevel = epLevel + 1
    const ours = guardianEpLevelDropdownLabel(track.chipId, track.trackId, gameLevel)
    if (ours !== opt) {
      mismatches.push({
        row,
        chipId: track.chipId,
        trackId: track.trackId,
        level: epLevel,
        tsv: opt,
        ours,
      })
    }
  }
}

console.log('Rows compared (column F):', rowsCompared)
console.log('Dropdown options checked:', totalOptions)

if (mismatches.length === 0) {
  console.log('\nAll dropdown options match.')
} else {
  const byTrack = new Map<string, Mismatch[]>()
  for (const item of mismatches) {
    const key = `${item.chipId}.${item.trackId}`
    const list = byTrack.get(key) ?? []
    list.push(item)
    byTrack.set(key, list)
  }
  console.log('\n' + mismatches.length + ' mismatch(es) across ' + byTrack.size + ' track(s):\n')
  for (const [key, list] of [...byTrack.entries()].sort()) {
    console.log(key + ' (' + list.length + ' levels)')
    for (const item of list.slice(0, 5)) {
      console.log('  F' + item.row + ' ep L' + item.level)
      console.log('    TSV:', item.tsv)
      console.log('    OUR:', item.ours)
    }
    if (list.length > 5) console.log('  ... +' + (list.length - 5) + ' more')
    console.log('')
  }
  process.exit(1)
}
