import { describe, expect, it } from 'vitest'
import { WORKSHOP_GAME_CARD_ORDER } from '../data/workshopGameCards'
import {
  CARD_SAVE_ARRAY_LENGTH,
  CARD_SAVE_INDEX_BY_CARD_ID,
  CARD_SAVE_RESERVED_INDICES,
  mapCardPresetsFromSave,
  mapCardStarsFromSave,
} from './cardSaveSlotMap'

/** Sample save `cardLevel` / `cardUnlocked` (player-save-field-dump.json). */
const SAMPLE_CARD_LEVEL = [
  7, 7, 7, 7, 7, 7, 7, 7, 1, 1, 7, 7, 7, 7, 1, 7, 7, 1, 7, 7, 7, 7, 7, 7, 1, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 1, 1, 1, 1, 1,
] as const

const SAMPLE_CARD_UNLOCKED = [
  true, true, true, true, true, true, true, true, false, false, true, true, true, true, false, true,
  true, false, true, true, true, true, true, true, false, true, true, true, true, true, true, true,
  true, true, true, false, false, false, false, false,
] as const

describe('cardSaveSlotMap', () => {
  it('maps first eight cards at save indices 0–7', () => {
    expect(CARD_SAVE_INDEX_BY_CARD_ID.damage).toBe(0)
    expect(CARD_SAVE_INDEX_BY_CARD_ID.slowAura).toBe(7)
  })

  it('skips reserved slots 8–9 for catalog cards 8–9', () => {
    expect(CARD_SAVE_INDEX_BY_CARD_ID.criticalChance).toBe(10)
    expect(CARD_SAVE_INDEX_BY_CARD_ID.enemyBalance).toBe(11)
  })

  it('maps fortress through extra orb with gaps at 14 and 17', () => {
    expect(CARD_SAVE_INDEX_BY_CARD_ID.extraDefense).toBe(12)
    expect(CARD_SAVE_INDEX_BY_CARD_ID.fortress).toBe(13)
    expect(CARD_SAVE_INDEX_BY_CARD_ID.freeUpgrades).toBe(15)
    expect(CARD_SAVE_INDEX_BY_CARD_ID.extraOrb).toBe(16)
  })

  it('maps plasma cannon through recovery package with gap at 24', () => {
    expect(CARD_SAVE_INDEX_BY_CARD_ID.plasmaCannon).toBe(18)
    expect(CARD_SAVE_INDEX_BY_CARD_ID.recoveryPackageChance).toBe(23)
  })

  it('maps death ray through nuke at save indices 25–34', () => {
    expect(CARD_SAVE_INDEX_BY_CARD_ID.deathRay).toBe(25)
    expect(CARD_SAVE_INDEX_BY_CARD_ID.nuke).toBe(34)
  })

  it('maps area of effect at save index 35', () => {
    expect(CARD_SAVE_INDEX_BY_CARD_ID.areaOfEffect).toBe(35)
  })

  it('covers every catalog card and only uses non-reserved save slots', () => {
    const reserved = new Set<number>(CARD_SAVE_RESERVED_INDICES)
    const used = new Set(Object.values(CARD_SAVE_INDEX_BY_CARD_ID))
    expect(used.size).toBe(WORKSHOP_GAME_CARD_ORDER.length)
    for (const index of used) {
      expect(reserved.has(index)).toBe(false)
      expect(index).toBeLessThan(CARD_SAVE_ARRAY_LENGTH)
    }
  })

  it('maps sample save card stars using unlock flags and save slot indices', () => {
    const stars = mapCardStarsFromSave(SAMPLE_CARD_LEVEL, SAMPLE_CARD_UNLOCKED)
    expect(stars.damage).toBe(7)
    expect(stars.criticalChance).toBe(7)
    expect(stars.enemyBalance).toBe(7)
    expect(stars.plasmaCannon).toBe(7)
    expect(stars.nuke).toBe(7)
    expect(stars.areaOfEffect).toBe(0)
  })

  it('maps sample card levels without unlock array (ignores gap slot values)', () => {
    const stars = mapCardStarsFromSave(SAMPLE_CARD_LEVEL)
    expect(stars.criticalChance).toBe(7)
    expect(stars.plasmaCannon).toBe(7)
    expect(stars.areaOfEffect).toBe(1)
  })

  it('maps card preset slots from slotPresetCardInt save indices', () => {
    const slotPresetCardInt = new Array(140).fill(0)
    const slotPresetCardAssignedBool = new Array(140).fill(false)
    const preset0Slots = [15, 6, 19, 2, 12, 1, 11, 20, 16, 22, 23, 31, 7, 3, 0, 26, 25, 18]
    preset0Slots.forEach((saveIndex, slot) => {
      slotPresetCardInt[slot] = saveIndex
      slotPresetCardAssignedBool[slot] = true
    })
    slotPresetCardInt[28] = 15
    slotPresetCardInt[29] = 2
    slotPresetCardAssignedBool[28] = true
    slotPresetCardAssignedBool[29] = true

    const { cardPresetLoadouts, cardActivePresetIndex } = mapCardPresetsFromSave(
      slotPresetCardInt,
      slotPresetCardAssignedBool,
      0,
    )
    expect(cardActivePresetIndex).toBe(0)
    expect(cardPresetLoadouts[0]).toEqual([
      'freeUpgrades',
      'coins',
      'criticalCoin',
      'health',
      'extraDefense',
      'attackSpeed',
      'enemyBalance',
      'waveSkip',
      'extraOrb',
      'landMineStun',
      'recoveryPackageChance',
      'waveAccelerator',
      'slowAura',
      'healthRegen',
      'damage',
      'energyNet',
      'deathRay',
      'plasmaCannon',
    ])
    expect(cardPresetLoadouts[1]).toEqual(['freeUpgrades', 'health'])
  })
})
