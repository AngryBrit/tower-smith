/**
 * Generates src/data/workshopBotsData.ts from wiki bot upgrade tables.
 * Run: node scripts/gen-workshop-bots-data.mjs
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { touchWikiDataStamp } from './lib/wiki-data-stamp.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @param {readonly number[]} values stat at levels 0 … n */
function medalTrack(kind, values) {
  return {
    valueKind: kind,
    milestones: values.map((value, i) => ({
      value,
      marginalStones: i === 0 ? 0 : 100 + (i - 1) * 40,
    })),
  }
}

function lin(start, step, count) {
  return Array.from({ length: count }, (_, i) => start + i * step)
}

const thunderDuration = lin(5, 0.5, 21)
const thunderCooldown = lin(120, -3, 16)
const thunderLinger = lin(20, 3, 21)
const thunderRange = [25, ...lin(28, 3, 15)]

const goldenDuration = lin(20, 0.5, 31)
const goldenCooldown = lin(120, -3, 16)
/** Bonus ×2.0–×8.0 (levels 0–30); cooldown/range cap earlier per wiki. */
const goldenBonus = lin(2, 0.2, 31).map((v) => Math.round(v * 10) / 10)
const goldenRange = lin(20, 2, 21)

const amplifyDuration = lin(20, 0.5, 31)
const amplifyCooldown = lin(120, -3, 16)
/** Bonus ×3.5–×15.5 (levels 0–30); range caps at level 18 (61m). */
const amplifyBonus = lin(3.5, 0.4, 31).map((v) => Math.round(v * 10) / 10)
const amplifyRange = lin(25, 2, 19)

const botBotDuration = lin(20, 0.5, 31)
const botBotCooldown = lin(120, -3, 16)
/** Bonus ×1.05–×2.00 (20 levels, 0–19); +0.05/level — one distinct value per medal step. */
const botBotBonus = lin(1.05, 0.05, 20).map((v) => Math.round(v * 100) / 100)
const botBotRange = lin(20, 2, 21)

const flameDamageReduction = lin(20, 3, 26)
const flameCooldown = lin(75, -3, 16)
const flameDamage = lin(50, 8, 31)
const flameRange = [30, ...lin(34, 4, 15)]

const BOTS = {
  flame: {
    damageReduction: medalTrack('percent', flameDamageReduction),
    cooldown: medalTrack('seconds', flameCooldown),
    damage: medalTrack('mult', flameDamage),
    range: medalTrack('meters', flameRange),
  },
  thunder: {
    duration: medalTrack('seconds', thunderDuration),
    cooldown: medalTrack('seconds', thunderCooldown),
    linger: medalTrack('percent', thunderLinger),
    range: medalTrack('meters', thunderRange),
  },
  golden: {
    duration: medalTrack('seconds', goldenDuration),
    cooldown: medalTrack('seconds', goldenCooldown),
    bonus: medalTrack('mult', goldenBonus),
    range: medalTrack('meters', goldenRange),
  },
  amplify: {
    duration: medalTrack('seconds', amplifyDuration),
    cooldown: medalTrack('seconds', amplifyCooldown),
    bonus: medalTrack('mult', amplifyBonus),
    range: medalTrack('meters', amplifyRange),
  },
  botBot: {
    duration: medalTrack('seconds', botBotDuration),
    cooldown: medalTrack('seconds', botBotCooldown),
    bonus: medalTrack('mult', botBotBonus),
    range: medalTrack('meters', botBotRange),
  },
}

const BOT_ORDER = ['flame', 'thunder', 'golden', 'amplify', 'botBot']

