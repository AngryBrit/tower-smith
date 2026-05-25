import type { StringId } from '../i18n/dictionary'
import {
  BACKGROUND_EVENT_ROWS,
  BACKGROUND_GUILD_ROWS,
} from './backgroundEventGuildSkins'
import { BANNER_GUILD_ROWS } from './bannerGuildSkins'
import { GUARDIAN_THEME_IMAGES } from './guardianThemeImages'
import { MENU_GUILD_ROWS } from './menuGuildSkins'
import { TOWER_MILESTONE_IMAGES } from './towerMilestoneImages'
import { TOWER_EVENT_SKIN_ROWS, TOWER_GUILD_SKIN_ROWS } from './towerEventGuildSkins'

export type ThemeCategory =
  | 'tower'
  | 'background'
  | 'music'
  | 'menus'
  | 'banners'
  | 'guardian'

export type ThemeIconKey =
  | 'default'
  | 'plasma-ball'
  | 'north-spirit'
  | 'alien'
  | 'water-droplet'
  | 'cherry-blossom'
  | 'shuriken'
  | 'donut'
  | 'yin-yang'
  | 'smile'
  | 'butterfly'
  | 'sheep'
  | 'fried-egg'
  | 'turtle'
  | 'cheese'
  | 'skull'
  | 'creepy-clown'
  | 'tech-tree'
  | 'cactus'
  | 'rhino'
  | 'atomic'
  | 'eclipse'
  | 'mush-mush'
  | 'cat'
  | 'panda'
  | 'dragon'
  | 'cyber'
  | 'aurora'
  | 'sakura'
  | 'retrowave'
  | 'matrix'
  | 'volcano'
  | 'interstellar'
  | 'ocean-night'
  | 'haunted-house'
  | 'new-years'
  | 'arcade'
  | 'snowstorm'
  | 'music-note'
  | 'music-calm'
  | 'music-intense'
  | 'menu-dark-being'
  | 'menu-mech'
  | 'menu-party'
  | 'menu-pixel'
  | 'menu-horror'
  | 'menu-cosmos'
  | 'menu-supernova'
  | 'menu-claw'
  | 'menu-magician'
  | 'menu-crown'
  | 'guardian'

export type ThemeSkinGroup = 'event' | 'guild'

/** @deprecated Use ThemeSkinGroup */
export type TowerSkinGroup = ThemeSkinGroup

export type GameThemeEntry = {
  id: string
  category: ThemeCategory
  nameId: StringId
  icon: ThemeIconKey
  /** Tower milestone skins: unlock tier (1–21). */
  milestoneTier?: number
  unlock?: 'free' | 'pass'
  passNumber?: number
  /** Event or guild tower skins (not milestones). */
  towerGroup?: ThemeSkinGroup
  /** Event or guild background skins. */
  backgroundGroup?: ThemeSkinGroup
  eventNameId?: StringId
  guildSeason?: number
  /** Card preview image under `public/` (e.g. menu guild skins). */
  image?: string
  /** Pre-checked owned when no saved owned state exists yet. */
  ownedDefault?: boolean
}

/** @deprecated Use THEME_COIN_BONUS_PERCENT from themeCoinBonus.ts for coin categories. */
export const THEME_CATEGORY_PASSIVE_BONUS: Partial<Record<ThemeCategory, number>> = {
  tower: 0.4,
  background: 0.8,
  menus: 0.6,
  banners: 0.6,
  guardian: 0.6,
}

export const THEME_CATEGORIES: readonly ThemeCategory[] = [
  'tower',
  'background',
  'music',
  'menus',
  'banners',
  'guardian',
] as const

