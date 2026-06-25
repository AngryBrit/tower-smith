import type { StringId } from '../i18n/dictionary'
import type { WorkshopRelicDef, WorkshopRelicRarity } from './workshopRelics'
import { workshopRelicDef, workshopRelicsForUnlockGroup } from './workshopRelics'

export type RelicStatUnit = 'percent' | 'meters' | 'seconds'

export type RelicStatId =
  | 'labSpeed'
  | 'botRange'
  | 'damage'
  | 'ultimateDamage'
  | 'attackSpeed'
  | 'critChance'
  | 'critFactor'
  | 'damagePerMeter'
  | 'superCritChance'
  | 'superCritMult'
  | 'rendArmorMult'
  | 'health'
  | 'healthRegen'
  | 'defensePercent'
  | 'defenseAbsolute'
  | 'thorns'
  | 'knockbackForce'
  | 'orbSpeed'
  | 'landMineDamage'
  | 'wallHealth'
  | 'wallRebuild'
  | 'cash'
  | 'coins'
  | 'freeAttackUpgrade'
  | 'freeDefenseUpgrade'
  | 'freeUtilityUpgrade'
  | 'recoveryAmount'
  | 'enemyAttackSkip'
  | 'enemyHealthSkip'

export type RelicStatGroupId = 'misc' | 'damage' | 'defense' | 'utility'

export type RelicStatDef = {
  id: RelicStatId
  group: RelicStatGroupId
  labelId: StringId
  unit: RelicStatUnit
}

export const RELIC_STAT_DEFS: readonly RelicStatDef[] = [
  { id: 'labSpeed', group: 'misc', labelId: 'ws_relics_stat_labSpeed', unit: 'percent' },
  { id: 'botRange', group: 'misc', labelId: 'ws_relics_stat_botRange', unit: 'meters' },
  { id: 'damage', group: 'damage', labelId: 'ws_relics_stat_damage', unit: 'percent' },
  { id: 'ultimateDamage', group: 'damage', labelId: 'ws_relics_stat_ultimateDamage', unit: 'percent' },
  { id: 'attackSpeed', group: 'damage', labelId: 'ws_relics_stat_attackSpeed', unit: 'percent' },
  { id: 'critChance', group: 'damage', labelId: 'ws_relics_stat_critChance', unit: 'percent' },
  { id: 'critFactor', group: 'damage', labelId: 'ws_relics_stat_critFactor', unit: 'percent' },
  { id: 'damagePerMeter', group: 'damage', labelId: 'ws_relics_stat_damagePerMeter', unit: 'percent' },
  { id: 'superCritChance', group: 'damage', labelId: 'ws_relics_stat_superCritChance', unit: 'percent' },
  { id: 'superCritMult', group: 'damage', labelId: 'ws_relics_stat_superCritMult', unit: 'percent' },
  { id: 'rendArmorMult', group: 'damage', labelId: 'ws_relics_stat_rendArmorMult', unit: 'percent' },
  { id: 'health', group: 'defense', labelId: 'ws_relics_stat_health', unit: 'percent' },
  { id: 'healthRegen', group: 'defense', labelId: 'ws_relics_stat_healthRegen', unit: 'percent' },
  { id: 'defensePercent', group: 'defense', labelId: 'ws_relics_stat_defensePercent', unit: 'percent' },
  { id: 'defenseAbsolute', group: 'defense', labelId: 'ws_relics_stat_defenseAbsolute', unit: 'percent' },
  { id: 'thorns', group: 'defense', labelId: 'ws_relics_stat_thorns', unit: 'percent' },
  { id: 'knockbackForce', group: 'defense', labelId: 'ws_relics_stat_knockbackForce', unit: 'percent' },
  { id: 'orbSpeed', group: 'defense', labelId: 'ws_relics_stat_orbSpeed', unit: 'percent' },
  { id: 'landMineDamage', group: 'defense', labelId: 'ws_relics_stat_landMineDamage', unit: 'percent' },
  { id: 'wallHealth', group: 'defense', labelId: 'ws_relics_stat_wallHealth', unit: 'percent' },
  { id: 'wallRebuild', group: 'defense', labelId: 'ws_relics_stat_wallRebuild', unit: 'seconds' },
  { id: 'cash', group: 'utility', labelId: 'ws_relics_stat_cash', unit: 'percent' },
  { id: 'coins', group: 'utility', labelId: 'ws_relics_stat_coins', unit: 'percent' },
  { id: 'freeAttackUpgrade', group: 'utility', labelId: 'ws_relics_stat_freeAttackUpgrade', unit: 'percent' },
  { id: 'freeDefenseUpgrade', group: 'utility', labelId: 'ws_relics_stat_freeDefenseUpgrade', unit: 'percent' },
  { id: 'freeUtilityUpgrade', group: 'utility', labelId: 'ws_relics_stat_freeUtilityUpgrade', unit: 'percent' },
  { id: 'recoveryAmount', group: 'utility', labelId: 'ws_relics_stat_recoveryAmount', unit: 'percent' },
  { id: 'enemyAttackSkip', group: 'utility', labelId: 'ws_relics_stat_enemyAttackSkip', unit: 'percent' },
  { id: 'enemyHealthSkip', group: 'utility', labelId: 'ws_relics_stat_enemyHealthSkip', unit: 'percent' },
] as const

