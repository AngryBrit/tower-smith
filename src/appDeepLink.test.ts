import { describe, expect, it } from 'vitest'
import {
  parseAppDeepLinkFromLocation,
  relicDomId,
  resolveWorkshopDeepLinkNav,
  workshopStatDomId,
  workshopUltimateDomId,
} from './appDeepLink'

describe('appDeepLink', () => {
  it('builds stable DOM ids', () => {
    expect(relicDomId('t_i_flux')).toBe('relic-t_i_flux')
    expect(workshopStatDomId('damageLevel')).toBe('workshop-damageLevel')
    expect(workshopUltimateDomId('blackHole')).toBe('workshop-ultimate-blackHole')
  })

  it('resolves workshop stat navigation', () => {
    expect(resolveWorkshopDeepLinkNav('damageLevel')).toMatchObject({
      category: 'attack',
      mainTab: 'upgrade',
      domId: 'workshop-damageLevel',
    })
    expect(resolveWorkshopDeepLinkNav('enhanceDamageLevel')).toMatchObject({
      category: 'attack',
      mainTab: 'enhance',
    })
    expect(resolveWorkshopDeepLinkNav('ultimate-blackHole')).toMatchObject({
      category: 'ultimate',
      mainTab: 'upgrade',
      domId: 'workshop-ultimate-blackHole',
    })
    expect(resolveWorkshopDeepLinkNav('not-a-stat')).toBeNull()
  })

  it('parses hash and query targets', () => {
    expect(
      parseAppDeepLinkFromLocation('#attack-research--damage', ''),
    ).toEqual({
      kind: 'lab',
      target: 'attack-research--damage',
    })

    expect(parseAppDeepLinkFromLocation('#relic-t_i_flux', '')).toEqual({
      kind: 'relic',
      target: 't_i_flux',
    })

    expect(parseAppDeepLinkFromLocation('#workshop-damageLevel', '')).toEqual({
      kind: 'workshop',
      target: 'damageLevel',
    })

    expect(parseAppDeepLinkFromLocation('', '?workshop=attackSpeedLevel')).toEqual({
      kind: 'workshop',
      target: 'attackSpeedLevel',
    })

    expect(
      parseAppDeepLinkFromLocation('', '?relic=t_ii_lumin&lab=ignored'),
    ).toEqual({ kind: 'relic', target: 't_ii_lumin' })

    expect(parseAppDeepLinkFromLocation('', '')).toBeNull()
  })
})
