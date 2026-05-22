/**
 * All 31 in-game cards (wiki / Card Mastery list).
 */

import type { StringId } from '../i18n/dictionary'
import {
  formatWorkshopGameCardStarEffect,
  formatWorkshopGameCardStarEffectWithMastery,
  WORKSHOP_CARD_PRESET_COUNT,
  workshopGameCardWiki,
  type WorkshopGameCardRarity,
} from './workshopGameCardWiki'

export const WORKSHOP_GAME_CARD_MAX_STARS = 7 as const

export const WORKSHOP_GAME_CARD_ORDER = [
  'damage',
  'attackSpeed',
  'health',
  'healthRegen',
  'range',
  'cash',
  'coins',
  'slowAura',
  'criticalChance',
  'enemyBalance',
  'extraDefense',
  'fortress',
  'freeUpgrades',
  'extraOrb',
  'plasmaCannon',
  'criticalCoin',
  'waveSkip',
  'introSprint',
  'landMineStun',
  'recoveryPackageChance',
  'deathRay',
  'energyNet',
  'superTower',
  'secondWind',
  'demonMode',
  'energyShield',
  'waveAccelerator',
  'berserker',
  'ultimateCrit',
  'nuke',
  'areaOfEffect',
] as const

export type WorkshopGameCardId = (typeof WORKSHOP_GAME_CARD_ORDER)[number]

export const WORKSHOP_GAME_CARD_COUNT = WORKSHOP_GAME_CARD_ORDER.length

export type WorkshopCardStarsState = Record<WorkshopGameCardId, number>

const CARD_TITLE: Record<WorkshopGameCardId, StringId> = {
  damage: 'ws_card_damage',
  attackSpeed: 'ws_card_attack_speed',
  health: 'ws_card_health',
  healthRegen: 'ws_card_health_regen',
  range: 'ws_card_range',
  cash: 'ws_card_cash',
  coins: 'ws_card_coins',
  slowAura: 'ws_card_slow_aura',
  criticalChance: 'ws_card_critical_chance',
  enemyBalance: 'ws_card_enemy_balance',
  extraDefense: 'ws_card_extra_defense',
  fortress: 'ws_card_fortress',
  freeUpgrades: 'ws_card_free_upgrades',
  extraOrb: 'ws_card_extra_orb',
  plasmaCannon: 'ws_card_plasma_cannon',
  criticalCoin: 'ws_card_critical_coin',
  waveSkip: 'ws_card_wave_skip',
  introSprint: 'ws_card_intro_sprint',
  landMineStun: 'ws_card_land_mine_stun',
  recoveryPackageChance: 'ws_card_recovery_package_chance',
  deathRay: 'ws_card_death_ray',
  energyNet: 'ws_card_energy_net',
  superTower: 'ws_card_super_tower',
  secondWind: 'ws_card_second_wind',
  demonMode: 'ws_card_demon_mode',
  energyShield: 'ws_card_energy_shield',
  waveAccelerator: 'ws_card_wave_accelerator',
  berserker: 'ws_card_berserker',
  ultimateCrit: 'ws_card_ultimate_crit',
  nuke: 'ws_card_nuke',
  areaOfEffect: 'ws_card_area_of_effect',
}

const CARD_GLYPH: Record<WorkshopGameCardId, string> = {
  damage: '⚔',
  attackSpeed: '⚡',
  health: '♥',
  healthRegen: '✚',
  range: '◎',
  cash: '$',
  coins: '●',
  slowAura: '🐌',
  criticalChance: '✸',
  enemyBalance: '⚖',
  extraDefense: '🛡',
  fortress: '▣',
  freeUpgrades: '↑',
  extraOrb: '◉',
  plasmaCannon: '☄',
  criticalCoin: '¢',
  waveSkip: '»',
  introSprint: '⏩',
  landMineStun: '✹',
  recoveryPackageChance: '✚',
  deathRay: '',
  energyNet: '⛓',
  superTower: '★',
  secondWind: '↻',
  demonMode: '👿',
  energyShield: '⬡',
  waveAccelerator: '»',
  berserker: '🔥',
  ultimateCrit: '✦',
  nuke: '☢',
  areaOfEffect: '◈',
}

