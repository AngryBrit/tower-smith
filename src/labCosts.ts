/**
 * Marginal lab costs and upgrade durations come from the bundled
 * `src/data/tower-labs.json` table (per lab, per target level: `COST`, `DURATION`). **Card Mastery**
 * rows still resolve through that table for durations and toolkit coin lookups; the **cost line** on
 * those cards uses `stoneUnlockCost` from `public/research/sections/card-mastery.json` instead of
 * abbreviated coin ladder amounts. Labs missing from the map show **—** in the app (no snapshot fallback).
 */

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

/** Display-name mismatches between our research JSON and Tower Data lab keys */
const LAB_NAME_ALIASES: Record<string, string> = {
  'Labs Speed': 'Lab Speed',
  // Legacy typo from game data / old exports; canonical key in tower-labs.json is Super Crit Multi
  'Super Crit Mult': 'Super Crit Multi',
  'Black Hole Coin Bonus': 'Blackhole Coin Bonus',
  'Lightning Amplifier - Scatter': 'Swamp Rend',
  'Extra Extra Orbs': 'Extra Inner Orbs',
  // Thunder / Amplify / Bot duration: same marginal table as Golden Bot - Duration
  'Thunder Bot - Linger Time': 'Golden Bot - Duration',
  'Thunder Bot Linger Time': 'Golden Bot - Duration',
  'Amplify Bot - Duration': 'Golden Bot - Duration',
  'Amp Bot - Duration': 'Golden Bot - Duration',
  'Amplify Bot Cooldown': 'Amplify Bot - Cooldown',
  'Amp Bot - Cooldown': 'Amplify Bot - Cooldown',
  'Amplify Bot Duration': 'Golden Bot - Duration',
  'Bot Bot - Duration': 'Golden Bot - Duration',
  'Bot Bot Duration': 'Golden Bot - Duration',
  'Bot Bot Cooldown': 'Bot Bot - Cooldown',
  'Gold Bot - Cooldown': 'Golden Bot - Cooldown',
  'Gold Bot - Duration': 'Golden Bot - Duration',
  'Thunder Bot Cooldown': 'Thunder Bot - Cooldown',
  'Ray Enemy Health': 'Ray Enemy Attack',
  'Vampire Enemy Attack': 'Ray Enemy Attack',
  'Vampire Enemy Health': 'Ray Enemy Attack',
  'Scatter Enemy Attack': 'Ray Enemy Attack',
  'Scatter Enemy Health': 'Ray Enemy Attack',
  // Assist Module labs (wiki): one shared marginal table for all eight variants
  'Assist Module Substats - Armor': 'Assist Module Substats - Cannon',
  'Assist Module Substats - Generator': 'Assist Module Substats - Cannon',
  'Assist Module Substats - Core': 'Assist Module Substats - Cannon',
  'Assist Module Bonus - Cannon': 'Assist Module Substats - Cannon',
  'Assist Module Bonus - Armor': 'Assist Module Substats - Cannon',
  'Assist Module Bonus - Generator': 'Assist Module Substats - Cannon',
  'Assist Module Bonus - Core': 'Assist Module Substats - Cannon',
  'Armor Effect Bans': 'Cannon Effect Bans',
  'Thorns Resistance': 'Knockback Resistance',
  'Orb Resistance': 'Knockback Resistance',
  'Plasma Cannon Resistance': 'Knockback Resistance',
  'Death Ray Resistance': 'Knockback Resistance',
  'Enemy Speed': 'Armored Enemies',
  'More Enemies': 'Armored Enemies',
  'Enemy Attack Speed': 'Armored Enemies',
  'Ranged Ultimate': 'Fast\'s Ultimate',
  'Boss\'s Ultimate': 'Fast\'s Ultimate',
  'Basic\'s Ultimate': 'Fast\'s Ultimate',
  'Tank\'s Ultimate': 'Fast\'s Ultimate',
  'Protector\'s Ultimate': 'Fast\'s Ultimate',
  'Death Defy Down': 'Ultimate Weapon Durations',
  'Energy Shields Down': 'Ultimate Weapon Durations',
  'Enemy Level Skip Reduction': 'Ultimate Weapon Durations',
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

function getToolkitLevelEntry(
  labDisplayName: string,
  targetLevel: number,
): ToolkitLabLevel | undefined {
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

/** Inverse of `formatCoinAbbrev` for snapshot strings like `12.91 M`, `300`, `1.1 q`, `2.18 s`. */
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

/** Abbreviated coin display (K/M/B/T/q/Q/s): always two decimals (e.g. `197.60 K`). */
export function formatCoinAbbrev(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n < 1e3) return n < 1 ? n.toFixed(2) : String(Math.round(n))
  const abs = n
  if (abs >= 1e21) return `${(n / 1e21).toFixed(2)} s`
  if (abs >= 1e18) return `${(n / 1e18).toFixed(2)} Q`
  // Wiki uses q (1e15) from ~0.1 q upward; 250 T = 0.25 q (Assist Module labs, etc.)
  if (abs >= 1e14) return `${(n / 1e15).toFixed(2)} q`
  if (abs >= 1e12) return `${(n / 1e12).toFixed(2)} T`
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)} B`
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)} M`
  if (abs >= 1e3) return `${(n / 1e3).toFixed(2)} K`
  return String(Math.round(n))
}

/**
 * Like `formatCoinAbbrev`, but keeps **T** through quintillion scale (skips **q**).
 * Workshop enhancement unlock hints use wiki “50T / 500T” wording.
 */
export function formatCoinAbbrevPreferT(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n < 1e3) return n < 1 ? n.toFixed(2) : String(Math.round(n))
  const abs = n
  if (abs >= 1e21) return `${(n / 1e21).toFixed(2)} s`
  if (abs >= 1e18) return `${(n / 1e18).toFixed(2)} Q`
  if (abs >= 1e12) return `${(n / 1e12).toFixed(2)} T`
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)} B`
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)} M`
  if (abs >= 1e3) return `${(n / 1e3).toFixed(2)} K`
  return String(Math.round(n))
}

/** Full power-stone amount for ultimate workshop cards (no K/M/B abbrev). */
export function formatPowerStoneAmount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—'
  return String(Math.round(n))
}
