/**
 * Resolve equipped sub-module effect values from persisted selections + wiki catalog.
 */

import type { WorkshopAssistModuleSlot } from './workshopSimModules'
import {
  parseSubmoduleCellNumber,
  submoduleEffectId,
  WORKSHOP_SUBMODULE_SECTIONS,
} from './workshopSubmoduleCatalog'
import type { WorkshopSubmoduleRarity } from './workshopSubmoduleEffects'
import type {
  WorkshopSubmoduleBonusContext,
} from './workshopAssistSubmoduleScale'
import { scaleAssistSubmoduleValueForSlot } from './workshopAssistSubmoduleScale'
import type {
  WorkshopSubmoduleSelectionMap,
  WorkshopSubmoduleSelections,
  WorkshopSubmoduleSlotSelections,
} from './workshopSubmoduleSelection'
import type { WorkshopUltimateUpgradeKey } from './workshopUltimateData'

export type { WorkshopSubmoduleBonusContext } from './workshopAssistSubmoduleScale'

export type WorkshopAttackSubmoduleExtras = {
  critChancePercentPoints?: number
  critFactorAdd?: number
  attackRangeMetersAdd?: number
  damagePerMeterMultAdd?: number
  multishotChancePercentPoints?: number
  multishotTargetsCount?: number
  rapidFireChancePercentPoints?: number
  rapidFireDurationSeconds?: number
  bounceShotChancePercentPoints?: number
  bounceShotTargetsCount?: number
  bounceShotRangeMeters?: number
  superCritChancePercentPoints?: number
  superCritMultAdd?: number
  rendArmorChancePercentPoints?: number
  rendArmorMultAdd?: number
  maxRendArmorMultPercentPoints?: number
}

export type WorkshopDefenseSubmoduleExtras = {
  healthRegenPercentBonus?: number
  defensePercentPoints?: number
  defenseAbsolutePercentBonus?: number
  thornDamagePercentPoints?: number
  lifestealPercentPoints?: number
  knockbackChancePercentPoints?: number
  knockbackForceAdd?: number
  orbSpeedAdd?: number
  orbsCount?: number
  shockwaveSizeAdd?: number
  shockwaveFrequencySecondsReduction?: number
  landMineDamagePercentPoints?: number
  landMineChancePercentPoints?: number
  landMineRadiusAdd?: number
  deathDefyPercentPoints?: number
  wallHealthPercentPoints?: number
  wallRebuildSecondsReduction?: number
}

export type WorkshopUtilitySubmoduleExtras = {
  cashBonusAdd?: number
  cashPerWaveAdd?: number
  coinsKillBonusAdd?: number
  coinsWaveAdd?: number
  freeAttackUpgradePercentPoints?: number
  freeDefenseUpgradePercentPoints?: number
  freeUtilityUpgradePercentPoints?: number
  interestPerWavePercentPoints?: number
  recoveryAmountPercentPoints?: number
  maxRecoveryAdd?: number
  packageChancePercentPoints?: number
  enemyAttackSkipPercentPoints?: number
  enemyHealthSkipPercentPoints?: number
}

export type WorkshopSubmoduleBonuses = {
  attack: WorkshopAttackSubmoduleExtras
  defense: WorkshopDefenseSubmoduleExtras
  utility: WorkshopUtilitySubmoduleExtras
  ultimate: Partial<Record<WorkshopUltimateUpgradeKey, number>>
}

const EMPTY_ATTACK: WorkshopAttackSubmoduleExtras = {}
const EMPTY_DEFENSE: WorkshopDefenseSubmoduleExtras = {}
const EMPTY_UTILITY: WorkshopUtilitySubmoduleExtras = {}

