#!/usr/bin/env node
/**
 * Validate workshop GOD table `value` rows against reverse-engineered binary formulas.
 *
 * Usage:
 *   npm run validate:workshop-binary
 *   npx tsx scripts/validate-workshop-binary-formulas.ts --levels 5820,5840
 *   npx tsx scripts/validate-workshop-binary-formulas.ts --tsv "H:/path/health-regen.tsv"
 *   npx tsx scripts/validate-workshop-binary-formulas.ts --strict --min-level 5000
 *
 * After re-scraping with full-precision values, import TSV → JSON then re-run without `--tsv`
 * to confirm committed GOD JSON matches the binary curve.
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseWorkshopValue } from './lib/parse-workshop-amount.mjs'
import {
  WORKSHOP_HEALTH_REGEN_DISPLAY_CALIBRATION,
  impliedHealthRegenDisplayEnhance,
  workshopBinaryHealthRegenBase,
  type WorkshopBinaryFloatMode,
} from '../src/data/workshopBinaryHealthRegenBase'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

type StatId = 'health-regen'

type StatConfig = {
  godName: string
  godPath: string
  binaryBase: (level: number, mode?: WorkshopBinaryFloatMode) => number
  binaryVa: string
  binaryGetter: string
}

const STAT_CONFIG: Record<StatId, StatConfig> = {
  'health-regen': {
    godName: 'Health Regen',
    godPath: 'tables/workshop/defense/health-regen.json',
    binaryBase: workshopBinaryHealthRegenBase,
    binaryVa: '0x15368B0',
    binaryGetter: 'Main::GetOutOfRoundHealthRegen',
  },
}

type GodLevelRow = { level: number; value: number | null; valueDisplay?: string }

function parseArgs(argv: string[]) {
  const out = {
    stat: 'health-regen' as StatId,
    levels: null as number[] | null,
    all: false,
    strict: false,
    tsv: '',
    maxRelPct: 0.15,
    minLevel: 500,
    floatMode: 'float32-pow' as WorkshopBinaryFloatMode,
    sampleEvery: 100,
    help: false,
  }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--stat') out.stat = (argv[++i] ?? out.stat) as StatId
    else if (a === '--levels') {
      out.levels = (argv[++i] ?? '').split(',').map(Number).filter(Number.isFinite)
    } else if (a === '--all') out.all = true
    else if (a === '--strict') {
      out.strict = true
      out.maxRelPct = 0.5
    } else if (a === '--tsv') {
      out.tsv = argv[++i] ?? ''
      out.strict = true
      out.maxRelPct = 0.01
      out.minLevel = 1
    } else if (a === '--max-rel-pct') out.maxRelPct = Number(argv[++i] ?? out.maxRelPct)
    else if (a === '--min-level') out.minLevel = Number(argv[++i] ?? out.minLevel)
    else if (a === '--float-mode') {
      out.floatMode = argv[++i] === 'float32-pow' ? 'float32-pow' : 'float64'
    } else if (a === '--sample-every') {
      out.sampleEvery = Math.max(1, Number(argv[++i] ?? out.sampleEvery))
    } else if (a === '--help' || a === '-h') out.help = true
  }
  return out
}

function loadGodLevels(config: StatConfig): GodLevelRow[] {
  const raw = JSON.parse(readFileSync(join(ROOT, config.godPath), 'utf8')) as {
    levels: GodLevelRow[]
  }
  return raw.levels
}

function loadTsvLevels(tsvPath: string): GodLevelRow[] {
  const text = readFileSync(tsvPath, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = text.split('\n').filter(Boolean)
  if (lines.length < 2) throw new Error(`TSV needs header + rows: ${tsvPath}`)
  const headers = lines[0]!.split('\t').map((h) => h.trim())
  const levelIdx = headers.indexOf('Level')
  const valueIdx = headers.indexOf('Value')
  if (levelIdx < 0 || valueIdx < 0) {
    throw new Error(`TSV needs Level and Value columns: ${tsvPath}`)
  }
  return lines.slice(1).map((line) => {
    const cols = line.split('\t')
    const level = Number(cols[levelIdx]?.trim())
    const rawValue = cols[valueIdx]?.trim() ?? ''
    const valueRow = parseWorkshopValue(rawValue)
    return {
      level,
      value: valueRow.value,
      valueDisplay: valueRow.valueDisplay ?? rawValue,
    }
  })
}

function relPctDelta(binary: number, actual: number | null): number {
  if (actual == null || !Number.isFinite(actual) || actual === 0) {
    return binary === 0 ? 0 : Infinity
  }
  return (Math.abs(binary - actual) / Math.abs(actual)) * 100
}

function formatB(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return `${(n / 1e9).toFixed(4)}B`
}

function compareRows(
  rows: GodLevelRow[],
  binaryBase: StatConfig['binaryBase'],
  floatMode: WorkshopBinaryFloatMode,
  label: string,
  minLevel: number,
) {
  const diffs = []
  let worst: (typeof diffs)[number] | null = null
  for (const row of rows) {
    if (row.level < minLevel || row.value == null || !Number.isFinite(row.value) || row.value <= 0) {
      continue
    }
    const binary = binaryBase(row.level, floatMode)
    const relPct = relPctDelta(binary, row.value)
    const abs = Math.abs(binary - row.value)
    const entry = { level: row.level, binary, actual: row.value, abs, relPct, display: row.valueDisplay }
    diffs.push(entry)
    if (!worst || entry.relPct > worst.relPct) worst = entry
  }
  return { label, diffs, worst, count: diffs.length }
}

function printComparison(result: ReturnType<typeof compareRows>, maxRelPct: number): number {
  const { label, diffs, worst, count } = result
  console.log(`\n=== ${label} (${count} levels) ===`)
  if (worst) {
    console.log(
      `worst: L${worst.level} binary=${formatB(worst.binary)} actual=${formatB(worst.actual)} ` +
        `Δabs=${worst.abs.toExponential(3)} Δrel=${worst.relPct.toFixed(4)}%` +
        (worst.display ? ` (display ${worst.display})` : ''),
    )
  }
  const over = diffs.filter((d) => d.relPct > maxRelPct)
  console.log(`levels over ${maxRelPct}% rel error: ${over.length}`)
  return over.length > 0 ? 1 : 0
}

function printSpotChecks(config: StatConfig, floatMode: WorkshopBinaryFloatMode, levels: number[]) {
  console.log(`\n--- spot check (${config.binaryGetter} @ ${config.binaryVa}, ${floatMode}) ---`)
  console.log('level | binary base   | GOD value     | Δrel%')
  const godLevels = loadGodLevels(config)
  for (const L of levels) {
    const binary = config.binaryBase(L, floatMode)
    const god = godLevels.find((r) => r.level === L)?.value
    const rel = relPctDelta(binary, god ?? null)
    console.log(
      `${String(L).padStart(5)} | ${formatB(binary).padStart(13)} | ${formatB(god ?? NaN).padStart(13)} | ${rel.toFixed(4)}`,
    )
  }
}

function printCalibrationEnhance(floatMode: WorkshopBinaryFloatMode) {
  const card = 2.6
  const relics = 0.97
  console.log(`\n--- displayed-regen enhance term (card×${card}, relics+${relics * 100}%, ${floatMode}) ---`)
  console.log('level | game B/s | implied enhance (binary base)')
  const terms: number[] = []
  for (const pt of WORKSHOP_HEALTH_REGEN_DISPLAY_CALIBRATION) {
    const enh = impliedHealthRegenDisplayEnhance({
      level: pt.level,
      gameDisplayPerSec: pt.gameDisplayPerSec,
      cardMultiplier: card,
      relicsBonusFraction: relics,
      floatMode,
    })
    terms.push(enh)
    console.log(
      `${pt.level} | ${(pt.gameDisplayPerSec / 1e9).toFixed(2)} | ${enh.toFixed(6)} (Regen+ tier ×${pt.regenPlusTier})`,
    )
  }
  const spread = Math.max(...terms) - Math.min(...terms)
  console.log(`spread across anchors: ${spread.toFixed(6)} (flat ≈1.4975 with binary base)`)
}

function main() {
  const args = parseArgs(process.argv)
  if (args.help) {
    console.log(`Usage: npx tsx scripts/validate-workshop-binary-formulas.ts [options]

Options:
  --stat <id>         Stat to validate (default: health-regen)
  --levels <n,n,...>  Spot-check specific levels against GOD JSON
  --all               Sample GOD levels (--sample-every) with --strict
  --strict            Fail when GOD levels exceed --max-rel-pct (default 0.5% for 2-decimal exports)
  --tsv <path>        Compare a full-precision TSV re-scrape (implies --strict, 0.01%)
  --max-rel-pct <n>   Fail threshold
  --min-level <n>     Skip GOD rows below this level in strict mode (default 500)
  --float-mode <m>    float64 | float32-pow (default float32-pow, bit-exact to game)
  --sample-every <n>  Level stride when using --all (default 100)
`)
    process.exit(0)
  }

  const config = STAT_CONFIG[args.stat]
  if (!config) {
    console.error(`Unknown --stat ${args.stat}. Known: ${Object.keys(STAT_CONFIG).join(', ')}`)
    process.exit(1)
  }

  console.log(`Binary oracle: ${config.binaryGetter} (${config.binaryVa})`)
  console.log(`GOD table: ${config.godPath}`)

  let failures = 0

  const defaultSpot = WORKSHOP_HEALTH_REGEN_DISPLAY_CALIBRATION.map((p) => p.level)
  printSpotChecks(config, args.floatMode, args.levels ?? [...defaultSpot])
  printCalibrationEnhance(args.floatMode)

  const godLevels = loadGodLevels(config)

  if (args.strict && args.all) {
    const sampled = godLevels.filter(
      (r) =>
        r.level >= args.minLevel &&
        (r.level % args.sampleEvery === 0 || r.level === godLevels.at(-1)?.level),
    )
    failures += printComparison(
      compareRows(
        sampled,
        config.binaryBase,
        args.floatMode,
        `GOD JSON sample every ${args.sampleEvery}`,
        args.minLevel,
      ),
      args.maxRelPct,
    )
  } else if (args.strict && !args.tsv) {
    const high = godLevels.filter((r) => r.level >= args.minLevel)
    failures += printComparison(
      compareRows(high, config.binaryBase, args.floatMode, `GOD JSON (L>=${args.minLevel})`, args.minLevel),
      args.maxRelPct,
    )
  }

  if (args.tsv) {
    if (!existsSync(args.tsv)) {
      console.error(`TSV not found: ${args.tsv}`)
      process.exit(1)
    }
    const tsvLevels = loadTsvLevels(args.tsv)
    failures += printComparison(
      compareRows(tsvLevels, config.binaryBase, args.floatMode, `TSV ${args.tsv}`, args.minLevel),
      args.maxRelPct,
    )
    failures += printComparison(
      compareRows(
        tsvLevels,
        config.binaryBase,
        'float32-pow',
        `TSV ${args.tsv} (float32-pow)`,
        args.minLevel,
      ),
      args.maxRelPct,
    )
  }

  console.log('')
  if (failures > 0) {
    console.error(`FAIL: ${failures} comparison group(s) had levels over ${args.maxRelPct}% vs binary.`)
    if (args.tsv) {
      console.error('Full-precision TSV should match the binary curve; fix scrape or formula.')
    } else {
      console.error('2-decimal GOD exports are expected to drift; re-scrape with full values or use --tsv.')
    }
    process.exit(1)
  }
  if (args.strict) {
    console.log('OK: binary formula within threshold.')
  } else {
    console.log('OK: spot checks complete (informational). Use --strict or --tsv for pass/fail gates.')
  }
  if (!args.tsv) {
    console.log('Re-scrape workflow: export full-precision TSV →')
    console.log('  npm run validate:workshop-binary -- --tsv <path>')
    console.log('  node scripts/import-workshop-god-tsv.mjs defense <dir>')
    console.log('  node scripts/sync-workshop-god-tables.mjs')
  }
}

main()
