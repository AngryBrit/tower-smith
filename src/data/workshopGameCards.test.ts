import { describe, expect, it } from 'vitest'
import {
  defaultWorkshopCardStars,
  WORKSHOP_GAME_CARD_ORDER,
  workshopCardStarMirrorsForPersisted,
  workshopCardStarsFromLegacy,
  workshopEquippedCardStars,
  workshopGameCardGlow,
  workshopGameCardImage,
  type WorkshopGameCardId,
} from './workshopGameCards'

describe('workshopGameCards images', () => {
  it('maps every card to a public webp asset', () => {
    for (const id of WORKSHOP_GAME_CARD_ORDER) {
      expect(workshopGameCardImage(id), id).toMatch(/^\/cards\/[A-Za-z0-9_]+\.webp$/)
    }
    expect(WORKSHOP_GAME_CARD_ORDER.length).toBe(31)
  })
})

describe('workshopGameCardGlow', () => {
  it('maps each card to a reference glow colour', () => {
    expect(workshopGameCardGlow('damage')).toBe('cyan')
    expect(workshopGameCardGlow('attackSpeed')).toBe('magenta')
    expect(workshopGameCardGlow('health')).toBe('gold')
    expect(workshopGameCardGlow('healthRegen')).toBe('green')
    expect(workshopGameCardGlow('range')).toBe('cyan')
    expect(workshopGameCardGlow('cash')).toBe('magenta')
    expect(workshopGameCardGlow('coins')).toBe('gold')
    expect(workshopGameCardGlow('slowAura')).toBe('green')
    for (const id of WORKSHOP_GAME_CARD_ORDER) {
      expect(['cyan', 'magenta', 'gold', 'green']).toContain(workshopGameCardGlow(id))
    }
  })
})

describe('workshopCardStarsFromLegacy', () => {
  it('keeps unified cardStars when sim mirrors are zero (unequipped)', () => {
    const cardStars = { ...defaultWorkshopCardStars(), damage: 7, attackSpeed: 7, berserker: 7 }
    expect(
      workshopCardStarsFromLegacy({
        cardStars,
        simDamageCardStars: 0,
        simAttackSpeedCardStars: 0,
        simBerserkerCardStars: 0,
      }),
    ).toEqual(cardStars)
  })
})

describe('workshopEffectiveEquippedLoadout', () => {
  it('only includes the first cardEquipSlots cards from the active preset', () => {
    const cardStars = { ...defaultWorkshopCardStars(), damage: 7, attackSpeed: 3 }
    const cardPresetLoadouts = Array.from({ length: 5 }, () => [] as WorkshopGameCardId[])
    cardPresetLoadouts[0] = ['attackSpeed', 'damage']
    expect(
      workshopEquippedCardStars(
        {
          cardStars,
          cardPresetLoadouts,
          cardActivePresetIndex: 0,
          cardEquipSlots: 1,
        },
        'attackSpeed',
      ),
    ).toBe(3)
    expect(
      workshopEquippedCardStars(
        {
          cardStars,
          cardPresetLoadouts,
          cardActivePresetIndex: 0,
          cardEquipSlots: 1,
        },
        'damage',
      ),
    ).toBe(7)
  })
})

describe('workshopCardStarMirrorsForPersisted', () => {
  it('counts stars only for workshop cards equipped on the active preset', () => {
    const cardStars = {
      ...defaultWorkshopCardStars(),
      damage: 5,
      attackSpeed: 3,
      berserker: 2,
    }
    const cardPresetLoadouts = Array.from({ length: 5 }, () => [] as WorkshopGameCardId[])
    cardPresetLoadouts[0] = ['damage', 'berserker']
    cardPresetLoadouts[1] = ['attackSpeed']
    const loadoutCtx = {
      cardStars,
      cardPresetLoadouts,
      cardEquipSlots: 28,
    }
    expect(
      workshopCardStarMirrorsForPersisted({
        ...loadoutCtx,
        cardActivePresetIndex: 0,
      }),
    ).toEqual({
      simDamageCardStars: 5,
      simAttackSpeedCardStars: 0,
      simBerserkerCardStars: 2,
    })
    expect(
      workshopCardStarMirrorsForPersisted({
        ...loadoutCtx,
        cardActivePresetIndex: 1,
      }),
    ).toEqual({
      simDamageCardStars: 0,
      simAttackSpeedCardStars: 3,
      simBerserkerCardStars: 0,
    })
  })
})
