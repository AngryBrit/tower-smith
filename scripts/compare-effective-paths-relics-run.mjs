import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const RELIC_UNLOCKED = 2

function normalizeName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function loadGameIndexToId() {
  const src = readFileSync(join(root, 'src/playerSave/gameRelicMapping.ts'), 'utf8')
  const m = src.match(/GAME_RELIC_INDEX_TO_WORKSHOP_ID[^[]*\[([\s\S]*?)\]\s*as const/s)
  return [...m[1].matchAll(/"([^"]+)"|null/g)].map((x) => x[1] ?? null)
}

function loadRelics() {
  return JSON.parse(readFileSync(join(root, 'src/data/workshopRelics.generated.json'), 'utf8'))
}

function loadSaveOwned(gameIds) {
  const dump = JSON.parse(readFileSync(join(root, 'docs/player-save-field-dump.json'), 'utf8'))
  const owned = new Set()
  for (const item of dump.fields.relicsUnlocked.items) {
    if (item.value?.value__ !== RELIC_UNLOCKED) continue
    const id = gameIds[item.index]
    if (id) owned.add(id)
  }
  return owned
}

function buildNameToId(relics) {
  const byNorm = new Map(relics.map((r) => [normalizeName(r.name), r.id]))
  const aliases = [
    ['game joystick', 'holy_joystick'],
    ['cheers', 'champagne'],
    ['omniscience', 'gnosis'],
    ['gnosis', 'gnosis'],
    ['mystic bunny', 'mystic_bunny_1'],
    ['clip ons', 'clip_ons'],
    ['lets mix', 'let_s_mix'],
    ['let s mix', 'let_s_mix'],
    ['night life', 'night_life'],
    ['vr', 'vr'],
    ['lets play', 'let_s_play'],
    ['let s play', 'let_s_play'],
    ['warm clothes', 'warm_clothes'],
    ['collectors spirit', 'collector_s_spirit'],
    ['skys curtain', 'sky_s_curtain'],
    ['explorers helmet', 'explorer_s_helmet'],
    ['miners tool', 'miner_s_tool'],
    ['happiness balloons', 'hapiness_balloons'],
    ['carousel of joy', 'carousel_of_joy'],
    ['gift box', 'gift_box'],
    ['river of plenty', 'river_of_plenty'],
    ['3 body solution', '3_body_solution'],
    ['creepy smile', 'creepy_smile'],
    ['dark sight', 'dark_sight'],
    ['cloud lightning', 'cloud_lightning'],
    ['storm clouds', 'cloud_lightning'],
  ]
  for (const [k, v] of aliases) byNorm.set(k, v)
  return byNorm
}

// Effective Paths paste (Relic Name, Unlocked)
const SHEET_ROWS = `
Copper Badge	TRUE
Silver Badge	TRUE
T:I Flux	TRUE
T:II Lumin	TRUE
T:III Pulse	TRUE
T:IV Harmonic	TRUE
T:V Ether	TRUE
1st Tower Birthday	TRUE
2nd Tower Birthday	FALSE
3rd Tower Birthday	FALSE
4th Tower Birthday	FALSE
5th Tower Birthday	FALSE
6th Tower Birthday	FALSE
No Spoon	FALSE
Bacteriophage	TRUE
Dreamcatcher	FALSE
Ionized Plasma	TRUE
Ancient Tome	FALSE
Tower Latte	FALSE
Spooky Bat	FALSE
Cherry	FALSE
Game Joystick	FALSE
Honey Drop	TRUE
Firework	FALSE
Aurora Vortex	TRUE
Dark Sight	FALSE
Palm Tree	TRUE
Submarine	FALSE
Alien Head	TRUE
Warp Gate	FALSE
Barnacle	TRUE
Pizza	FALSE
Refraction Array	FALSE
Hook	TRUE
Cobweb	TRUE
Gale Winds	TRUE
Clip Ons	TRUE
Rain Jacket	FALSE
Rabies	TRUE
Comet	FALSE
Remote Control	TRUE
Anubis	FALSE
Lava Flow	TRUE
Abduction Room	TRUE
Acorn	TRUE
Cauldron	FALSE
Icicle	TRUE
Koi Fish	TRUE
Tea Ceremony	FALSE
Lunar Cat Paw	TRUE
Confetti Ball	TRUE
Summit Starlight	FALSE
Falling Apple	TRUE
Power Glove	TRUE
Coral Crown	TRUE
Throne	FALSE
Temporal Rift	TRUE
Hourglass	FALSE
Haunted Mirror	TRUE
Whispering Web	FALSE
Pulsar Core	TRUE
Quantum Drive	FALSE
Bloom Burst	FALSE
Mystic Bunny	FALSE
Fancy Wires	TRUE
Infinite Ruler	FALSE
Pi Seal	FALSE
UFO Beam	TRUE
Abduction Signal	FALSE
Honey Jar	TRUE
Heavenly Sweet	TRUE
Duck	TRUE
Grass	FALSE
Let's Mix	TRUE
Plasma Globe	TRUE
Plasma Vortex	TRUE
Floppy Disk	TRUE
Magic Cube	TRUE
Safe Path	TRUE
Shining Light	TRUE
Fisherman Set	TRUE
Sunset Boat	TRUE
World Domination	TRUE
Model Training	TRUE
Gnosis 	FALSE
Rlyeh	TRUE
Madness Induced	FALSE
Breaking News	TRUE
Globalization	TRUE
Brunch	TRUE
Dry leaves	TRUE
Blood Monster	TRUE
Vr	TRUE
Holographic Ads	FALSE
Good Hunting	TRUE
Spider Vision	FALSE
Pinball	TRUE
To Infinity	TRUE
Explorer's Helmet	TRUE
Miner's Tool	TRUE
Star Path	TRUE
Snow Globe	TRUE
Winter Gloves	FALSE
Party Popper	TRUE
Champagne	TRUE
Happiness Balloons	TRUE
Delicious Food	TRUE
Sky's Curtain	TRUE
Solar Flare	TRUE
Elemental Explosion	TRUE
Sudden Attack	TRUE
Alien Experiment	TRUE
Bouquet	TRUE
Love Letter	TRUE
Lighthouse	TRUE
Night Shark	TRUE
Festival Lanterns	TRUE
Ramen	TRUE
Perfect Catch	TRUE
Broken Security	TRUE
Research Object	TRUE
Ancient Times	TRUE
Space Distortion	TRUE
Nature's Fury	TRUE
Big Tornado	TRUE
Synapse	TRUE
Neural Network	TRUE
Magic Cards	FALSE
Viral Infection	TRUE
Immunization	FALSE
Gold Badge	TRUE
Platinum Badge	TRUE
T: VI Nova	TRUE
T: VII Aether	TRUE
T: VIII Graviton	TRUE
T: IX Fusion	TRUE
T: X Plasma	TRUE
Red Pill	FALSE
Neuron	TRUE
Spirit Wolf	FALSE
Plasma Arc	TRUE
Space Sundial	FALSE
Pumpkin	FALSE
Man Skull	FALSE
Sakura Lantern	TRUE
Controller	FALSE
Stinger	TRUE
Cheers	FALSE
Contained Ions	TRUE
Creepy Smile	FALSE
Pixel Cube Heart	TRUE
The Kraken	FALSE
Alien Warp Drive	TRUE
Star Ship	FALSE
Wave	TRUE
Illuminati	FALSE
Prismatic Shard	FALSE
Fish	TRUE
The Fly	TRUE
Flying House	TRUE
Code Stream	TRUE
Cloud Lightning	FALSE
Ebola	FALSE
Planetary Rings	TRUE
Cathode Ray Tube	TRUE
Sphinx	FALSE
Ash Cloud	FALSE
Crop Circle	TRUE
Scarf	FALSE
Witch Hat	FALSE
Sleigh Bell	TRUE
Bonsai Tree	TRUE
Kimono	FALSE
Pet Cat	TRUE
Party Mask	TRUE
Mountain Goat	TRUE
3 Body Solution	TRUE
Arcade Token	TRUE
Angler Fish	FALSE
Crown	FALSE
Dream Clock	TRUE
Time Compass	FALSE
Shadow Puppet	TRUE
Cursed Candle	FALSE
Light Speedometer	FALSE
Photon Blade	FALSE
Candy Core	FALSE
Magic Egg	FALSE
Mech Head	TRUE
Do While True	FALSE
Psychohistorian Brain	FALSE
Alien Egg	FALSE
Monolith	FALSE
Honey Society	TRUE
The Queen	TRUE
Wind	TRUE
Lilies	TRUE
Night Life	TRUE
Plasma Cell	TRUE
Plasma Chamber	TRUE
Retro Camera	TRUE
Night City	TRUE
Eternal Quest	TRUE
Nature's Wrath	TRUE
Good Catch	TRUE
River Of Plenty	TRUE
Brave Heroes	TRUE
Tower Agent	TRUE
Fake Reality	TRUE
Cosmic Freedom	TRUE
No Signal	TRUE
Antenna	TRUE
Glowing Mushrooms	TRUE
Warm Clothes	TRUE
Glimpse of Despair	TRUE
Tech Weapon	TRUE
Cybernetics	TRUE
Spider Poison	TRUE
Spider Forest	TRUE
Let's Play	TRUE
Enemies	TRUE
Crystals Bag	TRUE
Full Minecart	TRUE
Star Planet	TRUE
Snowflake	TRUE
Wreath	TRUE
Firework Rocket	TRUE
Gift box	TRUE
Amazing Prizes	TRUE
Carousel Of Joy	TRUE
Northern Mountains	TRUE
Cosmic Impact	TRUE
Quasar	TRUE
Crop Circles	TRUE
Alien Implants	TRUE
Lovely Gift	TRUE
Pierced Heart	TRUE
Sailing At Night	TRUE
Moonlight	TRUE
Forest Temple	TRUE
Tori	TRUE
Collector's Spirit	TRUE
Digital Disaster	TRUE
Instability	TRUE
Clock Tower	TRUE
Time Travel	TRUE
Natural Fire	TRUE
Storm Planet	TRUE
Brain Net	TRUE
Body Control	TRUE
Dangerous Tricks	FALSE
Personal Care	TRUE
Global Threat	TRUE
Champion Badge	FALSE
Tower Master	FALSE
T: XI Resonance	TRUE
T: XII Chrono	FALSE
T: XIII Hyper	FALSE
T: XIV Arcane	FALSE
T: XV Celestial	FALSE
T: XVI Quantum	FALSE
T: XVII Nebula	FALSE
T: XVIII Singularity	FALSE
T: XIX Atomic	FALSE
T: XX Cyber	FALSE
T: XXI Eclipse	FALSE
Legend Badge	FALSE
`.trim()

const relics = loadRelics()
const idToName = Object.fromEntries(relics.map((r) => [r.id, r.name]))
const nameToId = buildNameToId(relics)
const gameIds = loadGameIndexToId()
const saveOwned = loadSaveOwned(gameIds)

const rows = SHEET_ROWS.split('\n').map((line) => {
  const [name, unlockedRaw] = line.split('\t')
  return { name: name.trim(), unlocked: unlockedRaw.trim().toUpperCase() === 'TRUE' }
})

const mismatches = []
const unmapped = []
let matched = 0

for (const row of rows) {
  const id = nameToId.get(normalizeName(row.name))
  if (!id) {
    unmapped.push(row.name)
    continue
  }
  const inSave = saveOwned.has(id)
  if (inSave !== row.unlocked) {
    mismatches.push({ name: row.name, id, sheet: row.unlocked, save: inSave })
  } else {
    matched++
  }
}

console.log('Save owned (via relicsUnlocked + game index map):', saveOwned.size)
console.log('Spreadsheet rows:', rows.length)
console.log('Matched:', matched)
console.log('Unmapped sheet names:', unmapped.length, unmapped)
console.log('Mismatches:', mismatches.length)
for (const m of mismatches) {
  console.log(
    `  ${m.name} (${m.id}): sheet=${m.sheet ? 'TRUE' : 'FALSE'} save=${m.save ? 'owned' : 'not owned'}`,
  )
}

const sheetById = new Map()
for (const row of rows) {
  const id = nameToId.get(normalizeName(row.name))
  if (id) sheetById.set(id, row.unlocked)
}
const extraInSave = [...saveOwned].filter((id) => sheetById.get(id) !== true)
const missingFromSave = [...sheetById.entries()]
  .filter(([, u]) => u)
  .filter(([id]) => !saveOwned.has(id))
  .map(([id]) => idToName[id])

console.log('\nTRUE in sheet but NOT owned in save:', missingFromSave.length)
console.log(missingFromSave.join(', ') || '(none)')
console.log('\nOwned in save but not TRUE in sheet:', extraInSave.length)
console.log(extraInSave.map((id) => idToName[id]).join(', ') || '(none)')
