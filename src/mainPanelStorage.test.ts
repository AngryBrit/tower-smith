import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MAIN_PANEL,
  readMainPanel,
  sanitizeMainPanel,
} from './mainPanelStorage'

describe('mainPanelStorage', () => {
  it('defaults to workshop', () => {
    expect(sanitizeMainPanel(undefined, false)).toBe(DEFAULT_MAIN_PANEL)
    expect(sanitizeMainPanel('bogus', false)).toBe(DEFAULT_MAIN_PANEL)
  })

  it('maps modules to workshop when panel disabled', () => {
    expect(sanitizeMainPanel('modules', false)).toBe('workshop')
    expect(sanitizeMainPanel('modules', true)).toBe('modules')
  })

  it('maps legacy galleryAdmin panel to toolsSettings', () => {
    expect(sanitizeMainPanel('galleryAdmin', true)).toBe('toolsSettings')
  })

  it('readMainPanel returns workshop when storage empty', () => {
    expect(readMainPanel(false)).toBe('workshop')
  })
})
