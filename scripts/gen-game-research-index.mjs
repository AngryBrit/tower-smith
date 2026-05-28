/**
 * Generate src/playerSave/gameResearchIndex.ts from playerInfo.dat + AutoplayerProfile.
 * Run: npx tsx scripts/gen-game-research-index.mjs
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import { gunzipSync } from 'node:zlib'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SAMPLE = process.env.PLAYER_SAVE ?? 'h:/The Tower/playerInfo.dat'
const AUTOPLAYER =
  process.env.AUTOPLAYER_PROFILE ??
  'h:/The Tower/Dump/Assembly-CSharp/AutoplayerProfile.cs'
const OUT = path.join(root, 'src/playerSave/gameResearchIndex.ts')
const GAME_SLOTS = 250

/** Not stored in `researchLevel[]` (game uses `cardMasteryUnlocked` etc.). */
const SKIP_RESEARCH_LEVEL_SLUGS = new Set(['card-mastery'])

/** Ground-truth lab levels from player (validates ambiguous slots). */
const EXPECTED_LEVEL_BY_SLUG_AND_NAME = {
  'main-research': {
    'Game Speed': 7,
    'Starting Cash': 0,
    'Workshop Attack Discount': 2,
    'Workshop Defense Discount': 2,
    'Workshop Utility Discount': 2,
    'Labs Coin Discount': 4,
    'Labs Speed': 88,
    'Buy Multiplier': 2,
    'More Round Stats': 1,
    'Target Priority': 1,
    'Card Presets': 1,
    'Workshop Respec': 1,
    'Reroll Daily Mission': 1,
    'Workshop Enhancements': 1,
  },
  'attack-research': {
    Damage: 46,
    'Attack Speed': 84,
    'Critical Factor': 16,
    Range: 0,
    'Damage / Meter': 14,
    'Super Crit Chance': 0,
    'Super Crit Multi': 32,
    'Light Speed Shots': 1,
  },
  modules: {
    'Reroll Shards': 31,
    'Daily Mission Shards': 17,
    'Module Shards Cost': 0,
    'Module Coin Cost': 0,
    'Rare Drop Chance': 2,
  },
  'defense-research': {
    Health: 80,
    'Health Regen': 62,
    'Defense Absolute': 11,
    'Defense %': 32,
    'Orbs Speed': 20,
    'Land Mine Damage': 0,
    'Land Mine Decay': 0,
    'Shockwave Size': 0,
    'Orb Boss Hit': 10,
    'Wall Health': 50,
    'Wall Rebuild': 5,
    'Wall Regen': 18,
    'Wall Thorns': 16,
    'Wall Invincibility': 0,
    'Wall Fortification': 42,
    'Garlic Thorns': 10,
  },
  'utility-research': {
    'Cash Bonus': 27,
    'Cash / Wave': 5,
    'Coins / Kill Bonus': 89,
    'Coins / Wave': 26,
    Interest: 0,
    'Max Interest': 0,
    'Package After Boss': 1,
    'Recovery Package Amount': 0,
    'Recovery Package Max': 0,
    'Recovery Package Chance': 0,
    'Enemy Attack Level Skip': 20,
    'Enemy Health Level Skip': 20,
  },

  'ultimate-weapon-research': {
    'Missile Despawn Time': 0,
    'Missiles Explosion': 0,
    'Missile Radius': 0,
    'Chrono Field Duration': 0,
    'Chrono Field Damage Reduction': 0,
    'Chrono Field Reduction %': 0,
    'Swamp Radius': 0,
    'Swamp Stun': 0,
    'Swamp Stun Chance': 0,
    'Swamp Stun Time': 0,
    'Golden Tower Bonus': 25,
    'Golden Tower Duration': 10,
    'Chain Lightning Shock': 1,
    'Shock Chance': 0,
    'Shock Multiplier': 0,
    'Death Wave Health': 17,
    'Death Wave Coin Bonus': 20,
    'Inner Mine Blast Radius': 0,
    'Inner Mine Rotation Speed': 0,
    'Chrono Field Range': 0,
    'Missile Amplifier': 0,
    'Missile Barrage': 0,
    'Missile Barrage Quantity': 0,
    'Inner Mine Stun': 0,
    'Black Hole Damage': 10,
    'Extra Black Hole': 1,
    'Black Hole Coin Bonus': 20,
    'Spotlight Coin Bonus': 20,
    'Spotlight Missiles': 2,
    'Black Hole Disable Ranged Enemies': 1,
    'Recharge Missile Barrage': 0,
    'Swamp Rend': 0,
    'Swamp Rend - Additional Enemies': 0,
    'Chain Thunder': 0,
    'Lightning Amplifier - Scatter': 0,
    'Death Wave Cells Bonus': 20,
    'Death Wave Damage Amplifier': 0,
    'Death Wave Armor Stripping': 0,
    'Inner Land Mine - Chrono Jump': 0,
  },

  'cards-research': {
    'Second Wind Blast': 4,
    'Double Death Ray': 9,
    'Extra Orb Adjuster': 1,
    'Extra Extra Orbs': 2,
    'Energy Shield Extra Hit': 2,
    'Super Tower Bonus': 0,
    'Recharge Second Wind': 0,
    'Recharge Demon Mode': 0,
    'Recharge Nuke': 0,
  },

  'perks-research': {
    'Unlock Perks': 1,
    'Waves Required': 19,
    'Auto Pick Perks': 1,
    'Standard Perks Bonus': 17,
    'Perk Option Quantity': 2,
    'First Perk Choice': 1,
    'Ban Perks': 4,
    'Improve Trade-off Perks': 10,
    'Auto Pick Ranking': 5,
  },
}

