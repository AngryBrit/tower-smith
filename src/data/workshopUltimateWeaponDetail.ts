/**
 * Ultimate Weapon detail dialog — flavor descriptions, stat interpolation, and lab enhancements.
 */

import type { StringId } from '../i18n/dictionary'
import {
  WORKSHOP_ULTIMATE_TRACKS,
  WORKSHOP_ULTIMATE_WEAPON_STATS,
  workshopUltimateMaxLevel,
  workshopUltimateStatDisplay,
  workshopUltimateStatValue,
  type WorkshopUltimateUpgradeKey,
  type WorkshopUltimateWeaponId,
} from './workshopUltimate'
import {
  benefitDisplayForCard,
  getEffectiveLevel,
  type ResearchData,
} from '../types/research'
import { workshopDisplayedAttackCritStats } from './workshopDisplayedAttackCrit'
import { workshopCardMasteryMultiplier } from './workshopCardMastery'
import { workshopGameCardStarValue } from './workshopGameCardWiki'
import { workshopEquippedCardStars } from './workshopGameCards'
import { workshopChassisModuleHeroStatMultiplier } from './workshopChassisModuleHeroStatWorkshop'
import { workshopRelicsUltimateDamageRelicMultiplier } from './workshopRelicStats'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'

export type UltimateWeaponEnhancementRow = {
  labName: string
  sectionIndex: number
  itemIndex: number
  level: number
  value: string
  locked: boolean
}

export type UltimateWeaponStatDetailRow = {
  key: WorkshopUltimateUpgradeKey
  stat: string
  current: string
  next: string | null
  maxed: boolean
}

export type WorkshopUltimateWeaponDetailConfig = {
  descId: StringId
  /** Stat keys whose display values fill `{0}`, `{1}`, `{2}` in the description template. */
  descStatKeys: readonly WorkshopUltimateUpgradeKey[]
  /**
   * Damage-multiple stat key shown in the description as a crit-scaled "Tower Damage" multiple
   * (e.g. `1398x`). Set only for damage-dealing weapons whose description ends in
   * "Tower Damage (scales with all Crit)". Undefined → description uses the raw stat display.
   */
  damageStatKey?: WorkshopUltimateUpgradeKey
  labNames: readonly string[]
}

export const WORKSHOP_ULTIMATE_WEAPON_DETAIL: Record<
  WorkshopUltimateWeaponId,
  WorkshopUltimateWeaponDetailConfig
> = {
  chainLightning: {
    descId: 'ws_uw_desc_chainLightning',
    descStatKeys: [
      'chainLightningChanceLevel',
      'chainLightningQuantityLevel',
      'chainLightningDamageLevel',
    ],
    damageStatKey: 'chainLightningDamageLevel',
    labNames: [
      'Chain Lightning Shock',
      'Shock Chance',
      'Shock Multiplier',
      'Chain Thunder',
      'Lightning Amplifier - Scatter',
    ],
  },
  smartMissiles: {
    descId: 'ws_uw_desc_smartMissiles',
    descStatKeys: ['smartMissilesQuantityLevel', 'smartMissilesDamageLevel'],
    damageStatKey: 'smartMissilesDamageLevel',
    labNames: [
      'Missile Despawn Time',
      'Missiles Explosion',
      'Missile Radius',
      'Missile Amplifier',
      'Missile Barrage',
      'Missile Barrage Quantity',
      'Recharge Missile Barrage',
    ],
  },
  deathWave: {
    descId: 'ws_uw_desc_deathWave',
    descStatKeys: ['deathWaveQuantityLevel', 'deathWaveDamageLevel'],
    damageStatKey: 'deathWaveDamageLevel',
    labNames: [
      'Death Wave Health',
      'Death Wave Coin Bonus',
      'Death Wave Cells Bonus',
      'Death Wave Damage Amplifier',
      'Death Wave Armor Stripping',
    ],
  },
  chronoField: {
    descId: 'ws_uw_desc_chronoField',
    descStatKeys: ['chronoFieldDurationLevel', 'chronoFieldSlowLevel'],
    labNames: [
      'Chrono Field Duration',
      'Chrono Field Damage Reduction',
      'Chrono Field Reduction %',
      'Chrono Field Range',
    ],
  },
  innerLandMines: {
    descId: 'ws_uw_desc_innerLandMines',
    descStatKeys: ['innerLandMinesQuantityLevel', 'innerLandMinesDamageLevel'],
    damageStatKey: 'innerLandMinesDamageLevel',
    labNames: [
      'Inner Mine Blast Radius',
      'Inner Mine Rotation Speed',
      'Inner Mine Stun',
      'Inner Land Mine - Chrono Jump',
    ],
  },
  goldenTower: {
    descId: 'ws_uw_desc_goldenTower',
    descStatKeys: ['goldenTowerDurationLevel', 'goldenTowerBonusLevel'],
    labNames: ['Golden Tower Bonus', 'Golden Tower Duration'],
  },
  poisonSwamp: {
    descId: 'ws_uw_desc_poisonSwamp',
    descStatKeys: ['poisonSwampDamageLevel', 'poisonSwampDurationLevel'],
    labNames: [
      'Swamp Radius',
      'Swamp Stun',
      'Swamp Stun Chance',
      'Swamp Stun Time',
      'Swamp Rend - Basic Enemies',
      'Swamp Rend - Additional Enemies',
    ],
  },
  blackHole: {
    descId: 'ws_uw_desc_blackHole',
    descStatKeys: ['blackHoleDurationLevel', 'blackHoleSizeLevel'],
    labNames: [
      'Black Hole Damage',
      'Extra Black Hole',
      'Black Hole Coin Bonus',
      'Black Hole Disable Ranged Enemies',
    ],
  },
  spotlight: {
    descId: 'ws_uw_desc_spotlight',
    descStatKeys: ['spotlightQuantityLevel', 'spotlightBonusLevel'],
    labNames: ['Spotlight Coin Bonus', 'Spotlight Missiles'],
  },
}

