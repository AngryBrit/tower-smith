/**
 * Wiki **Cards** page: star tables (Lv.1–7), rarities, descriptions, slot gem costs.
 */

import type { WorkshopGameCardId } from './workshopGameCards'

export type WorkshopGameCardRarity = 'common' | 'rare' | 'epic'

export type WorkshopCardValueKind = 'mult' | 'percent' | 'addPercent' | 'sec' | 'min' | 'flat'

export type WorkshopGameCardWikiDef = {
  rarity: WorkshopGameCardRarity
  description: string
  kind: WorkshopCardValueKind
  /** Wiki Lv.1 … Lv.7 values. */
  stars: readonly [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ]
  /** Milestone gate (wiki); card still listed in inventory. */
  milestone?: string
}

/** Gem cost per slot index (slot 1 = free). */
export const WORKSHOP_CARD_SLOT_GEM_COSTS: readonly number[] = [
  0, 50, 100, 200, 300, 400, 500, 600, 750, 1000, 1200, 1400, 1600, 1800, 2500,
  3500, 4500, 5500, 6500, 7500, 8500, 10000,
] as const

export const WORKSHOP_CARD_MAX_SLOTS_GEMS = WORKSHOP_CARD_SLOT_GEM_COSTS.length
export const WORKSHOP_CARD_MAX_SLOTS_HARMONY = 28 as const
export const WORKSHOP_CARD_DEFAULT_EQUIP_SLOTS = 1 as const
export const WORKSHOP_CARD_PRESET_COUNT = 5 as const

export const WORKSHOP_GAME_CARD_WIKI: Record<
  WorkshopGameCardId,
  WorkshopGameCardWikiDef
