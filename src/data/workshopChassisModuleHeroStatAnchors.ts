import {
  WORKSHOP_CHASSIS_MODULE_MAX_LEVEL_BY_MERGE,
  type WorkshopChassisModuleMergeTier,
} from './workshopChassisModuleShared'

export type WorkshopChassisModuleHeroStatSlot = 'cannon' | 'armor' | 'generator' | 'core'

/** DVT_Modules **Base stat** row (Lv.1 excess → display `1 + base`). */
export type WorkshopChassisModuleHeroStatBase = Record<
  WorkshopChassisModuleHeroStatSlot,
  number
>

/** DVT_Modules **Increase / lvl** bracket (applies from that module level upward). */
export type WorkshopChassisModuleHeroStatIncreaseBracket = {
  fromLevel: number
  cannon: number
  armor: number
  generator: number
  core: number
}

/** In-game main-effect mult at module merge max level (milli = ×1000). */
export type WorkshopChassisModuleHeroStatAnchor = {
  lv100Milli: number
}

const m100 = (lv100: number): WorkshopChassisModuleHeroStatAnchor => ({
  lv100Milli: Math.round(lv100 * 1000),
})

const baseRow = (
  cannon: number,
  generator: number,
  core: number,
): WorkshopChassisModuleHeroStatBase => ({
  cannon,
  armor: cannon,
  generator,
  core,
})

/**
 * Modules v6.1.2 — **DVT_Modules** tab (`Base stat` + `Increase / lvl`).
 * @see https://docs.google.com/spreadsheets/d/14lyOMBbO8WZd4q-lFvpeYHhJi1g-oJOA6jCEF6aQHkQ
 */
export const WORKSHOP_MODULE_HERO_STAT_BASE_BY_MERGE: Record<
  WorkshopChassisModuleMergeTier,
  WorkshopChassisModuleHeroStatBase
> = {
  rare: baseRow(0.032, 0.013, 0.06),
  rare_plus: baseRow(0.052, 0.016, 0.09),
  epic: baseRow(0.072, 0.019, 0.13),
  epic_plus: baseRow(0.102, 0.023, 0.16),
  legendary: baseRow(0.132, 0.026, 0.21),
  legendary_plus: baseRow(0.162, 0.029, 0.26),
  mythic: baseRow(0.202, 0.033, 0.31),
  mythic_plus: baseRow(0.252, 0.036, 0.36),
  ancestral: baseRow(0.302, 0.041, 0.41),
  star_1: baseRow(0.314, 0.043, 0.426),
  star_2: baseRow(0.326, 0.044, 0.443),
  star_3: baseRow(0.338, 0.046, 0.459),
  star_4: baseRow(0.35, 0.048, 0.476),
  star_5: baseRow(0.362, 0.049, 0.492),
}

/** DVT_Modules **Common** base-stat row (not a merge tier). */
export const WORKSHOP_MODULE_HERO_STAT_COMMON_BASE: WorkshopChassisModuleHeroStatBase = baseRow(
  0.012,
  0.011,
  0.04,
)

export const WORKSHOP_MODULE_HERO_STAT_INCREASE_BRACKETS: readonly WorkshopChassisModuleHeroStatIncreaseBracket[] =
  [
    { fromLevel: 1, cannon: 0.002, armor: 0.002, generator: 0.001, core: 0.01 },
    { fromLevel: 20, cannon: 0.004, armor: 0.004, generator: 0.001, core: 0.015 },
    { fromLevel: 30, cannon: 0.006, armor: 0.006, generator: 0.002, core: 0.02 },
    { fromLevel: 40, cannon: 0.008, armor: 0.008, generator: 0.003, core: 0.025 },
    { fromLevel: 60, cannon: 0.012, armor: 0.012, generator: 0.003, core: 0.03 },
    { fromLevel: 80, cannon: 0.03, armor: 0.03, generator: 0.004, core: 0.05 },
    { fromLevel: 100, cannon: 0.07, armor: 0.07, generator: 0.005, core: 0.08 },
    { fromLevel: 120, cannon: 0.1, armor: 0.1, generator: 0.006, core: 0.12 },
    { fromLevel: 140, cannon: 0.12, armor: 0.12, generator: 0.008, core: 0.15 },
    { fromLevel: 160, cannon: 0.2, armor: 0.2, generator: 0.01, core: 0.25 },
  ]