export const RELIC_STAT_GROUP_ORDER: readonly RelicStatGroupId[] = [
  'misc',
  'damage',
  'defense',
  'utility',
]

const STAT_BY_ID = new Map<RelicStatId, RelicStatDef>(
  RELIC_STAT_DEFS.map((def) => [def.id, def]),
)

const STAT_PHRASE_TO_ID: readonly [string, RelicStatId][] = [
  ['lab speed', 'labSpeed'],
  ['bot range', 'botRange'],
  ['tower damage', 'damage'],
  ['damage / meter', 'damagePerMeter'],
  ['damage/meter', 'damagePerMeter'],
  ['ultimate damage', 'ultimateDamage'],
  ['attack speed', 'attackSpeed'],
  ['critical chance', 'critChance'],
  ['crit chance', 'critChance'],
  ['critical factor', 'critFactor'],
  ['crit factor', 'critFactor'],
  ['super critical chance', 'superCritChance'],
  ['super critical mult', 'superCritMult'],
  ['rend armor mult', 'rendArmorMult'],
  ['tower health', 'health'],
  ['health regen', 'healthRegen'],
  ['health earned', 'health'],
  ['health', 'health'],
  ['defense absolute', 'defenseAbsolute'],
  ['defence absolute', 'defenseAbsolute'],
  ['defense percent', 'defensePercent'],
  ['defense', 'defensePercent'],
  ['thorns', 'thorns'],
  ['knockback force', 'knockbackForce'],
  ['orb speed', 'orbSpeed'],
  ['land mine damage', 'landMineDamage'],
  ['wall health', 'wallHealth'],
  ['wall rebuild time', 'wallRebuild'],
  ['cash bonus', 'cash'],
  ['cash', 'cash'],
  ['coins earned', 'coins'],
  ['coins', 'coins'],
  ['coin', 'coins'],
  ['free attack upgrade', 'freeAttackUpgrade'],
  ['free defense upgrade', 'freeDefenseUpgrade'],
  ['free utility upgrade', 'freeUtilityUpgrade'],
  ['recovery amount time', 'recoveryAmount'],
  ['recovery amount', 'recoveryAmount'],
  ['enemy attack level skip', 'enemyAttackSkip'],
  ['enemy health skip', 'enemyHealthSkip'],
  ['enemy health level skip', 'enemyHealthSkip'],
  ['damage', 'damage'],
]

export type ParsedRelicEffect = {
  statId: RelicStatId
  value: number
  unit: RelicStatUnit
  sign: 1 | -1
}

export type RelicStatRow = {
  stat: RelicStatDef
  active: number
  total: number
  standard: number
  premium: number
  rareBonus: number | null
  epicBonus: number | null
  activeCount: number
  totalCount: number
}

export type RelicStatGroup = {
  groupId: RelicStatGroupId
  rows: RelicStatRow[]
}

function normalizePhrase(phrase: string): string {
  return phrase
    .toLowerCase()
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim()
}

