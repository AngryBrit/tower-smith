/**
 * Generate game Relic enum index → workshop relic id mapping.
 * Run: node scripts/gen-game-relic-index.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const relicCs = readFileSync('h:/The Tower/Dump/Assembly-CSharp/Relic.cs', 'utf8')
const catalog = JSON.parse(
  readFileSync(join(root, 'src/data/workshopRelics.generated.json'), 'utf8'),
)
const catalogIds = new Set(catalog.map((r) => r.id))
const catalogByNormName = new Map(
  catalog.map((r) => [norm(r.name), r.id]),
)

/** @type {Record<string, string>} */
const ENUM_OVERRIDES = {
  None: '',
  Year1: '1st_tower_birthday',
  Year2: '2nd_tower_birthday',
  Year3: '3rd_tower_birthday',
  Year4: '4th_tower_birthday',
  Year5: '5th_tower_birthday',
  Year6: '6th_tower_birthday',
  Tier1: 't_i_flux',
  Tier2: 't_ii_lumin',
  Tier3: 't_iii_pulse',
  Tier4: 't_iv_harmonic',
  Tier5: 't_v_ether',
  Tier6: 't_vi_nova',
  Tier7: 't_vii_aether',
  Tier8: 't_viii_graviton',
  Tier9: 't_ix_fusion',
  Tier10: 't_x_plasma',
  Tier11: 't_xi_resonance',
  Tier12: 't_xii_chrono',
  Tier13: 't_xiii_hyper',
  Tier14: 't_xiv_arcane',
  Tier15: 't_xv_celestial',
  Tier16: 't_xvi_quantum',
  Tier17: 't_xvii_nebula',
  Tier18: 't_xviii_singularity',
  Tier19: 't_xix_atomic',
  Tier20: 't_xx_cyber',
  Tier21: 't_xxi_eclipse',
  FullMoon: 'dreamcatcher',
  Wolf: 'spirit_wolf',
  Bat: 'spooky_bat',
  Skull: 'man_skull',
  HolyJoystick: 'holy_joystick',
  Controller: 'game_joystick',
  Fireworks: 'firework',
  Cheers: 'champagne',
  Pumpkin: 'jack_o_lantern',
  PixelCubeHeart: 'pixel_heart',
  CreepyEye: 'dark_sight',
  CreepySmile: 'creepy_grin',
  StarShip: 'star_ship',
  Wave: 'ocean_wave',
  Illuminati: 'illuminati_symbol',
  PrismaticShard: 'prismatic_shard',
  TheFly: 'the_fly',
  CodeStream: 'code_stream',
  MountainGoat: 'mountain_goat',
  Fish: 'fish',
  FlyHouse: 'flying_house',
  StormClouds: 'cloud_lightning',
  Ebola: 'ebola',
  Sphinx: 'sphinx',
  PlanetaryRings: 'planetary_rings',
  Lava: 'lava_flow',
  AshCloud: 'ash_cloud',
  Cassette: 'cassette_tape',
  NeonSunglasses: 'neon_sunglasses',
  Kimono: 'kimono',
  Scarf: 'scarf',
  WitchHat: 'witch_hat',
  CropCircle: 'crop_circle',
  SleighBell: 'sleigh_bell',
  BonsaiTree: 'bonsai_tree',
  ArcadeToken: 'arcade_token',
  CutePetCat: 'cute_pet_cat',
  PartyMask: 'party_mask',
  ThreeBodySolution: '3_body_solution',
  AnglerFish: 'anglerfish',
  HauntedMirror: 'haunted_mirror',
  ShadowPuppet: 'shadow_puppet',
  DreamClock: 'dream_clock',
  PulsarCore: 'pulsar_core',
  LightSpeedometer: 'light_speedometer',
  UfoBeam: 'ufo_beam',
  AlienEgg: 'alien_egg',
  Hourglass: 'hourglass',
  TimeCompass: 'time_compass',
  WhisperingWeb: 'whispering_web',
  CursedCandle: 'cursed_candle',
  QuantumDrive: 'quantum_drive',
  PhotonBlade: 'photon_blade',
  AbductionSignal: 'abduction_signal',
  Monolith: 'monolith',
  Crown: 'crown',
  BloomBurst: 'bloom_burst',
  CandyCore: 'candy_core',
  MysticHare: 'mystic_bunny_1',
  MagicEgg: 'magic_egg',
  InfiniteRuler: 'infinite_ruler',
  DoWhileTrue: 'do_while_true',
  PiSeal: 'pi_seal',
  PsychoHistorianBrain: 'psychohistorian_brain',
  FancyWires: 'fancy_wires',
  MechHead: 'mech_head',
  SafePath: 'safe_path',
  ShiningLight: 'shining_light',
  EndlessAdventure: 'eternal_quest',
  RelentlessNature: 'nature_s_wrath',
  Rlyeh: 'rlyeh',
  MadnessInduction: 'madness_induced',
  CosmicSovereignty: 'cosmic_freedom',
  Omniscience: 'gnosis',
  HoneyJar: 'honey_jar',
  HeavenlySweet: 'heavenly_sweet',
  HoneySociety: 'honey_society',
  TheQueen: 'the_queen',
  Duck: 'duck',
  Grass: 'grass',
  Wind: 'wind',
  Lilies: 'lilies',
  PlasmaGlobe: 'plasma_globe',
  PlasmaVortex: 'plasma_vortex',
  PlasmaCell: 'plasma_cell',
  PlasmaChamber: 'plasma_chamber',
  FloppyDisc: 'floppy_disk',
  MagicCube: 'magic_cube',
  RetroCamera: 'retro_camera',
  NightCity: 'night_city',
  FishermanSet: 'fisherman_set',
  SunsetBoat: 'sunset_boat',
  GoodCatch: 'good_catch',
  RiverOfPlenty: 'river_of_plenty',
  MachineLanguage: 'model_training',
  InstantKnowledge: 'gnosis',
  TowerAgent: 'tower_agent',
  FakeReality: 'fake_reality',
  BreakingNews: 'breaking_news',
  Globalization: 'globalization',
  NoSignal: 'no_signal',
  Antenna: 'antenna',
  Brunch: 'brunch',
  DryLeaves: 'dry_leaves',
  GlowingMushrooms: 'glowing_mushrooms',
  WinterIsComing: 'warm_clothes',
  LetsMix: 'lets_mix',
  Nightlife: 'nightlife',
  WorldDomination: 'world_domination',
  BraveHeroes: 'brave_heroes',
  VR: 'vr',
  HolographicAds: 'holographic_ads',
  TechWeapon: 'tech_weapon',
  Cybernetics: 'cybernetics',
  ExplorersHelmet: 'explorer_s_helmet',
  MinersTools: 'miner_s_tool',
  CrystalsBag: 'crystals_bag',
  FullMinecart: 'full_minecart',
  HappinessBalloons: 'happiness_balloons',
  DeliciousFood: 'delicious_food',
  AmazingPrizes: 'amazing_prizes',
  CarouselOfJoy: 'carousel_of_joy',
  Bouquet: 'bouquet',
  LovelyGift: 'lovely_gift',
  LoveLetter: 'love_letter',
  PiercedHeart: 'pierced_heart',
  GoodHunting: 'good_hunting',
  SpiderVision: 'spider_vision',
  SpiderPoison: 'spider_poison',
  SpiderForest: 'spider_forest',
  Pinball: 'pinball',
  ToInfinity: 'to_infinity',
  LetsPlay: 'lets_play',
  Enemies: 'enemies',
  SnowGlobe: 'snow_globe',
  WinterGloves: 'winter_gloves',
  Snowflake: 'snowflake',
  ChristmasWreath: 'wreath',
  PartyPopper: 'party_popper',
  Champagne: 'champagne',
  FireworkRocket: 'firework_rocket',
  GiftBox: 'gift_box',
  SkysCurtains: 'sky_s_curtain',
  SolarFlare: 'solar_flare',
  NorthernMountains: 'northern_mountains',
  CosmicImpact: 'cosmic_impact',
  SuddenAttack: 'sudden_attack',
  AlienExperiment: 'alien_experiment',
  CropCircles: 'crop_circles',
  AlienImplants: 'alien_implants',
  BloodMonster: 'blood_monster',
  GlimpseOfDespair: 'glimpse_of_despair',
  StarPath: 'star_path',
  StarPlanet: 'star_planet',
  AncientTimes: 'ancient_times',
  SpaceDistortion: 'space_distortion',
  ClockTower: 'clock_tower',
  TimeTravel: 'time_travel',
  Lighthouse: 'lighthouse',
  NightShark: 'night_shark',
  SailingAtNight: 'sailing_at_night',
  Moonlight: 'moonlight',
  FestivalLanterns: 'festival_lanterns',
  Ramen: 'ramen',
  ForestTemple: 'forest_temple',
  Tori: 'tori',
  BrokenSecurity: 'broken_security',
  ResearchObject: 'research_object',
  DigitalDisaster: 'digital_disaster',
  Instability: 'instability',
  ElementalExplosion: 'elemental_explosion',
  Quasar: 'quasar',
  PerfectCatch: 'perfect_catch',
  CollectorsSpirit: 'collector_s_spirit',
  NaturesFury: 'nature_s_fury',
  NaturalFire: 'natural_fire',
  BigTornado: 'big_tornado',
  StormPlanet: 'storm_planet',
  Synapse: 'synapse',
  BrainNet: 'brain_net',
  NeuralNetwork: 'neural_network',
  BodyControl: 'body_control',
  ViralInfection: 'viral_infection',
  PersonalCare: 'personal_care',
  Immunization: 'immunization',
  GlobalThreat: 'global_threat',
  MagmaRiver: 'magma_river',
  NewIsland: 'new_island',
  Obsidian: 'obsidian',
  GeologicalActivity: 'geological_activity',
  MagicCards: 'magic_cards',
  DangerousTricks: 'dangerous_tricks',
  LegendBadge: 'legend_badge',
  AncientTome: 'ancient_tome',
  Sundial: 'space_sundial',
  SakuraLantern: 'sakura_lantern',
  Stinger: 'stinger',
  Kraken: 'the_kraken',
  RedPill: 'red_pill',
  NoSpoon: 'no_spoon',
  LunarPawPrint: 'lunar_cat_paw',
  CutePetCat: 'pet_cat',
}

