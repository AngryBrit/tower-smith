import { BACKGROUND_EVENT_ROWS } from '../data/backgroundEventGuildSkins'
import { GAME_THEMES, type GameThemeEntry, type ThemeCategory } from '../data/gameThemes'
import { TOWER_EVENT_SKIN_ROWS } from '../data/towerEventGuildSkins'
import { STRINGS_EN } from '../i18n/dictionary'

/** Effective Paths Themes & Songs v3.x section identifiers. */
export type EffectivePathsThemeSheetSection =
  | 'tower-event'
  | 'tower-milestone'
  | 'background'
  | 'music'
  | 'guardian'
  | 'menus'
  | 'banners'

/** Normalize theme names for Effective Paths sheet matching. */
export function normalizeEffectivePathsThemeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/['']/g, '')
    .replace(/^tier\s*\d+\s*[-:.]?\s*/i, '')
    .replace(/^\d+\s*[-:.]\s*/, '')
    .replace(/\(tier\s*\d+\)/gi, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function themeMatchesSection(entry: GameThemeEntry, section: EffectivePathsThemeSheetSection): boolean {
  switch (section) {
    case 'tower-event':
      return entry.category === 'tower' && entry.milestoneTier == null
    case 'tower-milestone':
      return entry.category === 'tower' && entry.milestoneTier != null
    case 'background':
      return entry.category === 'background'
    case 'music':
      return entry.category === 'music'
    case 'guardian':
      return entry.category === 'guardian'
    case 'menus':
      return entry.category === 'menus'
    case 'banners':
      return entry.category === 'banners'
    default:
      return false
  }
}

const NAME_TO_THEME_ID_BY_SECTION = new Map<
  EffectivePathsThemeSheetSection,
  Map<string, string>
>()

for (const section of [
  'tower-event',
  'tower-milestone',
  'background',
  'music',
  'guardian',
  'menus',
  'banners',
] as const satisfies readonly EffectivePathsThemeSheetSection[]) {
  const map = new Map<string, string>()
  for (const entry of GAME_THEMES) {
    if (!themeMatchesSection(entry, section)) continue
    const label = STRINGS_EN[entry.nameId]
    if (!label) continue
    const key = normalizeEffectivePathsThemeName(label)
    if (!key || map.has(key)) continue
    map.set(key, entry.id)
  }
  NAME_TO_THEME_ID_BY_SECTION.set(section, map)
}

function addEventNameAliases(
  section: 'tower-event' | 'background',
  rows: readonly { id: string; eventNameId: keyof typeof STRINGS_EN }[],
): void {
  const map = NAME_TO_THEME_ID_BY_SECTION.get(section)!
  for (const row of rows) {
    const label = STRINGS_EN[row.eventNameId]
    if (!label) continue
    const key = normalizeEffectivePathsThemeName(label)
    if (!key || map.has(key)) continue
    map.set(key, row.id)
  }
}

addEventNameAliases('tower-event', TOWER_EVENT_SKIN_ROWS)
addEventNameAliases('background', BACKGROUND_EVENT_ROWS)

const EFFECTIVE_PATHS_THEME_NAME_ALIASES: Readonly<
  Record<EffectivePathsThemeSheetSection, Readonly<Record<string, string>>>
> = {
  'tower-event': {
    [normalizeEffectivePathsThemeName('Plasma')]: 'tower-event-plasma-ball',
  },
  'tower-milestone': {
    [normalizeEffectivePathsThemeName('Mush Mush')]: 'tower-mush-mush',
    [normalizeEffectivePathsThemeName('Mush-mush')]: 'tower-mush-mush',
    [normalizeEffectivePathsThemeName('Yin Yang')]: 'tower-yin-yang',
    [normalizeEffectivePathsThemeName('Yin-Yang')]: 'tower-yin-yang',
    [normalizeEffectivePathsThemeName('Fried egg')]: 'tower-fried-egg',
  },
  background: {
    [normalizeEffectivePathsThemeName('Plasma')]: 'bg-plasma-field',
    [normalizeEffectivePathsThemeName('Cosy Cosmos')]: 'bg-guild-cozy-cosmos',
    [normalizeEffectivePathsThemeName('Cozy Cosmos')]: 'bg-guild-cozy-cosmos',
    [normalizeEffectivePathsThemeName('New Years')]: 'bg-new-years',
    [normalizeEffectivePathsThemeName("New Year's")]: 'bg-new-years',
    [normalizeEffectivePathsThemeName('New Year')]: 'bg-new-years',
    [normalizeEffectivePathsThemeName('TV wall')]: 'bg-tv-wall',
    [normalizeEffectivePathsThemeName('Pi disk')]: 'bg-pi-disk',
    [normalizeEffectivePathsThemeName('Koi pond')]: 'bg-koi-pond',
    [normalizeEffectivePathsThemeName('Throne room')]: 'bg-guild-throne-room',
  },
  music: {
    [normalizeEffectivePathsThemeName('Oceans Sings')]: 'music-krisu-oceans-sings',
    [normalizeEffectivePathsThemeName('Krisu Oceans Sings')]: 'music-krisu-oceans-sings',
    [normalizeEffectivePathsThemeName('Hiding in Himalaya')]: 'music-krisu-hiding-himalaya',
    [normalizeEffectivePathsThemeName('Forest Bathing')]: 'music-krisu-forest-bathing',
  },
  guardian: {
    [normalizeEffectivePathsThemeName('Butter')]: 'guardian-butter',
    [normalizeEffectivePathsThemeName('Muse')]: 'guardian-muse',
  },
  menus: {
    [normalizeEffectivePathsThemeName('Dark Being')]: 'menu-dark-being',
    [normalizeEffectivePathsThemeName('Mech world')]: 'menu-mech',
    [normalizeEffectivePathsThemeName('Mech World')]: 'menu-mech',
    [normalizeEffectivePathsThemeName('Party')]: 'menu-party',
    [normalizeEffectivePathsThemeName('Supernova')]: 'menu-supernova',
    [normalizeEffectivePathsThemeName('Magician')]: 'menu-magician',
    [normalizeEffectivePathsThemeName('Pixel alien war')]: 'menu-pixel',
    [normalizeEffectivePathsThemeName('Crimson horror')]: 'menu-horror',
    [normalizeEffectivePathsThemeName('Claw machine')]: 'menu-claw',
    [normalizeEffectivePathsThemeName('Cosy Cosmos')]: 'menu-cosmos',
    [normalizeEffectivePathsThemeName('Cozy Cosmos')]: 'menu-cosmos',
  },
  banners: {
    [normalizeEffectivePathsThemeName('Dark Being')]: 'banner-dark-being',
    [normalizeEffectivePathsThemeName('Mech world')]: 'banner-mech',
    [normalizeEffectivePathsThemeName('Mech World')]: 'banner-mech',
    [normalizeEffectivePathsThemeName('Party')]: 'banner-party',
    [normalizeEffectivePathsThemeName('Supernova')]: 'banner-supernova',
    [normalizeEffectivePathsThemeName('Magician')]: 'banner-magician',
    [normalizeEffectivePathsThemeName('Pixel alien war')]: 'banner-pixel',
    [normalizeEffectivePathsThemeName('Crimson horror')]: 'banner-horror',
    [normalizeEffectivePathsThemeName('Claw machine')]: 'banner-claw',
    [normalizeEffectivePathsThemeName('Cosy Cosmos')]: 'banner-cosmos',
    [normalizeEffectivePathsThemeName('Cozy Cosmos')]: 'banner-cosmos',
  },
}

for (const [section, aliases] of Object.entries(EFFECTIVE_PATHS_THEME_NAME_ALIASES) as [
  EffectivePathsThemeSheetSection,
  Readonly<Record<string, string>>,
][]) {
  const map = NAME_TO_THEME_ID_BY_SECTION.get(section)!
  for (const [alias, id] of Object.entries(aliases)) {
    map.set(alias, id)
  }
}

/** Map an Effective Paths theme name cell to a TowerSmith theme id, if known. */
export function gameThemeIdFromSheetName(
  sheetName: string,
  section: EffectivePathsThemeSheetSection,
): string | null {
  const key = normalizeEffectivePathsThemeName(sheetName)
  if (!key) return null
  return NAME_TO_THEME_ID_BY_SECTION.get(section)?.get(key) ?? null
}

/** @deprecated Use section-specific ids — kept for tests exploring legacy grouping. */
export function themeCategoryForSection(
  section: EffectivePathsThemeSheetSection,
): ThemeCategory | 'tower-milestone' {
  if (section === 'tower-milestone' || section === 'tower-event') return 'tower'
  return section
}
