import { describe, expect, it } from 'vitest'
import { buildModuleSheetUpdates } from './buildModuleSheetUpdates'
import {
  legacyModuleEpInventoryLayout,
  parseModuleEpInventoryLayoutV612,
  resolveModuleEpInventoryLayout,
} from './moduleEpInventoryLayoutFromSheet'
import {
  modulesEpDefaultSectionLevels,
  type ModulesEpSyncState,
} from './modulesEpStateFromPersisted'

/** Trimmed v6.1.2 grid Inventory tab (rows 1–20). */
const V612_GRID: string[][] = [
  ['Module Inventory'],
  [''],
  ['', '🔵 CANNON', 'Astral Deliverance', 'Being Annihilator', 'Death Penalty', 'Havoc Bringer', 'Shrink Ray', 'Amplifying Strike', 'Any Other', 'Any Other 2'],
  ['', 'Highest Level', 'Rarity', 'Level', 'Stat', 'Rarity', 'Level', 'Stat', 'Rarity', 'Level', 'Stat', 'Rarity', 'Level', 'Stat', 'Rarity', 'Level', 'Stat', 'Rarity', 'Level', 'Stat', 'Rarity', 'Level', 'Stat', 'Rarity', 'Level', 'Stat'],
  ['', 'Tower Damage', '300', 'Ancestral 2*', '240', 'x26.099', 'None', '0', 'x1.000', 'None', '0', 'x1.000', 'None', '0', 'x1.000', 'None', '0', 'x1.000', 'None', '0', 'x1.000', 'Common', '20', 'x1.050', 'Common', '20', 'x1.050'],
  [''],
  ['', 'Assist Level', 'Critical Chance', 'Epic', '+4%'],
  ['', '1', 'Super Crit Multi', 'Epic', '+2x'],
  ['', '', 'Critical Factor', 'Epic', '+6x'],
  ['', '', 'Critical Factor', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', 'Epic', '60', 'x1.128'],
  ['', '🟥 ARMOR', 'Negative Mass Projector', 'Space Displacer', 'Wormhole Redirector', 'Orbital Augment', 'Any Other', 'Any Other 2'],
  ['', 'Highest Level', 'Stat', 'Rarity', 'Level', 'Stat', 'Rarity', 'Level', 'Stat', 'Rarity', 'Level', 'Stat', 'Rarity', 'Level', 'Stat', 'Rarity', 'Level', 'Stat', 'Rarity', 'Level', 'Stat'],
  ['', 'Tower Health', '300', '', '#VALUE!', 'None', '0', 'x1.000', 'None', '0', 'x1.000', 'None', '0', 'x1.000', 'Legendary', '100', 'x2.270', 'None', '0', 'x1.000', 'Common', '20', 'x1.050', 'Common', '20', 'x1.050'],
]

describe('resolveModuleEpInventoryLayout', () => {
  it('detects v6.1.2 grid layout from title row', () => {
    const layout = resolveModuleEpInventoryLayout(V612_GRID)
    expect(layout.variant).toBe('v612')
    expect(layout.sections.cannon.highestPrimaryLevelCell).toEqual({ row: 5, col: 2 })
    expect(layout.sections.cannon.highestAssistLevelCell).toEqual({ row: 8, col: 1 })
    expect(layout.sections.cannon.dataRow).toBe(5)
    expect(layout.sections.armor.dataRow).toBe(18)
    expect(layout.sections.cannon.blockStride).toBe(3)
  })

  it('maps cannon modules with stride-3 columns starting at D', () => {
    const layout = parseModuleEpInventoryLayoutV612(V612_GRID)
    const astral = layout.sections.cannon.modules.find((m) => m.moduleId === 'astralDeliverance')
    const anyOther = layout.sections.cannon.modules.find((m) => m.moduleId === '__anyOther1')
    expect(astral?.baseCol).toBe(3)
    expect(anyOther?.baseCol).toBe(21)
  })

  it('maps orbital augment to the fifth armor block', () => {
    const layout = parseModuleEpInventoryLayoutV612(V612_GRID)
    const orbital = layout.sections.armor.modules.find((m) => m.moduleId === 'orbitalAugment')
    expect(orbital?.baseCol).toBe(14)
  })

  it('maps stride-3 rarity columns from data row, not skipped name-row labels', () => {
    const rows = V612_GRID.map((row) => [...row])
    rows[2] = [
      '',
      '🔵 CANNON',
      'Tower Damage',
      '300',
      'Astral Deliverance',
      'Being Annihilator',
      'Death Penalty',
      'Havoc Bringer',
      'Shrink Ray',
      'Amplifying Strike',
      'Any Other',
      'Any Other 2',
    ]
    const layout = resolveModuleEpInventoryLayout(rows)
    const astral = layout.sections.cannon.modules.find((m) => m.moduleId === 'astralDeliverance')
    expect(astral?.baseCol).toBe(3)
  })
})

describe('buildModuleSheetUpdates v612', () => {
  it('extrapolates module columns from catalog order when layout omits columns', () => {
    const layout = parseModuleEpInventoryLayoutV612(V612_GRID)
    const sparse = {
      ...layout,
      sections: {
        ...layout.sections,
        cannon: {
          ...layout.sections.cannon,
          modules: layout.sections.cannon.modules.filter((m) => m.moduleId === 'astralDeliverance'),
        },
      },
    }
    const state: ModulesEpSyncState = {
      sectionLevels: modulesEpDefaultSectionLevels(),
      modules: [
        {
          moduleId: 'shrinkRay',
          hubSlot: 'cannon',
          role: 'main',
          mergeTier: 'legendary',
          level: 80,
          hubEquipped: false,
          substats: [],
        },
      ],
    }
    const byRange = Object.fromEntries(
      buildModuleSheetUpdates('Inventory', state, sparse).map((u) => [u.range, u.values[0]![0]]),
    )
    expect(byRange["'Inventory'!G5"]).toBe('Legendary')
  })

  it('writes main cannon data to row 5 column D and assist to its module column', () => {
    const layout = parseModuleEpInventoryLayoutV612(V612_GRID)
    const state: ModulesEpSyncState = {
      sectionLevels: {
        ...modulesEpDefaultSectionLevels(),
        cannon: { highestPrimaryLevel: 300, highestAssistLevel: 1 },
      },
      modules: [
        {
          moduleId: 'astralDeliverance',
          hubSlot: 'cannon',
          role: 'main',
          mergeTier: 'star_2',
          level: 140,
          hubEquipped: true,
          substats: [],
        },
        {
          moduleId: 'amplifyingStrike',
          hubSlot: 'cannon',
          role: 'assist',
          mergeTier: 'legendary_plus',
          level: 100,
          hubEquipped: true,
          substats: [],
        },
      ],
    }
    const byRange = Object.fromEntries(
      buildModuleSheetUpdates('Inventory', state, layout).map((u) => [u.range, u.values[0]![0]]),
    )

    expect(byRange["'Inventory'!C5"]).toBe(300)
    expect(byRange["'Inventory'!B8"]).toBe(1)
    expect(byRange["'Inventory'!D5"]).toBe('Ancestral 2*')
    expect(byRange["'Inventory'!E5"]).toBeUndefined()
    expect(byRange["'Inventory'!G5"]).toBe('None')
    expect(byRange["'Inventory'!S5"]).toBe('Legendary+')
    expect(byRange["'Inventory'!T5"]).toBeUndefined()
    expect(byRange["'Inventory'!V5"]).toBe('None')
  })
})

/** Compact Inventory tab (stride-5, ~3 rows per section) — clean template. */
const COMPACT_GRID: string[][] = [
  ['🔵 CANNON ', '', '', 'Highest Level', '', 'Module Inventory Astral Deliverance Rarity', 'Level', 'Stat', '', '', 'Being Annihilator Rarity', 'Level', 'Stat', '', '', 'Death Penalty Rarity', 'Level', 'Stat', '', '', 'Havoc Bringer Rarity', 'Level', 'Stat', '', '', 'Shrink Ray Rarity', 'Level', 'Stat', '', '', 'Amplifying Strike Rarity', 'Level', 'Stat', '', '', 'Any Other Rarity', 'Level', 'Stat', '', '', 'Any Other 2 Rarity', 'Level', 'Stat'],
  ['', 'Tower Damage', '', '1', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'Common', '1', 'x1.012', '', '', 'Common', '1', 'x1.012'],
  ['', '', '', '1'],
  ['🟥 ARMOR', '', '', '', '', 'Anti-Cube Portal', '', '', '', '', 'Negative Mass Projector', '', '', '', '', 'Space Displacer', '', '', '', '', 'Wormhole Redirector', '', '', '', '', 'Sharp Fortitude', '', '', '', '', 'Orbital Augment', '', '', '', '', 'Any Other', '', '', '', '', 'Any Other 2'],
  ['', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity'],
  ['', 'Tower Health', '', '1', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'Common', '1', 'x1.012'],
  ['', '', '', '1'],
  ['▲ GENERATOR', '', '', '', '', 'Black Hole Digestor', '', '', '', '', 'Galaxy Compressor', '', '', '', '', 'Singularity Harness', '', '', '', '', 'Pulsar Harvester', '', '', '', '', 'Project Funding', '', '', '', '', 'Restorative Bonus', '', '', '', '', 'Any Other', '', '', '', '', 'Any Other 2'],
  ['', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity'],
  ['', 'Coin Bonus', '', '1', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'Common', '1', 'x1.011'],
  ['', '', '', '1'],
  ['🔶 CORE', '', '', '', '', 'Multiverse Nexus', '', '', '', '', 'Dimension Core', '', '', '', '', 'Harmony Conductor', '', '', '', '', 'Om Chip', '', '', '', '', 'Magnetic Hook', '', '', '', '', 'Primordial Collapse', '', '', '', '', 'Any Other', '', '', '', '', 'Any Other 2'],
  ['', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity', '', '', '', '', 'Rarity'],
  ['', 'UW Damage', '', '1', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'None', '0', 'x1.000', '', '', 'Common', '1', 'x1.040'],
]

describe('compact Inventory layout', () => {
  it('detects compact stride-5 rows from clean template', () => {
    const layout = resolveModuleEpInventoryLayout(COMPACT_GRID)
    expect(layout.variant).toBe('compact')
    expect(layout.sections.cannon.highestPrimaryLevelCell).toEqual({ row: 2, col: 3 })
    expect(layout.sections.cannon.highestAssistLevelCell).toEqual({ row: 8, col: 3 })
    expect(layout.sections.armor.highestAssistLevelCell).toEqual({ row: 21, col: 3 })
    expect(layout.sections.cannon.dataRow).toBe(2)
    expect(layout.sections.armor.dataRow).toBe(6)
    expect(layout.sections.generator.dataRow).toBe(10)
    expect(layout.sections.core.dataRow).toBe(14)
    expect(layout.sections.cannon.blockStride).toBe(5)
    expect(layout.sections.armor.modules.find((m) => m.moduleId === 'orbitalAugment')?.baseCol).toBe(30)
  })

  it('writes armor assist level to row 16 on compact layout', () => {
    const layout = resolveModuleEpInventoryLayout(COMPACT_GRID)
    const state: ModulesEpSyncState = {
      sectionLevels: {
        ...modulesEpDefaultSectionLevels(),
        armor: { highestPrimaryLevel: 130, highestAssistLevel: 90 },
      },
      modules: [
        {
          moduleId: 'orbitalAugment',
          hubSlot: 'armor',
          role: 'assist',
          mergeTier: 'ancestral',
          level: 90,
          hubEquipped: true,
          substats: [],
        },
      ],
    }
    const byRange = Object.fromEntries(
      buildModuleSheetUpdates('Inventory', state, layout).map((u) => [u.range, u.values[0]![0]]),
    )
    expect(byRange["'Inventory'!D6"]).toBe(130)
    expect(byRange["'Inventory'!D21"]).toBe(90)
  })

  it('writes astral to F2 and assist to its module column on compact layout', () => {
    const layout = resolveModuleEpInventoryLayout(COMPACT_GRID)
    const state: ModulesEpSyncState = {
      sectionLevels: {
        ...modulesEpDefaultSectionLevels(),
        cannon: { highestPrimaryLevel: 240, highestAssistLevel: 100 },
      },
      modules: [
        {
          moduleId: 'astralDeliverance',
          hubSlot: 'cannon',
          role: 'main',
          mergeTier: 'star_2',
          level: 140,
          hubEquipped: true,
          substats: [],
        },
        {
          moduleId: 'amplifyingStrike',
          hubSlot: 'cannon',
          role: 'assist',
          mergeTier: 'legendary_plus',
          level: 100,
          hubEquipped: true,
          substats: [],
        },
      ],
    }
    const byRange = Object.fromEntries(
      buildModuleSheetUpdates('Inventory', state, layout).map((u) => [u.range, u.values[0]![0]]),
    )
    expect(byRange["'Inventory'!D2"]).toBe(240)
    expect(byRange["'Inventory'!D8"]).toBe(100)
    expect(byRange["'Inventory'!D21"]).toBe(0)
    expect(byRange["'Inventory'!F2"]).toBe('Ancestral 2*')
    expect(byRange["'Inventory'!AE2"]).toBe('Legendary+')
    expect(byRange["'Inventory'!AE3"]).toBeUndefined()
  })

  it('writes main substats to v6.1.2 rows 7–14 on compact layout', () => {
    const layout = resolveModuleEpInventoryLayout(COMPACT_GRID)
    const state: ModulesEpSyncState = {
      sectionLevels: modulesEpDefaultSectionLevels(),
      modules: [
        {
          moduleId: 'astralDeliverance',
          hubSlot: 'cannon',
          role: 'main',
          mergeTier: 'star_1',
          level: 140,
          hubEquipped: true,
          substats: [
            { effectId: 'crit-chance', catalogLabel: 'Crit Chance [%]', rarity: 'epic' },
            { effectId: 'super-crit-multi', catalogLabel: 'Super Crit Multi', rarity: 'epic' },
          ],
        },
        {
          moduleId: 'amplifyingStrike',
          hubSlot: 'cannon',
          role: 'assist',
          mergeTier: 'legendary_plus',
          level: 100,
          hubEquipped: true,
          substats: [
            { effectId: 'attack-speed', catalogLabel: 'Attack Speed', rarity: 'epic' },
          ],
        },
      ],
    }
    const byRange = Object.fromEntries(
      buildModuleSheetUpdates('Inventory', state, layout).map((u) => [u.range, u.values[0]![0]]),
    )

    expect(layout.sections.cannon.substatStartRow).toBe(7)
    expect(layout.sections.cannon.substatEndRow).toBe(14)
    expect(byRange["'Inventory'!F7"]).toBe('Critical Chance')
    expect(byRange["'Inventory'!G7"]).toBe('Epic')
    expect(byRange["'Inventory'!F8"]).toBe('Super Crit Multi')
    expect(byRange["'Inventory'!AE7"]).toBe('Attack Speed')
    expect(byRange["'Inventory'!F3"]).toBeUndefined()
  })
})

describe('buildModuleSheetUpdates fallback', () => {
  it('still supports fallback stride-5 layout', () => {
    const state: ModulesEpSyncState = {
      sectionLevels: modulesEpDefaultSectionLevels(),
      modules: [
        {
          moduleId: 'astralDeliverance',
          hubSlot: 'cannon',
          role: 'main',
          mergeTier: 'star_1',
          level: 140,
          hubEquipped: true,
          substats: [],
        },
      ],
    }
    const byRange = Object.fromEntries(
      buildModuleSheetUpdates('Inventory', state, legacyModuleEpInventoryLayout()).map((u) => [
        u.range,
        u.values[0]![0],
      ]),
    )
    expect(byRange["'Inventory'!U2"]).toBe('Ancestral 1*')
  })
})