function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function pascalToSnake(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase()
}

function displayNameFromEnum(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/Tier(\d+)/i, (_, n) => `T:${roman(n)}`)
    .replace(/Year(\d+)/i, (_, n) => `${n}${ord(n)} Tower Birthday`)
}

function roman(n) {
  const map = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI']
  return map[Number(n)] ?? n
}

function ord(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

/** @type {{index:number, enumName:string}[]} */
const entries = []
for (const m of relicCs.matchAll(/^\t([A-Za-z0-9]+)\s*=\s*(-?\d+)/gm)) {
  const enumName = m[1]
  const index = Number(m[2])
  if (enumName === 'None' && index === -1) continue
  entries.push({ index, enumName })
}
entries.sort((a, b) => a.index - b.index)

const maxIndex = Math.max(...entries.map((e) => e.index))
const map = Array.from({ length: maxIndex + 1 }, () => null)
const unmatched = []

for (const { index, enumName } of entries) {
  let id = ENUM_OVERRIDES[enumName]
  if (id === '') {
    map[index] = null
    continue
  }
  if (!id) id = pascalToSnake(enumName)
  if (!catalogIds.has(id)) {
    const byName = catalogByNormName.get(norm(displayNameFromEnum(enumName)))
    if (byName) id = byName
  }
  if (!catalogIds.has(id)) {
    unmatched.push({ index, enumName, guess: id })
    continue
  }
  map[index] = id
}

console.log('mapped', map.filter(Boolean).length, '/', map.length)
console.log('unmatched', unmatched.length)
if (unmatched.length) {
  console.log(unmatched.slice(0, 30).map((u) => `${u.index}\t${u.enumName}\t${u.guess}`).join('\n'))
}

const outPath = join(root, 'src/playerSave/gameRelicMapping.ts')
const lines = [
  '/**',
  ' * Game `relicsUnlocked[]` indices (Il2Cpp `Relic` enum).',
  ' * TowerSmith catalog order ({@link WORKSHOP_RELIC_ORDER}) differs — do not index saves by wiki order.',
  ' * Generated by `scripts/gen-game-relic-index.mjs`.',
  ' */',
  '',
  `export const GAME_RELIC_COUNT = ${map.length} as const`,
  '',
  '/** Save array index → workshop relic id (null = no catalog entry). */',
  'export const GAME_RELIC_INDEX_TO_WORKSHOP_ID: readonly (string | null)[] = [',
]
for (let i = 0; i < map.length; i++) {
  const v = map[i]
  lines.push(`  ${v == null ? 'null' : JSON.stringify(v)}, // ${entries.find((e) => e.index === i)?.enumName ?? i}`)
}
lines.push('] as const', '')
lines.push(
  'export function workshopRelicIdAtGameIndex(gameIndex: number): string | null {',
  '  if (!Number.isInteger(gameIndex) || gameIndex < 0 || gameIndex >= GAME_RELIC_INDEX_TO_WORKSHOP_ID.length) {',
  '    return null',
  '  }',
  '  return GAME_RELIC_INDEX_TO_WORKSHOP_ID[gameIndex] ?? null',
  '}',
  '',
)

writeFileSync(outPath, lines.join('\n'))
console.log('wrote', outPath)
