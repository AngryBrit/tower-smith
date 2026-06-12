import {
  GAME_THEMES,
  type ThemeCategory,
} from '../data/gameThemes'
import {
  buildBackgroundThemeIdsByGameIndex,
  buildTowerThemeIdsByGameIndex,
} from './gameEventTimeline'
import {
  buildBannerThemeIdsByGameIndex,
  buildMenuThemeIdsByGameIndex,
} from './gameGuildSeasonTimeline'
import { buildMusicThemeIdsByGameIndex } from './musicSaveSlotMap'

const GUARDIAN_THEME_IDS = GAME_THEMES.filter((t) => t.category === 'guardian').map((t) => t.id)

const BANNER_THEME_IDS = GAME_THEMES.filter((t) => t.category === 'banners').map((t) => t.id)
const MENU_THEME_IDS = GAME_THEMES.filter((t) => t.category === 'menus').map((t) => t.id)

const TOWER_THEME_IDS_BY_GAME_INDEX: readonly (string | undefined)[] =
  buildTowerThemeIdsByGameIndex()

const BACKGROUND_THEME_IDS_BY_GAME_INDEX: readonly (string | undefined)[] =
  buildBackgroundThemeIdsByGameIndex()

const MENU_THEME_IDS_BY_GAME_INDEX: readonly (string | undefined)[] =
  buildMenuThemeIdsByGameIndex()

const BANNER_THEME_IDS_BY_GAME_INDEX: readonly (string | undefined)[] =
  buildBannerThemeIdsByGameIndex()

const MUSIC_THEME_IDS_BY_GAME_INDEX: readonly (string | undefined)[] =
  buildMusicThemeIdsByGameIndex()

/**
 * Game guardian skin index order includes non-theme slots:
 * - index 0: default guardian (Orbie) → not a collectible theme id
 * - index 3: currently unused/unreleased slot
 */
const GUARDIAN_THEME_IDS_BY_GAME_INDEX: readonly (string | undefined)[] = [
  undefined,
  GUARDIAN_THEME_IDS[0], // Butter (Throne)
  GUARDIAN_THEME_IDS[1], // Muse (Mech World)
  undefined,
  ...GUARDIAN_THEME_IDS.slice(2), // Finn..Disco
]

/** Theme ids in game index order (parallel to `towerUnlocked`, etc.). */
const THEME_IDS_BY_CATEGORY: Record<ThemeCategory, readonly string[]> = {
  tower: Object.freeze(
    TOWER_THEME_IDS_BY_GAME_INDEX.filter((id): id is string => !!id),
  ),
  background: Object.freeze(
    BACKGROUND_THEME_IDS_BY_GAME_INDEX.filter((id): id is string => !!id),
  ),
  music: Object.freeze(
    GAME_THEMES.filter((t) => t.category === 'music').map((t) => t.id),
  ),
  menus: Object.freeze(MENU_THEME_IDS),
  banners: Object.freeze(BANNER_THEME_IDS),
  guardian: Object.freeze(GUARDIAN_THEME_IDS_BY_GAME_INDEX.filter((id): id is string => !!id)),
}

const THEME_IDS_BY_CATEGORY_GAME_INDEX: Record<ThemeCategory, readonly (string | undefined)[]> = {
  ...THEME_IDS_BY_CATEGORY,
  tower: TOWER_THEME_IDS_BY_GAME_INDEX,
  background: BACKGROUND_THEME_IDS_BY_GAME_INDEX,
  music: MUSIC_THEME_IDS_BY_GAME_INDEX,
  menus: MENU_THEME_IDS_BY_GAME_INDEX,
  banners: BANNER_THEME_IDS_BY_GAME_INDEX,
  guardian: GUARDIAN_THEME_IDS_BY_GAME_INDEX,
}

export function gameThemeIdAtIndex(
  category: ThemeCategory,
  index: number,
): string | undefined {
  if (!Number.isFinite(index) || index < 0) return undefined
  return THEME_IDS_BY_CATEGORY_GAME_INDEX[category][Math.trunc(index)]
}

export function gameThemeOwnedIdsFromUnlockArrays(save: {
  towerUnlocked: boolean[]
  backgroundUnlocked: boolean[]
  menuUnlocked: boolean[]
  profileBannerUnlocked: boolean[]
  guardianSkinUnlocked: boolean[]
  trackAvailable: boolean[]
}): string[] {
  const owned = new Set<string>()
  const add = (category: ThemeCategory, flags: boolean[]) => {
    const ids = THEME_IDS_BY_CATEGORY_GAME_INDEX[category]
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
  add('guardian', save.guardianSkinUnlocked)
  add('music', save.trackAvailable)
  return [...owned].sort()
}