const BOT_STATS = {
  flame: [
    { key: 'flameBotDamageReductionLevel', stat: 'damageReduction' },
    { key: 'flameBotCooldownLevel', stat: 'cooldown' },
    { key: 'flameBotDamageLevel', stat: 'damage' },
    { key: 'flameBotRangeLevel', stat: 'range' },
  ],
  thunder: [
    { key: 'thunderBotDurationLevel', stat: 'duration' },
    { key: 'thunderBotCooldownLevel', stat: 'cooldown' },
    { key: 'thunderBotLingerLevel', stat: 'linger' },
    { key: 'thunderBotRangeLevel', stat: 'range' },
  ],
  golden: [
    { key: 'goldenBotDurationLevel', stat: 'duration' },
    { key: 'goldenBotCooldownLevel', stat: 'cooldown' },
    { key: 'goldenBotBonusLevel', stat: 'bonus' },
    { key: 'goldenBotRangeLevel', stat: 'range' },
  ],
  amplify: [
    { key: 'amplifyBotDurationLevel', stat: 'duration' },
    { key: 'amplifyBotCooldownLevel', stat: 'cooldown' },
    { key: 'amplifyBotBonusLevel', stat: 'bonus' },
    { key: 'amplifyBotRangeLevel', stat: 'range' },
  ],
  botBot: [
    { key: 'botBotDurationLevel', stat: 'duration' },
    { key: 'botBotCooldownLevel', stat: 'cooldown' },
    { key: 'botBotBonusLevel', stat: 'bonus' },
    { key: 'botBotRangeLevel', stat: 'range' },
  ],
}

const SPECIAL_UNLOCK = {
  flame: 'flameBotBurningGroundUnlocked',
  thunder: 'thunderBotTitanShockUnlocked',
  golden: 'goldenBotBonusCellsUnlocked',
  amplify: 'amplifyBotEchoingShotUnlocked',
  botBot: 'botBotMaximumPowerUnlocked',
}

/** Wiki Events → Bot+ Ability Costs (May 2026). */
const SPECIAL_LEVEL = {
  flame: 'flameBotBurningGroundLevel',
  thunder: 'thunderBotTitanShockLevel',
  golden: 'goldenBotBonusCellsLevel',
  amplify: 'amplifyBotEchoingShotLevel',
  botBot: 'botBotMaximumPowerLevel',
}

const SPECIAL_TRACK_ROWS = {
  flame: {
    kind: 'mult',
    /** Burning Ground: ×1.5–×3.5, medals 100 +50/level (levels 1–20). */
    rows: Array.from({ length: 21 }, (_, i) => {
      const value = Math.round((1.5 + i * 0.1) * 10) / 10
      const cost = i === 0 ? 0 : 100 + (i - 1) * 50
      return [value, cost]
    }),
  },
  thunder: {
    kind: 'percent',
    /** Titan Shock: 5%–25% attack speed, medals 100 +50/level (levels 1–20). */
    rows: Array.from({ length: 21 }, (_, i) => {
      const value = 5 + i
      const cost = i === 0 ? 0 : 100 + (i - 1) * 50
      return [value, cost]
    }),
  },
  golden: {
    kind: 'mult',
    /** Bonus Cells: ×1.25–×2.50; medals 100 +50/level (levels 1–25). */
    rows: Array.from({ length: 26 }, (_, i) => {
      const value = Math.round((1.25 + i * 0.05) * 100) / 100
      const cost = i === 0 ? 0 : 100 + (i - 1) * 50
      return [value, cost]
    }),
  },
  amplify: {
    kind: 'count',
    /** Echoing Shot: 3–12 projectiles; lv1 costs 100, then +200/level (max level 9). */
    rows: Array.from({ length: 10 }, (_, i) => {
      const value = 3 + i
      const cost = i === 0 ? 0 : 100 + (i - 1) * 200
      return [value, cost]
    }),
  },
  botBot: {
    kind: 'mult',
    /** Maximum Power: ×1.25–×2.25, medals 100 +50/level (levels 1–20). */
    rows: Array.from({ length: 21 }, (_, i) => {
      const value = Math.round((1.25 + i * 0.05) * 100) / 100
      const cost = i === 0 ? 0 : 100 + (i - 1) * 50
      return [value, cost]
    }),
  },
}

const UPGRADE_ORDER = BOT_ORDER.flatMap((id) => BOT_STATS[id].map((s) => s.key))

