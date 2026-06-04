/**
 * List researchLevel[id] > 0 in the player save field dump that have no import mapping.
 *
 * Reads:  docs/player-save-field-dump.json, or a raw playerInfo *.dat save
 * Writes: docs/research-level-unmapped.txt (each slot includes player-save-field-dump.json:line when that dump exists)
 *
 * Usage (from repo root):
 *   npx tsx docs/list-unmapped-research-levels.mjs
 *   npx tsx docs/list-unmapped-research-levels.mjs path/to/playerInfo.dat
 *   npx tsx docs/list-unmapped-research-levels.mjs path/to/dump.json path/to/output.txt
 *   npm run research-unmapped
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { decodePlayerInfoBytes } from '../src/playerSave/decodePlayerInfo.ts'
import { GAME_RESEARCH_ID_TO_MANIFEST_FLAT } from '../src/playerSave/gameResearchIndex.ts'
import { ATTACK_RESEARCH_LEVEL_ID_BY_LAB_NAME } from '../src/playerSave/gameAttackResearchMapping.ts'
import { MAIN_RESEARCH_LEVEL_ID_BY_LAB_NAME } from '../src/playerSave/gameMainResearchMapping.ts'
import { DEFENSE_RESEARCH_LEVEL_ID_BY_LAB_NAME } from '../src/playerSave/gameDefenseResearchMapping.ts'
import { UTILITY_RESEARCH_LEVEL_ID_BY_LAB_NAME } from '../src/playerSave/gameUtilityResearchMapping.ts'
import { ULTIMATE_RESEARCH_LEVEL_ID_BY_LAB_NAME } from '../src/playerSave/gameUltimateResearchMapping.ts'
import { CARDS_RESEARCH_LEVEL_ID_BY_LAB_NAME } from '../src/playerSave/gameCardsResearchMapping.ts'
import { PERKS_RESEARCH_LEVEL_ID_BY_LAB_NAME } from '../src/playerSave/gamePerksResearchMapping.ts'
import { MODULES_RESEARCH_LEVEL_ID_BY_LAB_NAME } from '../src/playerSave/gameModulesResearchMapping.ts'
import { ENEMIES_RESEARCH_LEVEL_ID_BY_LAB_NAME } from '../src/playerSave/gameEnemiesResearchMapping.ts'
import { CARD_MASTERY_RESEARCH_LEVEL_ID_BY_LAB_NAME } from '../src/playerSave/gameCardMasteryResearchMapping.ts'
import {
  BOT_COOLDOWN_RESEARCH_LEVEL_ID_BY_LAB_NAME,
  BOT_RESEARCH_LEVEL_ID_BY_LAB_NAME,
} from '../src/playerSave/gameBotLabMapping.ts'

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultDump = path.join(repoRoot, 'docs/player-save-field-dump.json')
const defaultOut = path.join(repoRoot, 'docs/research-level-unmapped.txt')

const dumpPath = path.resolve(process.argv[2] ?? defaultDump)
const outPath = path.resolve(process.argv[3] ?? defaultOut)

/** @param {string} text @param {number} index */
function lineNumberAt(text, index) {
  return text.slice(0, index).split('\n').length
}

/**
 * @param {string} text
 * @returns {{ levels: number[], lineById: number[], length: number, nonzeroCount: number, valuesBlockLine: number }}
 */
