import { afterEach, describe, expect, it, vi } from 'vitest'
import { shouldUsePickerOAuthRedirectFlow } from './googleDrivePickerEnvironment'

describe('shouldUsePickerOAuthRedirectFlow', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses JS Picker on localhost desktop', () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      maxTouchPoints: 0,
    })
    expect(shouldUsePickerOAuthRedirectFlow()).toBe(false)
  })

  it('uses JS Picker on production desktop', () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      maxTouchPoints: 0,
    })
    expect(shouldUsePickerOAuthRedirectFlow()).toBe(false)
  })

  it('uses JS Picker on a phone user agent', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      maxTouchPoints: 5,
    })
    expect(shouldUsePickerOAuthRedirectFlow()).toBe(false)
  })
})