/** Card art in `public/cards/` (wiki names as `Pascal_Snake.webp`). */
const CARD_IMAGE: Record<WorkshopGameCardId, string> = {
  damage: '/cards/Damage.webp',
  attackSpeed: '/cards/Attack_Speed.webp',
  health: '/cards/Health.webp',
  healthRegen: '/cards/Health_Regen.webp',
  range: '/cards/Range.webp',
  cash: '/cards/Cash.webp',
  coins: '/cards/Coins.webp',
  slowAura: '/cards/Slow_Aura.webp',
  criticalChance: '/cards/Critical_Chance.webp',
  enemyBalance: '/cards/Enemy_Balance.webp',
  extraDefense: '/cards/Extra_Defense.webp',
  fortress: '/cards/Fortress.webp',
  freeUpgrades: '/cards/Free_Upgrades.webp',
  extraOrb: '/cards/Extra_Orb.webp',
  plasmaCannon: '/cards/Plasma_Cannon.webp',
  criticalCoin: '/cards/Critical_Coin.webp',
  waveSkip: '/cards/Wave_Skip.webp',
  introSprint: '/cards/Intro_Sprint.webp',
  landMineStun: '/cards/Land_Mine_Stun.webp',
  recoveryPackageChance: '/cards/Recovery_Package_Chance.webp',
  deathRay: '/cards/Death_Ray.webp',
  energyNet: '/cards/Energy_Net.webp',
  superTower: '/cards/Super_Tower.webp',
  secondWind: '/cards/Second_Wind.webp',
  demonMode: '/cards/Demon_Mode.webp',
  energyShield: '/cards/Energy_Shield.webp',
  waveAccelerator: '/cards/Wave_Accelerator.webp',
  berserker: '/cards/Berserker.webp',
  ultimateCrit: '/cards/Ultimate_Crit.webp',
  nuke: '/cards/Nuke.webp',
  areaOfEffect: '/cards/Area_Effect.webp',
}

const ART_VARIANTS = [
  'damage',
  'attackSpeed',
  'berserker',
  'cannon',
  'relics',
  'perk',
  'taken',
] as const

export type WorkshopGameCardArtVariant = (typeof ART_VARIANTS)[number]

/** In-game card frame glow (art vignette), matched to wiki screenshots. */
export const WORKSHOP_GAME_CARD_GLOWS = ['cyan', 'magenta', 'gold', 'green'] as const

export type WorkshopGameCardGlow = (typeof WORKSHOP_GAME_CARD_GLOWS)[number]

/** Per-card art glow colour (not the modulo art-variant slot). */
const CARD_GLOW: Record<WorkshopGameCardId, WorkshopGameCardGlow> = {
  damage: 'cyan',
  attackSpeed: 'magenta',
  health: 'gold',
  healthRegen: 'green',
  range: 'cyan',
  cash: 'magenta',
  coins: 'gold',
  slowAura: 'green',
  criticalChance: 'magenta',
  enemyBalance: 'cyan',
  extraDefense: 'cyan',
  fortress: 'cyan',
  freeUpgrades: 'gold',
  extraOrb: 'cyan',
  plasmaCannon: 'magenta',
  criticalCoin: 'gold',
  waveSkip: 'cyan',
  introSprint: 'gold',
  landMineStun: 'gold',
  recoveryPackageChance: 'gold',
  deathRay: 'magenta',
  energyNet: 'cyan',
  superTower: 'cyan',
  secondWind: 'gold',
  demonMode: 'magenta',
  energyShield: 'cyan',
  waveAccelerator: 'gold',
  berserker: 'gold',
  ultimateCrit: 'magenta',
  nuke: 'gold',
  areaOfEffect: 'magenta',
}

export function defaultWorkshopCardStars(): WorkshopCardStarsState {
  return Object.fromEntries(
    WORKSHOP_GAME_CARD_ORDER.map((id) => [id, 0]),
  ) as WorkshopCardStarsState
}

export function workshopGameCardTitleId(id: WorkshopGameCardId): StringId {
  return CARD_TITLE[id]
}

export function workshopGameCardGlyph(id: WorkshopGameCardId): string {
  return CARD_GLYPH[id]
}

export function workshopGameCardImage(id: WorkshopGameCardId): string {
  return CARD_IMAGE[id]
}

export function workshopGameCardArtVariant(id: WorkshopGameCardId): WorkshopGameCardArtVariant {
  const i = WORKSHOP_GAME_CARD_ORDER.indexOf(id)
  return ART_VARIANTS[i % ART_VARIANTS.length]!
}

export function workshopGameCardGlow(id: WorkshopGameCardId): WorkshopGameCardGlow {
  return CARD_GLOW[id]
}

export function workshopGameCardMaxStars(_id: WorkshopGameCardId): number {
  return WORKSHOP_GAME_CARD_MAX_STARS
}

export function workshopGameCardRarity(id: WorkshopGameCardId): WorkshopGameCardRarity {
  return workshopGameCardWiki(id).rarity
}

export function workshopGameCardDescription(id: WorkshopGameCardId): string {
  return workshopGameCardWiki(id).description
}