function parseResearchLevelValues(text) {
  const blockRe =
    /"researchLevel":\s*\{\s*"_type":\s*"ArraySinglePrimitive",\s*"length":\s*(\d+),\s*"nonzeroCount":\s*(\d+),\s*"values":\s*\[/
  const block = text.match(blockRe)
  if (!block) throw new Error('researchLevel ArraySinglePrimitive block not found in dump')
  const bracket = block.index + block[0].length - 1
  let depth = 0
  let end = bracket
  for (let i = bracket; i < text.length; i++) {
    if (text[i] === '[') depth++
    else if (text[i] === ']') {
      depth--
      if (depth === 0) {
        end = i + 1
        break
      }
    }
  }
  const levels = JSON.parse(text.slice(bracket, end))
  const valuesBlockLine = lineNumberAt(text, block.index)
  const baseLine = lineNumberAt(text, bracket)
  const body = text.slice(bracket + 1, end - 1)
  const lineById = []
  let id = 0
  let line = baseLine
  for (let i = 0; i < body.length && id < levels.length; i++) {
    const ch = body[i]
    if (ch === '\n') {
      line++
      continue
    }
    if (ch === ' ' || ch === ',' || ch === '\r') continue
    if (ch === '-' || (ch >= '0' && ch <= '9')) {
      lineById[id++] = line
      while (i + 1 < body.length && /[-0-9.eE+.]/.test(body[i + 1])) i++
      continue
    }
  }
  if (lineById.length !== levels.length) {
    throw new Error(
      `researchLevel line map mismatch: ${lineById.length} lines vs ${levels.length} values`,
    )
  }
  return {
    levels,
    lineById,
    length: Number(block[1]),
    nonzeroCount: Number(block[2]),
    valuesBlockLine,
  }
}

/**
 * Line numbers for each researchLevel[id] in docs/player-save-field-dump.json (if present).
 * @param {string} jsonDumpPath
 * @returns {{ lineById: number[], valuesBlockLine: number, dumpBase: string } | null}
 */
function loadJsonLineMap(jsonDumpPath) {
  if (!existsSync(jsonDumpPath) || jsonDumpPath.toLowerCase().endsWith('.dat')) {
    return null
  }
  try {
    const text = readFileSync(jsonDumpPath, 'utf8')
    const { lineById, valuesBlockLine } = parseResearchLevelValues(text)
    return { lineById, valuesBlockLine, dumpBase: path.basename(jsonDumpPath) }
  } catch {
    return null
  }
}

/** @param {string} datPath */
function loadDatMeta(datPath) {
  const raw = readFileSync(datPath)
  const bytes = raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw
  const levels = decodePlayerInfoBytes(bytes).researchLevel
  const nonzeroCount = levels.filter((lv) => lv > 0).length
  const jsonLines = loadJsonLineMap(defaultDump)
  return {
    levels,
    lineById: jsonLines?.lineById ?? levels.map((_, id) => id),
    length: levels.length,
    nonzeroCount,
    decodedAt: '',
    dumpBase: path.basename(datPath),
    valuesBlockLine: jsonLines?.valuesBlockLine ?? null,
    jsonDumpRef: jsonLines?.dumpBase ?? null,
    fromDat: true,
  }
}

/** @param {string} dumpPath */
function loadDumpMeta(dumpPath) {
  if (!existsSync(dumpPath)) {
    throw new Error(`Dump not found: ${dumpPath}`)
  }
  if (dumpPath.toLowerCase().endsWith('.dat')) {
    return loadDatMeta(dumpPath)
  }
  const text = readFileSync(dumpPath, 'utf8')
  let decodedAt = ''
  const decodedMatch = text.match(/"decodedAt":\s*"([^"]+)"/)
  if (decodedMatch) decodedAt = decodedMatch[1]
  const { levels, lineById, length, nonzeroCount, valuesBlockLine } =
    parseResearchLevelValues(text)
  const dumpBase = path.basename(dumpPath)
  return {
    levels,
    lineById,
    length,
    nonzeroCount,
    decodedAt,
    dumpBase,
    valuesBlockLine,
    jsonDumpRef: dumpBase,
    fromDat: false,
  }
}

/** @returns {Map<number, string[]>} */
function buildExplicitMap() {
  const explicit = new Map()
  /** @param {Record<string, number>} obj @param {string} section */
  function add(obj, section) {
    for (const [name, id] of Object.entries(obj)) {
      if (!explicit.has(id)) explicit.set(id, [])
      explicit.get(id).push(`${section}: ${name}`)
    }
  }
  add(ATTACK_RESEARCH_LEVEL_ID_BY_LAB_NAME, 'attack')
  add(MAIN_RESEARCH_LEVEL_ID_BY_LAB_NAME, 'main')
  add(DEFENSE_RESEARCH_LEVEL_ID_BY_LAB_NAME, 'defense')
  add(UTILITY_RESEARCH_LEVEL_ID_BY_LAB_NAME, 'utility')
  add(ULTIMATE_RESEARCH_LEVEL_ID_BY_LAB_NAME, 'ultimate')
  add(CARDS_RESEARCH_LEVEL_ID_BY_LAB_NAME, 'cards')
  add(PERKS_RESEARCH_LEVEL_ID_BY_LAB_NAME, 'perks')
  add(MODULES_RESEARCH_LEVEL_ID_BY_LAB_NAME, 'modules')
  add(BOT_COOLDOWN_RESEARCH_LEVEL_ID_BY_LAB_NAME, 'bots')
  add(BOT_RESEARCH_LEVEL_ID_BY_LAB_NAME, 'bots')
  add(ENEMIES_RESEARCH_LEVEL_ID_BY_LAB_NAME, 'enemies')
  add(CARD_MASTERY_RESEARCH_LEVEL_ID_BY_LAB_NAME, 'card-mastery')
  return explicit
}

/** @param {number[]} levels @param {number[]} lineById @param {string} dumpRef @param {Map<number, string[]>} explicit */
function analyze(levels, lineById, dumpRef, explicit) {
  const rows = []
  const unmapped = []
  for (let id = 0; id < levels.length; id++) {
    const lv = levels[id] ?? 0
    if (lv <= 0) continue
    const dumpLine = lineById[id]
    const flat = GAME_RESEARCH_ID_TO_MANIFEST_FLAT[id] ?? -1
    const labs = explicit.get(id)
    let status
    let detail = ''
    if (labs?.length) {
      status = 'explicit'
      detail = labs.join('; ')
    } else if (flat >= 0) {
      status = 'index'
      detail = `manifest flat ${flat}`
    } else {
      status = 'unmapped'
      unmapped.push({ id, lv, dumpLine })
    }
    rows.push({ id, lv, dumpLine, status, detail })
  }
  return { rows, unmapped, dumpRef }
}

/**
 * @param {{ dumpRef: string, line: number, id: number, fromDat: boolean, jsonDumpRef: string | null }} loc
 */
function dumpLoc({ dumpRef, line, id, fromDat, jsonDumpRef }) {
  if (jsonDumpRef && line > 0 && line !== id) {
    const json = `${jsonDumpRef}:${line}`
    if (fromDat) return `${json}  (${dumpRef} researchLevel[${id}])`
    return json
  }
  if (fromDat) return `${dumpRef} researchLevel[${id}]`
  return `${dumpRef}:${line}`
}

function formatReport({
  generatedAt,
  dumpPath,
  dumpRef,
  jsonDumpRef,
  valuesBlockLine,
  decodedAt,
  slotCount,
  dumpNonzeroCount,
  rows,
  unmapped,
  fromDat,
}) {
  const loc = (line, id) => dumpLoc({ dumpRef, line, id, fromDat, jsonDumpRef })
  const lines = []
  lines.push('researchLevel import coverage')
  lines.push('===========================')
  lines.push(`Generated: ${generatedAt}`)
  lines.push(`Dump: ${dumpPath}`)
  if (decodedAt) lines.push(`Dump decodedAt: ${decodedAt}`)
  lines.push(`Slots: ${slotCount} (game uses researchLevel[0..${slotCount - 1}])`)
  lines.push(`Nonzero in dump: ${rows.length} (dump header nonzeroCount: ${dumpNonzeroCount})`)
  lines.push(
    `Mapped for import: ${rows.length - unmapped.length} (explicit lab map and/or gameResearchIndex)`,
  )
  lines.push(`Unmapped (level > 0): ${unmapped.length}`)
  if (fromDat && jsonDumpRef && valuesBlockLine != null) {
    lines.push(`researchLevel values: decoded from ${dumpRef}`)
    lines.push(
      `JSON line refs: ${jsonDumpRef} (block ~line ${valuesBlockLine}, id N → values[N] on that line)`,
    )
  } else if (fromDat) {
    lines.push(`researchLevel values: decoded from ${dumpRef} (array index = researchLevel[id])`)
    lines.push(
      `JSON line refs: (none — regenerate ${path.basename(defaultDump)} for file:line locations)`,
    )
  } else {
    lines.push(
      `researchLevel values: ${dumpRef} (block ~line ${valuesBlockLine}, array id N → values[N] on its line)`,
    )
  }
  lines.push('')
  lines.push('Unmapped slots (not in gameResearchIndex, not in *BY_LAB_NAME maps)')
  lines.push('----------------------------------------------------------------')
  if (unmapped.length === 0) {
    lines.push('  (none)')
  } else {
    for (const { id, lv, dumpLine } of unmapped.sort((a, b) => a.id - b.id)) {
      lines.push(`  [${id}] = ${lv}  @ ${loc(dumpLine, id)}`)
    }
  }
  lines.push('')
  lines.push('All nonzero slots')
  lines.push('-----------------')
  for (const { id, lv, dumpLine, status, detail } of rows.sort((a, b) => a.id - b.id)) {
    const tag = status === 'unmapped' ? 'UNMAPPED' : status === 'explicit' ? 'explicit' : 'index'
    lines.push(`  [${id}] = ${lv}  @ ${loc(dumpLine, id)}  ${tag}${detail ? `  (${detail})` : ''}`)
  }
  lines.push('')
  lines.push('Regenerate dump: npx tsx scripts/regenerate-player-save-dump.mjs')
  lines.push('Regenerate report: npm run research-unmapped')
  return lines.join('\n') + '\n'
}

function main() {
  const explicit = buildExplicitMap()
  const {
    levels,
    lineById,
    length,
    nonzeroCount,
    decodedAt,
    dumpBase,
    valuesBlockLine,
    jsonDumpRef,
    fromDat,
  } = loadDumpMeta(dumpPath)
  const dumpRef = dumpBase
  const { rows, unmapped } = analyze(levels, lineById, dumpRef, explicit)
  const report = formatReport({
    generatedAt: new Date().toISOString(),
    dumpPath,
    dumpRef,
    jsonDumpRef: jsonDumpRef ?? null,
    valuesBlockLine,
    decodedAt,
    slotCount: length,
    dumpNonzeroCount: nonzeroCount,
    rows,
    unmapped,
    fromDat,
  })
  writeFileSync(outPath, report, 'utf8')
  console.log(`Wrote ${outPath}`)
  console.log(`  nonzero: ${rows.length}, unmapped: ${unmapped.length}`)
  if (unmapped.length > 0) {
    for (const { id, lv, dumpLine } of unmapped) {
      console.log(
        `  [${id}] = ${lv}  @ ${dumpLoc({ dumpRef, line: dumpLine, id, fromDat, jsonDumpRef: jsonDumpRef ?? null })}`,
      )
    }
  }
}

main()