export const GAME_THEMES: readonly GameThemeEntry[] = [
  // Tower — milestone skins (tier 1–21)
  {
    id: 'tower-shuriken',
    category: 'tower',
    nameId: 'theme_tower_shuriken',
    icon: 'shuriken',
    milestoneTier: 1,
    image: TOWER_MILESTONE_IMAGES['tower-shuriken'],
    unlock: 'free',
  },
  {
    id: 'tower-donut',
    category: 'tower',
    nameId: 'theme_tower_donut',
    icon: 'donut',
    milestoneTier: 2,
    image: TOWER_MILESTONE_IMAGES['tower-donut'],
    unlock: 'pass',
    passNumber: 1,
  },
  {
    id: 'tower-yin-yang',
    category: 'tower',
    nameId: 'theme_tower_yin_yang',
    icon: 'yin-yang',
    milestoneTier: 3,
    image: TOWER_MILESTONE_IMAGES['tower-yin-yang'],
    unlock: 'free',
  },
  {
    id: 'tower-smile',
    category: 'tower',
    nameId: 'theme_tower_smile',
    icon: 'smile',
    milestoneTier: 4,
    image: TOWER_MILESTONE_IMAGES['tower-smile'],
    unlock: 'free',
  },
  {
    id: 'tower-butterfly',
    category: 'tower',
    nameId: 'theme_tower_butterfly',
    icon: 'butterfly',
    milestoneTier: 5,
    image: TOWER_MILESTONE_IMAGES['tower-butterfly'],
    unlock: 'pass',
    passNumber: 2,
  },
  {
    id: 'tower-sheep',
    category: 'tower',
    nameId: 'theme_tower_sheep',
    icon: 'sheep',
    milestoneTier: 6,
    image: TOWER_MILESTONE_IMAGES['tower-sheep'],
    unlock: 'free',
  },
  {
    id: 'tower-fried-egg',
    category: 'tower',
    nameId: 'theme_tower_fried_egg',
    icon: 'fried-egg',
    milestoneTier: 7,
    image: TOWER_MILESTONE_IMAGES['tower-fried-egg'],
    unlock: 'free',
  },
  {
    id: 'tower-mush-mush',
    category: 'tower',
    nameId: 'theme_tower_mush_mush',
    icon: 'mush-mush',
    milestoneTier: 8,
    image: TOWER_MILESTONE_IMAGES['tower-mush-mush'],
    unlock: 'pass',
    passNumber: 3,
  },
  {
    id: 'tower-turtle',
    category: 'tower',
    nameId: 'theme_tower_turtle',
    icon: 'turtle',
    milestoneTier: 9,
    image: TOWER_MILESTONE_IMAGES['tower-turtle'],
    unlock: 'free',
  },
  {
    id: 'tower-cheese',
    category: 'tower',
    nameId: 'theme_tower_cheese',
    icon: 'cheese',
    milestoneTier: 10,
    image: TOWER_MILESTONE_IMAGES['tower-cheese'],
    unlock: 'free',
  },
  {
    id: 'tower-cat',
    category: 'tower',
    nameId: 'theme_tower_cat',
    icon: 'cat',
    milestoneTier: 11,
    image: TOWER_MILESTONE_IMAGES['tower-cat'],
    unlock: 'pass',
    passNumber: 4,
  },
  {
    id: 'tower-skull',
    category: 'tower',
    nameId: 'theme_tower_skull',
    icon: 'skull',
    milestoneTier: 12,
    image: TOWER_MILESTONE_IMAGES['tower-skull'],
    unlock: 'free',
  },
  {
    id: 'tower-creepy-clown',
    category: 'tower',
    nameId: 'theme_tower_creepy_clown',
    icon: 'creepy-clown',
    milestoneTier: 13,
    image: TOWER_MILESTONE_IMAGES['tower-creepy-clown'],
    unlock: 'free',
  },
  {
    id: 'tower-panda',
    category: 'tower',
    nameId: 'theme_tower_panda',
    icon: 'panda',
    milestoneTier: 14,
    image: TOWER_MILESTONE_IMAGES['tower-panda'],
    unlock: 'pass',
    passNumber: 5,
  },
  {
    id: 'tower-tech-tree',
    category: 'tower',
    nameId: 'theme_tower_tech_tree',
    icon: 'tech-tree',
    milestoneTier: 15,
    image: TOWER_MILESTONE_IMAGES['tower-tech-tree'],
    unlock: 'free',
  },
  {
    id: 'tower-cactus',
    category: 'tower',
    nameId: 'theme_tower_cactus',
    icon: 'cactus',
    milestoneTier: 16,
    image: TOWER_MILESTONE_IMAGES['tower-cactus'],
    unlock: 'free',
  },
  {
    id: 'tower-dragon',
    category: 'tower',
    nameId: 'theme_tower_dragon',
    icon: 'dragon',
    milestoneTier: 17,
    image: TOWER_MILESTONE_IMAGES['tower-dragon'],
    unlock: 'pass',
    passNumber: 6,
  },
  {
    id: 'tower-rhino',
    category: 'tower',
    nameId: 'theme_tower_rhino',
    icon: 'rhino',
    milestoneTier: 18,
    image: TOWER_MILESTONE_IMAGES['tower-rhino'],
    unlock: 'free',
  },
  {
    id: 'tower-atomic',
    category: 'tower',
    nameId: 'theme_tower_atomic',
    icon: 'atomic',
    milestoneTier: 19,
    image: TOWER_MILESTONE_IMAGES['tower-atomic'],
    unlock: 'free',
  },
  {
    id: 'tower-cyber',
    category: 'tower',
    nameId: 'theme_tower_cyber',
    icon: 'cyber',
    milestoneTier: 20,
    image: TOWER_MILESTONE_IMAGES['tower-cyber'],
    unlock: 'pass',
    passNumber: 7,
  },
  {
    id: 'tower-eclipse',
    category: 'tower',
    nameId: 'theme_tower_eclipse',
    icon: 'eclipse',
    milestoneTier: 21,
    image: TOWER_MILESTONE_IMAGES['tower-eclipse'],
    unlock: 'free',
  },

  ...TOWER_EVENT_SKIN_ROWS.map(
    (row): GameThemeEntry => ({
      id: row.id,
      category: 'tower',
      nameId: row.nameId,
      icon: row.icon as ThemeIconKey,
      towerGroup: 'event',
      eventNameId: row.eventNameId,
      image: row.image,
    }),
  ),

  ...TOWER_GUILD_SKIN_ROWS.map(
    (row): GameThemeEntry => ({
      id: row.id,
      category: 'tower',
      nameId: row.nameId,
      icon: row.icon as ThemeIconKey,
      towerGroup: 'guild',
      guildSeason: row.guildSeason,
      image: row.image,
    }),
  ),

  ...BACKGROUND_EVENT_ROWS.map(
    (row): GameThemeEntry => ({
      id: row.id,
      category: 'background',
      nameId: row.nameId,
      icon: row.icon as ThemeIconKey,
      backgroundGroup: 'event',
      eventNameId: row.eventNameId,
      image: row.image,
      ownedDefault: row.ownedDefault,
    }),
  ),

  ...BACKGROUND_GUILD_ROWS.map(
    (row): GameThemeEntry => ({
      id: row.id,
      category: 'background',
      nameId: row.nameId,
      icon: row.icon as ThemeIconKey,
      backgroundGroup: 'guild',
      guildSeason: row.guildSeason,
      image: row.image,
      ownedDefault: row.ownedDefault,
    }),
  ),

  // Music — Krisu tracks (+0.6% passive coin bonus per owned)
  {
    id: 'music-krisu-oceans-sings',
    category: 'music',
    nameId: 'theme_music_krisu_oceans_sings',
    icon: 'music-note',
  },
  {
    id: 'music-krisu-hiding-himalaya',
    category: 'music',
    nameId: 'theme_music_krisu_hiding_himalaya',
    icon: 'music-calm',
  },
  {
    id: 'music-krisu-forest-bathing',
    category: 'music',
    nameId: 'theme_music_krisu_forest_bathing',
    icon: 'music-intense',
  },

  ...MENU_GUILD_ROWS.map(
    (row): GameThemeEntry => ({
      id: row.id,
      category: 'menus',
      nameId: row.nameId,
      icon: row.icon as ThemeIconKey,
      guildSeason: row.guildSeason,
      image: row.image,
    }),
  ),

  ...BANNER_GUILD_ROWS.map(
    (row): GameThemeEntry => ({
      id: row.id,
      category: 'banners',
      nameId: row.nameId,
      icon: row.icon as ThemeIconKey,
      guildSeason: row.guildSeason,
      image: row.image,
    }),
  ),

  // Guardian — guild guardian themes (+0.6% passive coin bonus per owned)
  {
    id: 'guardian-butter',
    category: 'guardian',
    nameId: 'theme_guardian_butter',
    icon: 'guardian',
    guildSeason: 1,
    image: GUARDIAN_THEME_IMAGES['guardian-butter'],
  },
  {
    id: 'guardian-muse',
    category: 'guardian',
    nameId: 'theme_guardian_muse',
    icon: 'guardian',
    guildSeason: 2,
    image: GUARDIAN_THEME_IMAGES['guardian-muse'],
  },
  {
    id: 'guardian-finn',
    category: 'guardian',
    nameId: 'theme_guardian_finn',
    icon: 'guardian',
    guildSeason: 2,
    image: GUARDIAN_THEME_IMAGES['guardian-finn'],
    ownedDefault: true,
  },
  {
    id: 'guardian-nyra',
    category: 'guardian',
    nameId: 'theme_guardian_nyra',
    icon: 'guardian',
    guildSeason: 3,
    image: GUARDIAN_THEME_IMAGES['guardian-nyra'],
    ownedDefault: true,
  },
  {
    id: 'guardian-rolo',
    category: 'guardian',
    nameId: 'theme_guardian_rolo',
    icon: 'guardian',
    guildSeason: 3,
    image: GUARDIAN_THEME_IMAGES['guardian-rolo'],
    ownedDefault: true,
  },
  {
    id: 'guardian-glenn',
    category: 'guardian',
    nameId: 'theme_guardian_glenn',
    icon: 'guardian',
    guildSeason: 4,
    image: GUARDIAN_THEME_IMAGES['guardian-glenn'],
    ownedDefault: true,
  },
  {
    id: 'guardian-zepe',
    category: 'guardian',
    nameId: 'theme_guardian_zepe',
    icon: 'guardian',
    guildSeason: 4,
    image: GUARDIAN_THEME_IMAGES['guardian-zepe'],
    ownedDefault: true,
  },
  {
    id: 'guardian-iris',
    category: 'guardian',
    nameId: 'theme_guardian_iris',
    icon: 'guardian',
    guildSeason: 5,
    image: GUARDIAN_THEME_IMAGES['guardian-iris'],
    ownedDefault: true,
  },
  {
    id: 'guardian-silk',
    category: 'guardian',
    nameId: 'theme_guardian_silk',
    icon: 'guardian',
    guildSeason: 5,
    image: GUARDIAN_THEME_IMAGES['guardian-silk'],
    ownedDefault: true,
  },
  {
    id: 'guardian-mickey',
    category: 'guardian',
    nameId: 'theme_guardian_mickey',
    icon: 'guardian',
    guildSeason: 6,
    image: GUARDIAN_THEME_IMAGES['guardian-mickey'],
    ownedDefault: true,
  },
  {
    id: 'guardian-gaia',
    category: 'guardian',
    nameId: 'theme_guardian_gaia',
    icon: 'guardian',
    guildSeason: 6,
    image: GUARDIAN_THEME_IMAGES['guardian-gaia'],
    ownedDefault: true,
  },
  {
    id: 'guardian-arwing',
    category: 'guardian',
    nameId: 'theme_guardian_arwing',
    icon: 'guardian',
    guildSeason: 7,
    image: GUARDIAN_THEME_IMAGES['guardian-arwing'],
    ownedDefault: true,
  },
  {
    id: 'guardian-frank',
    category: 'guardian',
    nameId: 'theme_guardian_frank',
    icon: 'guardian',
    guildSeason: 7,
    image: GUARDIAN_THEME_IMAGES['guardian-frank'],
    ownedDefault: true,
  },
  {
    id: 'guardian-earl',
    category: 'guardian',
    nameId: 'theme_guardian_earl',
    icon: 'guardian',
    guildSeason: 8,
    image: GUARDIAN_THEME_IMAGES['guardian-earl'],
    ownedDefault: true,
  },
  {
    id: 'guardian-mei',
    category: 'guardian',
    nameId: 'theme_guardian_mei',
    icon: 'guardian',
    guildSeason: 8,
    image: GUARDIAN_THEME_IMAGES['guardian-mei'],
    ownedDefault: true,
  },
  {
    id: 'guardian-shelly',
    category: 'guardian',
    nameId: 'theme_guardian_shelly',
    icon: 'guardian',
    guildSeason: 9,
    image: GUARDIAN_THEME_IMAGES['guardian-shelly'],
    ownedDefault: true,
  },
  {
    id: 'guardian-disco',
    category: 'guardian',
    nameId: 'theme_guardian_disco',
    icon: 'guardian',
    guildSeason: 9,
    image: GUARDIAN_THEME_IMAGES['guardian-disco'],
    ownedDefault: true,
  },
] as const

