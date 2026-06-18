import { describe, expect, it } from 'vitest'
import { workshopRelicIdFromSheetName } from './relicSheetNames'

describe('workshopRelicIdFromSheetName', () => {
  it('maps EP v3.1.6 tier labels with a space after the colon', () => {
    const spaced = [
      ['T: VI Nova', 't_vi_nova'],
      ['T: VII Aether', 't_vii_aether'],
      ['T: VIII Graviton', 't_viii_graviton'],
      ['T: IX Fusion', 't_ix_fusion'],
      ['T: X Plasma', 't_x_plasma'],
      ['T: XI Resonance', 't_xi_resonance'],
      ['T: XII Chrono', 't_xii_chrono'],
      ['T: XIII Hyper', 't_xiii_hyper'],
      ['T: XIV Arcane', 't_xiv_arcane'],
      ['T: XV Celestial', 't_xv_celestial'],
      ['T: XVI Quantum', 't_xvi_quantum'],
      ['T: XVII Nebula', 't_xvii_nebula'],
      ['T: XVIII Singularity', 't_xviii_singularity'],
      ['T: XIX Atomic', 't_xix_atomic'],
      ['T: XX Cyber', 't_xx_cyber'],
      ['T: XXI Eclipse', 't_xxi_eclipse'],
    ] as const
    for (const [sheetName, id] of spaced) {
      expect(workshopRelicIdFromSheetName(sheetName)).toBe(id)
    }
  })

  it('still maps compact tier labels without spaces', () => {
    expect(workshopRelicIdFromSheetName('T:VI Nova')).toBe('t_vi_nova')
    expect(workshopRelicIdFromSheetName('T:I Flux')).toBe('t_i_flux')
  })

  it('maps relic names with spaced [n] suffixes and anniversary labels', () => {
    expect(workshopRelicIdFromSheetName('Mystic Bunny [1]')).toBe('mystic_bunny_1')
    expect(workshopRelicIdFromSheetName('Mystic Hare')).toBe('mystic_bunny_1')
    expect(workshopRelicIdFromSheetName('Mystic Hair')).toBe('mystic_bunny_1')
    expect(workshopRelicIdFromSheetName('Big Party')).toBe('big_party')
    expect(workshopRelicIdFromSheetName('BigParty')).toBe('big_party')
    expect(workshopRelicIdFromSheetName('Celebration')).toBe('celebration')
  })

  it('maps Cheers and Champagne to distinct relic ids', () => {
    expect(workshopRelicIdFromSheetName('Cheers')).toBe('cheers')
    expect(workshopRelicIdFromSheetName('Champagne')).toBe('champagne')
  })
})
