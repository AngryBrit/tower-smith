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
      trackAvailable: [],
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

describe('gameThemeIndex backgrounds', () => {
  it('uses index 0 for default and maps event rows to save slots 1+', () => {
    expect(gameThemeIdAtIndex('background', 0)).toBeUndefined()
    expect(gameThemeIdAtIndex('background', 1)).toBe('bg-interstellar')
    expect(gameThemeIdAtIndex('background', 2)).toBe('bg-volcano')
    expect(gameThemeIdAtIndex('background', 3)).toBe('bg-plasma-field')
    expect(gameThemeIdAtIndex('background', 4)).toBe('bg-honeycomb')
    expect(gameThemeIdAtIndex('background', 5)).toBe('bg-aurora')
    expect(gameThemeIdAtIndex('background', 6)).toBe('bg-alien-ship')
    expect(gameThemeIdAtIndex('background', 7)).toBe('bg-ocean-night')
    expect(gameThemeIdAtIndex('background', 8)).toBe('bg-sakura')
    expect(gameThemeIdAtIndex('background', 9)).toBe('bg-easter')
    expect(gameThemeIdAtIndex('background', 10)).toBe('bg-retrowave')
    expect(gameThemeIdAtIndex('background', 11)).toBe('bg-prismatic-lines')
    expect(gameThemeIdAtIndex('background', 12)).toBe('bg-cobweb')
    expect(gameThemeIdAtIndex('background', 13)).toBe('bg-matrix')
    expect(gameThemeIdAtIndex('background', 14)).toBe('bg-haunted-house')
    expect(gameThemeIdAtIndex('background', 15)).toBe('bg-virus-field')
    expect(gameThemeIdAtIndex('background', 16)).toBe('bg-mountain-night')
    expect(gameThemeIdAtIndex('background', 17)).toBe('bg-sandstorm')
    expect(gameThemeIdAtIndex('background', 18)).toBe('bg-autumn-forest')
    expect(gameThemeIdAtIndex('background', 19)).toBe('bg-arcade')
    expect(gameThemeIdAtIndex('background', 20)).toBe('bg-new-years')
    expect(gameThemeIdAtIndex('background', 21)).toBe('bg-dark-strands')
    expect(gameThemeIdAtIndex('background', 22)).toBe('bg-deep-sea')
    expect(gameThemeIdAtIndex('background', 23)).toBe('bg-hyper-space')
    expect(gameThemeIdAtIndex('background', 24)).toBe('bg-invasion')
    expect(gameThemeIdAtIndex('background', 25)).toBe('bg-sunset-river')
    expect(gameThemeIdAtIndex('background', 26)).toBe('bg-hurricane')
    expect(gameThemeIdAtIndex('background', 27)).toBe('bg-rainfall')
    expect(gameThemeIdAtIndex('background', 28)).toBe('bg-tv-wall')
    expect(gameThemeIdAtIndex('background', 29)).toBe('bg-abduction')
    expect(gameThemeIdAtIndex('background', 30)).toBe('bg-snowstorm')
    expect(gameThemeIdAtIndex('background', 31)).toBe('bg-forest-of-cats')
    expect(gameThemeIdAtIndex('background', 32)).toBe('bg-event-horizon')
    expect(gameThemeIdAtIndex('background', 33)).toBe('bg-clock-tower')
    expect(gameThemeIdAtIndex('background', 34)).toBe('bg-pi-disk')
    expect(gameThemeIdAtIndex('background', 35)).toBeUndefined()
    expect(gameThemeIdAtIndex('background', 36)).toBe('bg-guild-mech-world')
    expect(gameThemeIdAtIndex('background', 39)).toBe('bg-koi-pond')
    expect(gameThemeIdAtIndex('background', 50)).toBe('bg-guild-claw-machine')
    expect(gameThemeIdAtIndex('background', 51)).toBe('bg-neuron')
    expect(gameThemeIdAtIndex('background', 52)).toBe('bg-guild-magician')
  })

  it('imports mech world from save flag at index 36', () => {
    const flags = Array<boolean>(37).fill(false)
    flags[36] = true
    const owned = gameThemeOwnedIdsFromUnlockArrays({
      towerUnlocked: [],
      backgroundUnlocked: flags,
      menuUnlocked: [],
      profileBannerUnlocked: [],
      guardianSkinUnlocked: [],
      trackAvailable: [],
    })
    expect(owned).toEqual(['bg-guild-mech-world'])
  })

  it('imports koi pond from save flag at index 39', () => {
    const flags = Array<boolean>(40).fill(false)
    flags[39] = true
    const owned = gameThemeOwnedIdsFromUnlockArrays({
      towerUnlocked: [],
      backgroundUnlocked: flags,
      menuUnlocked: [],
      profileBannerUnlocked: [],
      guardianSkinUnlocked: [],
      trackAvailable: [],
    })
    expect(owned).toEqual(['bg-koi-pond'])
  })

  it('imports owned backgrounds from sample save flags at indices 29–34', () => {
    const flags = Array<boolean>(35).fill(false)
    flags[30] = true
    flags[33] = true
    const owned = gameThemeOwnedIdsFromUnlockArrays({
      towerUnlocked: [],
      backgroundUnlocked: flags,
      menuUnlocked: [],
      profileBannerUnlocked: [],
      guardianSkinUnlocked: [],
      trackAvailable: [],
    })
    expect(owned).toEqual(
      expect.arrayContaining(['bg-snowstorm', 'bg-clock-tower']),
    )
    expect(owned).not.toContain('bg-abduction')
    expect(owned).not.toContain('bg-pi-disk')
    expect(owned).toHaveLength(2)
  })

  it('imports owned backgrounds from sample save flags at indices 19–28', () => {
    const flags = Array<boolean>(29).fill(false)
    for (const i of [19, 20, 25, 26, 28]) flags[i] = true
    const owned = gameThemeOwnedIdsFromUnlockArrays({
      towerUnlocked: [],
      backgroundUnlocked: flags,
      menuUnlocked: [],
      profileBannerUnlocked: [],
      guardianSkinUnlocked: [],
      trackAvailable: [],
    })
    expect(owned).toEqual(
      expect.arrayContaining([
        'bg-arcade',
        'bg-new-years',
        'bg-sunset-river',
        'bg-hurricane',
        'bg-tv-wall',
      ]),
    )
    expect(owned).not.toContain('bg-dark-strands')
    expect(owned).not.toContain('bg-rainfall')
    expect(owned).toHaveLength(5)
  })

  it('imports owned backgrounds from sample save flags at indices 15–18', () => {
    const flags = Array<boolean>(19).fill(false)
    flags[15] = true
    flags[18] = true
    const owned = gameThemeOwnedIdsFromUnlockArrays({
      towerUnlocked: [],
      backgroundUnlocked: flags,
      menuUnlocked: [],
      profileBannerUnlocked: [],
      guardianSkinUnlocked: [],
      trackAvailable: [],
    })
    expect(owned).toEqual(
      expect.arrayContaining(['bg-virus-field', 'bg-autumn-forest']),
    )
    expect(owned).toHaveLength(2)
  })

  it('imports owned backgrounds from sample save flags at indices 5–13', () => {
    const flags = Array<boolean>(14).fill(false)
    flags[0] = true
    for (const i of [5, 6, 7, 8, 10, 12, 13]) flags[i] = true
    const owned = gameThemeOwnedIdsFromUnlockArrays({
      towerUnlocked: [],
      backgroundUnlocked: flags,
      menuUnlocked: [],
      profileBannerUnlocked: [],
      guardianSkinUnlocked: [],
      trackAvailable: [],
    })
    expect(owned).toEqual(
      expect.arrayContaining([
        'bg-aurora',
        'bg-alien-ship',
        'bg-ocean-night',
        'bg-sakura',
        'bg-retrowave',
        'bg-cobweb',
        'bg-matrix',
      ]),
    )
    expect(owned).not.toContain('bg-easter')
    expect(owned).not.toContain('bg-prismatic-lines')
    expect(owned).toHaveLength(7)
  })

  it('does not treat index 0 unlock flag as an owned catalog background', () => {
    const flags = Array<boolean>(53).fill(false)
    flags[0] = true
    const owned = gameThemeOwnedIdsFromUnlockArrays({
      towerUnlocked: [],
      backgroundUnlocked: flags,
      menuUnlocked: [],
      profileBannerUnlocked: [],
      guardianSkinUnlocked: [],
      trackAvailable: [],
    })
    expect(owned).toEqual([])
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
      trackAvailable: [],
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
      trackAvailable: [],
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

describe('gameThemeIndex music', () => {
  /** Mirrors CLEAN.dat — base OST only, no Krisu themes purchased. */
  const CLEAN_TRACK_FLAGS = (() => {
    const flags = Array<boolean>(12).fill(false)
    for (const i of [0, 1, 2, 3, 6, 7]) flags[i] = true
    return flags
  })()

  /** Mirrors playerInfo.dat when all three Krisu themes are owned. */
  const OWNED_KRISU_TRACK_FLAGS = (() => {
    const flags = [...CLEAN_TRACK_FLAGS]
    flags[4] = true
    flags[5] = true
    flags[8] = true
    return flags
  })()

  it('maps Krisu catalog ids to trackAvailable indices 4, 5, 8', () => {
    expect(gameThemeIdAtIndex('music', 4)).toBe('music-krisu-oceans-sings')
    expect(gameThemeIdAtIndex('music', 5)).toBe('music-krisu-hiding-himalaya')
    expect(gameThemeIdAtIndex('music', 8)).toBe('music-krisu-forest-bathing')
    expect(gameThemeIdAtIndex('music', 9)).toBeUndefined()
  })

  it('does not import base OST slots as owned theme ids', () => {
    const owned = gameThemeOwnedIdsFromUnlockArrays({
      towerUnlocked: [],
      backgroundUnlocked: [],
      menuUnlocked: [],
      profileBannerUnlocked: [],
      guardianSkinUnlocked: [],
      trackAvailable: CLEAN_TRACK_FLAGS,
    })
    expect(owned.some((id) => id.startsWith('music-'))).toBe(false)
  })

  it('imports Krisu songs when trackAvailable slots 4, 5, 8 are true', () => {
    const owned = gameThemeOwnedIdsFromUnlockArrays({
      towerUnlocked: [],
      backgroundUnlocked: [],
      menuUnlocked: [],
      profileBannerUnlocked: [],
      guardianSkinUnlocked: [],
      trackAvailable: OWNED_KRISU_TRACK_FLAGS,
    })
    expect(owned).toEqual(
      expect.arrayContaining([
        'music-krisu-oceans-sings',
        'music-krisu-hiding-himalaya',
        'music-krisu-forest-bathing',
      ]),
    )
    expect(owned.filter((id) => id.startsWith('music-'))).toHaveLength(3)
  })
})
