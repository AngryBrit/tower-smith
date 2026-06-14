import { describe, expect, it } from 'vitest'
import {
  defaultWorkshopPresetLabels,
  sanitizeWorkshopPresetLabels,
  workshopPresetDisplayLabel,
  WORKSHOP_PRESET_LABEL_MAX_LENGTH,
} from './workshopPresetLabels'

describe('sanitizeWorkshopPresetLabels', () => {
  it('returns empty labels for invalid input', () => {
    expect(sanitizeWorkshopPresetLabels(null, 5)).toEqual(['', '', '', '', ''])
  })

  it('trims and caps label length', () => {
    const long = 'x'.repeat(WORKSHOP_PRESET_LABEL_MAX_LENGTH + 5)
    expect(sanitizeWorkshopPresetLabels(['  Farm  ', long], 5)).toEqual([
      'Farm',
      'x'.repeat(WORKSHOP_PRESET_LABEL_MAX_LENGTH),
      '',
      '',
      '',
    ])
  })
})

describe('workshopPresetDisplayLabel', () => {
  it('uses custom label when set', () => {
    expect(workshopPresetDisplayLabel(['Raid', ''], 0, 'Preset 1')).toBe('Raid')
  })

  it('falls back when custom label is empty', () => {
    expect(workshopPresetDisplayLabel(defaultWorkshopPresetLabels(), 2, 'Preset 3')).toBe(
      'Preset 3',
    )
  })
})
