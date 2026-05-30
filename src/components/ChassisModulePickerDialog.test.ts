import { describe, expect, it } from 'vitest'
import {
  shouldHighlightModuleAbilityPart,
  splitModuleAbilityUniqueParts,
} from './chassisModuleAbilityText'

describe('ModuleAbilityUniqueText helpers', () => {
  it('highlights plain count tier values', () => {
    const text = 'When you super crit, your next 3 attacks are guaranteed super crits.'
    const parts = splitModuleAbilityUniqueParts(text, ['3'])
    expect(parts).toContain('3')
    expect(shouldHighlightModuleAbilityPart('3', ['3'])).toBe(true)
  })

  it('still highlights suffixed tier values without an explicit token', () => {
    expect(shouldHighlightModuleAbilityPart('15%', [])).toBe(true)
    expect(shouldHighlightModuleAbilityPart('×2', [])).toBe(true)
  })
})