> = {
  damage: {
    rarity: 'common',
    description: 'Increases Tower Damage by ×#',
    kind: 'mult',
    stars: [1.5, 2, 2.4, 2.8, 3.2, 3.6, 4],
  },
  attackSpeed: {
    rarity: 'common',
    description: 'Increases Attack Speed by ×#',
    kind: 'mult',
    stars: [1.25, 1.4, 1.55, 1.7, 1.85, 2, 2.15],
  },
  health: {
    rarity: 'common',
    description: 'Increases Tower Health by ×#',
    kind: 'mult',
    stars: [1.5, 2, 2.4, 2.8, 3.2, 3.6, 4],
  },
  healthRegen: {
    rarity: 'common',
    description: 'Increases Health Regen by ×# / sec',
    kind: 'mult',
    stars: [1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6],
  },
  range: {
    rarity: 'common',
    description: 'Increases Tower Range by ×#',
    kind: 'mult',
    stars: [1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45],
  },
  cash: {
    rarity: 'common',
    description: 'Increase all Cash earned by ×#',
    kind: 'mult',
    stars: [1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4],
  },
  coins: {
    rarity: 'common',
    description: 'Increase all Coins earned by ×#',
    kind: 'mult',
    stars: [1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45],
  },
  slowAura: {
    rarity: 'common',
    description: 'Reduces Enemy Speed in Range by #%',
    kind: 'percent',
    stars: [13, 16, 19, 22, 25, 28, 31],
  },
  criticalChance: {
    rarity: 'common',
    description: 'Increases critical chance by #%',
    kind: 'addPercent',
    stars: [5, 6, 7, 8, 9, 10, 11],
  },
  enemyBalance: {
    rarity: 'common',
    description:
      'Increases Enemy Spawns by ×# & Cash on Kill increased by ×#',
    kind: 'mult',
    stars: [1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9],
  },
  extraDefense: {
    rarity: 'common',
    description: 'Increases Defense Percent by #%',
    kind: 'addPercent',
    stars: [5, 6, 7, 8, 9, 10, 11],
  },
  fortress: {
    rarity: 'common',
    description: 'Increases Defense Absolute by ×#',
    kind: 'mult',
    stars: [1.3, 1.45, 1.6, 1.75, 1.9, 2.05, 2.2],
  },
  freeUpgrades: {
    rarity: 'rare',
    description: 'Increases Free Upgrade Chance by #%',
    kind: 'percent',
    stars: [4, 5, 6, 7, 8, 9, 10],
  },
  extraOrb: {
    rarity: 'rare',
    description:
      'Spawns a rotating Orb at # speed which instantly kills Common Enemies on contact',
    kind: 'flat',
    stars: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
  },
  plasmaCannon: {
    rarity: 'rare',
    description: 'Fires a Plasma Shot at the Boss, reducing Health by #%',
    kind: 'percent',
    stars: [30, 34, 38, 42, 46, 50, 54],
  },
  criticalCoin: {
    rarity: 'rare',
    description:
      'On Basic Enemy Crit Kill: Base 1 coin drop at a chance of #%',
    kind: 'percent',
    stars: [15, 18, 21, 24, 27, 30, 33],
  },
  waveSkip: {
    rarity: 'rare',
    description:
      'Gain a #% chance of skipping waves while still earning cash and coins equal to x1.10 the value of the wave enemies',
    kind: 'percent',
    stars: [9, 10, 11, 13, 15, 17, 19],
  },
  introSprint: {
    rarity: 'rare',
    description:
      'Skips 10 Waves at a time for the first # Waves (capped at your Highest Wave). Bosses spawn every Wave and no Coins are granted during Intro Sprint',
    kind: 'flat',
    stars: [20, 30, 40, 50, 60, 80, 100],
  },
  landMineStun: {
    rarity: 'rare',
    description:
      'Land Mines have a 40% chance to Stun for # (except Bosses)',
    kind: 'sec',
    stars: [1.4, 1.8, 2.2, 2.6, 3, 3.4, 3.8],
    milestone: 'Tier 7 Wave 250',
  },
  recoveryPackageChance: {
    rarity: 'rare',
    description: 'Increase Recovery package Chance by #%',
    kind: 'percent',
    stars: [15, 18, 21, 24, 27, 30, 33],
    milestone: 'Tier 2 Wave 750',
  },
  deathRay: {
    rarity: 'epic',
    description:
      'A powerful ray that destroys enemies on contact (except bosses), duration # sec',
    kind: 'sec',
    stars: [2.3, 2.7, 3.1, 3.5, 3.9, 4.4, 4.9],
  },
  energyNet: {
    rarity: 'epic',
    description: 'Fire a special net at a boss immobilizing it for # sec',
    kind: 'sec',
    stars: [2.5, 2.8, 3.1, 3.4, 3.7, 4, 4.3],
  },
  superTower: {
    rarity: 'epic',
    description:
      'Tower becomes super for 15 sec; damage ×# (30 sec cooldown)',
    kind: 'mult',
    stars: [2.5, 2.9, 3.3, 3.7, 4.1, 4.5, 5],
  },
  secondWind: {
    rarity: 'epic',
    description:
      'Revive the tower with half health once per round; invincible shield for # sec',
    kind: 'sec',
    stars: [10, 15, 20, 25, 30, 35, 40],
  },
  demonMode: {
    rarity: 'epic',
    description:
      'Once per round: Demon mode — ×3 damage and invincible for # sec',
    kind: 'sec',
    stars: [180, 200, 220, 240, 260, 280, 300],
  },
  energyShield: {
    rarity: 'epic',
    description: 'Shield ignores a single attack; replenishes after # min',
    kind: 'min',
    stars: [20, 18, 16, 14, 12, 10, 8],
  },
  waveAccelerator: {
    rarity: 'epic',
    description: 'Reduce the cooldown between waves by #%',
    kind: 'percent',
    stars: [30, 34, 38, 42, 46, 50, 54],
  },
  berserker: {
    rarity: 'epic',
    description:
      'Increase damage by #% of total damage absorbed this round (max ×8 tower damage)',
    kind: 'addPercent',
    stars: [0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4],
  },
  ultimateCrit: {
    rarity: 'epic',
    description:
      'Ultimate weapons gain a #% chance to deal critical damage at tower critical factor',
    kind: 'addPercent',
    stars: [1, 1.33, 1.66, 2, 2.33, 2.66, 3],
    milestone: 'Tier 14 Wave 50',
  },
  nuke: {
    rarity: 'epic',
    description: 'Destroys #% of enemies',
    kind: 'percent',
    stars: [25, 35, 45, 55, 65, 80, 100],
    milestone: 'Tier 11 Wave 10',
  },
  areaOfEffect: {
    rarity: 'epic',
    description:
      'Increase AoE damage for Inner Land Mine, Poison Swamp, Smart Missile, Flame Bot, and Land Mine by #%',
    kind: 'percent',
    stars: [5, 8, 11, 14, 17, 20, 25],
    milestone: 'Tier 20 Wave 80',
  },
}