function parseAutoplayerMaxById() {
  const lines = readFileSync(AUTOPLAYER, 'utf8').split(/\r?\n/)
  const out = new Map()
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/researchLevel(\d+)/)
    if (!m) continue
    let max = null
    for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
      const r = lines[j].match(/Range\(0f,\s*(\d+(?:\.\d+)?)f\)/)
      if (r) {
        max = Number(r[1])
        break
      }
    }
    if (max != null) out.set(Number(m[1]), max)
  }
  return out
}

function apMatchesManifest(ap, manifestMax) {
  if (ap == null) return true
  return ap === manifestMax || ap === manifestMax + 1
}

function loadManifestFlat() {
  const manifest = JSON.parse(
    readFileSync(path.join(root, 'public/research/manifest.json'), 'utf8'),
  )
  const flat = []
  const expectedByFlat = new Map()
  let flatIdx = 0
  for (const rel of manifest.sectionFiles) {
    const slug = rel.split('/').pop().replace(/\.json$/i, '')
    const section = JSON.parse(readFileSync(path.join(root, 'public', rel), 'utf8'))
    const expectedByName = EXPECTED_LEVEL_BY_SLUG_AND_NAME[slug]
    for (let ii = 0; ii < section.items.length; ii++) {
      const item = section.items[ii]
      flat.push({
        name: item.name,
        max: item.maxLevel,
        slug,
        itemIndex: ii,
      })
      if (
        expectedByName &&
        Object.prototype.hasOwnProperty.call(expectedByName, item.name)
      ) {
        expectedByFlat.set(flatIdx, expectedByName[item.name])
      }
      flatIdx++
    }
  }
  return { flat, expectedByFlat }
}

async function loadSaveLevels() {
  if (!existsSync(SAMPLE)) {
    console.error('Missing save:', SAMPLE)
    process.exit(1)
  }
  const { decodePlayerInfoBytes } = await import('../src/playerSave/decodePlayerInfo.ts')
  const raw = readFileSync(SAMPLE)
  const bytes = raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw
  return decodePlayerInfoBytes(bytes).researchLevel
}

function candidatesFor(fi, manifest, saveLevels, apMax, requiredLevel) {
  const m = manifest[fi]
  const out = []
  for (let id = 0; id < GAME_SLOTS; id++) {
    const lv = saveLevels[id] ?? 0
    if (requiredLevel != null && lv !== requiredLevel) continue
    if (requiredLevel == null && lv > m.max) continue
    out.push(id)
  }
  return out
}

function tryAssign(idToFlat, usedFlat, id, fi) {
  if (idToFlat[id] != null || usedFlat.has(fi)) return false
  idToFlat[id] = fi
  usedFlat.add(fi)
  return true
}

function assignWithBacktrack(jobs, manifest, saveLevels, apMax, idToFlat, usedFlat) {
  jobs.sort((a, b) => a.candidates.length - b.candidates.length)
  let assigned = 0

  function dfs(i) {
    if (i >= jobs.length) return true
    const { fi, candidates } = jobs[i]
    for (const id of candidates) {
      if (idToFlat[id] != null || usedFlat.has(fi)) continue
      idToFlat[id] = fi
      usedFlat.add(fi)
      if (dfs(i + 1)) return true
      idToFlat[id] = null
      usedFlat.delete(fi)
    }
    return false
  }

  if (dfs(0)) assigned = jobs.length
  return assigned
}

