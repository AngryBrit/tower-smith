import type { StringId } from '../i18n/dictionary'

type TowerEventRow = {
  id: string
  nameId: StringId
  eventNameId: StringId
  icon: string
  /** Preview art in `public/themes/tower/`. */
  image?: string
}

type TowerGuildRow = {
  id: string
  nameId: StringId
  icon: string
  guildSeason: number
  /** Preview art in `public/themes/tower/`. */
  image?: string
}

/** Row order = UI/catalog. Save slots are in `towerSaveSlotMap.ts`. */
export const TOWER_EVENT_SKIN_ROWS: readonly TowerEventRow[] = [
  {
    id: 'tower-event-plasma-ball',
    nameId: 'theme_skin_plasma_ball',
    eventNameId: 'theme_event_plasma_returns',
    icon: 'plasma-ball',
    image: '/themes/tower/plasma_ball.webp',
  },
  {
    id: 'tower-event-north-spirit',
    nameId: 'theme_skin_north_spirit',
    eventNameId: 'theme_event_aurora',
    icon: 'north-spirit',
    image: '/themes/tower/NorthSpirit.webp',
  },
  {
    id: 'tower-event-alien',
    nameId: 'theme_skin_alien',
    eventNameId: 'theme_event_aliens',
    icon: 'alien',
    image: '/themes/tower/alien.webp',
  },
  {
    id: 'tower-event-water-droplet',
    nameId: 'theme_skin_water_droplet',
    eventNameId: 'theme_event_ocean_night',
    icon: 'water-droplet',
    image: '/themes/tower/WaterDroplet.webp',
  },
  {
    id: 'tower-event-cherry-blossom',
    nameId: 'theme_skin_cherry_blossom',
    eventNameId: 'theme_event_cherry_blossom',
    icon: 'cherry-blossom',
    image: '/themes/tower/CherryBlossomSkin.webp',
  },
  {
    id: 'tower-event-neo-turbo',
    nameId: 'theme_skin_neo_turbo',
    eventNameId: 'theme_event_retrowave',
    icon: 'retrowave',
    image: '/themes/tower/car-skin.webp',
  },
  {
    id: 'tower-event-spider',
    nameId: 'theme_skin_spider',
    eventNameId: 'theme_event_cobweb',
    icon: 'haunted-house',
    image: '/themes/tower/spider-skin.webp',
  },
  {
    id: 'tower-event-sentinel',
    nameId: 'theme_skin_sentinel',
    eventNameId: 'theme_event_matrix',
    icon: 'matrix',
    image: '/themes/tower/sentinel-skin.webp',
  },
  {
    id: 'tower-event-autumn-leaf',
    nameId: 'theme_skin_autumn_leaf',
    eventNameId: 'theme_event_autumn',
    icon: 'cactus',
    image: '/themes/tower/autumn-leaf.webp',
  },
  {
    id: 'tower-event-invader',
    nameId: 'theme_skin_invader',
    eventNameId: 'theme_event_retro_arcade',
    icon: 'arcade',
    image: '/themes/tower/invader.webp',
  },
  {
    id: 'tower-event-toast-glass',
    nameId: 'theme_skin_toast_glass',
    eventNameId: 'theme_event_new_year',
    icon: 'new-years',
    image: '/themes/tower/champagne-glass.webp',
  },
  {
    id: 'tower-event-fisherman',
    nameId: 'theme_skin_fisherman',
    eventNameId: 'theme_event_sunset_fishing',
    icon: 'ocean-night',
    image: '/themes/tower/fisherman.webp',
  },
  {
    id: 'tower-event-storm-eye',
    nameId: 'theme_skin_storm_eye',
    eventNameId: 'theme_event_into_the_storm',
    icon: 'snowstorm',
    image: '/themes/tower/storm-eye.webp',
  },
  {
    id: 'tower-event-noise-tower',
    nameId: 'theme_skin_noise_tower',
    eventNameId: 'theme_event_towers_channel',
    icon: 'arcade',
    image: '/themes/tower/NoiseTower.webp',
  },
  {
    id: 'tower-event-snowman',
    nameId: 'theme_skin_snowman',
    eventNameId: 'theme_event_snowstorm',
    icon: 'snowstorm',
    image: '/themes/tower/snowman.webp',
  },
  {
    id: 'tower-event-pocket-watch',
    nameId: 'theme_skin_pocket_watch',
    eventNameId: 'theme_event_what_time_is_it',
    icon: 'atomic',
    image: '/themes/tower/pocket-watch_icon.webp',
  },
  {
    id: 'tower-event-frog',
    nameId: 'theme_skin_frog',
    eventNameId: 'theme_event_koi_pond',
    icon: 'turtle',
    image: '/themes/tower/frog.webp',
  },
  {
    id: 'tower-event-marshmallow',
    nameId: 'theme_skin_marshmallow',
    eventNameId: 'theme_event_camping',
    icon: 'sheep',
    image: '/themes/tower/Marshmallow.webp',
  },
  {
    id: 'tower-event-cthulhu',
    nameId: 'theme_skin_cthulhu',
    eventNameId: 'theme_event_cthulhu',
    icon: 'alien',
    image: '/themes/tower/cthulhu.webp',
  },
  {
    id: 'tower-event-flying-car',
    nameId: 'theme_skin_flying_car',
    eventNameId: 'theme_event_cyberpunk',
    icon: 'cyber',
    image: '/themes/tower/FlyingCar.webp',
  },
  {
    id: 'tower-event-crystal',
    nameId: 'theme_skin_crystal',
    eventNameId: 'theme_event_crystal_cave',
    icon: 'eclipse',
    image: '/themes/tower/Crystal.webp',
  },
  {
    id: 'tower-event-balloon',
    nameId: 'theme_skin_balloon',
    eventNameId: 'theme_event_amusement_park',
    icon: 'donut',
    image: '/themes/tower/BalloonIcon.webp',
  },
  {
    id: 'tower-event-heart',
    nameId: 'theme_skin_heart',
    eventNameId: 'theme_event_valentine',
    icon: 'cherry-blossom',
    image: '/themes/tower/valentine-heart-icon.webp',
  },
  {
    id: 'tower-event-glitch',
    nameId: 'theme_skin_glitch',
    eventNameId: 'theme_event_glitch',
    icon: 'matrix',
    image: '/themes/tower/glitched-tower.webp',
  },
  {
    id: 'tower-event-brain',
    nameId: 'theme_skin_brain',
    eventNameId: 'theme_event_neuron',
    icon: 'atomic',
    image: '/themes/tower/Brain.webp',
  },
  {
    id: 'tower-event-cake',
    nameId: 'theme_skin_cake',
    eventNameId: 'theme_event_5th_anniversary',
    icon: 'menu-party',
    image: '/themes/tower/Cake.webp',
  },
  {
    id: 'tower-event-star',
    nameId: 'theme_skin_star',
    eventNameId: 'theme_event_interstellar',
    icon: 'interstellar',
    image: '/themes/tower/StarSkin.webp',
  },
  {
    id: 'tower-event-eye-of-the-lord',
    nameId: 'theme_skin_eye_of_the_lord',
    eventNameId: 'theme_event_volcano',
    icon: 'volcano',
    image: '/themes/tower/FireEye.webp',
  },
  {
    id: 'tower-event-bee',
    nameId: 'theme_skin_bee',
    eventNameId: 'theme_event_honey',
    icon: 'smile',
    image: '/themes/tower/Bee.webp',
  },
  {
    id: 'tower-event-bunny',
    nameId: 'theme_skin_bunny',
    eventNameId: 'theme_event_easter',
    icon: 'sheep',
    image: '/themes/tower/bunny-skin.webp',
  },
  {
    id: 'tower-event-prisma',
    nameId: 'theme_skin_prisma',
    eventNameId: 'theme_event_prismatic_lines',
    icon: 'retrowave',
    image: '/themes/tower/Prisma.webp',
  },
  {
    id: 'tower-event-virus',
    nameId: 'theme_skin_virus',
    eventNameId: 'theme_event_viral_outbreak',
    icon: 'matrix',
    image: '/themes/tower/virus.webp',
  },
  {
    id: 'tower-event-howling-wolf',
    nameId: 'theme_skin_howling_wolf',
    eventNameId: 'theme_event_full_moon',
    icon: 'rhino',
    image: '/themes/tower/wolf-skin.webp',
  },
  {
    id: 'tower-event-hourglass',
    nameId: 'theme_skin_hourglass',
    eventNameId: 'theme_event_sands_of_time',
    icon: 'atomic',
    image: '/themes/tower/hourglass_icon.webp',
  },
  {
    id: 'tower-event-pumpkin',
    nameId: 'theme_skin_pumpkin',
    eventNameId: 'theme_event_halloween',
    icon: 'haunted-house',
    image: '/themes/tower/pumpkin.webp',
  },
  {
    id: 'tower-event-dark-tower',
    nameId: 'theme_skin_dark_tower',
    eventNameId: 'theme_event_dark_strands',
    icon: 'menu-dark-being',
    image: '/themes/tower/dark-tower.webp',
  },
  {
    id: 'tower-event-dive-helmet',
    nameId: 'theme_skin_dive_helmet',
    eventNameId: 'theme_event_deep_blue_sea',
    icon: 'ocean-night',
    image: '/themes/tower/dive-helmet.webp',
  },
  {
    id: 'tower-event-starship',
    nameId: 'theme_skin_starship',
    eventNameId: 'theme_event_faster_than_light',
    icon: 'interstellar',
    image: '/themes/tower/starship.webp',
  },
  {
    id: 'tower-event-elite-tower',
    nameId: 'theme_skin_elite_tower',
    eventNameId: 'theme_event_invaders',
    icon: 'alien',
    image: '/themes/tower/elite-tower.webp',
  },
  {
    id: 'tower-event-umbrella',
    nameId: 'theme_skin_umbrella',
    eventNameId: 'theme_event_rainfall',
    icon: 'water-droplet',
    image: '/themes/tower/umbrella.webp',
  },
  {
    id: 'tower-event-unlucky-cow',
    nameId: 'theme_skin_unlucky_cow',
    eventNameId: 'theme_event_abduction',
    icon: 'sheep',
    image: '/themes/tower/cow.webp',
  },
  {
    id: 'tower-event-black-cat',
    nameId: 'theme_skin_black_cat',
    eventNameId: 'theme_event_meowy_night',
    icon: 'cat',
    image: '/themes/tower/black_cat.webp',
  },
  {
    id: 'tower-event-black-hole',
    nameId: 'theme_skin_black_hole',
    eventNameId: 'theme_event_gravity',
    icon: 'eclipse',
    image: '/themes/tower/black_hole.webp',
  },
  {
    id: 'tower-event-neon-pi',
    nameId: 'theme_skin_neon_pi',
    eventNameId: 'theme_event_pi',
    icon: 'matrix',
    image: '/themes/tower/pi.webp',
  },
]