export function towerThemesByGroup(): {
  milestone: GameThemeEntry[]
  event: GameThemeEntry[]
  guild: GameThemeEntry[]
} {
  const tower = GAME_THEMES.filter((e) => e.category === 'tower')
  return {
    milestone: tower
      .filter((e) => e.milestoneTier != null)
      .sort((a, b) => (a.milestoneTier ?? 0) - (b.milestoneTier ?? 0)),
    event: tower.filter((e) => e.towerGroup === 'event'),
    guild: tower
      .filter((e) => e.towerGroup === 'guild')
      .sort((a, b) => (a.guildSeason ?? 0) - (b.guildSeason ?? 0)),
  }
}

export function backgroundThemesByGroup(): {
  event: GameThemeEntry[]
  guild: GameThemeEntry[]
} {
  const background = GAME_THEMES.filter((e) => e.category === 'background')
  return {
    event: background.filter((e) => e.backgroundGroup === 'event'),
    guild: background
      .filter((e) => e.backgroundGroup === 'guild')
      .sort((a, b) => (a.guildSeason ?? 0) - (b.guildSeason ?? 0)),
  }
}

export function themesForCategory(category: ThemeCategory): GameThemeEntry[] {
  if (category === 'tower') {
    const { milestone, event, guild } = towerThemesByGroup()
    return [...milestone, ...event, ...guild]
  }
  if (category === 'background') {
    const { event, guild } = backgroundThemesByGroup()
    return [...event, ...guild]
  }
  return GAME_THEMES.filter((e) => e.category === category)
}

export function themeUnlockLabel(
  t: (id: StringId) => string,
  entry: GameThemeEntry,
): string | null {
  if (entry.unlock === 'free') return t('theme_unlock_free')
  if (entry.unlock === 'pass' && entry.passNumber != null) {
    return t('theme_unlock_pass').replace('{{n}}', String(entry.passNumber))
  }
  return null
}

export const DEFAULT_THEME_SELECTION: Record<ThemeCategory, string> = {
  tower: 'tower-shuriken',
  background: 'bg-interstellar',
  music: 'music-krisu-oceans-sings',
  menus: 'menu-mech',
  banners: 'banner-mech',
  guardian: 'guardian-butter',
}