export function workshopGameCardEffectLabel(id: WorkshopGameCardId, stars: number): string {
  return formatWorkshopGameCardStarEffect(id, stars)
}

export {
  formatWorkshopGameCardStarEffect,
  formatWorkshopGameCardStarEffectWithMastery,
  workshopGameCardWiki,
}

export function clampWorkshopGameCardStars(n: number, id: WorkshopGameCardId): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(workshopGameCardMaxStars(id), Math.trunc(n)))
}

export function sanitizeWorkshopCardStars(raw: unknown): WorkshopCardStarsState {
  const stars = defaultWorkshopCardStars()
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return stars
  const o = raw as Record<string, unknown>
  for (const id of WORKSHOP_GAME_CARD_ORDER) {
    if (o[id] != null) {
      stars[id] = clampWorkshopGameCardStars(Number(o[id]), id)
    }
  }
  return stars
}

/** Legacy sim fields → unified card star map. */
export function workshopCardStarsFromLegacy(o: Record<string, unknown>): WorkshopCardStarsState {
  if (o.cardStars != null) {
    return sanitizeWorkshopCardStars(o.cardStars)
  }
  const stars = defaultWorkshopCardStars()
  if (o.simDamageCardStars != null) {
    stars.damage = clampWorkshopGameCardStars(Number(o.simDamageCardStars), 'damage')
  }
  if (o.simAttackSpeedCardStars != null) {
    stars.attackSpeed = clampWorkshopGameCardStars(
      Number(o.simAttackSpeedCardStars),
      'attackSpeed',
    )
  }
  if (o.simBerserkerCardStars != null) {
    stars.berserker = clampWorkshopGameCardStars(Number(o.simBerserkerCardStars), 'berserker')
  }
  return stars
}

export type WorkshopCardLoadoutPersisted = {
  cardStars: WorkshopCardStarsState
  cardPresetLoadouts: WorkshopGameCardId[][]
  cardActivePresetIndex: number
}

export function clampWorkshopCardActivePresetIndex(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_CARD_PRESET_COUNT - 1, Math.trunc(n)))
}

export function workshopActiveLoadout(ws: WorkshopCardLoadoutPersisted): WorkshopGameCardId[] {
  const i = clampWorkshopCardActivePresetIndex(ws.cardActivePresetIndex)
  return ws.cardPresetLoadouts[i] ?? []
}

/** Stars for a card only when it is equipped on the active preset (else 0). */
export function workshopEquippedCardStars(
  ws: WorkshopCardLoadoutPersisted,
  id: WorkshopGameCardId,
): number {
  if (!workshopActiveLoadout(ws).includes(id)) return 0
  return ws.cardStars[id]
}

/** Workshop sim mirrors: Damage / Attack Speed / Berserker stars from the active loadout. */
export function workshopCardStarMirrorsForPersisted(
  ws: WorkshopCardLoadoutPersisted,
): {
  simDamageCardStars: number
  simAttackSpeedCardStars: number
  simBerserkerCardStars: number
} {
  return {
    simDamageCardStars: workshopEquippedCardStars(ws, 'damage'),
    simAttackSpeedCardStars: workshopEquippedCardStars(ws, 'attackSpeed'),
    simBerserkerCardStars: workshopEquippedCardStars(ws, 'berserker'),
  }
}

/** Merge a workshop patch and refresh sim* card mirrors from the active loadout. */
export function workshopCardMirrorsPatch(
  ws: WorkshopCardLoadoutPersisted,
  partial: Partial<WorkshopCardLoadoutPersisted>,
): Partial<WorkshopCardLoadoutPersisted> & {
  simDamageCardStars: number
  simAttackSpeedCardStars: number
  simBerserkerCardStars: number
} {
  const merged: WorkshopCardLoadoutPersisted = {
    cardStars: partial.cardStars ?? ws.cardStars,
    cardPresetLoadouts: partial.cardPresetLoadouts ?? ws.cardPresetLoadouts,
    cardActivePresetIndex: partial.cardActivePresetIndex ?? ws.cardActivePresetIndex,
  }
  return {
    ...partial,
    ...workshopCardStarMirrorsForPersisted(merged),
  }
}

/** @deprecated Use workshopCardStarMirrorsForPersisted for workshop-linked stars. */
export function workshopCardStarMirrors(stars: WorkshopCardStarsState): {
  simDamageCardStars: number
  simAttackSpeedCardStars: number
  simBerserkerCardStars: number
} {
  return {
    simDamageCardStars: stars.damage,
    simAttackSpeedCardStars: stars.attackSpeed,
    simBerserkerCardStars: stars.berserker,
  }
}
