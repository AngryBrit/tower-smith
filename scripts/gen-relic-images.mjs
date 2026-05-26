/**
 * Match workshop relic catalog ids to `public/relics/{rarity}/*.webp` and emit
 * `src/data/workshopRelicImages.generated.json`.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const relicsDir = join(root, 'public/relics')
const catalogPath = join(root, 'src/data/workshopRelics.generated.json')
const outPath = join(root, 'src/data/workshopRelicImages.generated.json')

const RARITY_DIRS = ['rare', 'epic', 'legendary', 'unmapped']

/** @type {string[]} */
const files = []
/** @type {Map<string, string>} basename -> path relative to public/relics/ */
const relPathByBasename = new Map()

function collectWebpFiles(dir, prefix = '') {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      collectWebpFiles(join(dir, entry.name), rel)
      continue
    }
    if (!entry.name.endsWith('.webp')) continue
    files.push(entry.name)
    if (!relPathByBasename.has(entry.name)) relPathByBasename.set(entry.name, rel)
  }
}

if (existsSync(join(relicsDir, 'rare'))) {
  for (const rarity of RARITY_DIRS) {
    const sub = join(relicsDir, rarity)
    if (existsSync(sub)) collectWebpFiles(sub, rarity)
  }
} else {
  collectWebpFiles(relicsDir)
}

/** @type {Record<string, string>} */
const MANUAL = {
  t_i_flux: 'relic_Flux_1.webp',
  t_ii_lumin: 'relic_Lumin_1.webp',
  t_iii_pulse: 'relic_Pulse_1.webp',
  t_iv_harmonic: 'relic_Harmonic_1.webp',
  t_v_ether: 'relic_Ether_1.webp',
  t_vi_nova: 'relic_Nova_1.webp',
  t_vii_aether: 'relic_Aether_1.webp',
  t_viii_graviton: 'relic_Graviton_1.webp',
  t_ix_fusion: 'relic_Fusion_1.webp',
  t_x_plasma: 'relic_Plasma_1.webp',
  t_xi_resonance: 'relic_Resonance_1.webp',
  t_xii_chrono: 'relic_Chrono_1.webp',
  t_xiii_hyper: 'relic_Hyper_1.webp',
  t_xiv_arcane: 'relic_Arcane_1.webp',
  t_xv_celestial: 'relic_Celestial_1.webp',
  t_xvi_quantum: 'relic_T16-Quantum.webp',
  t_xvii_nebula: 'relic_T17-Nebula.webp',
  t_xviii_singularity: 'relic_T18-Singularity.webp',
  t_xix_atomic: 'AtomicRelics.webp',
  t_xx_cyber: 'CyberRelic.webp',
  t_xxi_eclipse: 'EclipseRelic.webp',
  copper_badge: 'relic_CopperBadge_1.webp',
  silver_badge: 'relic_SilverBadge_1.webp',
  gold_badge: 'relic_GoldBadge_1.webp',
  platinum_badge: 'relic_PlatinumBadge_1.webp',
  champion_badge: 'relic_ChampionBadge_1.webp',
  legend_badge: 'relic_LegendBadge.webp',
  '1st_tower_birthday': 'relic_1Year_(1).webp',
  '2nd_tower_birthday': 'relic_2year_(1).webp',
  '3rd_tower_birthday': 'relic_3year_(1).webp',
  '4th_tower_birthday': 'relic_4year.webp',
  '5th_tower_birthday': 'relic_5year.webp',
  '6th_tower_birthday': 'relic_6year.webp',
  tower_master: 'relic_ChampionFirst_1.webp',
  no_spoon: 'relic_NoSpoon_1.webp',
  red_pill: 'relic_RedPill_1.webp',
  dreamcatcher: 'relic_Dreamcatcher_1.webp',
  spirit_wolf: 'relic_Wolf_1.webp',
  bacteriophage: 'relic_Bacteriophage_1.webp',
  neuron: 'relic_Neuron_1.webp',
  ionized_plasma: 'relic_IonizedPlasma_1.webp',
  plasma_arc: 'relic_PlasmaArc_1.webp',
  space_sundial: 'relic_Sundial.webp',
  the_kraken: 'relic_Kraken.webp',
  mech_head: 'relic_guilds_mech.webp',
  fancy_wires: 'relic_guilds_wire.webp',
  mystic_bunny_1: 'relic_mysticHare.webp',
  party_mask: 'relic_newYearMask.webp',
  spooky_bat: 'relic_Bat.webp',
  man_skull: 'relic_Skull.webp',
  tower_latte: 'relic_javaTowerLatte.webp',
  holy_joystick: 'relic_holyJoystick.webp',
  pixel_cube_heart: 'relic_PixelHeart.webp',
  dark_sight: 'relic_CreepyEye.webp',
  cobweb: 'relic_webby.webp',
  remote_control: 'relic_tvRemote.webp',
  cathode_ray_tube: 'relic_cathodeRay.webp',
  lava_flow: 'relic_lava.webp',
  '3_body_solution': 'relic_threeBodySolution.webp',
  psychohistorian_brain: 'relic_psychoHistorian.webp',
  duck: 'rare_Duck.webp',
  grass: 'rare_grass.webp',
  wind: 'Epic_wind.webp',
  lilies: 'Epic_Lilies.webp',
  floppy_disk: 'Floppy_Disc.webp',
  eternal_quest: 'EndlessAdventure.webp',
  nature_s_wrath: 'RelentlessNature.webp',
  madness_induced: 'Madness_induction.webp',
  cosmic_freedom: 'Cosmic_Sovereignty.webp',
  warm_clothes: 'Winter_is_Coming.webp',
  cybernetics: 'Cybernetics.webp',
  miner_s_tool: "Miner's_Tools.webp",
  wreath: 'christmas_wreath.webp',
  firework_rocket: 'Fireworks.webp',
  gift_box: 'Gift.webp',
  sky_s_curtain: "Sky's_Curtains.webp",
  alien_experiment: 'Alien_Experiments.webp',
  night_shark: 'NightSharks.webp',
  festival_lanterns: 'FestivalLantern.webp',
  space_distortion: 'SpacetimeDistortion.webp',
  nature_s_fury: 'NatureFury.webp',
  tower_agent: 'Tower_Agent.webp',
  model_training: 'Machine_Language.webp',
  gnosis: 'Instant_Knowledge.webp',
}

