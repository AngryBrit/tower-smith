/**
 * Patch workshopRelics.generated.json to match reference relic table.
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src/data/workshopRelics.generated.json')

/** @type {Array<Record<string, unknown>>} */
let relics = JSON.parse(readFileSync(path, 'utf8'))

function byId(id) {
  const r = relics.find((x) => x.id === id)
  if (!r) throw new Error(`missing id: ${id}`)
  return r
}

function patch(id, partial) {
  Object.assign(byId(id), partial)
}

// —— Name fixes ——
patch('holy_joystick', { name: 'Game Joystick' })
patch('hapiness_balloons', { name: 'Happiness Balloons' })

// —— Stat / description fixes ——
patch('gale_winds', { description: 'Increase coins earned by 2%' })
patch('dream_clock', { description: 'Increase orb speed by 5%' })
patch('photon_blade', { description: 'Increase tower damage by 5%', damagePct: 5 })
patch('spider_forest', { description: 'Increase critical factor by 5%' })
patch('pulsar_core', { description: 'Increase recovery amount by 2%' })
patch('4th_tower_birthday', { unlock: 'Play for 4 years' })

// —— Swapped medal thresholds ——
patch('confetti_ball', {
  unlock: 'Event: Earn 350 medals during the "New Year (II)"',
})
patch('party_mask', {
  unlock: 'Event: Earn 700 medals during the "New Year (II)"',
})

// —— Viral Outbreak event relics (wiki) ——
patch('bacteriophage', {
  description: 'Increase tower damage by 2%',
  unlock: 'Event: Earn 350 medals during the "Viral Outbreak"',
  damagePct: 2,
})
patch('rabies', {
  description: 'Increase lab speed by 2%',
  unlock: 'Event: Earn 350 medals during the "Viral Outbreak (II)"',
})
patch('neuron', {
  description: 'Increase health by 5%',
  unlock: 'Event: Earn 700 medals during the "Viral Outbreak"',
})
patch('ebola', {
  description: 'Increase defense absolute by 5%',
  unlock: 'Event: Earn 700 medals during the "Viral Outbreak (II)"',
})
patch('viral_infection', {
  description: 'Increase health by 2%',
  unlock: 'Event: Earn 350 medals during the "Viral Outbreak"',
})
patch('immunization', {
  description: 'Increase critical chance by 1%',
  unlock: 'Event Premium: Earn 550 medals during the "Viral Outbreak"',
})
patch('personal_care', {
  description: 'Increase free defense upgrade by 2%',
  unlock: 'Event: Earn 700 medals during the "Viral Outbreak"',
})
patch('global_threat', {
  description: 'Increase critical factor by 5%',
  unlock: 'Event Premium: Earn 1100 medals during the "Viral Outbreak"',
})