/** Core sub-module row label → ultimate workshop upgrade key. */
const CORE_LABEL_TO_ULTIMATE_KEY: Record<string, WorkshopUltimateUpgradeKey> = {
  'Golden Tower - Bonus': 'goldenTowerBonusLevel',
  'Golden Tower - Duration [s]': 'goldenTowerDurationLevel',
  'Golden Tower - Cooldown [s]': 'goldenTowerCooldownLevel',
  'Black Hole - Size [m]': 'blackHoleSizeLevel',
  'Black Hole - Duration [s]': 'blackHoleDurationLevel',
  'Black Hole - Cooldown [s]': 'blackHoleCooldownLevel',
  'Spotlight - Bonus': 'spotlightBonusLevel',
  'Spotlight - Angle*': 'spotlightAngleLevel',
  'Chrono Field - Duration [s]*': 'chronoFieldDurationLevel',
  'Chrono Field - Speed Reduction [%]*': 'chronoFieldSlowLevel',
  'Chrono Field - Cooldown [s]*': 'chronoFieldCooldownLevel',
  'Death Wave - Damage [x]': 'deathWaveDamageLevel',
  'Death Wave - Quantity': 'deathWaveQuantityLevel',
  'Death Wave - Cooldown [s]': 'deathWaveCooldownLevel',
  'Smart Missiles - Damage': 'smartMissilesDamageLevel',
  'Smart Missiles - Quantity': 'smartMissilesQuantityLevel',
  'Smart Missiles - Cooldown [s]': 'smartMissilesCooldownLevel',
  'Inner Land Mines - Damage [x]': 'innerLandMinesDamageLevel',
  'Inner Land Mines - Quantity': 'innerLandMinesQuantityLevel',
  'Inner Land Mines - Cooldown [s]': 'innerLandMinesCooldownLevel',
  'Poison Swamp - Damage [x]': 'poisonSwampDamageLevel',
  'Poison Swamp - Duration [s]': 'poisonSwampDurationLevel',
  'Poison Swamp - Cooldown [s]': 'poisonSwampCooldownLevel',
  'Chain Lightning - Damage [x]': 'chainLightningDamageLevel',
  'Chain Lightning - Quantity': 'chainLightningQuantityLevel',
  'Chain Lightning - Chance [%]': 'chainLightningChanceLevel',
}

export function submoduleValueForEffectId(
  selections: WorkshopSubmoduleSelectionMap,
  slot: WorkshopAssistModuleSlot,
  effectId: string,
): number {
  const rarity = selections[effectId] as WorkshopSubmoduleRarity | undefined
  if (rarity == null) return 0
  const section = WORKSHOP_SUBMODULE_SECTIONS[slot]
  for (const row of section.rows) {
    if (submoduleEffectId(row.label) !== effectId) continue
    return parseSubmoduleCellNumber(row.cells[rarity]) ?? 0
  }
  return 0
}

function pick(
  selections: WorkshopSubmoduleSelectionMap,
  slot: WorkshopAssistModuleSlot,
  label: string,
): number {
  return submoduleValueForEffectId(selections, slot, submoduleEffectId(label))
}

function pickAssist(
  ctx: WorkshopSubmoduleBonusContext | undefined,
  slotSelections: WorkshopSubmoduleSlotSelections,
  slot: WorkshopAssistModuleSlot,
  label: string,
): number {
  const raw = pick(slotSelections.assist, slot, label)
  if (raw === 0) return 0
  if (ctx == null) return raw
  const effectId = submoduleEffectId(label)
  return scaleAssistSubmoduleValueForSlot(
    ctx.ws,
    slot,
    raw,
    effectId,
    ctx.research,
    ctx.labOverrides,
  )
}

function pickSlot(
  slotSelections: WorkshopSubmoduleSlotSelections,
  slot: WorkshopAssistModuleSlot,
  label: string,
  ctx?: WorkshopSubmoduleBonusContext,
): number {
  return pick(slotSelections.main, slot, label) + pickAssist(ctx, slotSelections, slot, label)
}

