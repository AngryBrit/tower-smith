import { describe, expect, it } from 'vitest'
import {
  gameThemeIdAtIndex,
  gameThemeOwnedIdsFromUnlockArrays,
} from './gameThemeIndex'

/** Mirrors sample save: owned 0,2–8; not 1 or 9 (no dark being or magician). */
const SAMPLE_MENU_FLAGS = (() => {
  const flags = Array<boolean>(11).fill(false)
  for (const i of [0, 2, 3, 4, 5, 6, 7, 8]) flags[i] = true
  return flags
})()

/** Mirrors sample save: owned 0,3–9; not 1,2,10 (no magician). */
const SAMPLE_BANNER_FLAGS = (() => {
  const flags = Array<boolean>(11).fill(false)
  for (const i of [0, 3, 4, 5, 6, 7, 8, 9]) flags[i] = true
  return flags
})()

describe('gameThemeIndex menus', () => {
  it('maps save indices: 0 default menu, 1 dark being, 2 mech, 10 magician', () => {
    expect(gameThemeIdAtIndex('menus', 0)).toBeUndefined()
    expect(gameThemeIdAtIndex('menus', 1)).toBe('menu-dark-being')
    expect(gameThemeIdAtIndex('menus', 2)).toBe('menu-mech')
    expect(gameThemeIdAtIndex('menus', 7)).toBe('menu-supernova')
    expect(gameThemeIdAtIndex('menus', 8)).toBe('menu-claw')
    expect(gameThemeIdAtIndex('menus', 9)).toBe('menu-magician')
  })

  it('imports owned guild menus except dark being and magician', () => {
    const owned = gameThemeOwnedIdsFromUnlockArrays({
      towerUnlocked: [],
      backgroundUnlocked: [],
      menuUnlocked: SAMPLE_MENU_FLAGS,
      profileBannerUnlocked: [],
      guardianSkinUnlocked: [],
    })
    expect(owned).toEqual(
      expect.arrayContaining([
        'menu-mech',
        'menu-party',
        'menu-pixel',
        'menu-horror',
        'menu-cosmos',
        'menu-supernova',
        'menu-claw',
      ]),
    )
    expect(owned).not.toContain('menu-dark-being')
    expect(owned).not.toContain('menu-magician')
    expect(owned).toHaveLength(7)
  })
})

describe('gameThemeIndex banners', () => {
  it('maps guild seasons 2–9 at indices 3–9 with gaps at 0–2', () => {
    expect(gameThemeIdAtIndex('banners', 0)).toBeUndefined()
    expect(gameThemeIdAtIndex('banners', 2)).toBeUndefined()
    expect(gameThemeIdAtIndex('banners', 3)).toBe('banner-mech')
    expect(gameThemeIdAtIndex('banners', 4)).toBe('banner-party')
    expect(gameThemeIdAtIndex('banners', 5)).toBe('banner-pixel')
    expect(gameThemeIdAtIndex('banners', 6)).toBe('banner-horror')
    expect(gameThemeIdAtIndex('banners', 8)).toBe('banner-supernova')
    expect(gameThemeIdAtIndex('banners', 9)).toBe('banner-claw')
    expect(gameThemeIdAtIndex('banners', 10)).toBe('banner-magician')
  })

  it('does not treat index 0 unlock flag as an owned catalog banner', () => {
    const flags = Array<boolean>(11).fill(false)
    flags[0] = true
    const owned = gameThemeOwnedIdsFromUnlockArrays({
      towerUnlocked: [],
      backgroundUnlocked: [],
      menuUnlocked: [],
      profileBannerUnlocked: flags,
      guardianSkinUnlocked: [],
    })
    expect(owned).toEqual([])
  })

  it('imports owned guild banners except magician', () => {
    const owned = gameThemeOwnedIdsFromUnlockArrays({
      towerUnlocked: [],
      backgroundUnlocked: [],
      menuUnlocked: [],
      profileBannerUnlocked: SAMPLE_BANNER_FLAGS,
      guardianSkinUnlocked: [],
    })
    expect(owned).toEqual(
      expect.arrayContaining([
        'banner-mech',
        'banner-party',
        'banner-pixel',
        'banner-horror',
        'banner-cosmos',
        'banner-supernova',
        'banner-claw',
      ]),
    )
    expect(owned).not.toContain('banner-magician')
    expect(owned).toHaveLength(7)
  })
})