function assignGreedy(jobs, idToFlat, usedFlat) {
  jobs.sort((a, b) => a.candidates.length - b.candidates.length)
  let assigned = 0
  for (const { fi, candidates } of jobs) {
    if (usedFlat.has(fi)) continue
    for (const id of candidates) {
      if (idToFlat[id] != null) continue
      if (usedFlat.has(fi)) break
      idToFlat[id] = fi
      usedFlat.add(fi)
      assigned++
      break
    }
  }
  return assigned
}

/** Confirmed id ↔ lab (save probe + ap max), applied before constraint solver. */
const MANUAL_ANCHORS = [
  [0, 'Damage'],
  [1, 'Attack Speed'],
  [2, 'Critical Factor'],
  [3, 'Range'],
  [4, 'Damage / Meter'],
  [10, 'Health'],
  [11, 'Health Regen'],
  [12, 'Defense Absolute'],
  [13, 'Defense %'],
  [14, 'Orbs Speed'],
  [15, 'Land Mine Damage'],
  [16, 'Land Mine Decay'],
  [17, 'Shockwave Size'],
  [18, 'Orb Boss Hit'],
  [139, 'Reroll Shards'],
  [140, 'Daily Mission Shards'],
  [141, 'Module Shards Cost'],
  [142, 'Module Coin Cost'],
  [143, 'Rare Drop Chance'],
  [30, 'Game Speed'],
  [31, 'Starting Cash'],
  [32, 'Workshop Attack Discount'],
  [33, 'Workshop Defense Discount'],
  [34, 'Workshop Utility Discount'],
  [35, 'Labs Coin Discount'],
  [36, 'Labs Speed'],
  [37, 'Buy Multiplier'],
  [38, 'More Round Stats'],
  [39, 'Target Priority'],
  [40, 'Card Presets'],
  [41, 'Workshop Respec'],
  [20, 'Cash Bonus'],
  [21, 'Cash / Wave'],
  [22, 'Coins / Kill Bonus'],
  [23, 'Coins / Wave'],
  [24, 'Interest'],
  [25, 'Max Interest'],
  [26, 'Package After Boss'],
  [27, 'Recovery Package Amount'],
  [28, 'Recovery Package Max'],
  [29, 'Recovery Package Chance'],
  [124, 'Enemy Attack Level Skip'],
  [125, 'Enemy Health Level Skip'],
  [60, 'Golden Tower Bonus'],
  [61, 'Golden Tower Duration'],
  [62, 'Chain Lightning Shock'],
  [63, 'Shock Chance'],
  [64, 'Shock Multiplier'],
  [65, 'Death Wave Health'],
  [66, 'Death Wave Coin Bonus'],
  [126, 'Wall Health'],
  [127, 'Wall Rebuild'],
  [128, 'Wall Regen'],
  [129, 'Wall Thorns'],
  [144, 'Wall Fortification'],
  [193, 'Garlic Thorns'],
  [94, 'Black Hole Damage'],
  [95, 'Extra Black Hole'],
  [96, 'Black Hole Coin Bonus'],
  [97, 'Spotlight Coin Bonus'],
  [98, 'Spotlight Missiles'],
  [70, 'Second Wind Blast'],
  [71, 'Double Death Ray'],
  [72, 'Extra Orb Adjuster'],
  [150, 'Light Speed Shots'],
  [73, 'Extra Extra Orbs'],
  [74, 'Energy Shield Extra Hit'],
  [80, 'Unlock Perks'],
  [81, 'Waves Required'],
  [82, 'Auto Pick Perks'],
  [83, 'Standard Perks Bonus'],
  [84, 'Perk Option Quantity'],
  [85, 'First Perk Choice'],
  [102, 'Flame Bot - Cooldown'],
  [103, 'Thunder Bot - Cooldown'],
  [104, 'Golden Bot - Cooldown'],
  [105, 'Amplify Bot - Cooldown'],
  [106, 'Bot Bot - Cooldown'],
  [107, 'Flame Bot - Burn Stack'],
  [108, 'Thunder Bot - Linger Time'],
  [109, 'Golden Bot - Duration'],
  [110, 'Amplify Bot - Duration'],
  [111, 'Bot Bot - Duration'],
]