// —— Event name / tier fixes ——
patch('warp_gate', {
  unlock: 'Event: Earn 350 medals during the "Faster Than Light"',
})
patch('summit_starlight', {
  unlock: 'Event: Earn 350 medals during the "Full Moon (II)"',
})
patch('mountain_goat', {
  unlock: 'Event: Earn 700 medals during the "Full Moon (II)"',
})
patch('koi_fish', {
  unlock: 'Event: Earn 350 medals during the "Cherry Blossom (III)"',
})
patch('bonsai_tree', {
  unlock: 'Event: Earn 700 medals during the "Cherry Blossom (III)"',
})
patch('tea_ceremony', {
  unlock: 'Purchase: 200 medals during the "Cherry Blossom (III)"',
})
patch('kimono', {
  unlock: 'Purchase: 500 medals during the "Cherry Blossom (III)"',
})
patch('honey_jar', {
  unlock: 'Event: Earn 350 medals during the "Honey (III)"',
})
patch('heavenly_sweet', {
  unlock: 'Event Premium: Earn 550 medals during the "Honey (III)"',
})
patch('honey_society', {
  unlock: 'Event: Earn 700 medals during the "Honey (III)"',
})
patch('the_queen', {
  unlock: 'Event Premium: Earn 1100 medals during the "Honey (III)"',
})
patch('plasma_globe', {
  unlock: 'Event: Earn 350 medals during the "Plasma Returns (III)"',
})
patch('plasma_vortex', {
  unlock: 'Event Premium: Earn 550 medals during the "Plasma Returns (III)"',
})
patch('plasma_cell', {
  unlock: 'Event: Earn 700 medals during the "Plasma Returns (III)"',
})
patch('plasma_chamber', {
  unlock: 'Event Premium: Earn 1100 medals during the "Plasma Returns (III)"',
})
patch('magic_cube', {
  unlock: 'Event Premium: Earn 550 medals during the "Retrowave (III)"',
})
patch('brunch', {
  unlock: 'Event: Earn 350 medals during the "Autumn (III)"',
})
patch('dry_leaves', {
  unlock: 'Event Premium: Earn 550 medals during the "Autumn (III)"',
})
patch('glowing_mushrooms', {
  unlock: 'Event: Earn 700 medals during the "Autumn (III)"',
})
patch('warm_clothes', {
  unlock: 'Event Premium: Earn 1100 medals during the "Autumn (III)"',
})
patch('lighthouse', {
  unlock: 'Event: Earn 350 medals during the "Ocean Night (III)"',
})
patch('sailing_at_night', {
  unlock: 'Event: Earn 700 medals during the "Ocean Night (III)"',
})
patch('night_shark', {
  unlock: 'Event Premium: Earn 550 medals during the "Ocean Night (III)"',
})
patch('moonlight', {
  unlock: 'Event Premium: Earn 1100 medals during the "Ocean Night (III)"',
})