export function workshopGameCardWiki(id: WorkshopGameCardId): WorkshopGameCardWikiDef {
  return WORKSHOP_GAME_CARD_WIKI[id]
}

/** Card detail % values omit a leading + (in-game copy). */
export const WORKSHOP_GAME_CARD_DETAIL_PLAIN_PERCENT: ReadonlySet<WorkshopGameCardId> = new Set([
  'criticalChance',
  'extraDefense',
])

export function workshopGameCardUsesDetailPlainPercent(id: WorkshopGameCardId): boolean {
  return WORKSHOP_GAME_CARD_DETAIL_PLAIN_PERCENT.has(id)
}

export function workshopGameCardStarValue(id: WorkshopGameCardId, stars: number): number | null {
  const s = Math.trunc(stars)
  if (s <= 0) return null
  const row = WORKSHOP_GAME_CARD_WIKI[id].stars
  if (s > row.length) return row[row.length - 1]!
  return row[s - 1]!
}

function formatNum(n: number, fixedDecimals?: number): string {
  if (fixedDecimals != null) return n.toFixed(fixedDecimals)
  if (Number.isInteger(n)) return String(n)
  const t = n.toFixed(2)
  return t.replace(/\.?0+$/, '')
}

function formatWorkshopGameCardEffectValue(
  id: WorkshopGameCardId,
  value: number,
  fixedDecimals?: number,
): string {
  const kind = WORKSHOP_GAME_CARD_WIKI[id].kind
  const num = formatNum(value, fixedDecimals)
  switch (kind) {
    case 'mult':
      return `×${num}`
    case 'percent':
      return `${num}%`
    case 'addPercent':
      return `+${num}%`
    case 'sec':
      return `${num}s`
    case 'min':
      return `${num}m`
    case 'flat':
      return num
    default:
      return num
  }
}

/** Card detail dialog: two decimals for ×/time values; trim .00 on % cards only. */
const WORKSHOP_GAME_CARD_DETAIL_INTEGER_FLAT: ReadonlySet<WorkshopGameCardId> = new Set([
  'introSprint',
])

const WORKSHOP_GAME_CARD_DETAIL_ONE_DECIMAL_SEC: ReadonlySet<WorkshopGameCardId> = new Set([
  'landMineStun',
])

export function workshopGameCardDetailFixedDecimals(
  id: WorkshopGameCardId,
): number | undefined {
  if (WORKSHOP_GAME_CARD_DETAIL_INTEGER_FLAT.has(id)) return undefined
  if (WORKSHOP_GAME_CARD_DETAIL_ONE_DECIMAL_SEC.has(id)) return 1
  const kind = WORKSHOP_GAME_CARD_WIKI[id].kind
  return kind === 'percent' || kind === 'addPercent' ? undefined : 2
}

/** Display string for the wiki Lv.N effect (stars 1…7). */
export function formatWorkshopGameCardStarEffect(
  id: WorkshopGameCardId,
  stars: number,
  fixedDecimals?: number,
): string {
  const v = workshopGameCardStarValue(id, stars)
  if (v == null) return ''
  return formatWorkshopGameCardEffectValue(id, v, fixedDecimals)
}

function formatExtraOrbSpeedForDetail(value: number): string {
  const t = value.toFixed(2)
  return t.startsWith('0.') ? t.slice(1) : t
}