/** Cannon/armor share one Lv.100 column (Planner / in-game). */
export const WORKSHOP_CANNON_ARMOR_HERO_LV100_BY_MERGE: Partial<
  Record<WorkshopChassisModuleMergeTier, WorkshopChassisModuleHeroStatAnchor>
> = {
  epic: m100(1.37),
  epic_plus: m100(1.64),
  legendary: m100(2.27),
  legendary_plus: m100(2.3),
  mythic: m100(2.34),
  mythic_plus: m100(2.39),
  ancestral: m100(2.44),
  star_1: m100(2.498),
  star_2: m100(2.555),
  star_3: m100(2.613),
  star_4: m100(2.67),
  star_5: m100(2.728),
}

/** Generator Coin Bonus at module Lv.100 (Planner / Inventory anchors). */
export const WORKSHOP_GENERATOR_HERO_LV100_BY_MERGE: Partial<
  Record<WorkshopChassisModuleMergeTier, WorkshopChassisModuleHeroStatAnchor>
> = {
  epic: m100(1.128),
  epic_plus: m100(1.192),
  legendary: m100(1.275),
  legendary_plus: m100(1.278),
  mythic: m100(1.282),
  mythic_plus: m100(1.285),
  ancestral: m100(1.29),
  star_1: m100(1.302),
  star_2: m100(1.313),
  star_3: m100(1.325),
  star_4: m100(1.336),
  star_5: m100(1.348),
}

/** Effective Paths level checkpoints (milli) for generator Coin Bonus above Lv.100. */
type WorkshopGeneratorLevelAnchor = { level: number; milli: number }

/** Effective Paths single-level overrides (post-L100 path ≠ sheet). */
const WORKSHOP_GENERATOR_LEVEL_OVERRIDE_MILLI_BY_MERGE: Partial<
  Record<WorkshopChassisModuleMergeTier, Readonly<Record<number, number>>>
> = {
  star_1: { 218: 2300 },
  star_2: { 239: 2568 },
}

const WORKSHOP_GENERATOR_LEVEL_ANCHORS_BY_MERGE: Partial<
  Record<WorkshopChassisModuleMergeTier, readonly WorkshopGeneratorLevelAnchor[]>
> = {
  star_2: [
    { level: 160, milli: 1724 },
    { level: 240, milli: 2588 },
  ],
  star_3: [
    { level: 160, milli: 1750 },
    { level: 260, milli: 2870 },
  ],
  star_4: [
    { level: 200, milli: 2241 },
    { level: 280, milli: 3169 },
  ],
  star_5: [
    { level: 200, milli: 2284 },
    { level: 300, milli: 3484 },
  ],
}

export const WORKSHOP_CORE_HERO_LV100_BY_MERGE: Partial<
  Record<WorkshopChassisModuleMergeTier, WorkshopChassisModuleHeroStatAnchor>
> = {
  epic: m100(2.17),
  epic_plus: m100(2.8),
  legendary: m100(3.85),
  legendary_plus: m100(3.9),
  mythic: m100(3.95),
  mythic_plus: m100(4),
  ancestral: m100(4.05),
  star_1: m100(4.172),
  star_2: m100(4.294),
  star_3: m100(4.416),
  star_4: m100(4.538),
  star_5: m100(4.66),
}

const HERO_STAT_LINEAR_HIGH = 100
const HERO_STAT_LINEAR_SPAN = HERO_STAT_LINEAR_HIGH - 1
const MILLI_SCALE = 1000

const MERGE_TIERS_WITH_LV100_ANCHOR = new Set<WorkshopChassisModuleMergeTier>([
  'epic',
  'epic_plus',
  'legendary',
  'legendary_plus',
  'mythic',
  'mythic_plus',
  'ancestral',
  'star_1',
  'star_2',
  'star_3',
  'star_4',
  'star_5',
])

/** Ancestral 1★–5★: post-L100 growth scales with Lv.100−Lv.1 span vs Mythic+. */
const STAR_MERGE_TIERS = new Set<WorkshopChassisModuleMergeTier>([
  'star_1',
  'star_2',
  'star_3',
  'star_4',
  'star_5',
])

