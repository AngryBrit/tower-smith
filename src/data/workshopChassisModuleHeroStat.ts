/**
 * In-game-style primary stat line for module picker hero (e.g. x2.460 Tower Damage).
 */

import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import type { ResearchData } from '../types/research'
import type {
  WorkshopChassisModuleDef,
  WorkshopChassisModuleEffectTier,
  WorkshopChassisModuleMergeTier,
} from './workshopChassisModuleShared'

type WorkshopChassisModuleRarity =
  | WorkshopChassisModuleEffectTier
  | WorkshopChassisModuleMergeTier
import { WORKSHOP_MODULE_LEVEL_MAX } from './workshopSubmoduleCatalog'
import type { WorkshopAssistModuleSlot } from './workshopSimModules'

/** In-game cannon main-effect display: **×5** reference at Lv.0, scales to **×5×level/205** (≈×2.460 at Lv.101). */
const CANNON_TOWER_DAMAGE_HERO_BASE = 5
const CANNON_TOWER_DAMAGE_LEVEL_CAP = 205

/** In-game generator Coin Bonus main effect: **×1** at Lv.0 → **×1.640** at Lv.300 (+0.64 excess). */
const GENERATOR_COIN_BONUS_HERO_MAX_EXCESS = 0.64

/** In-game armor Tower Health main effect: **×4.2** at Lv.0, scales to **×2.270** at Lv.100. */
const ARMOR_TOWER_HEALTH_LEVEL_CAP = 185
const ARMOR_TOWER_HEALTH_HERO_BASE = 4.2

/** In-game core Ultimate Weapon Damage main effect: **×8** at Lv.0, scales to **×3.980** at Lv.101. */
const CORE_ULTIMATE_WEAPON_DAMAGE_HERO_BASE = 8
const CORE_ULTIMATE_WEAPON_DAMAGE_LEVEL_CAP = 203

export type WorkshopChassisModuleHeroStatContext = {
  moduleLevel: number
}

/** @deprecated Health card/lab are not stacked on the module-picker hero line. */
export function buildTowerHealthHeroStatContext(
  _ws: WorkshopPersistedV1,
  _research: ResearchData | null,
  _labOverrides: Record<string, number>,
  moduleLevel: number,
): WorkshopChassisModuleHeroStatContext {
  return { moduleLevel }
}

export function buildTowerDamageHeroStatContext(
  _ws: WorkshopPersistedV1,
  _research: ResearchData | null,
  _labOverrides: Record<string, number>,
  moduleLevel: number,
): WorkshopChassisModuleHeroStatContext {
  return { moduleLevel }
}

/** In-game mult hero line: floor to 2 decimals, always show 3 (e.g. 2.46 → 2.460). */
function formatMultHeroDisplay(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0'
  const floored = Math.floor(n * 100) / 100
  return floored.toFixed(3)
}

function formatHeroStatNumber(n: number): string {
  if (!Number.isFinite(n)) return '0'
  if (n >= 10_000) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  if (n >= 1000) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  const rounded = Math.round(n * 1000) / 1000
  return rounded.toFixed(3).replace(/\.?0+$/, '') || '0'
}

function clampModuleLevel(moduleLevel: number): number {
  return Math.max(0, Math.min(WORKSHOP_MODULE_LEVEL_MAX, moduleLevel))
}

/**
 * Cannon main-effect hero mult (module level only; not stacked with damage card/lab).
 * e.g. Lv.101 → 5×101/205 ≈ x2.460 Tower Damage for every cannon module.
 */
function towerDamageHeroMult(moduleLevel: number): number {
  const level = clampModuleLevel(moduleLevel)
  if (level <= 0) return CANNON_TOWER_DAMAGE_HERO_BASE
  return (CANNON_TOWER_DAMAGE_HERO_BASE * level) / CANNON_TOWER_DAMAGE_LEVEL_CAP
}

function formatTowerDamageHeroStat(moduleLevel: number): string {
  const level = clampModuleLevel(moduleLevel)
  const total = towerDamageHeroMult(level)
  const display = level > 0 ? formatMultHeroDisplay(total) : formatHeroStatNumber(total)
  return `x${display} Tower Damage`
}

/**
 * Generator Coin Bonus hero mult (module level only; same for every generator module).
 * e.g. Lv.60 → 1 + 0.64×60/300 = x1.128 Coin Bonus.
 */
function coinBonusHeroMult(moduleLevel: number): number {
  const level = clampModuleLevel(moduleLevel)
  if (level <= 0) return 1
  return 1 + (GENERATOR_COIN_BONUS_HERO_MAX_EXCESS * level) / WORKSHOP_MODULE_LEVEL_MAX
}

function formatCoinBonusHeroStat(moduleLevel: number): string {
  const total = coinBonusHeroMult(clampModuleLevel(moduleLevel))
  return `x${formatHeroStatNumber(total)} Coin Bonus`
}

/**
 * Armor Tower Health hero mult (module level only; not stacked with health card/lab).
 * e.g. Lv.100 → 4.2×100/185 ≈ x2.270 Tower Health for every armor module.
 */
function towerHealthHeroMult(moduleLevel: number): number {
  const level = clampModuleLevel(moduleLevel)
  if (level <= 0) return ARMOR_TOWER_HEALTH_HERO_BASE
  return (
    Math.floor((ARMOR_TOWER_HEALTH_HERO_BASE * level * 100) / ARMOR_TOWER_HEALTH_LEVEL_CAP) /
    100
  )
}

function formatTowerHealthHeroStat(moduleLevel: number): string {
  const level = clampModuleLevel(moduleLevel)
  const total = towerHealthHeroMult(level)
  const display = level > 0 ? formatMultHeroDisplay(total) : formatHeroStatNumber(total)
  return `x${display} Tower Health`
}

/**
 * Core Ultimate Weapon Damage hero mult (module level only; same for every core module).
 * e.g. Lv.101 → 8×101/203 ≈ x3.980 Ultimate Weapon Damage.
 */
function ultimateWeaponDamageHeroMult(moduleLevel: number): number {
  const level = clampModuleLevel(moduleLevel)
  if (level <= 0) return CORE_ULTIMATE_WEAPON_DAMAGE_HERO_BASE
  return (CORE_ULTIMATE_WEAPON_DAMAGE_HERO_BASE * level) / CORE_ULTIMATE_WEAPON_DAMAGE_LEVEL_CAP
}

function formatUltimateWeaponDamageHeroStat(moduleLevel: number): string {
  const level = clampModuleLevel(moduleLevel)
  const total = ultimateWeaponDamageHeroMult(level)
  const display = level > 0 ? formatMultHeroDisplay(total) : formatHeroStatNumber(total)
  return `x${display} Ultimate Weapon Damage`
}

export function formatWorkshopChassisModuleHeroStat(
  slot: WorkshopAssistModuleSlot,
  def: WorkshopChassisModuleDef,
  rarity: WorkshopChassisModuleRarity,
  context?: WorkshopChassisModuleHeroStatContext,
): string {
  const moduleLevel = context?.moduleLevel ?? 0

  if (slot === 'cannon') {
    return formatTowerDamageHeroStat(moduleLevel)
  }

  if (slot === 'armor') {
    return formatTowerHealthHeroStat(moduleLevel)
  }

  if (slot === 'generator') {
    return formatCoinBonusHeroStat(moduleLevel)
  }

  if (slot === 'core') {
    return formatUltimateWeaponDamageHeroStat(moduleLevel)
  }

  const _exhaustive: never = slot
  return _exhaustive
}