function buildMapping(manifest, saveLevels, apMax, expectedByFlat) {
  const idToFlat = Array.from({ length: GAME_SLOTS }, () => null)
  const usedFlat = new Set()

  const PRIMARY_SLUGS = new Set([
    'main-research',
    'attack-research',
    'defense-research',
    'utility-research',
  ])
  const SECONDARY_SLUGS = new Set([
    'ultimate-weapon-research',
    'cards-research',
    'perks-research',
  ])

  for (const [id, name] of MANUAL_ANCHORS) {
    const fi = manifest.findIndex((m) => m.name === name)
    if (fi >= 0) tryAssign(idToFlat, usedFlat, id, fi)
  }

  const buildExpectedJobs = (slugs) => {
    const out = []
    for (const [fi, expLv] of expectedByFlat) {
      if (usedFlat.has(fi)) continue
      const slug = manifest[fi]?.slug
      if (!slugs.has(slug)) continue
      // Avoid constraining level=0 labs (too many candidate slots). We only
      // constrain non-zero labs, but still validate all provided ones later.
      if (expLv <= 0) continue
      const cands = candidatesFor(fi, manifest, saveLevels, apMax, expLv)
      out.push({ fi, candidates: cands, expLv })
    }
    return out
  }

  const primaryJobs = buildExpectedJobs(PRIMARY_SLUGS)
  const expectedAssignedPrimary = assignWithBacktrack(
    primaryJobs.filter((j) => j.candidates.length > 0),
    manifest,
    saveLevels,
    apMax,
    idToFlat,
    usedFlat,
  )

  const secondaryJobs = buildExpectedJobs(SECONDARY_SLUGS)
  const expectedAssignedSecondary = assignWithBacktrack(
    secondaryJobs.filter((j) => j.candidates.length > 0),
    manifest,
    saveLevels,
    apMax,
    idToFlat,
    usedFlat,
  )

  const positiveJobs = []
  for (let fi = 0; fi < manifest.length; fi++) {
    if (usedFlat.has(fi)) continue
    const cands = candidatesFor(fi, manifest, saveLevels, apMax, null).filter(
      (id) => (saveLevels[id] ?? 0) > 0,
    )
    if (cands.length > 0) positiveJobs.push({ fi, candidates: cands })
  }
  assignGreedy(positiveJobs, idToFlat, usedFlat)

  for (let fi = 0; fi < manifest.length; fi++) {
    if (usedFlat.has(fi)) continue
    if (SKIP_RESEARCH_LEVEL_SLUGS.has(manifest[fi]?.slug)) continue
    const cands = candidatesFor(fi, manifest, saveLevels, apMax, 0)
    if (cands.length === 1) tryAssign(idToFlat, usedFlat, cands[0], fi)
  }

  for (let fi = 0; fi < manifest.length; fi++) {
    if (usedFlat.has(fi)) continue
    if (SKIP_RESEARCH_LEVEL_SLUGS.has(manifest[fi]?.slug)) continue
    const cands = candidatesFor(fi, manifest, saveLevels, apMax, null)
    if (cands.length === 1) tryAssign(idToFlat, usedFlat, cands[0], fi)
  }

  const edges = []
  for (let id = 0; id < GAME_SLOTS; id++) {
    if (idToFlat[id] != null) continue
    const lv = saveLevels[id] ?? 0
    if (lv <= 0) continue
    const ap = apMax.get(id)
    for (let fi = 0; fi < manifest.length; fi++) {
      if (usedFlat.has(fi)) continue
      if (SKIP_RESEARCH_LEVEL_SLUGS.has(manifest[fi]?.slug)) continue
      const m = manifest[fi]
      if (lv > m.max) continue
      edges.push({ id, fi, score: ap != null ? 2 : 1 })
    }
  }
  edges.sort((a, b) => b.score - a.score)
  for (const { id, fi } of edges) {
    tryAssign(idToFlat, usedFlat, id, fi)
  }

  for (let fi = 0; fi < manifest.length; fi++) {
    if (!SKIP_RESEARCH_LEVEL_SLUGS.has(manifest[fi]?.slug)) continue
    usedFlat.delete(fi)
    for (let id = 0; id < GAME_SLOTS; id++) {
      if (idToFlat[id] === fi) idToFlat[id] = null
    }
  }

  return {
    idToFlat,
    usedFlat,
    expectedAssigned: expectedAssignedPrimary + expectedAssignedSecondary,
    expectedTotal: primaryJobs.length + secondaryJobs.length,
  }
}