function buildAttackBonuses(
  slotSelections: WorkshopSubmoduleSlotSelections,
  ctx?: WorkshopSubmoduleBonusContext,
): WorkshopAttackSubmoduleExtras {
  const p = (label: string) => pickSlot(slotSelections, 'cannon', label, ctx)
  const bounceChance = p('Bounce Shot Chance')
  return {
    critChancePercentPoints: p('Crit Chance [%]') || undefined,
    critFactorAdd: p('Crit Factor') || undefined,
    attackRangeMetersAdd: p('Attack Range [m]') || undefined,
    // Workshop **Damage / Meter** card uses main cannon sub-module only (not assist copy).
    damagePerMeterMultAdd:
      submoduleValueForEffectId(
        slotSelections.main,
        'cannon',
        submoduleEffectId('Damage / Meter [m]'),
      ) || undefined,
    multishotChancePercentPoints: p('Multishot Chance [%]') || undefined,
    multishotTargetsCount: p('Multishot Targets') || undefined,
    rapidFireChancePercentPoints: p('Rapid Fire Chance [%]') || undefined,
    rapidFireDurationSeconds: p('Rapid Fire Duration') || undefined,
    bounceShotChancePercentPoints: bounceChance || undefined,
    bounceShotTargetsCount: p('Bounce Shot Targets') || undefined,
    bounceShotRangeMeters: p('Bounce Shot Range') || undefined,
    superCritChancePercentPoints: p('Super Crit Chance') || undefined,
    superCritMultAdd: p('Super Crit Multi') || undefined,
    rendArmorChancePercentPoints: p('Rend Armor Chance') || undefined,
    rendArmorMultAdd: p('Rend Armor Multi') || undefined,
    maxRendArmorMultPercentPoints: p('Max Rend Armor Multi') || undefined,
  }
}

function buildDefenseBonuses(
  slotSelections: WorkshopSubmoduleSlotSelections,
  ctx?: WorkshopSubmoduleBonusContext,
): WorkshopDefenseSubmoduleExtras {
  const p = (label: string) => pickSlot(slotSelections, 'armor', label, ctx)
  const shockFreq = p('Shockwave Frequency [s]')
  const wallRebuild = p('Wall Rebuild [s]')
  return {
    healthRegenPercentBonus: p('Health Regen [%]') || undefined,
    defensePercentPoints: p('Defense [%]') || undefined,
    defenseAbsolutePercentBonus: p('Defense Absolute [%]') || undefined,
    thornDamagePercentPoints: p('Thorns Damage') || undefined,
    lifestealPercentPoints: p('Lifesteal [%]') || undefined,
    knockbackChancePercentPoints: p('Knockback Chance [%]') || undefined,
    knockbackForceAdd: p('Knockback Force') || undefined,
    orbSpeedAdd: p('Orb Speed') || undefined,
    orbsCount: p('Orbs') || undefined,
    shockwaveSizeAdd: p('Shockwave Size') || undefined,
    shockwaveFrequencySecondsReduction:
      shockFreq !== 0 ? Math.abs(shockFreq) : undefined,
    landMineDamagePercentPoints: p('Land Mine Damage [%]') || undefined,
    landMineChancePercentPoints: p('Land Mine Chance [%]') || undefined,
    landMineRadiusAdd: p('Land Mine Radius') || undefined,
    deathDefyPercentPoints: p('Death Defy') || undefined,
    wallHealthPercentPoints: p('Wall Health [%]') || undefined,
    wallRebuildSecondsReduction:
      wallRebuild !== 0 ? Math.abs(wallRebuild) : undefined,
  }
}