function ultimateWeaponResearchSectionIndex(data: ResearchData | null): number {
  if (!data) return -1
  return data.sections.findIndex((s) => s.sectionSlug === 'ultimate-weapon-research')
}

export function ultimateWeaponLabLevel(
  data: ResearchData | null,
  overrides: Record<string, number>,
  labName: string,
): number {
  const sectionIndex = ultimateWeaponResearchSectionIndex(data)
  if (sectionIndex < 0) return 0
  const itemIndex =
    data!.sections[sectionIndex]?.items.findIndex((i) => i.name === labName) ?? -1
  if (itemIndex < 0) return 0
  const item = data!.sections[sectionIndex]?.items[itemIndex]
  if (!item) return 0
  return getEffectiveLevel(sectionIndex, itemIndex, item, overrides)
}

export function ultimateWeaponEnhancementRows(
  weaponId: WorkshopUltimateWeaponId,
  data: ResearchData | null,
  overrides: Record<string, number>,
): readonly UltimateWeaponEnhancementRow[] {
  const config = WORKSHOP_ULTIMATE_WEAPON_DETAIL[weaponId]
  const sectionIndex = ultimateWeaponResearchSectionIndex(data)
  if (sectionIndex < 0) {
    return config.labNames.map((labName) => ({
      labName,
      sectionIndex: -1,
      itemIndex: -1,
      level: 0,
      value: '—',
      locked: true,
    }))
  }

  const section = data!.sections[sectionIndex]!
  return config.labNames.flatMap((labName) => {
    const itemIndex = section.items.findIndex((i) => i.name === labName)
    if (itemIndex < 0) return []
    const item = section.items[itemIndex]!
    const level = getEffectiveLevel(sectionIndex, itemIndex, item, overrides)
    const maxLevel = item.maxLevel ?? 0
    const value = benefitDisplayForCard(item, level, maxLevel)
    return [
      {
        labName,
        sectionIndex,
        itemIndex,
        level,
        value,
        locked: level <= 0,
      },
    ]
  })
}

export function workshopUltimateWeaponDescriptionLine(
  weaponId: WorkshopUltimateWeaponId,
  levels: Partial<Record<WorkshopUltimateUpgradeKey, number>>,
  template: string,
  statDisplayOverrides: Partial<Record<WorkshopUltimateUpgradeKey, string>> = {},
): string {
  const config = WORKSHOP_ULTIMATE_WEAPON_DETAIL[weaponId]
  let line = template
  config.descStatKeys.forEach((key, i) => {
    const level = levels[key] ?? 0
    const display = statDisplayOverrides[key] ?? workshopUltimateStatDisplay(key, level)
    line = line.replace(`{${i}}`, display)
  })
  return line
}