function increaseAtLevel(
  slot: WorkshopChassisModuleHeroStatSlot,
  level: number,
): number {
  let inc = WORKSHOP_MODULE_HERO_STAT_INCREASE_BRACKETS[0]![slot]
  for (const bracket of WORKSHOP_MODULE_HERO_STAT_INCREASE_BRACKETS) {
    if (level >= bracket.fromLevel) inc = bracket[slot]
  }
  return inc
}

/** Increment gained when leveling up **to** `level` (uses bracket active at `level - 1`). */
function increaseOnLevelUp(
  slot: WorkshopChassisModuleHeroStatSlot,
  level: number,
): number {
  if (level <= 1) return 0
  return increaseAtLevel(slot, level - 1)
}

function tieredIncreaseMilli(
  slot: WorkshopChassisModuleHeroStatSlot,
  fromLevel: number,
  toLevel: number,
): number {
  if (toLevel < fromLevel) return 0
  let sumMilli = 0
  for (let level = fromLevel; level <= toLevel; level += 1) {
    sumMilli += Math.round(increaseOnLevelUp(slot, level) * MILLI_SCALE)
  }
  return sumMilli
}

function lv1Milli(
  slot: WorkshopChassisModuleHeroStatSlot,
  merge: WorkshopChassisModuleMergeTier,
): number {
  const baseStat = WORKSHOP_MODULE_HERO_STAT_BASE_BY_MERGE[merge][slot]
  return Math.round((1 + baseStat) * MILLI_SCALE)
}

/** Lv.2–100: scale DVT Increase/lvl curve to the Lv.100 display target. */
function tieredScaledToLv100Milli(
  slot: WorkshopChassisModuleHeroStatSlot,
  lv1: number,
  lv100: number,
  level: number,
): number {
  if (level <= 1) return lv1
  const fullSpan = tieredIncreaseMilli(slot, 2, HERO_STAT_LINEAR_HIGH)
  if (fullSpan <= 0) {
    return lv1 + Math.floor(((lv100 - lv1) * (level - 1)) / HERO_STAT_LINEAR_SPAN)
  }
  const partial = tieredIncreaseMilli(slot, 2, level)
  return lv1 + Math.floor(((lv100 - lv1) * partial) / fullSpan)
}

/** Scale DVT Increase/lvl curve between two level anchors (e.g. Lv.100 → Lv.200). */
function tieredScaledBetweenMilli(
  slot: WorkshopChassisModuleHeroStatSlot,
  fromLevel: number,
  fromMilli: number,
  toLevel: number,
  toMilli: number,
  level: number,
  roundSegmentGrowth = false,
): number {
  if (level <= fromLevel) return fromMilli
  if (level >= toLevel) return toMilli
  const fullSpan = tieredIncreaseMilli(slot, fromLevel + 1, toLevel)
  if (fullSpan <= 0) {
    return fromMilli + Math.floor(((toMilli - fromMilli) * (level - fromLevel)) / (toLevel - fromLevel))
  }
  const partial = tieredIncreaseMilli(slot, fromLevel + 1, level)
  const delta = toMilli - fromMilli
  const numer = delta * partial
  const growth = Math.floor(numer / fullSpan)
  const rem = numer % fullSpan
  const roundedGrowth = growth + (roundSegmentGrowth ? segmentGrowthRoundUpExtra(rem, fullSpan) : 0)
  return fromMilli + roundedGrowth
}

/** Effective Paths segment growth rounding (milli steps above floor). */
function segmentGrowthRoundUpExtra(rem: number, fullSpan: number): number {
  let extra = 0
  if (rem * 10 >= fullSpan * 4 && rem * 10 < fullSpan * 5) extra += 1
  if (rem * 2 >= fullSpan) extra += 1
  return extra
}

function roundGeneratorSegmentGrowth(merge: WorkshopChassisModuleMergeTier, fromLevel: number): boolean {
  return fromLevel > HERO_STAT_LINEAR_HIGH && merge !== 'star_2'
}

