/**
 * Ultimate Weapon Plus — wiki unlock order + upgrade tables (May 2026 snapshot).
 */

import type { WorkshopUltimateTrack } from './workshopUltimateTable'
import type { WorkshopUltimateWeaponId } from './workshopUltimateData'

export type WorkshopUltimatePlusAbilityId =
  | 'chainLightningSmite'
  | 'smartMissilesCoverFire'
  | 'poisonSwampDeathCreep'
  | 'goldenTowerGoldenCombo'
  | 'innerLandMinesChargedMines'
  | 'deathWaveKillWall'
  | 'blackHoleConsume'
  | 'chronoFieldChronoLoop'
  | 'spotlightLightRange'

export const WORKSHOP_ULTIMATE_PLUS_ABILITY_ORDER: readonly WorkshopUltimatePlusAbilityId[] =
  [
    'chainLightningSmite',
    'smartMissilesCoverFire',
    'poisonSwampDeathCreep',
    'goldenTowerGoldenCombo',
    'innerLandMinesChargedMines',
    'deathWaveKillWall',
    'blackHoleConsume',
    'chronoFieldChronoLoop',
    'spotlightLightRange',
  ]

/** Power stones to buy the Nth Plus ability (1st … 9th). */
export const ULTIMATE_PLUS_UNLOCK_COSTS: readonly number[] = [
  500, 625, 750, 975, 1250, 1650, 2200, 2900, 3800,
]

export const ULTIMATE_PLUS_MAX_LEVEL = 10

export const ULTIMATE_PLUS_LEVEL_LOCKED = -1

function track(
  kind: WorkshopUltimateTrack['valueKind'],
  values: readonly number[],
  marginalStones: readonly number[],
): WorkshopUltimateTrack {
  const milestones = values.map((value, i) => ({
    value,
    marginalStones: i === 0 ? 0 : (marginalStones[i - 1] ?? 0),
  }))
  return { valueKind: kind, milestones }
}

const COST_300_23800 = [
  300, 375, 475, 600, 725, 925, 1150, 1450, 1800, 2200,
] as const

const COST_300_18570 = [
  300, 360, 430, 510, 620, 750, 900, 1100, 1350, 1650,
] as const

/** Golden Combo — 14 upgrades (L0→L14), wiki total 20,070 stones. */
const COST_GOLDEN_TOWER_GOLDEN_COMBO = [
  300, 360, 430, 510, 620, 750, 900, 1100, 1350, 1650, 2050, 2600, 3300, 4150,
] as const

const COST_400_19050 = [
  400, 500, 610, 730, 860, 1000, 1150, 1300, 1500, 1700,
] as const

export const WORKSHOP_ULTIMATE_PLUS_TRACKS: Record<
  WorkshopUltimatePlusAbilityId,
  WorkshopUltimateTrack
> = {
  chainLightningSmite: track(
    'percent',
    [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
    COST_300_23800,
  ),
  smartMissilesCoverFire: track(
    'seconds',
    [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3],
    COST_300_23800,
  ),
  poisonSwampDeathCreep: track(
    'percent',
    [120, 190, 260, 330, 400, 470, 540, 610, 680, 750, 820],
    COST_300_23800,
  ),
  goldenTowerGoldenCombo: track(
    'percent',
    [
      0.03, 0.06, 0.09, 0.12, 0.15, 0.18, 0.21, 0.24, 0.27, 0.3, 0.33, 0.36, 0.39,
      0.42, 0.45,
    ],
    COST_GOLDEN_TOWER_GOLDEN_COMBO,
  ),
  innerLandMinesChargedMines: track(
    'mult',
    [0.5, 1.5, 2.9, 4.7, 6.9, 9.5, 12.5, 15.9, 19.7, 23.9, 28.5],
    COST_300_18570,
  ),
  deathWaveKillWall: track(
    'count',
    [3, 4, 6, 9, 13, 18, 24, 31, 39, 48, 58],
    COST_400_19050,
  ),
  blackHoleConsume: track(
    'percent',
    [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
    COST_400_19050,
  ),
  chronoFieldChronoLoop: track(
    'mult',
    [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6],
    COST_400_19050,
  ),
  spotlightLightRange: track(
    'mult',
    [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11],
    COST_400_19050,
  ),
}

export const WORKSHOP_ULTIMATE_PLUS_WEAPON: Record<
  WorkshopUltimatePlusAbilityId,
  WorkshopUltimateWeaponId
> = {
  chainLightningSmite: 'chainLightning',
  smartMissilesCoverFire: 'smartMissiles',
  poisonSwampDeathCreep: 'poisonSwamp',
  goldenTowerGoldenCombo: 'goldenTower',
  innerLandMinesChargedMines: 'innerLandMines',
  deathWaveKillWall: 'deathWave',
  blackHoleConsume: 'blackHole',
  chronoFieldChronoLoop: 'chronoField',
  spotlightLightRange: 'spotlight',
}

export const WORKSHOP_ULTIMATE_PLUS_ABILITY_BY_WEAPON = Object.fromEntries(
  Object.entries(WORKSHOP_ULTIMATE_PLUS_WEAPON).map(([abilityId, weaponId]) => [
    weaponId,
    abilityId,
  ]),
) as Record<WorkshopUltimateWeaponId, WorkshopUltimatePlusAbilityId>

export type WorkshopUltimatePlusLevelKey =
  | 'ultimatePlusChainLightningSmiteLevel'
  | 'ultimatePlusSmartMissilesCoverFireLevel'
  | 'ultimatePlusPoisonSwampDeathCreepLevel'
  | 'ultimatePlusGoldenTowerGoldenComboLevel'
  | 'ultimatePlusInnerLandMinesChargedMinesLevel'
  | 'ultimatePlusDeathWaveKillWallLevel'
  | 'ultimatePlusBlackHoleConsumeLevel'
  | 'ultimatePlusChronoFieldChronoLoopLevel'
  | 'ultimatePlusSpotlightLightRangeLevel'

export const WORKSHOP_ULTIMATE_PLUS_LEVEL_BY_ABILITY: Record<
  WorkshopUltimatePlusAbilityId,
  WorkshopUltimatePlusLevelKey
> = {
  chainLightningSmite: 'ultimatePlusChainLightningSmiteLevel',
  smartMissilesCoverFire: 'ultimatePlusSmartMissilesCoverFireLevel',
  poisonSwampDeathCreep: 'ultimatePlusPoisonSwampDeathCreepLevel',
  goldenTowerGoldenCombo: 'ultimatePlusGoldenTowerGoldenComboLevel',
  innerLandMinesChargedMines: 'ultimatePlusInnerLandMinesChargedMinesLevel',
  deathWaveKillWall: 'ultimatePlusDeathWaveKillWallLevel',
  blackHoleConsume: 'ultimatePlusBlackHoleConsumeLevel',
  chronoFieldChronoLoop: 'ultimatePlusChronoFieldChronoLoopLevel',
  spotlightLightRange: 'ultimatePlusSpotlightLightRangeLevel',
}

export const WORKSHOP_ULTIMATE_PLUS_LEVEL_ORDER: readonly WorkshopUltimatePlusLevelKey[] =
  WORKSHOP_ULTIMATE_PLUS_ABILITY_ORDER.map((id) => WORKSHOP_ULTIMATE_PLUS_LEVEL_BY_ABILITY[id])

export function workshopUltimatePlusLevelKey(
  abilityId: WorkshopUltimatePlusAbilityId,
): WorkshopUltimatePlusLevelKey {
  return WORKSHOP_ULTIMATE_PLUS_LEVEL_BY_ABILITY[abilityId]
}