/**
 * Ultimate Crit card chance (fraction of 1) applied to a single ultimate-weapon hit. In-game only
 * the **Ultimate Crit** card lets ultimate weapons crit, and only while it is **equipped** in the
 * active card loadout — so this is `0` unless the card is equipped (≥1 star in the active loadout);
 * otherwise it is the card's star chance scaled by its Card Mastery tier.
 */
export function ultimateWeaponCritCardChanceFraction(
  workshop: WorkshopPersistedV1,
  researchData: ResearchData | null,
  labLevelOverrides: Record<string, number>,
): number {
  const stars = workshopEquippedCardStars(workshop, 'ultimateCrit')
  if (stars <= 0) return 0
  const base = workshopGameCardStarValue('ultimateCrit', stars)
  if (base == null) return 0
  const mastery = workshopCardMasteryMultiplier('ultimateCrit', researchData, labLevelOverrides)
  const pct = base * (mastery > 0 && Number.isFinite(mastery) ? mastery : 1)
  return pct / 100
}

/**
 * Core chassis module "Ultimate Weapon Damage" multiplier (e.g. Primordial Collapse at
 * `legendary_plus` L120 → `×5.500`). Applies to every damage-dealing ultimate weapon; `×1` when no
 * core module is equipped.
 */
export function ultimateWeaponCoreModuleMultiplier(workshop: WorkshopPersistedV1): number {
  return workshopChassisModuleHeroStatMultiplier(workshop, 'core')
}

/**
 * Workshop damage term after core chassis scaling, matching in-game rounding:
 * `round(base × core) + round(submoduleAdd × core)`.
 */
export function ultimateWeaponCoreScaledDamageSubtotal(
  base: number,
  submoduleAdd: number,
  coreMultiplier: number,
): number {
  if (coreMultiplier <= 1 + 1e-9) {
    return base + submoduleAdd
  }
  return Math.round(base * coreMultiplier) + Math.round(submoduleAdd * coreMultiplier)
}

/**
 * Harmony tree `Ultimate_Damage` benefit as a fraction (e.g. `0.0545` → +5.45%).
 * Save import does not decode harmony nodes yet — returns `0` until wired.
 */
export function ultimateWeaponHarmonyUltimateDamageFraction(
  _workshop: WorkshopPersistedV1,
): number {
  return 0
}

/**
 * Relic ultimate-damage multiplier from owned relics (`Relics.ultimateDamage` @ +0xd0).
 * Game starts at `1.0` and additively sums each unlocked relic's ultimate-damage %.
 */
export function ultimateWeaponRelicUltimateDamageMultiplier(
  ownedRelicIds: ReadonlySet<string>,
): number {
  return workshopRelicsUltimateDamageRelicMultiplier(ownedRelicIds)
}

/**
 * Global UW damage multiplier from `Main.GetChainLightningDamage`:
 * `(1 + harmony Ultimate_Damage) × relicUltimateDamageMult`.
 */
export function ultimateWeaponGlobalDamageMultiplier(
  workshop: WorkshopPersistedV1,
): number {
  const harmony = ultimateWeaponHarmonyUltimateDamageFraction(workshop)
  const relicMult = ultimateWeaponRelicUltimateDamageMultiplier(
    new Set(workshop.relicOwnedIds ?? []),
  )
  return (1 + harmony) * relicMult
}

/**
 * Crit-scaling multiplier the in-game ultimate-weapon "Tower Damage" multiple accounts for:
 * `(1 + CritFactor × UltimateCritChance) × (1 + SuperCritMult × SuperCritChance × UltimateCritChance)`.
 * Returns `1` when the Ultimate Crit card isn't equipped (no crit applies).
 */
export function ultimateWeaponCritDamageMultiplier(
  workshop: WorkshopPersistedV1,
  researchData: ResearchData | null,
  labLevelOverrides: Record<string, number>,
  gameResearchLevel?: readonly number[] | null,
): number {
  const ultimateCritChance = ultimateWeaponCritCardChanceFraction(
    workshop,
    researchData,
    labLevelOverrides,
  )
  if (ultimateCritChance <= 0) return 1
  const { criticalFactor, superCritMult, superCritChancePercent } = workshopDisplayedAttackCritStats(
    workshop,
    researchData,
    labLevelOverrides,
    gameResearchLevel,
  )
  const superCritChance = superCritChancePercent / 100
  const critTerm = 1 + criticalFactor * ultimateCritChance
  const superCritTerm = 1 + superCritMult * superCritChance * ultimateCritChance
  return critTerm * superCritTerm
}