function lv100AnchorForSlot(
  slot: WorkshopChassisModuleHeroStatSlot,
  merge: WorkshopChassisModuleMergeTier,
): number | undefined {
  const table =
    slot === 'generator'
      ? WORKSHOP_GENERATOR_HERO_LV100_BY_MERGE
      : slot === 'core'
        ? WORKSHOP_CORE_HERO_LV100_BY_MERGE
        : WORKSHOP_CANNON_ARMOR_HERO_LV100_BY_MERGE
  return table[merge]?.lv100Milli
}

function starPost100ScaleDecimals(slot: WorkshopChassisModuleHeroStatSlot): number {
  return slot === 'generator' ? 4 : 2
}

/** Scale post-L100 tiered steps for Ancestral 1★–5★. */
function starPost100ScaleFactor(
  slot: WorkshopChassisModuleHeroStatSlot,
  merge: WorkshopChassisModuleMergeTier,
): number {
  if (!STAR_MERGE_TIERS.has(merge)) return 1
  const lv100 = lv100AnchorForSlot(slot, merge)
  const refLv100 = lv100AnchorForSlot(slot, 'mythic_plus')
  if (lv100 == null || refLv100 == null) return 1
  const lv1 = lv1Milli(slot, merge)
  const refLv1 = lv1Milli(slot, 'mythic_plus')
  const refSpan = refLv100 - refLv1
  if (refSpan <= 0) return 1
  const ratio = (lv100 - lv1) / refSpan
  const decimals = starPost100ScaleDecimals(slot)
  const factor = 10 ** decimals
  return Math.round(ratio * factor) / factor
}

function scaledPostIncreaseMilli(
  slot: WorkshopChassisModuleHeroStatSlot,
  rawPostMilli: number,
  scale: number,
): number {
  const product = rawPostMilli * scale
  if (slot === 'generator' && scale !== 1) {
    // Planner: floor when fractional part ≥ 0.75, else round (matches Inventory L160 checkpoints).
    return product % 1 >= 0.75 ? Math.floor(product) : Math.round(product)
  }
  return Math.round(product)
}

function post100IncreaseMilli(
  slot: WorkshopChassisModuleHeroStatSlot,
  merge: WorkshopChassisModuleMergeTier,
  level: number,
): number {
  return postIncreaseRangeMilli(slot, merge, HERO_STAT_LINEAR_HIGH, level)
}

function postIncreaseRangeMilli(
  slot: WorkshopChassisModuleHeroStatSlot,
  merge: WorkshopChassisModuleMergeTier,
  fromLevel: number,
  level: number,
): number {
  if (level <= fromLevel) return 0
  const raw = tieredIncreaseMilli(slot, fromLevel + 1, level)
  const scale = starPost100ScaleFactor(slot, merge)
  if (scale === 1) return raw
  return scaledPostIncreaseMilli(slot, raw, scale)
}

function tieredOnlyHeroStatMilli(
  slot: WorkshopChassisModuleHeroStatSlot,
  merge: WorkshopChassisModuleMergeTier,
  level: number,
): number {
  const baseStat = WORKSHOP_MODULE_HERO_STAT_BASE_BY_MERGE[merge][slot]
  const lv1 = Math.round((1 + baseStat) * MILLI_SCALE)
  if (level <= 1) return lv1
  return lv1 + tieredIncreaseMilli(slot, 2, level)
}

