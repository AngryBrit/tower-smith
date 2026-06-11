import { describe, expect, it } from 'vitest'
import { WORKSHOP_SUBMODULE_SECTIONS } from '../data/workshopSubmoduleCatalog'
import {
  MODULE_EP_MERGE_TIER_SHEET_LABELS,
  MODULE_EP_SUBMODULE_RARITY_SHEET_LABELS,
  moduleEpMergeTierSheetLabel,
  moduleEpSubmoduleRaritySheetLabel,
  moduleEpSubmoduleSheetLabel,
} from './moduleEpSheetNames'

describe('moduleEpSheetNames', () => {
  it('maps merge tiers to Inventory dropdown labels', () => {
    expect(moduleEpMergeTierSheetLabel('star_1')).toBe('Ancestral 1*')
    expect(moduleEpMergeTierSheetLabel('legendary_plus')).toBe('Legendary+')
    expect(MODULE_EP_MERGE_TIER_SHEET_LABELS).toContain('Ancestral 1*')
  })

  it('maps submodule rarities', () => {
    expect(moduleEpSubmoduleRaritySheetLabel('legendary')).toBe('Legendary')
    expect(MODULE_EP_SUBMODULE_RARITY_SHEET_LABELS).toEqual([
      'Common',
      'Rare',
      'Epic',
      'Legendary',
      'Mythic',
      'Ancestral',
    ])
  })

  it('maps catalog labels to sheet substat names', () => {
    expect(moduleEpSubmoduleSheetLabel('Crit Chance [%]')).toBe('Critical Chance')
    expect(moduleEpSubmoduleSheetLabel('Defense [%]')).toBe('Defense %')
    expect(moduleEpSubmoduleSheetLabel('Golden Tower - Bonus')).toBe('Golden Tower - Bonus')
    expect(moduleEpSubmoduleSheetLabel('Chain Lightning - Chance [%]')).toBe('Chain Lightning - Chance')
  })

  it('covers every catalog row with a non-empty sheet label', () => {
    for (const section of Object.values(WORKSHOP_SUBMODULE_SECTIONS)) {
      for (const row of section.rows) {
        expect(moduleEpSubmoduleSheetLabel(row.label).length).toBeGreaterThan(0)
      }
    }
  })
})