/** Card detail star/% effect (plain % omits + for configured cards). */
function formatWorkshopGameCardDetailEffect(
  id: WorkshopGameCardId,
  stars: number,
  masteryMultiplier = 1,
  fixedDecimals?: number,
): string {
  const v = workshopGameCardStarValue(id, stars)
  if (v == null) return ''
  const mult =
    masteryMultiplier > 0 && Number.isFinite(masteryMultiplier) ? masteryMultiplier : 1
  const scaled = v * mult
  if (id === 'extraOrb') {
    return formatExtraOrbSpeedForDetail(scaled)
  }
  if (id === 'landMineStun') {
    return formatLandMineStunSecForSummary(scaled)
  }
  if (workshopGameCardUsesDetailPlainPercent(id)) {
    return `${formatNum(scaled, fixedDecimals)}%`
  }
  if (mult === 1) return formatWorkshopGameCardEffectValue(id, v, fixedDecimals)
  return formatWorkshopGameCardEffectValue(id, scaled, fixedDecimals)
}

function workshopExtraOrbDescriptionLine(
  stars: number,
  masteryMultiplier = 1,
): string {
  const speed = formatWorkshopGameCardDetailEffect(
    'extraOrb',
    stars,
    masteryMultiplier,
    workshopGameCardDetailFixedDecimals('extraOrb'),
  )
  if (!speed) return ''
  return `Spawns a rotating Orb at ${speed} speed which instantly kills Common Enemies on contact`
}

function formatLandMineStunSecForSummary(value: number): string {
  return `${value.toFixed(1)} sec`
}

function workshopLandMineStunDescriptionLine(
  stars: number,
  masteryMultiplier = 1,
): string {
  const v = workshopGameCardStarValue('landMineStun', stars)
  if (v == null) return ''
  const mult =
    masteryMultiplier > 0 && Number.isFinite(masteryMultiplier) ? masteryMultiplier : 1
  const stun = formatLandMineStunSecForSummary(v * mult)
  return `Land Mines have a 40% chance to Stun for ${stun} (except Bosses)`
}

/** Card detail dialog star effect (×/s/m keep two decimals; % omit trailing zeros). */
export function formatWorkshopGameCardStarEffectForDetail(
  id: WorkshopGameCardId,
  stars: number,
): string {
  return formatWorkshopGameCardDetailEffect(
    id,
    stars,
    1,
    workshopGameCardDetailFixedDecimals(id),
  )
}

/** Star effect scaled by Card Mastery tier (× labels from research). */
export function formatWorkshopGameCardStarEffectWithMastery(
  id: WorkshopGameCardId,
  stars: number,
  masteryMultiplier: number,
  fixedDecimals?: number,
): string {
  if (id === 'extraOrb') {
    return formatWorkshopGameCardDetailEffect(id, stars, masteryMultiplier, fixedDecimals)
  }
  const v = workshopGameCardStarValue(id, stars)
  if (v == null) return ''
  const mult =
    masteryMultiplier > 0 && Number.isFinite(masteryMultiplier) ? masteryMultiplier : 1
  if (mult === 1) return formatWorkshopGameCardEffectValue(id, v, fixedDecimals)
  return formatWorkshopGameCardEffectValue(id, v * mult, fixedDecimals)
}

/** Spawn multiplier lags cash-on-kill by one star tier (in-game Enemy Balance card). */
export function workshopEnemyBalanceSpawnStarValue(stars: number): number | null {
  const s = Math.trunc(stars)
  if (s <= 0) return null
  const row = WORKSHOP_GAME_CARD_WIKI.enemyBalance.stars
  const idx = s <= 1 ? 0 : Math.min(s - 2, row.length - 1)
  return row[idx]!
}

function workshopEnemyBalanceDescriptionLine(
  stars: number,
  masteryMultiplier = 1,
): string {
  const spawnV = workshopEnemyBalanceSpawnStarValue(stars)
  const cashV = workshopGameCardStarValue('enemyBalance', stars)
  if (spawnV == null || cashV == null) return ''
  const mult =
    masteryMultiplier > 0 && Number.isFinite(masteryMultiplier) ? masteryMultiplier : 1
  const spawnEffect = formatWorkshopGameCardEffectValue('enemyBalance', spawnV * mult)
  const cashEffect = formatWorkshopGameCardEffectValue(
    'enemyBalance',
    cashV * mult,
    workshopGameCardDetailFixedDecimals('enemyBalance'),
  )
  return `Increases Enemy Spawns by ${spawnEffect} & Cash on Kill increased by ${cashEffect}`
}