/** Generator: tiered DVT when merge max ≤100; otherwise scaled-to-Lv.100 + tiered above (like cannon). */
function generatorHeroStatMilli(
  merge: WorkshopChassisModuleMergeTier,
  level: number,
): number {
  if (!MERGE_TIERS_WITH_LV100_ANCHOR.has(merge)) {
    return tieredOnlyHeroStatMilli('generator', merge, level)
  }

  const maxLevel = WORKSHOP_CHASSIS_MODULE_MAX_LEVEL_BY_MERGE[merge]
  if (maxLevel <= HERO_STAT_LINEAR_HIGH) {
    return tieredOnlyHeroStatMilli('generator', merge, level)
  }

  const lv1 = lv1Milli('generator', merge)
  if (level <= 1) return lv1

  const lv100 = lv100AnchorForSlot('generator', merge)
  if (lv100 == null) return tieredOnlyHeroStatMilli('generator', merge, level)

  if (level <= HERO_STAT_LINEAR_HIGH) {
    return tieredScaledToLv100Milli('generator', lv1, lv100, level)
  }

  const at100 = tieredScaledToLv100Milli('generator', lv1, lv100, HERO_STAT_LINEAR_HIGH)

  const levelOverride = WORKSHOP_GENERATOR_LEVEL_OVERRIDE_MILLI_BY_MERGE[merge]?.[level]
  if (levelOverride != null) return levelOverride

  const anchors = WORKSHOP_GENERATOR_LEVEL_ANCHORS_BY_MERGE[merge]
  if (anchors?.length) {
    let fromLevel = HERO_STAT_LINEAR_HIGH
    let fromMilli = at100
    for (const anchor of anchors) {
      if (level <= anchor.level) {
        const milli = tieredScaledBetweenMilli(
          'generator',
          fromLevel,
          fromMilli,
          anchor.level,
          anchor.milli,
          level,
          roundGeneratorSegmentGrowth(merge, fromLevel),
        )
        return milli
      }
      fromLevel = anchor.level
      fromMilli = anchor.milli
    }
    return fromMilli + postIncreaseRangeMilli('generator', merge, fromLevel, level)
  }

  return at100 + post100IncreaseMilli('generator', merge, level)
}

function heroStatCommonMilli(
  slot: WorkshopChassisModuleHeroStatSlot,
  moduleLevel: number,
): number {
  const level = Math.max(0, Math.floor(moduleLevel))
  const baseStat = WORKSHOP_MODULE_HERO_STAT_COMMON_BASE[slot]
  const lv1 = Math.round((1 + baseStat) * MILLI_SCALE)
  if (level <= 0) return slot === 'generator' ? MILLI_SCALE : lv1
  if (level <= 1) return lv1
  return lv1 + tieredIncreaseMilli(slot, 2, level)
}

/**
 * DVT main-effect mult (milli-units):
 * - Lv.1 = `1 + Base stat`
 * - **Generator** (merge max ≤100): pure DVT **Increase/lvl** tiered curve
 * - **Generator** (merge max >100): Lv.2–100 scaled to Lv.100; above Lv.100 scaled via Effective Paths level anchors (2★–5★); else star-scaled tiered steps
 * - **Cannon / armor / core** Lv.2–100: scaled to Lv.100 anchor; Lv.101+ raw **Increase/lvl** steps
 * - **Ancestral 1★–5★** Lv.101+ steps scaled by Lv.100−Lv.1 span vs Mythic+ (2 dp; generator 4 dp scale, 0.75 floor rule on product)
 * - Rare / Rare+ = tiered **Increase/lvl** only
 */
export function workshopChassisModuleHeroStatMilli(
  slot: WorkshopChassisModuleHeroStatSlot,
  merge: WorkshopChassisModuleMergeTier,
  moduleLevel: number,
): number {
  const level = Math.max(0, Math.floor(moduleLevel))
  if (level <= 0) {
    return slot === 'generator' ? MILLI_SCALE : lv1Milli(slot, merge)
  }

  if (slot === 'generator') {
    return generatorHeroStatMilli(merge, level)
  }

  if (!MERGE_TIERS_WITH_LV100_ANCHOR.has(merge)) {
    return tieredOnlyHeroStatMilli(slot, merge, level)
  }

  const lv1 = lv1Milli(slot, merge)
  const lv100 = lv100AnchorForSlot(slot, merge)
  if (lv100 == null) return tieredOnlyHeroStatMilli(slot, merge, level)

  if (level <= HERO_STAT_LINEAR_HIGH) {
    return tieredScaledToLv100Milli(slot, lv1, lv100, level)
  }

  const at100 = tieredScaledToLv100Milli(slot, lv1, lv100, HERO_STAT_LINEAR_HIGH)
  return at100 + post100IncreaseMilli(slot, merge, level)
}

export function workshopChassisModuleHeroStatCommonMilli(
  slot: WorkshopChassisModuleHeroStatSlot,
  moduleLevel: number,
): number {
  return heroStatCommonMilli(slot, moduleLevel)
}

export function formatWorkshopChassisModuleHeroStatMilli(milli: number): string {
  return (milli / MILLI_SCALE).toFixed(3)
}