function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function pascalFromId(id) {
  return id
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
}

function pascalFromName(name) {
  return name.replace(/\[\d+\]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
}

const byNorm = new Map()
for (const f of files) {
  const base = f.replace(/\.webp$/i, '')
  byNorm.set(norm(base), f)
}

/** @type {Array<{id:string,name:string,rarity:string}>} */
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'))
const rarityById = new Map(catalog.map((r) => [r.id, r.rarity]))

/** @type {Record<string, string>} */
const map = {}
const unmatched = []

function assign(id, basename) {
  if (!files.includes(basename)) return false
  const rarity = rarityById.get(id)
  const rel = rarity ? `${rarity}/${basename}` : (relPathByBasename.get(basename) ?? basename)
  map[id] = rel
  return true
}

for (const relic of catalog) {
  const { id, name } = relic
  if (MANUAL[id] && assign(id, MANUAL[id])) continue

  const fileName = name.replace(/ /g, '_')
  const candidates = [
    `relic_${id}.webp`,
    `relic_${pascalFromId(id)}.webp`,
    `relic_${pascalFromName(name)}_1.webp`,
    `relic_${pascalFromName(name)}.webp`,
    `${fileName}.webp`,
  ]

  let file = null
  for (const c of candidates) {
    if (files.includes(c)) {
      file = c
      break
    }
  }

  if (!file) {
    const n = norm(name)
    file = byNorm.get(n) ?? byNorm.get(norm(`relic${name}`)) ?? null
  }

  if (!file) {
    const pascal = norm(pascalFromName(name))
    const matches = files.filter((f) => norm(f.replace(/\.webp$/i, '')) === pascal)
    if (matches.length === 1) file = matches[0]
  }

  if (file && assign(id, file)) {
    continue
  }
  unmatched.push({ id, name })
}

writeFileSync(outPath, `${JSON.stringify(map, null, 2)}\n`)
console.log(`Wrote ${Object.keys(map).length} / ${catalog.length} mappings to ${outPath}`)
if (unmatched.length) {
  console.log(`Unmatched (${unmatched.length}):`)
  for (const u of unmatched) console.log(`  ${u.id} — ${u.name}`)
}