function workshopExtraDefenseDescriptionLine(
  stars: number,
  masteryMultiplier = 1,
): string {
  const v = workshopGameCardStarValue('extraDefense', stars)
  if (v == null) return ''
  const mult =
    masteryMultiplier > 0 && Number.isFinite(masteryMultiplier) ? masteryMultiplier : 1
  const num = formatNum(v * mult)
  return `Increases Defense Percent by ${num}%`
}

/** Wiki description with # replaced by the star effect (sentence case). */
export function workshopGameCardDescriptionLine(
  id: WorkshopGameCardId,
  stars: number,
  masteryMultiplier = 1,
  fixedDecimals?: number,
): string {
  if (id === 'enemyBalance') {
    return workshopEnemyBalanceDescriptionLine(stars, masteryMultiplier)
  }
  if (id === 'extraDefense') {
    return workshopExtraDefenseDescriptionLine(stars, masteryMultiplier)
  }
  if (id === 'extraOrb') {
    return workshopExtraOrbDescriptionLine(stars, masteryMultiplier)
  }
  if (id === 'landMineStun') {
    return workshopLandMineStunDescriptionLine(stars, masteryMultiplier)
  }
  const template = WORKSHOP_GAME_CARD_WIKI[id].description
  const effect = formatWorkshopGameCardDetailEffect(
    id,
    stars,
    masteryMultiplier,
    fixedDecimals,
  )
  let sentence: string
  if (template.includes('×#')) {
    sentence = template.replace('×#', effect)
  } else if (template.includes('+#%')) {
    sentence = template.replace('+#%', effect)
  } else if (template.includes('#%')) {
    sentence = template.replace('#%', effect)
  } else {
    sentence = template.replace('#', effect)
  }
  return sentence.charAt(0).toUpperCase() + sentence.slice(1)
}

/** Card detail dialog description line (×/s/m keep two decimals; % omit trailing zeros). */
export function workshopGameCardDescriptionLineForDetail(
  id: WorkshopGameCardId,
  stars: number,
  masteryMultiplier = 1,
): string {
  return workshopGameCardDescriptionLine(
    id,
    stars,
    masteryMultiplier,
    workshopGameCardDetailFixedDecimals(id),
  )
}

/** Berserker rate as fraction of damage taken (wiki % → sim). */
export function workshopBerserkerCardRateFromStars(stars: number): number {
  const v = workshopGameCardStarValue('berserker', stars)
  return v == null ? 0 : v / 100
}

export function clampWorkshopCardEquipSlots(n: number): number {
  if (!Number.isFinite(n)) return WORKSHOP_CARD_DEFAULT_EQUIP_SLOTS
  return Math.max(1, Math.min(WORKSHOP_CARD_MAX_SLOTS_HARMONY, Math.trunc(n)))
}

export function defaultCardPresetLoadouts(): WorkshopGameCardId[][] {
  return Array.from({ length: WORKSHOP_CARD_PRESET_COUNT }, () => [])
}

export function sanitizeCardPresetLoadouts(raw: unknown): WorkshopGameCardId[][] {
  const empty = defaultCardPresetLoadouts()
  if (!Array.isArray(raw)) return empty
  return empty.map((_, i) => {
    const row = raw[i]
    if (!Array.isArray(row)) return []
    const ids = new Set<WorkshopGameCardId>()
    const out: WorkshopGameCardId[] = []
    for (const item of row) {
      if (typeof item !== 'string') continue
      const id = item as WorkshopGameCardId
      if (!(id in WORKSHOP_GAME_CARD_WIKI) || ids.has(id)) continue
      ids.add(id)
      out.push(id)
    }
    return out
  })
}
