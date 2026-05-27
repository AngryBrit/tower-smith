import {
  GAME_THEMES,
  type ThemeCategory,
} from '../data/gameThemes'

/** Theme ids in game index order (parallel to `towerUnlocked`, etc.). */
const THEME_IDS_BY_CATEGORY: Record<ThemeCategory, readonly string[]> = {
  tower: Object.freeze(
    GAME_THEMES.filter((t) => t.category === 'tower').map((t) => t.id),
  ),
  background: Object.freeze(
    GAME_THEMES.filter((t) => t.category === 'background').map((t) => t.id),
  ),
  music: Object.freeze(
    GAME_THEMES.filter((t) => t.category === 'music').map((t) => t.id),
  ),
  menus: Object.freeze(
    GAME_THEMES.filter((t) => t.category === 'menus').map((t) => t.id),
  ),
  banners: Object.freeze(
    GAME_THEMES.filter((t) => t.category === 'banners').map((t) => t.id),
  ),
  guardian: Object.freeze(
    GAME_THEMES.filter((t) => t.category === 'guardian').map((t) => t.id),
  ),
}

export function gameThemeIdAtIndex(
  category: ThemeCategory,
  index: number,
): string | undefined {
  if (!Number.isFinite(index) || index < 0) return undefined
  return THEME_IDS_BY_CATEGORY[category][Math.trunc(index)]
}

export function gameThemeOwnedIdsFromUnlockArrays(save: {
  towerUnlocked: boolean[]
  backgroundUnlocked: boolean[]
  menuUnlocked: boolean[]
  profileBannerUnlocked: boolean[]
}): string[] {
  const owned = new Set<string>()
  const add = (category: ThemeCategory, flags: boolean[]) => {
    const ids = THEME_IDS_BY_CATEGORY[category]
    for (let i = 0; i < flags.length && i < ids.length; i++) {
      if (flags[i]) {
        const id = ids[i]
        if (id) owned.add(id)
      }
    }
  }
  add('tower', save.towerUnlocked)
  add('background', save.backgroundUnlocked)
  add('menus', save.menuUnlocked)
  add('banners', save.profileBannerUnlocked)
  return [...owned].sort()
}
