import { describe, expect, it } from 'vitest'
import { legalRouteFromPathname } from './legalRoute'

describe('legalRouteFromPathname', () => {
  it('maps privacy and terms paths', () => {
    expect(legalRouteFromPathname('/privacy')).toBe('privacy')
    expect(legalRouteFromPathname('/privacy/')).toBe('privacy')
    expect(legalRouteFromPathname('/terms')).toBe('terms')
    expect(legalRouteFromPathname('/terms/')).toBe('terms')
  })

  it('returns null for app routes', () => {
    expect(legalRouteFromPathname('/')).toBeNull()
    expect(legalRouteFromPathname('/gallery')).toBeNull()
  })
})
