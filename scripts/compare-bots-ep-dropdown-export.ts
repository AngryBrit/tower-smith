/**
 * Compare Bots v3.1 Dropdown Export TSV (full validation lists) against our tables.
 * Usage: npx tsx scripts/compare-bots-ep-dropdown-export.ts "path/to/export.tsv"
 */
import { readFileSync } from 'node:fs'
import { botEpFarmingLevelDropdownLabel } from '../src/effectivePaths/buildBotSheetUpdates'
import { BOT_EP_V31_FARMING_LEVEL_START_ROWS, BOT_EP_V31_LEVEL_KEY_ORDER } from '../src/effectivePaths/botSheetNames'
import type { WorkshopBotId } from '../src/data/workshopBotsData'

const tsvPath = process.argv[2]
if (!tsvPath) {
  console.error('Usage: npx tsx scripts/compare-bots-ep-dropdown-export.ts <tsv-path>')
  process.exit(1)
}

const ROW_TO_LEVEL_KEY: Record<number, string> = {}
for (const botId of Object.keys(BOT_EP_V31_FARMING_LEVEL_START_ROWS) as WorkshopBotId[]) {
  const start = BOT_EP_V31_FARMING_LEVEL_START_ROWS[botId]
  const keys = BOT_EP_V31_LEVEL_KEY_ORDER[botId]
  keys.forEach((key, i) => {
    ROW_TO_LEVEL_KEY[start + i] = key
  })
}

/** Split full validation list into individual dropdown option strings. */
function parseDropdownOptions(raw: string): string[] {
  const text = raw.replace(/^Lo\s*\|\s*Locked\s*/i, '').trim()
  const re =
    /\d{2} \| .+? \| Cost \d+ ⧓ \| (?:Next \d+ ⧓|Maxed)/g
  return [...text.matchAll(re)].map((m) => m[0]!)
}

type Mismatch = {
  row: number
  col: string
  levelKey: string
  level: number
  tsv: string
  ours: string
}

const mismatches: Mismatch[] = []
const rowStats = new Map<number, { checked: number; levelKey: string }>()

const tsv = readFileSync(tsvPath, 'utf-8')
for (const line of tsv.split(/\r?\n/).filter(Boolean)) {
  const m = line.match(/^([GKOP])(\d+)\s+(.+)$/)
  if (!m) continue
  const col = m[1]!
  if (col !== 'G') continue // Farming column; K/O are identical preset copies
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
    const ours = botEpFarmingLevelDropdownLabel(levelKey, level)
    if (ours !== opt) {
      mismatches.push({ row, col, levelKey, level, tsv: opt, ours })
    }
  }
}

// Only compare column G once per row (K/O are duplicates)
const gMismatches = mismatches.filter((m) => m.col === 'G')

const totalOptions = [...rowStats.values()].reduce((n, s) => n + s.checked, 0)
console.log('Rows compared (column G):', rowStats.size)
console.log('Dropdown options checked:', totalOptions)

if (gMismatches.length === 0) {
  console.log('\nAll dropdown options match our milestone tables.')
} else {
  const byTrack = new Map<string, Mismatch[]>()
  for (const m of gMismatches) {
    const list = byTrack.get(m.levelKey) ?? []
    list.push(m)
    byTrack.set(m.levelKey, list)
  }
  console.log('\n' + gMismatches.length + ' mismatch(es) across ' + byTrack.size + ' track(s):\n')
  for (const [levelKey, list] of [...byTrack.entries()].sort()) {
    console.log(levelKey + ' (' + list.length + ' levels)')
    for (const m of list.slice(0, 5)) {
      console.log('  G' + m.row + ' L' + m.level)
      console.log('    TSV:', m.tsv)
      console.log('    OUR:', m.ours)
    }
    if (list.length > 5) console.log('  ... +' + (list.length - 5) + ' more')
    console.log('')
  }
  process.exit(1)
}
