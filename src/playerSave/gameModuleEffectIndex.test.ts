import { describe, expect, it } from 'vitest'
import {
  gameModuleEffectByIndex,
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
    expect(gameModuleEffectByIndex(215)).toMatchObject({
      effectId: 'enemy-attack-level-skip',
      rarity: 'ancestral',
    })
    expect(gameModuleEffectByIndex(219)).toMatchObject({
      effectId: 'enemy-health-level-skip',
      rarity: 'ancestral',
    })
  })

  it('imports Havoc Bringer substats from infoIndex 7 save row', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'cannon',
      [27, 19, 0, 0, 0, 0, 0, 0],
      1,
      0,
      'epic',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'damage-meter-m',
      rarity: 'epic',
    })
    expect(imported.ordered[1]).toMatchObject({
      effectId: 'attack-range-m',
      rarity: 'common',
    })
  })

  it('imports Death Penalty rapid-fire duration from rare-start row save index', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'cannon',
      [0, 45, 0, 0, 0, 0, 0, 0],
      50,
      0,
      'epic',
    )
    expect(imported.ordered[1]).toMatchObject({
      effectId: 'rapid-fire-duration',
      rarity: 'rare',
    })
  })

  it('imports epic rapid-fire duration from legendary save index on rare-start row', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'cannon',
      [46, 0, 0, 0, 0, 0, 0, 0],
      50,
      0,
      'epic',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'rapid-fire-duration',
      rarity: 'epic',
    })
  })

  it('imports Shrink Ray ancestral substats on ancestral-family cannon chassis', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'cannon',
      [39, 15, 6, 24, 0, 0, 0, 0],
      200,
      0,
      'star_2',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'multishot-targets',
      rarity: 'ancestral',
    })
    expect(imported.ordered[1]).toMatchObject({ effectId: 'crit-factor', rarity: 'epic' })
    expect(imported.ordered[2]).toMatchObject({
      effectId: 'attack-speed',
      rarity: 'ancestral',
    })
    expect(imported.ordered[3]).toMatchObject({
      effectId: 'damage-meter-m',
      rarity: 'common',
    })
  })

  it('keeps rapid-fire rare at save index 39 on non-ancestral cannon chassis', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'cannon',
      [39, 0, 0, 0, 0, 0, 0, 0],
      50,
      0,
      'legendary',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'rapid-fire-chance',
      rarity: 'rare',
    })
  })

  it('imports Amplifying Strike legendary substats on common-start cannon rows', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'cannon',
      [10, 16, 4, 33, 0, 0, 0, 0],
      50,
      0,
      'epic',
    )
    expect(imported.ordered[0]).toMatchObject({ effectId: 'crit-chance', rarity: 'legendary' })
    expect(imported.ordered[1]).toMatchObject({ effectId: 'crit-factor', rarity: 'legendary' })
    expect(imported.ordered[2]).toMatchObject({ effectId: 'attack-speed', rarity: 'legendary' })
    expect(imported.ordered[3]).toMatchObject({
      effectId: 'multishot-chance',
      rarity: 'legendary',
    })
  })

  it('imports Astral Deliverance cannon substats from save indices (epic-start row offset)', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'cannon',
      [9, 68, 15, 0, 0, 0, 0, 0],
      140,
      0,
      'star_1',
    )
    expect(imported.ordered[0]).toMatchObject({ effectId: 'crit-chance', rarity: 'epic' })
    expect(imported.ordered[1]).toMatchObject({ effectId: 'super-crit-multi', rarity: 'epic' })
    expect(imported.ordered[2]).toMatchObject({ effectId: 'crit-factor', rarity: 'epic' })
  })

  it('keeps true legendary cannon substat when previous index is also legendary', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'cannon',
      [42, 0, 0, 0, 0, 0, 0, 0],
      50,
      0,
      'epic',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'rapid-fire-chance',
      rarity: 'legendary',
    })
  })

  it('decodes ancestral-family generator main sparse indices for coins kill and free attack', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'generator',
      [215, 193, 160, 184, 0, 0, 0, 0],
      100,
      0,
      'star_2',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'enemy-attack-level-skip',
      rarity: 'ancestral',
    })
    expect(imported.ordered[1]).toMatchObject({
      effectId: 'free-utility-upgrade',
      rarity: 'epic',
    })
    expect(imported.ordered[2]).toMatchObject({
      effectId: 'coins-kill-bonus',
      rarity: 'ancestral',
    })
    expect(imported.ordered[3]).toMatchObject({
      effectId: 'free-attack-upgrade',
      rarity: 'ancestral',
    })
  })

  it('decodes Black Hole Digestor coins-kill ancestral at coins-wave sparse index 172', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'generator',
      [215, 193, 172, 184, 0, 0, 0, 0],
      200,
      0,
      'star_2',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'enemy-attack-level-skip',
      rarity: 'ancestral',
    })
    expect(imported.ordered[1]).toMatchObject({
      effectId: 'free-utility-upgrade',
      rarity: 'epic',
    })
    expect(imported.ordered[2]).toMatchObject({
      effectId: 'coins-kill-bonus',
      rarity: 'ancestral',
    })
    expect(imported.ordered[3]).toMatchObject({
      effectId: 'free-attack-upgrade',
      rarity: 'ancestral',
    })
  })

  it('keeps coins-wave common at save index 172 on non-ancestral generator chassis', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'generator',
      [172, 0, 0, 0, 0, 0, 0, 0],
      50,
      0,
      'legendary',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'coins-wave',
      rarity: 'common',
    })
  })

  it('keeps enemy attack level skip ancestral at high module level on ancestral generator', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'generator',
      [215, 0, 0, 0, 0, 0, 0, 0],
      134,
      0,
      'star_2',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'enemy-attack-level-skip',
      rarity: 'ancestral',
    })
  })

  it('imports compressed ancestral generator indices on Ancestral-tier Project Funding', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'generator',
      [216, 212, 191, 208, 0, 0, 0, 0],
      134,
      0,
      'star_2',
    )
    expect(imported.map).toMatchObject({
      'enemy-health-level-skip': 'ancestral',
      'enemy-attack-level-skip': 'ancestral',
      'free-utility-upgrade': 'common',
      'package-chance': 'ancestral',
    })
  })

  it('decodes level-offset effect index 330 as Package Chance mythic at 210', () => {
    expect(gameModuleEffectByIndex(330, 120)).toEqual(gameModuleEffectByIndex(210))
    expect(gameModuleEffectByIndex(330, 119)).toEqual(gameModuleEffectByIndex(211))
  })

  it('maps crit chance index 7 to common (+2%)', () => {
    expect(gameModuleEffectByIndex(7)).toMatchObject({
      effectId: 'crit-chance',
      rarity: 'common',
    })
    const imported = gameSubmoduleImportFromEffectIndices(
      'cannon',
      [7, 0, 0, 0, 0, 0, 0, 0],
      136,
    )
    expect(imported.map['crit-chance']).toBe('common')
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'crit-chance',
      rarity: 'common',
    })
  })

  it('decodes Dimension Core main effects (petethered)', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'core',
      [231, 225, 324, 315, 0, 0, 0, 0],
      138,
      0,
      'ancestral',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'chain-lightning-chance',
      rarity: 'mythic',
    })
    expect(imported.ordered[1]).toMatchObject({
      effectId: 'chain-lightning-quantity',
      rarity: 'mythic',
    })
    expect(imported.ordered[2]).toMatchObject({
      effectId: 'spotlight-angle',
      rarity: 'legendary',
    })
    expect(imported.ordered[3]).toMatchObject({
      effectId: 'black-hole-cooldown-s',
      rarity: 'mythic',
    })
    expect(imported.map).toMatchObject({
      'chain-lightning-chance': 'mythic',
      'chain-lightning-quantity': 'mythic',
      'spotlight-angle': 'legendary',
      'black-hole-cooldown-s': 'mythic',
    })
  })

  it('decodes Harmony Conductor assist core effects (petethered)', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'core',
      [286, 284, 326, 307, 0, 0, 0, 0],
      41,
      138,
      'star_1',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'golden-tower-duration-s',
      rarity: 'mythic',
    })
    expect(imported.ordered[1]).toMatchObject({
      effectId: 'golden-tower-bonus',
      rarity: 'ancestral',
    })
    expect(imported.ordered[2]).toMatchObject({
      effectId: 'spotlight-angle',
      rarity: 'ancestral',
    })
    expect(imported.ordered[3]).toMatchObject({
      effectId: 'black-hole-size-m',
      rarity: 'epic',
    })
    expect(imported.map).toMatchObject({
      'golden-tower-duration-s': 'mythic',
      'golden-tower-bonus': 'ancestral',
      'spotlight-angle': 'ancestral',
      'black-hole-size-m': 'epic',
    })
  })

  it('decodes Black Hole Digestor main generator sparse indices (petethered)', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'generator',
      [207, 171, 193, 211, 0, 0, 0, 0],
      134,
      0,
      'mythic_plus',
    )
    expect(imported.map).toMatchObject({
      'package-chance': 'mythic',
      'coins-kill-bonus': 'mythic',
      'free-utility-upgrade': 'epic',
      'enemy-attack-level-skip': 'mythic',
    })
  })

  it('decodes Singularity Harness assist generator sparse indices (petethered)', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'generator',
      [211, 195, 207, 162, 0, 0, 0, 0],
      66,
      134,
      'mythic_plus',
    )
    expect(imported.map).toMatchObject({
      'enemy-attack-level-skip': 'mythic',
      'free-utility-upgrade': 'mythic',
      'package-chance': 'mythic',
      'cash-wave': 'rare',
    })
  })

  it('decodes Sharp Fortitude armor main effects (petethered)', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'armor',
      [92, 150, 86, 101, 0, 0, 0, 0],
      130,
      0,
      'ancestral',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'defense',
      rarity: 'ancestral',
    })
    expect(imported.ordered[1]).toMatchObject({
      effectId: 'wall-health',
      rarity: 'ancestral',
    })
    expect(imported.ordered[2]).toMatchObject({
      effectId: 'health-regen',
      rarity: 'ancestral',
    })
    expect(imported.ordered[3]).toMatchObject({
      effectId: 'thorns-damage',
      rarity: 'mythic',
    })
    expect(imported.map).toMatchObject({
      defense: 'ancestral',
      'wall-health': 'ancestral',
      'health-regen': 'ancestral',
      'thorns-damage': 'mythic',
    })
  })

  it('decodes Sharp Fortitude epic thorns at second legendary sparse index 100', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'armor',
      [92, 86, 150, 100, 0, 0, 0, 0],
      200,
      0,
      'ancestral',
    )
    expect(imported.ordered[0]).toMatchObject({ effectId: 'defense', rarity: 'ancestral' })
    expect(imported.ordered[1]).toMatchObject({ effectId: 'health-regen', rarity: 'ancestral' })
    expect(imported.ordered[2]).toMatchObject({ effectId: 'wall-health', rarity: 'ancestral' })
    expect(imported.ordered[3]).toMatchObject({ effectId: 'thorns-damage', rarity: 'epic' })
  })

  it('decodes Sharp Fortitude epic thorns at first legendary sparse index 99', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'armor',
      [92, 86, 150, 99, 0, 0, 0, 0],
      200,
      0,
      'ancestral',
    )
    expect(imported.ordered[3]).toMatchObject({ effectId: 'thorns-damage', rarity: 'epic' })
  })

  it('decodes Orbital Augment armor assist effects (petethered)', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'armor',
      [92, 149, 86, 139, 0, 0, 0, 0],
      90,
      130,
      'ancestral',
    )
    expect(imported.map).toMatchObject({
      defense: 'ancestral',
      'wall-health': 'mythic',
      'health-regen': 'ancestral',
      'land-mine-radius': 'rare',
    })
  })

  it('decodes Orbital Augment epic assist wall health at sparse epic index 147', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'armor',
      [89, 83, 147, 0, 0, 0, 0, 0],
      60,
      100,
      'epic',
    )
    expect(imported.ordered[2]).toMatchObject({
      effectId: 'wall-health',
      rarity: 'epic',
    })
    expect(imported.map).toMatchObject({
      defense: 'epic',
      'health-regen': 'epic',
      'wall-health': 'epic',
    })
  })

  it('decodes Galaxy Compressor legendary merge epic substats at compressed indices', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'generator',
      [205, 213, 209, 0, 0, 0, 0, 0],
      60,
      0,
      'legendary',
    )
    expect(imported.ordered.slice(0, 3)).toEqual([
      { effectId: 'package-chance', rarity: 'epic' },
      { effectId: 'enemy-health-level-skip', rarity: 'epic' },
      { effectId: 'enemy-attack-level-skip', rarity: 'epic' },
    ])
    expect(imported.map).toMatchObject({
      'package-chance': 'epic',
      'enemy-health-level-skip': 'epic',
      'enemy-attack-level-skip': 'epic',
    })
  })

  it('decodes Space Displacer assist armor effects (petethered)', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'armor',
      [142, 88, 81, 132, 0, 0, 0, 0],
      90,
      undefined,
      'mythic',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'land-mine-radius',
      rarity: 'mythic',
    })
    expect(imported.ordered[3]).toMatchObject({
      effectId: 'land-mine-chance',
      rarity: 'mythic',
    })
    expect(imported.map).toMatchObject({
      'land-mine-radius': 'mythic',
      defense: 'rare',
      'health-regen': 'common',
      'land-mine-chance': 'mythic',
    })
  })

  it('decodes Pulsar Harvester assist generator effects (petethered)', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'generator',
      [207, 212, 216, 328, 0, 0, 0, 0],
      66,
      134,
      'star_2',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'package-chance',
      rarity: 'mythic',
    })
    expect(imported.ordered[1]).toMatchObject({
      effectId: 'enemy-attack-level-skip',
      rarity: 'ancestral',
    })
    expect(imported.ordered[2]).toMatchObject({
      effectId: 'enemy-health-level-skip',
      rarity: 'ancestral',
    })
    expect(imported.ordered[3]).toMatchObject({
      effectId: 'max-recovery',
      rarity: 'epic',
    })
    expect(imported.map).toMatchObject({
      'package-chance': 'mythic',
      'enemy-attack-level-skip': 'ancestral',
      'enemy-health-level-skip': 'ancestral',
      'max-recovery': 'epic',
    })
  })

  it('decodes Mythic+ Primordial Collapse main core sparse indices to in-game substat picks', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'core',
      [250, 315, 285, 311, 283, 0, 0, 0],
      160,
      0,
      'mythic_plus',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'death-wave-damage-x',
      rarity: 'mythic',
    })
    expect(imported.ordered[1]).toMatchObject({
      effectId: 'black-hole-cooldown-s',
      rarity: 'mythic',
    })
    expect(imported.ordered[2]).toMatchObject({
      effectId: 'golden-tower-duration-s',
      rarity: 'mythic',
    })
    expect(imported.ordered[3]).toMatchObject({
      effectId: 'black-hole-duration-s',
      rarity: 'mythic',
    })
    expect(imported.ordered[4]).toMatchObject({
      effectId: 'golden-tower-bonus',
      rarity: 'mythic',
    })
    expect(imported.map).toMatchObject({
      'death-wave-damage-x': 'mythic',
      'black-hole-cooldown-s': 'mythic',
      'golden-tower-duration-s': 'mythic',
      'black-hole-duration-s': 'mythic',
      'golden-tower-bonus': 'mythic',
    })
  })

  it('decodes ancestral-family core main sparse indices for death wave, spotlight, golden tower, black hole', () => {
    const imported = gameSubmoduleImportFromEffectIndices(
      'core',
      [254, 329, 281, 316, 0, 0, 0, 0],
      100,
      0,
      'star_1',
    )
    expect(imported.ordered[0]).toMatchObject({
      effectId: 'death-wave-quantity',
      rarity: 'ancestral',
    })
    expect(imported.ordered[1]).toMatchObject({
      effectId: 'spotlight-angle',
      rarity: 'mythic',
    })
    expect(imported.ordered[2]).toMatchObject({
      effectId: 'golden-tower-bonus',
      rarity: 'epic',
    })
    expect(imported.ordered[3]).toMatchObject({
      effectId: 'black-hole-cooldown-s',
      rarity: 'ancestral',
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