function emitTrack(id, track) {
  const rows = track.milestones
    .map((m) => `[${m.value}, ${m.marginalStones}]`)
    .join(', ')
  return `  ${id}: track('${track.valueKind}', [${rows}]),`
}

const tracksBody = BOT_ORDER.flatMap((botId) => {
  const stats = BOT_STATS[botId]
  return stats.map(({ key, stat }) => {
    const track = BOTS[botId][stat]
    return emitTrack(key, track)
  })
}).join('\n')

const specialTracksBody = BOT_ORDER.map((botId) => {
  const { kind, rows } = SPECIAL_TRACK_ROWS[botId]
  const key = SPECIAL_LEVEL[botId]
  const rowStr = rows.map(([v, m]) => `[${v}, ${m}]`).join(', ')
  return `  ${key}: track('${kind}', [${rowStr}]),`
}).join('\n')

const SPECIAL_LEVEL_ORDER = BOT_ORDER.map((id) => SPECIAL_LEVEL[id])

const out = `/** Wiki bot upgrade tables — generated by scripts/gen-workshop-bots-data.mjs */

import type { WorkshopUltimateTrack } from './workshopUltimateTable'

export type WorkshopBotId = ${BOT_ORDER.map((id) => `'${id}'`).join(' | ')}

export type WorkshopBotUpgradeKey =
${UPGRADE_ORDER.map((k) => `  | '${k}'`).join('\n')}

export type WorkshopBotSpecialKey =
${Object.values(SPECIAL_UNLOCK)
  .map((k) => `  | '${k}'`)
  .join('\n')}

export type WorkshopBotSpecialLevelKey =
${SPECIAL_LEVEL_ORDER.map((k) => `  | '${k}'`).join('\n')}

export const WORKSHOP_BOT_ORDER: readonly WorkshopBotId[] = ${JSON.stringify(BOT_ORDER)}

export const WORKSHOP_BOT_UPGRADE_ORDER: readonly WorkshopBotUpgradeKey[] = ${JSON.stringify(UPGRADE_ORDER)}

export const WORKSHOP_BOT_SPECIAL_LEVEL_ORDER: readonly WorkshopBotSpecialLevelKey[] = ${JSON.stringify(SPECIAL_LEVEL_ORDER)}

/** Level before stone unlock (wiki: ability not purchased). */
export const WORKSHOP_BOT_SPECIAL_LEVEL_LOCKED = -1 as const

export const WORKSHOP_BOT_SPECIAL_UNLOCK_STONES = 1250 as const

export const WORKSHOP_BOT_SPECIAL_BY_BOT: Record<WorkshopBotId, WorkshopBotSpecialKey> = ${JSON.stringify(SPECIAL_UNLOCK)}

export const WORKSHOP_BOT_SPECIAL_LEVEL_BY_BOT: Record<WorkshopBotId, WorkshopBotSpecialLevelKey> = ${JSON.stringify(SPECIAL_LEVEL)}

export const WORKSHOP_BOT_WEAPON_STATS: Record<
  WorkshopBotId,
  readonly { key: WorkshopBotUpgradeKey; stat: string }[]
> = ${JSON.stringify(BOT_STATS, null, 2).replace(/"([^"]+)":/g, '$1:')}

function track(kind: WorkshopUltimateTrack['valueKind'], rows: readonly (readonly [number, number])[]) {
  return {
    valueKind: kind,
    milestones: rows.map(([value, marginalStones], i) => ({
      value,
      marginalStones: i === 0 ? 0 : marginalStones,
    })),
  } satisfies WorkshopUltimateTrack
}

export const WORKSHOP_BOT_TRACKS: Record<WorkshopBotUpgradeKey, WorkshopUltimateTrack> = {
${tracksBody}
}

export const WORKSHOP_BOT_SPECIAL_TRACKS: Record<WorkshopBotSpecialLevelKey, WorkshopUltimateTrack> = {
${specialTracksBody}
}
`

writeFileSync(join(__dirname, '../src/data/workshopBotsData.ts'), out)
console.log('Wrote src/data/workshopBotsData.ts')
touchWikiDataStamp('gen-workshop-bots-data')
