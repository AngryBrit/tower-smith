import { describe, expect, it } from 'vitest'
import { isColorSchemePreference, resolveColorScheme } from './colorSchemePreference'

describe('colorSchemePreference', () => {
  it('recognizes stored preference values', () => {
    expect(isColorSchemePreference('dark')).toBe(true)
    expect(isColorSchemePreference('light')).toBe(true)
    expect(isColorSchemePreference('high-contrast')).toBe(true)
    expect(isColorSchemePreference('system')).toBe(false)
    expect(isColorSchemePreference('bogus')).toBe(false)
    expect(isColorSchemePreference(null)).toBe(false)
  })

  it('resolves preferences directly', () => {
    expect(resolveColorScheme('dark')).toBe('dark')
    expect(resolveColorScheme('light')).toBe('light')
    expect(resolveColorScheme('high-contrast')).toBe('high-contrast')
  })
})
