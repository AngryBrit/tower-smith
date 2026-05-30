import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { touchWikiDataStamp } from './lib/wiki-data-stamp.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const wikiPath = path.join(
  process.env.USERPROFILE ?? '',
  '.cursor/projects/c-Users-venar-OneDrive-Documents-Dev-tower-export/agent-tools/325e927f-f3b1-4f57-9a0c-7c9c2675bd93.txt',
)
const text = fs.readFileSync(wikiPath, 'utf8')
const mult = { B: 1e9, T: 1e12, q: 1e15, Q: 1e18, s: 1e21 }

function parseCoin(s) {
  const m = s.trim().match(/^([\d.]+)([BTqQs])$/)
  if (!m) throw new Error(`bad coin: ${s}`)
  return parseFloat(m[1]) * mult[m[2]]
}

function section(name) {
  const i = text.indexOf(`#### ${name}`)
  const j = text.indexOf('#### ', i + 10)
  const block = j > 0 ? text.slice(i, j) : text.slice(i)
  const rows = [...block.matchAll(/\|\s*(\d+)\s*\|\s*[\d.]+x\s*\|\s*([\d.]+[BTqQs])\s*\|/g)]
  return rows.map((r) => parseCoin(r[2]))
}

function fmtNum(n) {
  if (n >= 1e18 && Math.abs(n % 1e15) < 1) {
    const v = Math.round((n / 1e15) * 100) / 100
    return `${v}e15`
  }
  if (n >= 1e15 && Math.abs(n % 1e12) < 1) {
    const v = Math.round((n / 1e12) * 100) / 100
    return `${v}e12`
  }
  if (n >= 1e12) {
    const v = Math.round((n / 1e12) * 100) / 100
    return `${v}e12`
  }
  if (n >= 1e9) {
    const v = Math.round((n / 1e9) * 100) / 100
    return `${v}e9`
  }
  return String(n)
}

function formatArray(nums, perLine = 8) {
  const lines = []
  for (let i = 0; i < nums.length; i += perLine) {
    lines.push(`  ${nums.slice(i, i + perLine).map(fmtNum).join(', ')},`)
  }
  return lines.join('\n')
}

const tier200 = section('Coin Bonus')
const free100 = section('Free Upgrades')
const skip60 = section('Enemy Level Skips')

function tier200File() {
  return `/**
 * Utility **Coin Bonus** / **Cells/Kill Bonus**: **200** levels, +0.01x per level to x3.00.
 * Per-level marginal **Coins** from wiki.
 */

export const WORKSHOP_ENHANCE_UTILITY_TIER_200_MAX_LEVEL = 200 as const

const MARGINAL_COINS: readonly number[] = [
${formatArray(tier200)}
]

export function workshopEnhanceUtilityTier200Multiplier(completedLevels: number): number {
  const L = Math.min(Math.max(0, completedLevels), WORKSHOP_ENHANCE_UTILITY_TIER_200_MAX_LEVEL)
  return Math.round((1 + 0.01 * L) * 100) / 100
}

export function workshopEnhanceUtilityTier200StatDisplay(completedLevels: number): string {
  return \`\${workshopEnhanceUtilityTier200Multiplier(completedLevels).toFixed(2)}×\`
}

export function workshopEnhanceUtilityTier200NextMarginalCoins(
  completedLevels: number,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_ENHANCE_UTILITY_TIER_200_MAX_LEVEL) {
    return undefined
  }
  return MARGINAL_COINS[completedLevels]
}
`
}

function free100File() {
  return `/**
 * Utility **Free Upgrades +**: **100** levels, +0.01x per level to x2.00.
 */

export const WORKSHOP_ENHANCE_FREE_UPGRADES_MAX_LEVEL = 100 as const

const MARGINAL_COINS: readonly number[] = [
${formatArray(free100)}
]

export function workshopEnhanceFreeUpgradesMultiplier(completedLevels: number): number {
  const L = Math.min(Math.max(0, completedLevels), WORKSHOP_ENHANCE_FREE_UPGRADES_MAX_LEVEL)
  return Math.round((1 + 0.01 * L) * 100) / 100
}

export function workshopEnhanceFreeUpgradesStatDisplay(completedLevels: number): string {
  return \`\${workshopEnhanceFreeUpgradesMultiplier(completedLevels).toFixed(2)}×\`
}

export function workshopEnhanceFreeUpgradesNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_ENHANCE_FREE_UPGRADES_MAX_LEVEL) {
    return undefined
  }
  return MARGINAL_COINS[completedLevels]
}
`
}

function skip60File() {
  return `/**
 * Utility **Enemy Level Skip +**: **60** levels, +0.01x per level to x1.60.
 */

export const WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_MAX_LEVEL = 60 as const

const MARGINAL_COINS: readonly number[] = [
${formatArray(skip60)}
]

export function workshopEnhanceEnemyLevelSkipMultiplier(completedLevels: number): number {
  const L = Math.min(Math.max(0, completedLevels), WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_MAX_LEVEL)
  return Math.round((1 + 0.01 * L) * 100) / 100
}

export function workshopEnhanceEnemyLevelSkipStatDisplay(completedLevels: number): string {
  return \`\${workshopEnhanceEnemyLevelSkipMultiplier(completedLevels).toFixed(2)}×\`
}

export function workshopEnhanceEnemyLevelSkipNextMarginalCoins(
  completedLevels: number,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_MAX_LEVEL) {
    return undefined
  }
  return MARGINAL_COINS[completedLevels]
}
`
}

const outDir = path.join(__dirname, '../src/data')
fs.writeFileSync(path.join(outDir, 'workshopEnhanceUtilityTier200.ts'), tier200File())
fs.writeFileSync(path.join(outDir, 'workshopEnhanceFreeUpgrades.ts'), free100File())
fs.writeFileSync(path.join(outDir, 'workshopEnhanceEnemyLevelSkip.ts'), skip60File())
console.log('ok', tier200.length, free100.length, skip60.length)
touchWikiDataStamp('gen-utility-enhance-coins')
