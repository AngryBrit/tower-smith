import { describe, expect, it } from 'vitest'
import {
  GUILD_SEASON_TIMELINE,
  bannerSaveIndexForGuildSeason,
  buildBannerThemeIdsByGameIndex,
  buildMenuThemeIdsByGameIndex,
  menuSaveIndexForGuildSeason,
} from './gameGuildSeasonTimeline'

describe('gameGuildSeasonTimeline', () => {
  it('lists seasons oldest to newest with no season 1 banner', () => {
    expect(GUILD_SEASON_TIMELINE[0]?.event).toBe('Throne')
    expect(GUILD_SEASON_TIMELINE[0]?.bannerId).toBeNull()
    expect(GUILD_SEASON_TIMELINE[1]?.bannerId).toBe('banner-mech')
    expect(GUILD_SEASON_TIMELINE.at(-1)?.event).toBe('Magician')
  })

  it('maps menu and banner save indices by guild season', () => {
    expect(menuSaveIndexForGuildSeason(1)).toBe(1) // Dark Being / Throne
    expect(menuSaveIndexForGuildSeason(2)).toBe(2) // Mech World
    expect(menuSaveIndexForGuildSeason(8)).toBe(8)
    expect(menuSaveIndexForGuildSeason(9)).toBe(9) // Magician
    expect(bannerSaveIndexForGuildSeason(1)).toBeUndefined()
    expect(bannerSaveIndexForGuildSeason(2)).toBe(3)
    expect(bannerSaveIndexForGuildSeason(8)).toBe(9)
    expect(bannerSaveIndexForGuildSeason(9)).toBe(10)

    const menus = buildMenuThemeIdsByGameIndex()
    expect(menus[2]).toBe('menu-mech')
    expect(menus[9]).toBe('menu-magician')

    const banners = buildBannerThemeIdsByGameIndex()
    expect(banners[0]).toBeUndefined()
    expect(banners[3]).toBe('banner-mech')
    expect(banners[9]).toBe('banner-claw')
    expect(banners[10]).toBe('banner-magician')
  })
})