function statIdFromPhrase(phrase: string): RelicStatId | null {
  const normalized = normalizePhrase(phrase)
  let best: RelicStatId | null = null
  let bestLen = -1
  for (const [key, id] of STAT_PHRASE_TO_ID) {
    if (normalized === key && key.length > bestLen) {
      best = id
      bestLen = key.length
    }
  }
  return best
}

export function parseWorkshopRelicEffect(description: string): ParsedRelicEffect | null {
  const text = description.trim()
  const withBy = text.match(
    /^(increase|decrease)\s+(.+?)\s+by\s+([\d.]+)(%|m|s)\s*$/i,
  )
  const withoutBy = text.match(/^(increase|decrease)\s+(.+?)\s+([\d.]+)(%|m|s)\s*$/i)
  const match = withBy ?? withoutBy
  if (!match) return null

  const sign = match[1]!.toLowerCase() === 'decrease' ? -1 : 1
  const statId = statIdFromPhrase(match[2]!)
  if (!statId) return null

  const unitSuffix = match[4]!.toLowerCase()
  const unit: RelicStatUnit =
    unitSuffix === 'm' ? 'meters' : unitSuffix === 's' ? 'seconds' : 'percent'
  const def = STAT_BY_ID.get(statId)!
  if (def.unit !== unit) return null

  return { statId, value: Number(match[3]), unit, sign }
}

export function isPremiumRelicUnlock(unlock: string): boolean {
  return /\bpremium\b/i.test(unlock)
}

function emptyRow(stat: RelicStatDef): RelicStatRow {
  return {
    stat,
    active: 0,
    total: 0,
    standard: 0,
    premium: 0,
    rareBonus: null,
    epicBonus: null,
    activeCount: 0,
    totalCount: 0,
  }
}

function rarityBonusForStat(
  relics: readonly WorkshopRelicDef[],
  statId: RelicStatId,
  rarity: WorkshopRelicRarity,
): number | null {
  let max: number | null = null
  for (const relic of relics) {
    if (relic.rarity !== rarity) continue
    const effect = parseWorkshopRelicEffect(relic.description)
    if (!effect || effect.statId !== statId) continue
    const signed = effect.value * effect.sign
    max = max == null ? signed : Math.max(max, signed)
  }
  return max
}

/** Sum signed owned-relic bonuses for one stat (percent points, meters, or seconds). */
export function workshopRelicsActiveBonus(
  ownedIds: ReadonlySet<string>,
  statId: RelicStatId,
): number {
  let sum = 0
  for (const id of ownedIds) {
    const relic = workshopRelicDef(id)
    if (!relic) continue
    const effect = parseWorkshopRelicEffect(relic.description)
    if (!effect || effect.statId !== statId) continue
    sum += effect.value * effect.sign
  }
  return sum
}

/** Owned relic % bonuses only (0 when stat uses meters/seconds). */
export function workshopRelicsActiveBonusPercent(
  ownedIds: ReadonlySet<string>,
  statId: RelicStatId,
): number {
  const def = STAT_BY_ID.get(statId)
  if (!def || def.unit !== 'percent') return 0
  return workshopRelicsActiveBonus(ownedIds, statId)
}

/** Relic stats summed into wiki displayed damage **(1 + Relics)**. */
export const WORKSHOP_RELIC_DISPLAYED_DAMAGE_STAT_IDS: readonly RelicStatId[] = [
  'damage',
  'damagePerMeter',
]

/**
 * Share of **Damage / Meter** relic % counted toward workshop **Displayed Damage**
 * **(1 + Relics)**. Flat tower-damage relics count at full weight; per-meter relics only
 * partially fold into the displayed Damage stat (the same asymmetry the displayed-damage
 * **Damage / Meter lab** uses).
 *
 * Calibrated against `playerInfo.dat`: +65% damage relics + +45% damage/meter relics →
 * in-game displayed Damage **21.03B** (vs ×1.40 raw DPM lab, ×1.92 damage lab, ×2.68 attack
 * speed lab). That requires the (1 + Relics) pool ≈ ×1.986, i.e. damage/meter relics
 * contribute ≈ 0.747 of their %.
 */
export const WORKSHOP_DISPLAYED_DAMAGE_DPM_RELIC_SHARE = 0.747

