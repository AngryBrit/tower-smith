/**
 * Compare Bots v3.1 Master Sheet TSV farming dropdown labels against our milestone tables.
 * Usage: npx tsx scripts/compare-bots-ep-tsv.ts "path/to/Bots v3.1 - Master Sheet.tsv"
 */
import { readFileSync } from 'node:fs'
import { botEpFarmingLevelDropdownLabel } from '../src/effectivePaths/buildBotSheetUpdates'
import { BOT_EP_V31_LEVEL_KEY_ORDER } from '../src/effectivePaths/botSheetNames'
import type { WorkshopBotId } from '../src/data/workshopBotsData'

const tsvPath = process.argv[2]
if (!tsvPath) {
  console.error('Usage: npx tsx scripts/compare-bots-ep-tsv.ts <tsv-path>')
  process.exit(1)
}

const tsv = readFileSync(tsvPath, 'utf-8')
const lines = tsv.split(/\r?\n/).filter(Boolean)

const botNames: Record<string, WorkshopBotId> = {
  'Flame Bot': 'flame',
  'Thunder Bot': 'thunder',
  'Golden Bot': 'golden',
  'Amplify Bot': 'amplify',
  'Bot Bot': 'botBot',
}

type Case = {
  bot: WorkshopBotId
  attr: string
  level: number
  levelKey: string
  tsv: string
  ours: string
  ok: boolean
}

const cases: Case[] = []
let currentBot: WorkshopBotId | null = null

for (const line of lines.slice(2)) {
  const cols = line.split('\t')
  const botCell = cols[2]?.trim()
  if (botCell && botNames[botCell]) currentBot = botNames[botCell]
  const attr = cols[4]?.trim()
  const farming = cols[6]?.trim()
  if (!currentBot || !attr || !farming || !/^\d{2} \|/.test(farming)) continue

  const level = Number.parseInt(farming.slice(0, 2), 10)
  const keys = BOT_EP_V31_LEVEL_KEY_ORDER[currentBot]
  const attrNorm = attr.toLowerCase().replace(/\.$/, '')
  const special: Record<string, string> = {
    'damage r': 'flameBotDamageReductionLevel',
    wildfire: 'flameBotBurningGroundLevel',
    linger: 'thunderBotLingerLevel',
    'titan shock': 'thunderBotTitanShockLevel',
    'bonus cell': 'goldenBotBonusCellsLevel',
    'echoing shot': 'amplifyBotEchoingShotLevel',
    'maximum power': 'botBotMaximumPowerLevel',
  }

  let levelKey = special[attrNorm]
  if (!levelKey) {
    const idx = keys.findIndex((k) => {
      if (attrNorm === 'cooldown') return k.includes('Cooldown')
      if (attrNorm === 'damage') return k.includes('Damage') && !k.includes('Reduction')
      if (attrNorm === 'range') return k.includes('Range')
      if (attrNorm === 'duration') return k.includes('Duration')
      if (attrNorm === 'bonus') return k.includes('Bonus') && !k.includes('Cells')
      return false
    })
    levelKey = keys[idx]!
  }

  const ours = botEpFarmingLevelDropdownLabel(levelKey, level)
  cases.push({ bot: currentBot, attr, level, levelKey, tsv: farming, ours, ok: ours === farming })
}

const fails = cases.filter((c) => !c.ok)
console.log('Checked', cases.length, 'TSV farming dropdown selections\n')
for (const c of cases) {
  const mark = c.ok ? 'OK' : 'MISMATCH'
  console.log(mark, c.bot.padEnd(8), c.attr.padEnd(14), 'L' + String(c.level).padStart(2))
  if (!c.ok) {
    console.log('  TSV:', c.tsv)
    console.log('  OUR:', c.ours)
  }
}

if (fails.length === 0) {
  console.log('\nAll TSV selections match our milestone tables.')
} else {
  console.log('\n' + String(fails.length) + ' mismatch(es).')
  process.exit(1)
}
