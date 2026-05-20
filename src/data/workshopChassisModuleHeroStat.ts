/**
 * In-game-style primary stat line for module picker hero (e.g. x2.460 Tower Damage).
 */

import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import type { ResearchData } from '../types/research'
import {
  mergeLabAndCardMult,
  workshopCardMultProduct,
} from './workshopCardWorkshopDisplay'
import {
  formatWorkshopChassisModuleAbility,
  formatWorkshopChassisModuleValue,
  resolveChassisModuleEffectTier,
  type WorkshopChassisModuleDef,
  type WorkshopChassisModuleEffectTier,
  type WorkshopChassisModuleMergeTier,
  type WorkshopChassisModuleValueKind,
} from './workshopChassisModuleShared'

type WorkshopChassisModuleRarity =
  | WorkshopChassisModuleEffectTier
  | WorkshopChassisModuleMergeTier
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'
import { buildWorkshopDefenseLabDisplayOpts } from './workshopLabDisplayOpts'
import { WORKSHOP_MODULE_LEVEL_MAX } from './workshopSubmoduleCatalog'
import type { WorkshopAssistModuleSlot } from './workshopSimModules'

/** Cannon proc mult scaling (≈5×101/205 → 2.46). */
const CANNON_PROC_MULT_LEVEL_CAP = 205

/** Armor wall-health module excess scaling (≈0.5×100/185 → 0.27 atop ×2 Health+). */
const ARMOR_HEALTH_MODULE_LEVEL_CAP = 185

export type WorkshopChassisModuleHeroStatContext = {
  moduleLevel: number
  /** Equipped Health card × Health lab (same as workshop Health row). */
  healthMult?: number
  /** Tower **Health +** enhancement (defense enhance tab). */
  enhanceHealthLevel?: number
  /** **Wall Health +** enhancement (defense enhance tab). */
  enhanceWallHealthLevel?: number
}

export function buildTowerHealthHeroStatContext(
  ws: WorkshopPersistedV1,
  research: ResearchData | null,
  labOverrides: Record<string, number>,
  moduleLevel: number,
): WorkshopChassisModuleHeroStatContext {
  const lab = buildWorkshopDefenseLabDisplayOpts(research, labOverrides)
  const card = workshopCardMultProduct(ws, research, labOverrides, 'health')
  const healthMult = mergeLabAndCardMult(lab?.healthLabMultiplier, card) ?? 1
  return {
    moduleLevel,
    healthMult,
    enhanceHealthLevel: ws.enhanceHealthLevel,
    enhanceWallHealthLevel: ws.enhanceWallHealthLevel,
  }
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

function towerHealthBaseMult(context?: WorkshopChassisModuleHeroStatContext): number {
  const fromCard = context?.healthMult ?? 1
  const fromEnhance = Math.max(
    workshopEnhanceTier400Multiplier(context?.enhanceHealthLevel ?? 0),
    workshopEnhanceTier400Multiplier(context?.enhanceWallHealthLevel ?? 0),
  )
  return Math.max(fromCard, fromEnhance)
}

function parseTowerDamageProcMult(
  def: WorkshopChassisModuleDef,
  rarity: WorkshopChassisModuleRarity,
): number | null {
  const text = formatWorkshopChassisModuleAbility(def, rarity)
  const match = text.match(/Tower Damage by (\d+(?:\.\d+)?)\s*x/i)
  if (!match) return null
  const n = Number(match[1])
  return Number.isFinite(n) ? n : null
}

function formatTowerDamageProcHeroStat(procMult: number, moduleLevel: number): string {
  const level = clampModuleLevel(moduleLevel)
  const scaled =
    level > 0 ? procMult * (level / CANNON_PROC_MULT_LEVEL_CAP) : procMult
  const display = level > 0 ? formatMultHeroDisplay(scaled) : formatHeroStatNumber(scaled)
  return `x${display} Tower Damage`
}

/**
 * In-game Tower Health hero mult: Health+ (or Wall Health+) × base plus level-scaled module excess.
 * e.g. ×2.00 Health card + ×1.5 Sharp Fortitude at module Lv.100 → x2.270.
 */
function towerHealthHeroMult(
  moduleMult: number,
  moduleLevel: number,
  context?: WorkshopChassisModuleHeroStatContext,
): number {
  const level = clampModuleLevel(moduleLevel)
  const moduleExcess = moduleMult - 1
  const scaledModule =
    level > 0 && moduleExcess > 0
      ? moduleExcess * (level / ARMOR_HEALTH_MODULE_LEVEL_CAP)
      : moduleExcess
  return towerHealthBaseMult(context) + scaledModule
}

function formatTowerHealthMultHeroStat(
  def: WorkshopChassisModuleDef,
  rarity: WorkshopChassisModuleRarity,
  context?: WorkshopChassisModuleHeroStatContext,
): string {
  const effect = resolveChassisModuleEffectTier(rarity)
  const total = towerHealthHeroMult(def.values[effect], context?.moduleLevel ?? 0, context)
  return `x${formatMultHeroDisplay(total)} Tower Health`
}

const SLOT_STAT_LABEL: Record<
  WorkshopAssistModuleSlot,
  Partial<Record<WorkshopChassisModuleValueKind, string>>
> = {
  cannon: {
    percent: 'Tower Damage',
    damageMult: 'Damage',
    mult: 'Tower Damage',
  },
  armor: {
    percent: 'Defense',
    damageMult: 'Damage',
    mult: 'Defense',
  },
  generator: {
    percent: 'Cash Bonus',
    seconds: 'Cooldown',
    addMeters: 'Bot Range',
    count: 'Utility',
  },
  core: {
    percent: 'Core Effect',
    mult: 'Core Effect',
    seconds: 'Cooldown',
    count: 'Core Effect',
  },
}

function formatGenericHeroStat(
  slot: WorkshopAssistModuleSlot,
  def: WorkshopChassisModuleDef,
  rarity: WorkshopChassisModuleRarity,
): string {
  const effect = resolveChassisModuleEffectTier(rarity)
  const value = formatWorkshopChassisModuleValue(def.kind, def.values[effect])
  const label = SLOT_STAT_LABEL[slot][def.kind] ?? 'Effect'
  if (def.kind === 'mult' || def.kind === 'damageMult') {
    const prefix = value.startsWith('×') || value.startsWith('x') ? '' : '×'
    return `${prefix}${value} ${label}`
  }
  return `${value} ${label}`
}

export function formatWorkshopChassisModuleHeroStat(
  slot: WorkshopAssistModuleSlot,
  def: WorkshopChassisModuleDef,
  rarity: WorkshopChassisModuleRarity,
  context?: WorkshopChassisModuleHeroStatContext,
): string {
  if (slot === 'cannon') {
    const procMult = parseTowerDamageProcMult(def, rarity)
    if (procMult != null) {
      return formatTowerDamageProcHeroStat(procMult, context?.moduleLevel ?? 0)
    }
    if (def.kind === 'percent') {
      return `${formatWorkshopChassisModuleValue(def.kind, def.values[resolveChassisModuleEffectTier(rarity)])} Tower Damage`
    }
  }

  if (slot === 'armor' && def.kind === 'mult') {
    return formatTowerHealthMultHeroStat(def, rarity, context)
  }

  return formatGenericHeroStat(slot, def, rarity)
}
