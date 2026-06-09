import { describe, expect, it } from 'vitest'
import {
  gameModuleEffectByIndex,
  gameModuleEffectByIndexForSlot,
  gameSubmoduleImportFromEffectIndices,
} from './gameModuleEffectIndex'

describe('gameModuleEffectIndex', () => {
  it('maps save indices to in-game EffectRarity tiers (not raw wiki column when Common is absent)', () => {
    expect(gameModuleEffectByIndex(4)).toMatchObject({
      effectId: 'attack-speed',
      rarity: 'legendary',
    })
    expect(gameModuleEffectByIndex(10)).toMatchObject({
      effectId: 'crit-chance',
      rarity: 'legendary',
    })
    expect(gameModuleEffectByIndex(16)).toMatchObject({
      effectId: 'crit-factor',
      rarity: 'legendary',
    })
    expect(gameModuleEffectByIndex(33)).toMatchObject({
      effectId: 'multishot-chance',
      rarity: 'legendary',
    })
  })

  it('maps generator free-upgrade indices to epic (max tier on epic module)', () => {
    expect(gameModuleEffectByIndex(181)).toMatchObject({
      effectId: 'free-attack-upgrade',
      rarity: 'epic',
    })
    expect(gameModuleEffectByIndex(187)).toMatchObject({
      effectId: 'free-defense-upgrade',
      rarity: 'epic',
    })
    expect(gameModuleEffectByIndex(193)).toMatchObject({
      effectId: 'free-utility-upgrade',
      rarity: 'epic',
    })
  })

  it('shifts top tiers for rows starting at Epic (wall health) but not Mythic-only rows', () => {
    expect(gameModuleEffectByIndex(148)).toMatchObject({
      effectId: 'wall-health',
      rarity: 'legendary',
    })
  })

  it('maps core equipped save indices to game row order (not wiki catalog order)', () => {
    expect(gameModuleEffectByIndex(220)).toMatchObject({
      effectId: 'chain-lightning-damage-x',
      rarity: 'legendary',
    })
    expect(gameModuleEffectByIndex(252)).toMatchObject({
      effectId: 'death-wave-quantity',
      rarity: 'legendary',
    })
    expect(gameModuleEffectByIndex(282)).toMatchObject({
      effectId: 'golden-tower-bonus',
      rarity: 'legendary',
    })
    expect(gameModuleEffectByIndex(311)).toMatchObject({
      effectId: 'black-hole-duration-s',
      rarity: 'legendary',
    })
  })

  it('maps Package Chance epic→ancestral at 208–211; 212 starts Enemy Attack Level Skip', () => {
    expect(gameModuleEffectByIndex(208)).toMatchObject({
      effectId: 'package-chance',
      rarity: 'epic',
    })
    expect(gameModuleEffectByIndex(209)).toMatchObject({
      effectId: 'package-chance',
      rarity: 'legendary',
    })
    expect(gameModuleEffectByIndex(210)).toMatchObject({
      effectId: 'package-chance',
      rarity: 'mythic',
    })
    expect(gameModuleEffectByIndex(211)).toMatchObject({
      effectId: 'package-chance',
      rarity: 'ancestral',
    })
    expect(gameModuleEffectByIndex(212)).toMatchObject({
      effectId: 'enemy-attack-level-skip',
      rarity: 'epic',
    })
  })

  it('decodes level-offset effect index 330 as Package Chance mythic at 210', () => {
    expect(gameModuleEffectByIndex(330, 120)).toEqual(gameModuleEffectByIndex(210))
    expect(gameModuleEffectByIndex(330, 119)).toEqual(gameModuleEffectByIndex(211))
  })

  it('decodes assist generator effect with primary module level offset (petethered slot 3)', () => {
    expect(
      gameModuleEffectByIndexForSlot(328, 'generator', 66, 134),
    ).toMatchObject({
      effectId: 'free-utility-upgrade',
      rarity: 'legendary',
    })
    const imported = gameSubmoduleImportFromEffectIndices(
      'generator',
      [207, 212, 216, 328, 0, 0, 0, 0],
      66,
      134,
    )
    expect(imported.map).toMatchObject({
      'max-recovery': 'mythic',
      'enemy-attack-level-skip': 'epic',
      'enemy-health-level-skip': 'epic',
      'free-utility-upgrade': 'legendary',
    })
    expect(imported.ordered[3]).toMatchObject({
      effectId: 'free-utility-upgrade',
      rarity: 'legendary',
    })
  })

  it('maps Fudgyrella core effect indices to death wave damage, spotlight, golden tower, chain lightning', () => {
    expect(gameModuleEffectByIndex(250)).toMatchObject({
      effectId: 'death-wave-damage-x',
      rarity: 'legendary',
    })
    expect(gameModuleEffectByIndex(321)).toMatchObject({
      effectId: 'spotlight-bonus',
      rarity: 'mythic',
    })
    expect(gameModuleEffectByIndex(283)).toMatchObject({
      effectId: 'golden-tower-bonus',
      rarity: 'mythic',
    })
    expect(gameModuleEffectByIndex(221)).toMatchObject({
      effectId: 'chain-lightning-damage-x',
      rarity: 'mythic',
    })
  })
})
