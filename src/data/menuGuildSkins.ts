import type { StringId } from '../i18n/dictionary'

type MenuGuildRow = {
  id: string
  nameId: StringId
  icon: string
  guildSeason: number
  /** Preview art in `public/themes/menus/`. */
  image?: string
}

/**
 * Main-menu guild themes (seasons 1–9). Save index 0 is the default game menu (not listed here).
 * `menuUnlocked` slots: 0 default, 1 Throne, 2–8 seasons 2–8, 9 Magician.
 */
export const MENU_GUILD_ROWS: readonly MenuGuildRow[] = [
  {
    id: 'menu-dark-being',
    nameId: 'theme_menu_dark_being',
    icon: 'menu-dark-being',
    guildSeason: 1,
    image: '/themes/menus/dark-being-menu.webp',
  },
  {
    id: 'menu-mech',
    nameId: 'theme_menu_mech',
    icon: 'menu-mech',
    guildSeason: 2,
    image: '/themes/menus/mech-world-icon.webp',
  },
  {
    id: 'menu-party',
    nameId: 'theme_menu_party',
    icon: 'menu-party',
    guildSeason: 3,
    image: '/themes/menus/Party-icon.webp',
  },
  {
    id: 'menu-pixel',
    nameId: 'theme_menu_pixel',
    icon: 'menu-pixel',
    guildSeason: 4,
    image: '/themes/menus/PixelAlienWar.webp',
  },
  {
    id: 'menu-horror',
    nameId: 'theme_menu_horror',
    icon: 'menu-horror',
    guildSeason: 5,
    image: '/themes/menus/CrimsonHorrorIcon.webp',
  },
  {
    id: 'menu-cosmos',
    nameId: 'theme_menu_cosmos',
    icon: 'menu-cosmos',
    guildSeason: 6,
    image: '/themes/menus/CozyCosmosIcon.webp',
  },
  {
    id: 'menu-supernova',
    nameId: 'theme_menu_supernova',
    icon: 'menu-supernova',
    guildSeason: 7,
    image: '/themes/menus/SupernovaBackgroundIcon.webp',
  },
  {
    id: 'menu-claw',
    nameId: 'theme_menu_claw',
    icon: 'menu-claw',
    guildSeason: 8,
    image: '/themes/menus/ClawMachineIcon.webp',
  },
  {
    id: 'menu-magician',
    nameId: 'theme_menu_magician',
    icon: 'menu-magician',
    guildSeason: 9,
    image: '/themes/menus/MagicianIcon.webp',
  },
] as const
