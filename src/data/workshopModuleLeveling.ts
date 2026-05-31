/**
 * Chassis module **Main Effect** leveling (wiki Modules → Main Effect / Cost).
 * Main stat scales with module level; sub-module slots unlock at 41, 101, 141, 161, 201, 241.
 */

import { WORKSHOP_MODULE_LEVEL_MAX } from './workshopSubmoduleCatalog'

export const WORKSHOP_MODULE_MAIN_EFFECT_INTRO =
  'The main effect will be an increase to tower damage, health, Coin Bonus or Ultimate Weapon damage based on the module type. This effect is the only effect that can be increased by leveling up the module. Leveling up modules to levels 41, 101, 141, 161, 201, and 241 unlock additional slots for sub-module effects.'

export type WorkshopModuleLevelWikiRow = {
  level: number
  marginalShards: number
  marginalCoins: number
  totalShards: number
  totalCoins: number
}

/** Wiki milestone rows (marginal = cost of the purchase that completes that level). */
export const WORKSHOP_MODULE_LEVEL_WIKI_ROWS: readonly WorkshopModuleLevelWikiRow[] = [
  { level: 1, marginalShards: 0, marginalCoins: 0, totalShards: 0, totalCoins: 0 },
  { level: 2, marginalShards: 7, marginalCoins: 10_000, totalShards: 14, totalCoins: 20_000 },
  { level: 11, marginalShards: 20, marginalCoins: 45_000, totalShards: 108, totalCoins: 210_000 },
  { level: 21, marginalShards: 40, marginalCoins: 120_000, totalShards: 353, totalCoins: 810_000 },
  { level: 31, marginalShards: 75, marginalCoins: 350_000, totalShards: 838, totalCoins: 2_540_000 },
  { level: 41, marginalShards: 120, marginalCoins: 1_000_000, totalShards: 1_708, totalCoins: 7_440_000 },
  { level: 51, marginalShards: 180, marginalCoins: 3_000_000, totalShards: 2_968, totalCoins: 19_440_000 },
  { level: 61, marginalShards: 250, marginalCoins: 25_000_000, totalShards: 4_838, totalCoins: 71_440_000 },
  { level: 71, marginalShards: 350, marginalCoins: 100_000_000, totalShards: 7_438, totalCoins: 396_440_000 },
  { level: 81, marginalShards: 500, marginalCoins: 350_000_000, totalShards: 11_088, totalCoins: 1_650_000_000 },
  { level: 91, marginalShards: 700, marginalCoins: 350_000_000, totalShards: 16_288, totalCoins: 5_150_000_000 },
  { level: 101, marginalShards: 1_000, marginalCoins: 8_000_000_000, totalShards: 23_588, totalCoins: 16_300_000_000 },
  { level: 111, marginalShards: 1_300, marginalCoins: 8_000_000_000, totalShards: 33_888, totalCoins: 96_300_000_000 },
  { level: 121, marginalShards: 1_800, marginalCoins: 32_000_000_000, totalShards: 47_388, totalCoins: 200_300_000_000 },
  { level: 131, marginalShards: 2_500, marginalCoins: 32_000_000_000, totalShards: 66_088, totalCoins: 520_300_000_000 },
  { level: 141, marginalShards: 3_000, marginalCoins: 500_000_000_000, totalShards: 91_588, totalCoins: 1_310_000_000_000 },
  { level: 151, marginalShards: 4_000, marginalCoins: 500_000_000_000, totalShards: 122_588, totalCoins: 6_310_000_000_000 },
  { level: 161, marginalShards: 5_000, marginalCoins: 10_000_000_000_000, totalShards: 163_588, totalCoins: 20_810_000_000_000 },
  { level: 171, marginalShards: 6_250, marginalCoins: 510_000_000_000_000, totalShards: 220_463, totalCoins: 2.87e15 },
  { level: 181, marginalShards: 7_500, marginalCoins: 1.01e15, totalShards: 289_838, totalCoins: 10.73e15 },
  { level: 191, marginalShards: 8_750, marginalCoins: 1.51e15, totalShards: 371_713, totalCoins: 23.57e15 },
  { level: 201, marginalShards: 10_000, marginalCoins: 2.5e15, totalShards: 592_588, totalCoins: 41.91e15 },
  { level: 221, marginalShards: 15_000, marginalCoins: 265e15, totalShards: 718_588, totalCoins: 2.02e18 },
  { level: 241, marginalShards: 20_000, marginalCoins: 1e18, totalShards: 1_071_088, totalCoins: 144.46e18 },
  { level: 261, marginalShards: 30_000, marginalCoins: 106e18, totalShards: 1_576_088, totalCoins: 804.46e18 },
  { level: 281, marginalShards: 40_000, marginalCoins: 411e18, totalShards: 2_281_088, totalCoins: 5.79e21 },
  { level: 300, marginalShards: 49_500, marginalCoins: 886e18, totalShards: 3_136_088, totalCoins: 18.07e21 },
]

