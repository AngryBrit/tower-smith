import type { StringId } from '../i18n/dictionary'

type BannerGuildRow = {
  id: string
  nameId: StringId
  icon: string
  guildSeason: number
  /** Preview art in `public/themes/banners/`. */
  image?: string
}

/** Guild profile / main-menu banners (one per guild season). */
export const BANNER_GUILD_ROWS: readonly BannerGuildRow[] = [
  {
    id: 'banner-mech',
    nameId: 'theme_banner_mech',
    icon: 'menu-mech',
    guildSeason: 2,
    image: '/themes/banners/Mech_Banner.webp',
  },
  {
    id: 'banner-party',
    nameId: 'theme_banner_party',
    icon: 'menu-party',
    guildSeason: 3,
    image: '/themes/banners/Party%20Profile.webp',
  },
  {
    id: 'banner-pixel',
    nameId: 'theme_banner_pixel',
    icon: 'menu-pixel',
    guildSeason: 4,
    image: '/themes/banners/PixelAlienWarProfileBackground.webp',
  },
  {
    id: 'banner-horror',
    nameId: 'theme_banner_horror',
    icon: 'menu-horror',
    guildSeason: 5,
    image: '/themes/banners/CrimsonHorrorProfileBackground.webp',
  },
  {
    id: 'banner-cosmos',
    nameId: 'theme_banner_cosmos',
    icon: 'menu-cosmos',
    guildSeason: 6,
    image: '/themes/banners/ConstellationProfileBackground.webp',
  },
  {
    id: 'banner-supernova',
    nameId: 'theme_banner_supernova',
    icon: 'menu-supernova',
    guildSeason: 7,
    image: '/themes/banners/SupernovaProfileBackground.webp',
  },
  {
    id: 'banner-claw',
    nameId: 'theme_banner_claw',
    icon: 'menu-claw',
    guildSeason: 8,
    image: '/themes/banners/ClawMachineProfileBackground.webp',
  },
  {
    id: 'banner-magician',
    nameId: 'theme_banner_magician',
    icon: 'menu-magician',
    guildSeason: 9,
    image: '/themes/banners/MagicianProfileBackground.webp',
  },
] as const
