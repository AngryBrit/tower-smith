import { describe, expect, it } from 'vitest'
import { gameModuleEffectByIndex } from './gameModuleEffectIndex'

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
})