const ANCHOR_LEVELS = WORKSHOP_MODULE_LEVEL_WIKI_ROWS.map((row) => row.level)
const ANCHOR_MARGINAL_SHARDS = WORKSHOP_MODULE_LEVEL_WIKI_ROWS.map((row) => row.marginalShards)
const ANCHOR_MARGINAL_COINS = WORKSHOP_MODULE_LEVEL_WIKI_ROWS.map((row) => row.marginalCoins)
const ANCHOR_TOTAL_SHARDS = WORKSHOP_MODULE_LEVEL_WIKI_ROWS.map((row) => row.totalShards)
const ANCHOR_TOTAL_COINS = WORKSHOP_MODULE_LEVEL_WIKI_ROWS.map((row) => row.totalCoins)

function logLerp(a: number, b: number, t: number): number {
  const u = Math.min(1, Math.max(0, t))
  if (a <= 0 || b <= 0) return a + u * (b - a)
  return Math.exp(Math.log(a) + u * (Math.log(b) - Math.log(a)))
}

function segmentIndex(level: number): number {
  if (level <= ANCHOR_LEVELS[0]!) return 0
  let i = 0
  while (i < ANCHOR_LEVELS.length - 1 && ANCHOR_LEVELS[i + 1]! < level) i += 1
  return i
}

function interpolateAnchor(
  level: number,
  anchors: readonly number[],
): number | undefined {
  if (level < ANCHOR_LEVELS[0]! || level > WORKSHOP_MODULE_LEVEL_MAX) return undefined
  const i = segmentIndex(level)
  const L0 = ANCHOR_LEVELS[i]!
  const L1 = ANCHOR_LEVELS[i + 1]!
  const v0 = anchors[i]!
  const v1 = anchors[i + 1]!
  if (level === L0) return v0
  if (level === L1) return v1
  if (L1 <= L0) return v0
  const t = (level - L0) / (L1 - L0)
  return logLerp(v0, v1, t)
}

/** Marginal shard cost for the purchase that completes `targetLevel` (L−1 → L). */
export function workshopModuleLevelMarginalShards(targetLevel: number): number | undefined {
  const value = interpolateAnchor(targetLevel, ANCHOR_MARGINAL_SHARDS)
  if (value == null) return undefined
  return Math.round(value)
}

/** Marginal coin cost for the purchase that completes `targetLevel` (L−1 → L). */
export function workshopModuleLevelMarginalCoins(targetLevel: number): number | undefined {
  return interpolateAnchor(targetLevel, ANCHOR_MARGINAL_COINS)
}

/** Cumulative shards spent to reach `level` (wiki **Total Shard**). */
export function workshopModuleLevelTotalShards(level: number): number | undefined {
  const value = interpolateAnchor(level, ANCHOR_TOTAL_SHARDS)
  if (value == null) return undefined
  return Math.round(value)
}

/** Cumulative coins spent to reach `level` (wiki **Total Coins**). */
export function workshopModuleLevelTotalCoins(level: number): number | undefined {
  return interpolateAnchor(level, ANCHOR_TOTAL_COINS)
}

export function workshopModuleNextMarginalShards(completedLevel: number): number | undefined {
  if (completedLevel < 0 || completedLevel >= WORKSHOP_MODULE_LEVEL_MAX) return undefined
  return workshopModuleLevelMarginalShards(completedLevel + 1)
}

export function workshopModuleNextMarginalCoins(completedLevel: number): number | undefined {
  if (completedLevel < 0 || completedLevel >= WORKSHOP_MODULE_LEVEL_MAX) return undefined
  return workshopModuleLevelMarginalCoins(completedLevel + 1)
}