function buildUtilityBonuses(
  slotSelections: WorkshopSubmoduleSlotSelections,
  ctx?: WorkshopSubmoduleBonusContext,
): WorkshopUtilitySubmoduleExtras {
  const p = (label: string) => pickSlot(slotSelections, 'generator', label, ctx)
  return {
    cashBonusAdd: p('Cash Bonus') || undefined,
    cashPerWaveAdd: p('Cash / Wave') || undefined,
    coinsKillBonusAdd: p('Coins / Kill Bonus') || undefined,
    coinsWaveAdd: p('Coins / Wave') || undefined,
    freeAttackUpgradePercentPoints: p('Free Attack Upgrade [%]') || undefined,
    freeDefenseUpgradePercentPoints: p('Free Defense Upgrade [%]') || undefined,
    freeUtilityUpgradePercentPoints: p('Free Utility Upgrade [%]') || undefined,
    interestPerWavePercentPoints: p('Interest / Wave [%]') || undefined,
    recoveryAmountPercentPoints: p('Recovery Amount [%]') || undefined,
    maxRecoveryAdd: p('Max Recovery') || undefined,
    packageChancePercentPoints: p('Package Chance [%]') || undefined,
    enemyAttackSkipPercentPoints: p('Enemy Attack Level Skip [%]') || undefined,
    enemyHealthSkipPercentPoints: p('Enemy Health Level Skip [%]') || undefined,
  }
}

function buildUltimateBonusesFromMap(
  selections: WorkshopSubmoduleSelectionMap,
  role: 'main' | 'assist',
  ctx?: WorkshopSubmoduleBonusContext,
): Partial<Record<WorkshopUltimateUpgradeKey, number>> {
  const out: Partial<Record<WorkshopUltimateUpgradeKey, number>> = {}
  for (const row of WORKSHOP_SUBMODULE_SECTIONS.core.rows) {
    const key = CORE_LABEL_TO_ULTIMATE_KEY[row.label]
    if (key == null) continue
    const effectId = submoduleEffectId(row.label)
    const raw = submoduleValueForEffectId(selections, 'core', effectId)
    if (raw === 0) continue
    const val =
      role === 'assist'
        ? ctx != null
          ? scaleAssistSubmoduleValueForSlot(
              ctx.ws,
              'core',
              raw,
              effectId,
              ctx.research,
              ctx.labOverrides,
            )
          : raw
        : raw
    if (val !== 0) out[key] = (out[key] ?? 0) + val
  }
  return out
}

function buildUltimateBonuses(
  slotSelections: WorkshopSubmoduleSlotSelections,
  ctx?: WorkshopSubmoduleBonusContext,
): Partial<Record<WorkshopUltimateUpgradeKey, number>> {
  const main = buildUltimateBonusesFromMap(slotSelections.main, 'main', ctx)
  const assist = buildUltimateBonusesFromMap(slotSelections.assist, 'assist', ctx)
  const out: Partial<Record<WorkshopUltimateUpgradeKey, number>> = { ...main }
  for (const [key, val] of Object.entries(assist) as [WorkshopUltimateUpgradeKey, number][]) {
    out[key] = (out[key] ?? 0) + val
  }
  return out
}

export function buildWorkshopSubmoduleBonuses(
  selections: WorkshopSubmoduleSelections,
  ctx?: WorkshopSubmoduleBonusContext,
): WorkshopSubmoduleBonuses {
  return {
    attack: buildAttackBonuses(selections.cannon, ctx),
    defense: buildDefenseBonuses(selections.armor, ctx),
    utility: buildUtilityBonuses(selections.generator, ctx),
    ultimate: buildUltimateBonuses(selections.core, ctx),
  }
}

/** Merged effect ids for UI (main + assist on one slot). Assist wins on duplicate keys. */
export function mergedSubmoduleSelectionMap(
  slotSelections: WorkshopSubmoduleSlotSelections,
): WorkshopSubmoduleSelectionMap {
  return { ...slotSelections.main, ...slotSelections.assist }
}

export function emptyWorkshopSubmoduleBonuses(): WorkshopSubmoduleBonuses {
  return {
    attack: { ...EMPTY_ATTACK },
    defense: { ...EMPTY_DEFENSE },
    utility: { ...EMPTY_UTILITY },
    ultimate: {},
  }
}

export function ultimateSubmoduleBonus(
  bonuses: WorkshopSubmoduleBonuses,
  key: WorkshopUltimateUpgradeKey,
): number {
  return bonuses.ultimate[key] ?? 0
}
