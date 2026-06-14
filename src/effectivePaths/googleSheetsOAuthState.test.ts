import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearGoogleSheetsOAuthState,
  createGoogleSheetsOAuthState,
  stashGoogleSheetsOAuthState,
  verifyGoogleSheetsOAuthState,
} from './googleSheetsOAuthState'

describe('googleSheetsOAuthState', () => {
  const store = new Map<string, string>()

  beforeEach(() => {
    store.clear()
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
    })
  })

  afterEach(() => {
    clearGoogleSheetsOAuthState()
    vi.unstubAllGlobals()
  })

  it('creates a 64-char hex state token', () => {
    const state = createGoogleSheetsOAuthState()
    expect(state).toMatch(/^[0-9a-f]{64}$/)
    expect(createGoogleSheetsOAuthState()).not.toBe(state)
  })

  it('accepts a matching state once, then rejects reuse', () => {
    const state = createGoogleSheetsOAuthState()
    stashGoogleSheetsOAuthState(state)
    expect(verifyGoogleSheetsOAuthState(state)).toBe(true)
    expect(verifyGoogleSheetsOAuthState(state)).toBe(false)
  })

  it('rejects missing or mismatched state', () => {
    stashGoogleSheetsOAuthState('abc123')
    expect(verifyGoogleSheetsOAuthState(undefined)).toBe(false)
    expect(verifyGoogleSheetsOAuthState('wrong')).toBe(false)
  })
})