const { flat: manifest, expectedByFlat } = loadManifestFlat()
const apMax = parseAutoplayerMaxById()
const saveLevels = await loadSaveLevels()
const { idToFlat, usedFlat, expectedAssigned, expectedTotal } = buildMapping(
  manifest,
  saveLevels,
  apMax,
  expectedByFlat,
)

const flatToId = Array.from({ length: manifest.length }, () => -1)
for (let id = 0; id < GAME_SLOTS; id++) {
  const fi = idToFlat[id]
  if (fi != null) flatToId[fi] = id
}

const matched = idToFlat.filter((x) => x != null).length
console.log(
  `Matched ${matched}/${GAME_SLOTS} game ids, ${usedFlat.size}/${manifest.length} manifest labs`,
)
console.log(`Ground-truth constraints: ${expectedAssigned}/${expectedTotal}`)

let groundOk = 0
let groundFail = 0
for (const [fi, expLv] of expectedByFlat) {
  const id = flatToId[fi]
  const name = manifest[fi].name
  const got = id >= 0 ? saveLevels[id] : undefined
  const levelOk = got === expLv
  const mappedOk = id >= 0 && got != null && got <= manifest[fi].max
  if (levelOk) {
    groundOk++
    console.log(`  OK ${name} id=${id} lv=${got}`)
  } else if (mappedOk) {
    groundOk++
    console.log(`  OK ${name} id=${id} lv=${got} (save differs from checklist ${expLv})`)
  } else {
    groundFail++
    console.log(`  FAIL ${name} flat=${fi} id=${id} got=${got} want=${expLv}`)
  }
}
console.log(`Ground-truth: ${groundOk} ok, ${groundFail} fail`)
if (groundFail > 0) process.exitCode = 1

const lines = [
  '/**',
  ' * Maps game `researchLevel` array index (research ID) ↔ manifest flat index.',
  ' * Generated by scripts/gen-game-research-index.mjs — do not edit by hand.',
  ' */',
  "import type { ResearchData } from '../types/research'",
  '',
  `export const GAME_RESEARCH_SLOT_COUNT = ${GAME_SLOTS} as const`,
  '',
  '/** manifest flat index per game research id, or -1 when unmapped */',
  'export const GAME_RESEARCH_ID_TO_MANIFEST_FLAT: readonly number[] = [',
]
for (let id = 0; id < GAME_SLOTS; id++) {
  const fi = idToFlat[id]
  lines.push(`  ${fi == null ? -1 : fi},`)
}
lines.push('] as const', '')
lines.push('/** game research id per manifest flat index, or -1 when unmapped */')
lines.push('export const GAME_MANIFEST_FLAT_TO_RESEARCH_ID: readonly number[] = [')
for (const id of flatToId) {
  lines.push(`  ${id},`)
}
lines.push('] as const', '')
lines.push('export function manifestFlatIndex(')
lines.push('  data: ResearchData,')
lines.push('  sectionIndex: number,')
lines.push('  itemIndex: number,')
lines.push('): number {')
lines.push('  let flat = 0')
lines.push('  for (let si = 0; si < sectionIndex; si++) {')
lines.push('    flat += data.sections[si]!.items.length')
lines.push('  }')
lines.push('  return flat + itemIndex')
lines.push('}')
lines.push('')
lines.push('export function gameResearchIdForManifest(')
lines.push('  data: ResearchData,')
lines.push('  sectionIndex: number,')
lines.push('  itemIndex: number,')
lines.push('): number | null {')
lines.push('  const flat = manifestFlatIndex(data, sectionIndex, itemIndex)')
lines.push('  if (flat < 0 || flat >= GAME_MANIFEST_FLAT_TO_RESEARCH_ID.length) return null')
lines.push('  const id = GAME_MANIFEST_FLAT_TO_RESEARCH_ID[flat]!')
lines.push('  if (id < 0 || id >= GAME_RESEARCH_SLOT_COUNT) return null')
lines.push('  return id')
lines.push('}')
lines.push('')

writeFileSync(OUT, lines.join('\n'))
console.log('Wrote', OUT)