/**
 * Combined build-level multiplier for in-game ultimate-weapon "Tower Damage" display:
 * `Core Module × Global UW × Crit`.
 */
export function ultimateWeaponBuildDamageMultiplier(
  workshop: WorkshopPersistedV1,
  researchData: ResearchData | null,
  labLevelOverrides: Record<string, number>,
  gameResearchLevel?: readonly number[] | null,
): number {
  const global = ultimateWeaponGlobalDamageMultiplier(workshop)
  const crit = ultimateWeaponCritDamageMultiplier(
    workshop,
    researchData,
    labLevelOverrides,
    gameResearchLevel,
  )
  return global * crit
}

/** In-game-style damage multiple for a weapon's damage stat (workshop card + detail dialog). */
export function workshopUltimateWeaponInGameDamageDisplay(
  damageStatKey: WorkshopUltimateUpgradeKey,
  level: number,
  submoduleAdd: number,
  workshop: WorkshopPersistedV1,
  researchData: ResearchData | null,
  labLevelOverrides: Record<string, number>,
  gameResearchLevel?: readonly number[] | null,
): string {
  const core = ultimateWeaponCoreModuleMultiplier(workshop)
  const buildMultiplier = ultimateWeaponBuildDamageMultiplier(
    workshop,
    researchData,
    labLevelOverrides,
    gameResearchLevel,
  )
  return workshopUltimateWeaponCritDamageDisplay(
    damageStatKey,
    level,
    submoduleAdd,
    core,
    buildMultiplier,
  )
}

/**
 * Crit-scaled "Tower Damage" multiple display (e.g. `1398x`) for a damage-dealing weapon.
 * Core scaling uses per-term rounding; `buildMultiplier` is global UW × crit (`×1` when none apply).
 */
export function workshopUltimateWeaponCritDamageDisplay(
  damageStatKey: WorkshopUltimateUpgradeKey,
  level: number,
  submoduleAdd: number,
  coreMultiplier: number,
  buildMultiplier: number,
): string {
  const base = workshopUltimateStatValue(damageStatKey, level)
  const subtotal = ultimateWeaponCoreScaledDamageSubtotal(base, submoduleAdd, coreMultiplier)
  const scaled = subtotal * buildMultiplier
  const rounded = scaled >= 100 ? Math.round(scaled) : Math.round(scaled * 10) / 10
  return `${rounded}x`
}

export function workshopUltimateWeaponStatDetailRows(
  weaponId: WorkshopUltimateWeaponId,
  levels: Partial<Record<WorkshopUltimateUpgradeKey, number>>,
  submoduleBonuses: Partial<Record<WorkshopUltimateUpgradeKey, number>> = {},
): readonly UltimateWeaponStatDetailRow[] {
  return WORKSHOP_ULTIMATE_WEAPON_STATS[weaponId].map(({ key, stat }) => {
    const level = levels[key] ?? 0
    const max = workshopUltimateMaxLevel(key)
    const maxed = level >= max
    const submoduleAdd = submoduleBonuses[key] ?? 0
    const current = workshopUltimateStatDisplay(key, level, submoduleAdd)
    const next =
      maxed
        ? null
        : workshopUltimateStatDisplay(key, level + 1, submoduleAdd)
    return { key, stat, current, next, maxed }
  })
}

/** Sanity check that every mapped lab exists in ultimate-weapon research. */
export function workshopUltimateWeaponDetailLabNamesValid(
  data: ResearchData,
): boolean {
  const sectionIndex = ultimateWeaponResearchSectionIndex(data)
  if (sectionIndex < 0) return false
  const names = new Set(data.sections[sectionIndex]!.items.map((i) => i.name))
  return Object.values(WORKSHOP_ULTIMATE_WEAPON_DETAIL).every((config) =>
    config.labNames.every((lab) => names.has(lab)),
  )
}

/** Exported for tests — verify stat keys exist in tracks. */
export function workshopUltimateWeaponDetailStatKeysValid(): boolean {
  return Object.values(WORKSHOP_ULTIMATE_WEAPON_DETAIL).every((config) =>
    config.descStatKeys.every((key) => key in WORKSHOP_ULTIMATE_TRACKS),
  )
}