export function workshopRelicsDisplayedDamageBonusFraction(
  ownedIds: ReadonlySet<string>,
): number {
  const damage = workshopRelicsActiveBonusPercent(ownedIds, 'damage')
  const damagePerMeter = workshopRelicsActiveBonusPercent(ownedIds, 'damagePerMeter')
  return (damage + damagePerMeter * WORKSHOP_DISPLAYED_DAMAGE_DPM_RELIC_SHARE) / 100
}

/** Relic stats summed into wiki displayed health **(1 + Relics)**. */
export const WORKSHOP_RELIC_DISPLAYED_HEALTH_STAT_IDS: readonly RelicStatId[] = [
  'health',
  'healthRegen',
]

export function workshopRelicsDisplayedHealthBonusFraction(
  ownedIds: ReadonlySet<string>,
): number {
  let pct = 0
  for (const statId of WORKSHOP_RELIC_DISPLAYED_HEALTH_STAT_IDS) {
    pct += workshopRelicsActiveBonusPercent(ownedIds, statId)
  }
  return pct / 100
}

/**
 * Share of **Damage / Meter** relic % counted toward workshop **Displayed Attack Speed**
 * **(1 + Relics)**. In-game displayed attack speed uses attack-speed relics only; damage/meter
 * relics fold into displayed Damage instead (see {@link WORKSHOP_DISPLAYED_DAMAGE_DPM_RELIC_SHARE}).
 *
 * Calibrated against `playerInfo.dat`: +14% attack-speed relics, +45% damage/meter relics →
 * displayed Attack Speed **39.08** (relic term ×1.14, not ×1.1428).
 */
export const WORKSHOP_DISPLAYED_ATTACK_SPEED_DPM_RELIC_SHARE = 0

/** Summed relic % for displayed attack speed (attack speed + partial damage/meter). */
export function workshopRelicsDisplayedAttackSpeedBonusPercent(
  ownedIds: ReadonlySet<string>,
): number {
  const attackSpeed = workshopRelicsActiveBonusPercent(ownedIds, 'attackSpeed')
  const damagePerMeter = workshopRelicsActiveBonusPercent(ownedIds, 'damagePerMeter')
  if (damagePerMeter <= 0) return attackSpeed
  return attackSpeed + damagePerMeter * WORKSHOP_DISPLAYED_ATTACK_SPEED_DPM_RELIC_SHARE
}

export function workshopRelicsDisplayedAttackSpeedRelicMultiplier(
  ownedIds: ReadonlySet<string>,
): number {
  const pct = workshopRelicsDisplayedAttackSpeedBonusPercent(ownedIds)
  return pct > 0 ? 1 + pct / 100 : 1
}

export function workshopRelicsBonusTable(
  ownedIds: ReadonlySet<string>,
): RelicStatGroup[] {
  const relics = workshopRelicsForUnlockGroup('all')
  const rows = new Map<RelicStatId, RelicStatRow>(
    RELIC_STAT_DEFS.map((stat) => [stat.id, emptyRow(stat)]),
  )

  for (const relic of relics) {
    const effect = parseWorkshopRelicEffect(relic.description)
    if (!effect) continue
    const row = rows.get(effect.statId)
    if (!row) continue
    const signed = effect.value * effect.sign
    const premium = isPremiumRelicUnlock(relic.unlock)
    const owned = ownedIds.has(relic.id)

    row.total += signed
    row.totalCount++
    if (premium) row.premium += signed
    else row.standard += signed
    if (owned) {
      row.active += signed
      row.activeCount++
    }
  }

  for (const row of rows.values()) {
    row.rareBonus = rarityBonusForStat(relics, row.stat.id, 'rare')
    row.epicBonus = rarityBonusForStat(relics, row.stat.id, 'epic')
  }

  return RELIC_STAT_GROUP_ORDER.map((groupId) => ({
    groupId,
    rows: RELIC_STAT_DEFS.filter((stat) => stat.group === groupId)
      .map((stat) => rows.get(stat.id)!)
      .filter((row) => row.totalCount > 0),
  })).filter((group) => group.rows.length > 0)
}

export function formatRelicStatValue(value: number, unit: RelicStatUnit): string {
  if (unit === 'meters') return `${value}m`
  if (unit === 'seconds') return `${value}s`
  return `${value.toFixed(1)}%`
}
