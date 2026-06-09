/**
 * Marginal lab costs and upgrade durations come from `tables/labs/` JSON (e.g. `main/`, `attack/`) when a lab has a GOD table
 * there (see {@link LAB_GOD_TABLES}), otherwise from bundled `src/data/tower-labs.json` (`COST`,
 * `DURATION`). **Card Mastery** rows still resolve through `tower-labs.json` for durations and toolkit
 * coin lookups; the **cost line** on those cards uses `stoneUnlockCost` from
 * `public/research/sections/card-mastery.json` instead of abbreviated coin ladder amounts. Labs missing
 * from both maps show **—** in the app (no snapshot fallback).
 *
 * Display: {@link formatCoinAbbrev} / {@link formatLabCoinDisplay} — **T** below 1 q (1e15), **q** from 1e15 up.
 */

import { labGodLevelEntry } from './data/labGodTables'
import towerLabsJson from './data/tower-labs.json'

export type ToolkitLabLevel = {
  DURATION: number
  COST: number
}

type ToolkitLabsFile = Record<
  string,
  Record<string, ToolkitLabLevel | undefined> | undefined
>

const towerLabs = towerLabsJson as ToolkitLabsFile

/** Legacy display-name → tower-labs.json key only (no shared GOD ladders). */
const LAB_NAME_ALIASES: Record<string, string> = {
  'Labs Speed': 'Lab Speed',
  'Super Crit Multi': 'Super Crit Mult',
  'Black Hole Coin Bonus': 'Blackhole Coin Bonus',
  'Extra Extra Orbs': 'Extra Inner Orbs',
}

function resolveToolkitLabKey(displayName: string): string | undefined {
  const trimmed = displayName.trim()
  if (towerLabs[trimmed]) return trimmed

  const mapped = LAB_NAME_ALIASES[trimmed]
  if (mapped && towerLabs[mapped]) return mapped

  if (trimmed.endsWith(' Mastery') && towerLabs['Card Mastery']) {
    return 'Card Mastery'
  }

  const lc = trimmed.toLowerCase()
  for (const k of Object.keys(towerLabs)) {
    if (k.toLowerCase() === lc) return k
  }

  return undefined
}

function getGodLevelEntry(
  labDisplayName: string,
  targetLevel: number,
): ToolkitLabLevel | undefined {
  const row = labGodLevelEntry(labDisplayName.trim(), targetLevel)
  if (!row) return undefined
  return { COST: row.coins, DURATION: row.time.seconds }
}

function getToolkitLevelEntry(
  labDisplayName: string,
  targetLevel: number,
): ToolkitLabLevel | undefined {
  const fromGod = getGodLevelEntry(labDisplayName, targetLevel)
  if (fromGod) return fromGod

  const key = resolveToolkitLabKey(labDisplayName)
  if (!key) return undefined

  const lab = towerLabs[key]
  if (!lab) return undefined

  return lab[String(targetLevel)]
}

/**
 * Raw coins for purchasing the upgrade from `currentLevel` → `currentLevel + 1`,
 * i.e. COST indexed by target lab level (same indexing as toolkit `labs.json`).
 */
export function toolkitMarginalCoinCost(
  labDisplayName: string,
  currentLevel: number,
): number | undefined {
  const entry = getToolkitLevelEntry(labDisplayName, currentLevel + 1)

  const cost = entry?.COST
  return typeof cost === 'number' && Number.isFinite(cost) ? cost : undefined
}

/**
 * Research time (seconds) for the upgrade `currentLevel` → `currentLevel + 1`,
 * i.e. DURATION at target lab level `currentLevel + 1`.
 */
export function toolkitUpgradeDurationSeconds(
  labDisplayName: string,
  currentLevel: number,
): number | undefined {
  const entry = getToolkitLevelEntry(labDisplayName, currentLevel + 1)
  const d = entry?.DURATION
  return typeof d === 'number' && Number.isFinite(d) ? d : undefined
}

/** Inverse of `formatCoinAbbrev` for snapshot strings like `12.91M`, `300`, `1.1q`, `2.18s`. */
export function parseAbbreviatedCoinsToNumber(input: string): number | undefined {
  const t = String(input).trim().replace(/,/g, '')
  if (!t || t === '—' || /^max$/i.test(t)) return undefined

  const m = /^([\d.]+)\s*([KkMmBbTtQqSs])?$/.exec(t.replace(/\s+/g, ' ').trim())
  if (!m) return undefined

  const n = Number(m[1])
  if (!Number.isFinite(n)) return undefined

  const rawSuf = m[2] ?? ''
  const suf = rawSuf.toLowerCase()
  const mult =
    suf === 'k'
      ? 1e3
      : suf === 'm'
        ? 1e6
        : suf === 'b'
          ? 1e9
          : suf === 't'
            ? 1e12
            : suf === 'q'
              ? rawSuf === 'Q'
                ? 1e18
                : 1e15
              : suf === 's'
                ? 1e21
                : 1

  const v = n * mult
  return Number.isFinite(v) ? v : undefined
}

export function isAssistModuleLabName(labDisplayName: string): boolean {
  const n = labDisplayName.trim()
  return (
    n.startsWith('Assist Module Substats - ') ||
    n.startsWith('Assist Module Bonus - ')
  )
}

/** @deprecated Alias for {@link formatCoinAbbrev}; Assist Module labs use the same T/q rules. */
export function formatAssistModuleLabCoinDisplay(n: number): string {
  return formatCoinAbbrev(n)
}

/** Lab / research coin display. */
export function formatLabCoinDisplay(n: number): string {
  return formatCoinAbbrev(n)
}

/**
 * Strip optional space before K/M/B/T/q/Q/s suffix (legacy snapshot strings).
 * Reformat coin amounts using {@link formatLabCoinDisplay}.
 */
export function normalizeCoinAbbrevDisplay(
  s: string,
  _opts?: { assistModuleLab?: boolean },
): string {
  const t = String(s).trim()
  if (!t || t === '—' || /^max$/i.test(t)) return t
  const compact = t.replace(/ (?=[KMBTqQs]$)/, '')
  const n = parseAbbreviatedCoinsToNumber(compact)
  if (n != null && n >= 1e12) {
    return formatLabCoinDisplay(n)
  }
  return compact
}

/**
 * Abbreviated coin display (K/M/B/T/q/Q/s): **T** below **1 q** (1e15), then **q** / **Q** / **s**.
 * Avoids `0.84q` for 840T; shows `1.00q` from 1e15 up.
 */
export function formatCoinAbbrev(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n === 0) return '0'
  if (n < 1e3) return n < 1 ? n.toFixed(2) : String(Math.round(n))
  const abs = n
  if (abs >= 1e21) return `${(n / 1e21).toFixed(2)}s`
  if (abs >= 1e18) return `${(n / 1e18).toFixed(2)}Q`
  if (abs >= 1e15) return `${(n / 1e15).toFixed(2)}q`
  if (abs >= 1e12) return `${(n / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `${(n / 1e3).toFixed(2)}K`
  return String(Math.round(n))
}

/** @deprecated Alias for {@link formatCoinAbbrev}; same T/q rules app-wide. */
export function formatCoinAbbrevPreferT(n: number): string {
  return formatCoinAbbrev(n)
}

/** Full power-stone amount for ultimate workshop cards (no K/M/B abbrev). */
export function formatPowerStoneAmount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—'
  return String(Math.round(n))
}
