/**
 * Write tables/labs/lab-order.json — canonical in-game lab order (Lab Calculator).
 * Run: node scripts/gen-lab-order.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const labsRoot = path.join(root, 'tables', 'labs')

const byName = new Map()

function walk(dir, rel = '') {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    const r = rel ? `${rel}/${ent.name}` : ent.name
    if (ent.isDirectory()) walk(p, r)
    else if (ent.name.endsWith('.json') && ent.name !== 'lab-order.json') {
      const j = JSON.parse(fs.readFileSync(p, 'utf8'))
      if (j.name) byName.set(j.name, r)
    }
  }
}

walk(labsRoot)

const ORDER = `
Game Speed
Starting Cash
Workshop Attack Discount
Workshop Defense Discount
Workshop Utility Discount
Labs Coin Discount
Labs Speed
Buy Multiplier
More Round Stats
Target Priority
Card Presets
Workshop Respec
Reroll Daily Mission
Workshop Enhancements
Battle Condition Reduction
Damage
Attack Speed
Critical Factor
Range
Damage / Meter
Super Crit Chance
Super Crit Mult
Max Rend Armor Multiplier
Light Speed Shots
Health
Health Regen
Defense Absolute
Defense %
Orbs Speed
Land Mine Damage
Land Mine Decay
Shockwave Size
Orb Boss Hit
Wall Health
Wall Rebuild
Wall Regen
Wall Thorns
Wall Invincibility
Wall Fortification
Garlic Thorns
Cash Bonus
Cash / Wave
Coins / Kill Bonus
Coins / Wave
Interest
Max Interest
Package After Boss
Recovery Package Amount
Recovery Package Max
Recovery Package Chance
Enemy Attack Level Skip
Enemy Health Level Skip
Missile Despawn Time
Missiles Explosion
Missile Radius
Chrono Field Duration
Chrono Field Damage Reduction
Chrono Field Reduction %
Swamp Radius
Swamp Stun
Swamp Stun Chance
Swamp Stun Time
Golden Tower Bonus
Golden Tower Duration
Chain Lightning Shock
Shock Chance
Shock Multiplier
Death Wave Health
Death Wave Coin Bonus
Inner Mine Blast Radius
Inner Mine Rotation Speed
Chrono Field Range
Missile Amplifier
Missile Barrage
Missile Barrage Quantity
Inner Mine Stun
Black Hole Damage
Extra Black Hole
Black Hole Coin Bonus
Spotlight Coin Bonus
Spotlight Missiles
Black Hole Disable Ranged Enemies
Recharge Missile Barrage
Swamp Rend - Basic Enemies
Swamp Rend - Additional Enemies
Chain Thunder
Lightning Amplifier - Scatter
Death Wave Cells Bonus
Death Wave Damage Amplifier
Death Wave Armor Stripping
Inner Land Mine - Chrono Jump
Second Wind Blast
Double Death Ray
Extra Orb Adjuster
Extra Extra Orbs
Energy Shield Extra Hit
Super Tower Bonus
Recharge Second Wind
Recharge Demon Mode
Recharge Nuke
Damage Mastery
Attack Speed Mastery
Health Mastery
Health Regen Mastery
Range Mastery
Cash Mastery
Coins Mastery
Slow Aura Mastery
Critical Chance Mastery
Enemy Balance Mastery
Extra Defense Mastery
Fortress Mastery
Free Upgrades Mastery
Extra Orb Mastery
Plasma Cannon Mastery
Critical Coin Mastery
Wave Skip Mastery
Intro Sprint Mastery
Land Mine Stun Mastery
Recovery Package Chance Mastery
Death Ray Mastery
Energy Net Mastery
Super Tower Mastery
Second Wind Mastery
Demon Mode Mastery
Energy Shield Mastery
Wave Accelerator Mastery
Berserker Mastery
Ultimate Crit Mastery
Nuke Mastery
Unlock Perks
Waves Required
Auto Pick Perks
Standard Perks Bonus
Perk Option Quantity
First Perk Choice
Ban Perks
Improve Trade-off Perks
Auto Pick Ranking
Flame Bot - Cooldown
Thunder Bot - Cooldown
Golden Bot - Cooldown
Amplify Bot - Cooldown
Flame Bot - Burn Stack
Thunder Bot - Linger Time
Golden Bot - Duration
Amplify Bot - Duration
Common Enemy Health
Common Enemy Attack
Fast Enemy Health
Fast Enemy Attack
Fast Enemy Speed
Tank Enemy Health
Tank Enemy Attack
Ranged Enemy Health
Ranged Enemy Attack
Boss Health
Boss Attack
Protector Health
Protector Radius
Protector Damage Reduction
Common Drop Chance
Reroll Shards
Daily Mission Shards
Module Shards Cost
Module Coin Cost
Rare Drop Chance
Unmerge Module
Shatter Shards
Cannon Effect Bans
Armor Effect Bans
Generator Effect Bans
Core Effect Bans
Area of Effect Mastery
Assist Module Substats - Cannon
Assist Module Substats - Armor
Assist Module Substats - Generator
Assist Module Substats - Core
Assist Module Bonus - Cannon
Assist Module Bonus - Armor
Assist Module Bonus - Generator
Assist Module Bonus - Core
Ray Enemy Attack
Ray Enemy Health
Vampire Enemy Attack
Vampire Enemy Health
Scatter Enemy Attack
Scatter Enemy Health
Ranged Enemy Range
Enhancement Attack - Coin Discount
Enhancement Defense - Coin Discount
Enhancement Utility - Coin Discount
Knockback Resistance
Thorns Resistance
Orb Resistance
Plasma Cannon Resistance
Death Ray Resistance
Armored Enemies
Enemy Speed
More Enemies
Enemy Attack Speed
Fast's Ultimate
Ranged Ultimate
Boss's Ultimate
Basic's Ultimate
Tank's Ultimate
Protector's Ultimate
Ultimate Weapon Durations
Death Defy Down
Energy Shields Down
Enemy Level Skip Reduction
Bot Bot - Cooldown
Bot Bot - Duration
Dissonant Echo - Attack
Dissonant Echo - Defense
Dissonant Echo - Utility
Dissonant Echo - Ultimate Weapons
`
  .trim()
  .split('\n')
  .map((s) => s.trim())

const labs = ORDER.map((name, i) => {
  const table = byName.get(name)
  const entry = { lab: i + 1, name }
  if (table) entry.table = table
  return entry
})

const outPath = path.join(labsRoot, 'lab-order.json')
fs.writeFileSync(outPath, `${JSON.stringify({ labs }, null, 2)}\n`, 'utf8')

const missing = labs.filter((l) => !l.table)
console.log(`Wrote ${outPath} (${labs.length} labs, ${missing.length} without GOD table)`)
if (missing.length) {
  console.log('No table:', missing.map((l) => l.name).join(', '))
}