export const TOWER_GUILD_SKIN_ROWS: readonly TowerGuildRow[] = [
  {
    id: 'tower-guild-crown',
    nameId: 'theme_skin_crown',
    icon: 'menu-crown',
    guildSeason: 1,
    image: '/themes/tower/crown.webp',
  },
  {
    id: 'tower-guild-mech-warrior',
    nameId: 'theme_skin_mech_warrior',
    icon: 'menu-mech',
    guildSeason: 2,
    image: '/themes/tower/mech-warrior.webp',
  },
  {
    id: 'tower-guild-dj',
    nameId: 'theme_skin_dj',
    icon: 'menu-party',
    guildSeason: 3,
    image: '/themes/tower/dj.webp',
  },
  {
    id: 'tower-guild-pixel-soldier',
    nameId: 'theme_skin_pixel_soldier',
    icon: 'menu-pixel',
    guildSeason: 4,
    image: '/themes/tower/PixelSoldierIcon.webp',
  },
  {
    id: 'tower-guild-restless-eye',
    nameId: 'theme_skin_restless_eye',
    icon: 'menu-horror',
    guildSeason: 5,
    image: '/themes/tower/RestlessEyeIcon.webp',
  },
  {
    id: 'tower-guild-shining-star',
    nameId: 'theme_skin_shining_star',
    icon: 'interstellar',
    guildSeason: 6,
    image: '/themes/tower/ShiningStarIcon.webp',
  },
  {
    id: 'tower-guild-space-telescope',
    nameId: 'theme_skin_space_telescope',
    icon: 'plasma-ball',
    guildSeason: 7,
    image: '/themes/tower/space-telescope.webp',
  },
  {
    id: 'tower-guild-bear',
    nameId: 'theme_skin_bear',
    icon: 'sheep',
    guildSeason: 8,
    image: '/themes/tower/claw-machine.webp',
  },
  {
    id: 'tower-guild-rabbit-in-hat',
    nameId: 'theme_skin_rabbit_in_hat',
    icon: 'sheep',
    guildSeason: 9,
    image: '/themes/tower/RabbitInHat.webp',
  },
]
