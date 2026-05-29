/**
 * Guild event seasons (oldest → newest), from the game effect-paths spreadsheet.
 * Season 1 (Throne) has a menu theme but no profile banner or guild background.
 */
export type GuildSeasonRow = {
  season: number
  event: string
  menuId: string
  bannerId: string | null
}

export const GUILD_SEASON_TIMELINE: readonly GuildSeasonRow[] = [
  { season: 1, event: 'Throne', menuId: 'menu-dark-being', bannerId: null },
  { season: 2, event: 'Mech World', menuId: 'menu-mech', bannerId: 'banner-mech' },
  { season: 3, event: 'Party', menuId: 'menu-party', bannerId: 'banner-party' },
  { season: 4, event: 'Pixel Alien War', menuId: 'menu-pixel', bannerId: 'banner-pixel' },
  { season: 5, event: 'Crimson Horror', menuId: 'menu-horror', bannerId: 'banner-horror' },
  { season: 6, event: 'Cosy Cosmos', menuId: 'menu-cosmos', bannerId: 'banner-cosmos' },
  { season: 7, event: 'Supernova', menuId: 'menu-supernova', bannerId: 'banner-supernova' },
  { season: 8, event: 'Claw Machine', menuId: 'menu-claw', bannerId: 'banner-claw' },
  { season: 9, event: 'Magician', menuId: 'menu-magician', bannerId: 'banner-magician' },
] as const

/**
 * `menuUnlocked` save index for guild season (1–9).
 * Index 0 is the default game menu (not a catalog theme).
 */
export function menuSaveIndexForGuildSeason(season: number): number | undefined {
  if (season >= 1 && season <= 9) return season
  return undefined
}

/**
 * `profileBannerUnlocked` save index for guild season (2–9).
 * Index 0 = default profile banner (not a catalog skin). Indices 1–2 unused.
 * Seasons 2–8 → indices 3–9; season 9 (Magician) → index 10.
 */
export function bannerSaveIndexForGuildSeason(season: number): number | undefined {
  if (season < 2 || season > 9) return undefined
  if (season === 9) return 10
  return season + 1
}

export function buildMenuThemeIdsByGameIndex(maxIndex = 10): (string | undefined)[] {
  const out: (string | undefined)[] = Array.from({ length: maxIndex + 1 }, () => undefined)
  for (const row of GUILD_SEASON_TIMELINE) {
    const idx = menuSaveIndexForGuildSeason(row.season)
    if (idx != null) out[idx] = row.menuId
  }
  return out
}

export function buildBannerThemeIdsByGameIndex(maxIndex = 10): (string | undefined)[] {
  const out: (string | undefined)[] = Array.from({ length: maxIndex + 1 }, () => undefined)
  for (const row of GUILD_SEASON_TIMELINE) {
    if (!row.bannerId) continue
    const idx = bannerSaveIndexForGuildSeason(row.season)
    if (idx != null) out[idx] = row.bannerId
  }
  return out
}