// —— New relics (order 241+) ——
const newRelics = [
  {
    order: 241,
    id: 'festival_lanterns',
    name: 'Festival Lanterns',
    rarity: 'rare',
    description: 'Increase knockback force by 2%',
    unlock: 'Event: Earn 350 medals during the "Cherry Blossom (IV)"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 242,
    id: 'ramen',
    name: 'Ramen',
    rarity: 'rare',
    description: 'Increase free utility upgrade by 1%',
    unlock: 'Event Premium: Earn 550 medals during the "Cherry Blossom (IV)"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 243,
    id: 'perfect_catch',
    name: 'Perfect Catch',
    rarity: 'rare',
    description: 'Increase free utility upgrade by 1%',
    unlock: 'Guild: Spend 75 tokens in Guild Season 8',
    unlockGroup: 'guild',
    damagePct: 0,
  },
  {
    order: 244,
    id: 'broken_security',
    name: 'Broken Security',
    rarity: 'rare',
    description: 'Increase health regen by 2%',
    unlock: 'Event: Earn 350 medals during the "Glitch"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 245,
    id: 'research_object',
    name: 'Research Object',
    rarity: 'rare',
    description: 'Increase tower damage by 2%',
    unlock: 'Event Premium: Earn 550 medals during the "Glitch"',
    unlockGroup: 'event',
    damagePct: 2,
  },
  {
    order: 246,
    id: 'ancient_times',
    name: 'Ancient Times',
    rarity: 'rare',
    description: 'Increase defense absolute by 2%',
    unlock: 'Event: Earn 350 medals during the "What Time Is It? (II)"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 247,
    id: 'space_distortion',
    name: 'Space Distortion',
    rarity: 'rare',
    description: 'Increase attack speed by 1%',
    unlock: 'Event Premium: Earn 550 medals during the "What Time Is It? (II)"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 248,
    id: 'nature_s_fury',
    name: "Nature's Fury",
    rarity: 'rare',
    description: 'Increase defense percent by 1%',
    unlock: 'Event: Earn 350 medals during the "Into the Storm (II)"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 249,
    id: 'big_tornado',
    name: 'Big Tornado',
    rarity: 'rare',
    description: 'Increase damage/meter by 2%',
    unlock: 'Event Premium: Earn 550 medals during the "Into the Storm (II)"',
    unlockGroup: 'event',
    damagePct: 2,
  },
  {
    order: 250,
    id: 'synapse',
    name: 'Synapse',
    rarity: 'rare',
    description: 'Increase knockback force by 2%',
    unlock: 'Event: Earn 350 medals during the "Neuron"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 251,
    id: 'neural_network',
    name: 'Neural Network',
    rarity: 'rare',
    description: 'Increase coins earned by 2%',
    unlock: 'Event Premium: Earn 550 medals during the "Neuron"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 252,
    id: 'forest_temple',
    name: 'Forest Temple',
    rarity: 'epic',
    description: 'Increase thorns by 2%',
    unlock: 'Event: Earn 700 medals during the "Cherry Blossom (IV)"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 253,
    id: 'tori',
    name: 'Tori',
    rarity: 'epic',
    description: 'Increase orb speed by 5%',
    unlock: 'Event Premium: Earn 1100 medals during the "Cherry Blossom (IV)"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 254,
    id: 'collector_s_spirit',
    name: "Collector's Spirit",
    rarity: 'epic',
    description: 'Increase tower damage by 5%',
    unlock: 'Guild: Spend 150 tokens in Guild Season 8',
    unlockGroup: 'guild',
    damagePct: 5,
  },
  {
    order: 255,
    id: 'digital_disaster',
    name: 'Digital Disaster',
    rarity: 'epic',
    description: 'Increase free defense upgrade by 2%',
    unlock: 'Event: Earn 700 medals during the "Glitch"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 256,
    id: 'instability',
    name: 'Instability',
    rarity: 'epic',
    description: 'Increase damage/meter by 5%',
    unlock: 'Event Premium: Earn 1100 medals during the "Glitch"',
    unlockGroup: 'event',
    damagePct: 5,
  },
  {
    order: 257,
    id: 'clock_tower',
    name: 'Clock Tower',
    rarity: 'epic',
    description: 'Increase cash bonus by 5%',
    unlock: 'Event: Earn 700 medals during the "What Time Is It? (II)"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 258,
    id: 'time_travel',
    name: 'Time Travel',
    rarity: 'epic',
    description: 'Increase critical chance by 2%',
    unlock: 'Event Premium: Earn 1100 medals during the "What Time Is It? (II)"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 259,
    id: 'natural_fire',
    name: 'Natural Fire',
    rarity: 'epic',
    description: 'Increase health regen by 5%',
    unlock: 'Event: Earn 700 medals during the "Into the Storm (II)"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 260,
    id: 'storm_planet',
    name: 'Storm Planet',
    rarity: 'epic',
    description: 'Increase lab speed by 4%',
    unlock: 'Event Premium: Earn 1100 medals during the "Into the Storm (II)"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 261,
    id: 'brain_net',
    name: 'Brain Net',
    rarity: 'epic',
    description: 'Increase free utility upgrade by 2%',
    unlock: 'Event: Earn 700 medals during the "Neuron"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 262,
    id: 'body_control',
    name: 'Body Control',
    rarity: 'epic',
    description: 'Increase ultimate damage by 5%',
    unlock: 'Event Premium: Earn 1100 medals during the "Neuron"',
    unlockGroup: 'event',
    damagePct: 0,
  },
  {
    order: 263,
    id: 'magic_cards',
    name: 'Magic Cards',
    rarity: 'rare',
    description: 'Increase free utility upgrade by 1%',
    unlock: 'Guild: Spend 75 tokens in Guild Season 9',
    unlockGroup: 'guild',
    damagePct: 0,
  },
  {
    order: 264,
    id: 'dangerous_tricks',
    name: 'Dangerous Tricks',
    rarity: 'epic',
    description: 'Increase attack speed by 2%',
    unlock: 'Guild: Spend 150 tokens in Guild Season 9',
    unlockGroup: 'guild',
    damagePct: 0,
  },
]

for (const row of newRelics) {
  if (relics.some((r) => r.id === row.id)) continue
  relics.push(row)
}

writeFileSync(path, JSON.stringify(relics, null, 2) + '\n', 'utf8')
console.log(`Patched ${relics.length} relics`)
