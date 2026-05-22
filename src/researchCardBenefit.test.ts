import { readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { workshopDefenseNextMarginalCoins } from './data/workshopDefense'
import { workshopDamageNextMarginalCoins } from './data/workshopDamage'
import { toolkitMarginalCoinCost, toolkitUpgradeDurationSeconds } from './labCosts'
import {
  UNLOCK_LAB_LV0_LABELS,
  applyWorkshopDiscountToCoins,
  benefitDisplayForCard,
  benefitLineWithNextUpgrade,
  getLevelBounds,
  marginalCostForNextUpgrade,
  parseResearchManifest,
  parseResearchSection,
  researchTimeForNextUpgrade,
  type ResearchItem,
} from './types/research'

const srcDir = dirname(fileURLToPath(import.meta.url))

function loadAllSections() {
  const manifestRaw: unknown = JSON.parse(
    readFileSync(join(srcDir, '../public/research/manifest.json'), 'utf-8'),
  )
  const { sectionFiles } = parseResearchManifest(manifestRaw)
  return sectionFiles.map((rel: string) => {
    const raw: unknown = JSON.parse(
      readFileSync(join(srcDir, '../public', rel.replace(/^\//, '')), 'utf-8'),
    )
    const slug = basename(rel, '.json')
    return parseResearchSection(raw, slug)
  })
}

function expectedBenefitLineAtLv0(item: ResearchItem, max: number): string {
  if (
    Object.prototype.hasOwnProperty.call(UNLOCK_LAB_LV0_LABELS, item.name) ||
    item.name === 'Target Priority' ||
    item.name === 'Spotlight Missiles'
  ) {
    return benefitDisplayForCard(item, 0, max)
  }
  if (max <= 0) {
    return `${benefitDisplayForCard(item, 0, max)} » —`
  }
  const left = benefitDisplayForCard(item, 0, max)
  const right = benefitDisplayForCard(item, 1, max)
  if (left === '—' && right !== '—') return right
  if (left === right) {
    return `${left} » —`
  }
  return `${left} » ${right}`
}

describe('benefitLineWithNextUpgrade (research-card__benefit)', () => {
  describe('Lv.0 for every item in public/research manifest', () => {
    for (const section of loadAllSections()) {
      describe(section.title, () => {
        for (const item of section.items) {
          it(item.name, () => {
            const { max } = getLevelBounds(item)
            expect(benefitLineWithNextUpgrade(item, 0, max)).toBe(
              expectedBenefitLineAtLv0(item, max),
            )
          })
        }
      })
    }
  })

  describe('BOTS research spot checks', () => {
    const bots = loadAllSections().find((s) => s.title === 'BOTS')
    if (!bots) throw new Error('fixture missing BOTS')

    it('Flame Bot - Cooldown Value shows −n as seconds (0s … -25s)', () => {
      const lab = bots.items.find((i) => i.name === 'Flame Bot - Cooldown')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 25
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0s')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('-1s')
      expect(benefitDisplayForCard(lab!, 25, max)).toBe('-25s')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0s » -1s')
      expect(benefitLineWithNextUpgrade(lab!, 23, max)).toBe('-23s » -24s')
      expect(benefitLineWithNextUpgrade(lab!, 24, max)).toBe('-24s » -25s')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('-25s')
    })

    it('Thunder Bot - Cooldown shares bot cooldown seconds display', () => {
      const lab = bots.items.find((i) => i.name === 'Thunder Bot - Cooldown')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 25
      expect(benefitDisplayForCard(lab!, 3, max)).toBe('-3s')
    })

    it('Flame Bot - Burn Stack max stacks is 2 + lab level (2 … 7)', () => {
      const lab = bots.items.find((i) => i.name === 'Flame Bot - Burn Stack')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 5
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('2')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('3')
      expect(benefitDisplayForCard(lab!, 5, max)).toBe('7')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('2 » 3')
      expect(benefitLineWithNextUpgrade(lab!, 4, max)).toBe('6 » 7')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('7')
    })

    it('Flame Bot - Cooldown tower-labs match wiki rows 1 and 25', () => {
      expect(toolkitMarginalCoinCost('Flame Bot - Cooldown', 0)).toBe(30_000_000)
      expect(toolkitUpgradeDurationSeconds('Flame Bot - Cooldown', 0)).toBe(
        139_980,
      )
      expect(toolkitMarginalCoinCost('Flame Bot - Cooldown', 24)).toBe(
        398_880_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Flame Bot - Cooldown', 24)).toBe(
        7_374_120,
      )
    })

    it('Flame Bot - Burn Stack tower-labs match wiki rows 1 and 5', () => {
      expect(toolkitMarginalCoinCost('Flame Bot - Burn Stack', 0)).toBe(
        43_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Flame Bot - Burn Stack', 0)).toBe(
        3_942_000,
      )
      expect(toolkitMarginalCoinCost('Flame Bot - Burn Stack', 4)).toBe(
        217_690_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Flame Bot - Burn Stack', 4)).toBe(
        6_894_540,
      )
    })

    it('Golden Bot - Cooldown uses bot cooldown seconds display', () => {
      const lab = bots.items.find((i) => i.name === 'Golden Bot - Cooldown')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 25
      expect(benefitDisplayForCard(lab!, 12, max)).toBe('-12s')
    })

    it('Golden Bot - Duration Value is +0.5s × lab level (+0s … +10s)', () => {
      const lab = bots.items.find((i) => i.name === 'Golden Bot - Duration')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+0s')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+0.5s')
      expect(benefitDisplayForCard(lab!, 2, max)).toBe('+1s')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('+10s')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('+0s » +0.5s')
      expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe('+9.5s » +10s')
    })

    it('Thunder Bot - Linger Time is +3s base + 0.5s/level (+3s … +13s)', () => {
      const lab = bots.items.find((i) => i.name === 'Thunder Bot - Linger Time')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+3s')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+3.5s')
      expect(benefitDisplayForCard(lab!, 2, max)).toBe('+4s')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('+13s')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('+3s » +3.5s')
      expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe('+12.5s » +13s')
    })

    it('Thunder Bot - Linger Time toolkit uses Golden Bot - Duration tower-labs', () => {
      expect(toolkitMarginalCoinCost('Thunder Bot - Linger Time', 0)).toBe(
        100_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Thunder Bot - Linger Time', 0)).toBe(
        720_000,
      )
    })

    it('Legacy Gold Bot names resolve via lab alias to Golden Bot tower-labs', () => {
      expect(toolkitMarginalCoinCost('Gold Bot - Cooldown', 0)).toBe(30_000_000)
      expect(toolkitMarginalCoinCost('Gold Bot - Duration', 0)).toBe(
        100_000_000_000,
      )
    })

    it('Golden Bot - Duration tower-labs match wiki rows 1 and 20', () => {
      expect(toolkitMarginalCoinCost('Golden Bot - Duration', 0)).toBe(
        100_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Golden Bot - Duration', 0)).toBe(
        720_000,
      )
      expect(toolkitMarginalCoinCost('Golden Bot - Duration', 19)).toBe(
        221_680_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Golden Bot - Duration', 19)).toBe(
        10_246_860,
      )
    })

    it('Bot Bot - Duration shares Gold duration Value + wiki T6 90 milestone', () => {
      const lab = bots.items.find((i) => i.name === 'Bot Bot - Duration')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T6 90')
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('+5s')
      expect(toolkitMarginalCoinCost('Bot Bot Duration', 0)).toBe(100_000_000_000)
    })

    it('Amplify Bot - Cooldown matches wiki -1s/level + T5 90; wiki name resolves toolkit', () => {
      const lab = bots.items.find((i) => i.name === 'Amplify Bot - Cooldown')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T5 90')
      const max = lab!.maxLevel ?? 25
      expect(benefitDisplayForCard(lab!, 12, max)).toBe('-12s')
      expect(toolkitMarginalCoinCost('Amplify Bot Cooldown', 0)).toBe(30_000_000)
      expect(toolkitUpgradeDurationSeconds('Amplify Bot Cooldown', 24)).toBe(
        7_374_120,
      )
    })

    it('Bot Bot - Cooldown matches wiki -1s/level + T6 90; wiki name resolves toolkit', () => {
      const lab = bots.items.find((i) => i.name === 'Bot Bot - Cooldown')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T6 90')
      const max = lab!.maxLevel ?? 25
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0s')
      expect(benefitDisplayForCard(lab!, 25, max)).toBe('-25s')
      expect(toolkitMarginalCoinCost('Bot Bot - Cooldown', 0)).toBe(30_000_000)
      expect(toolkitMarginalCoinCost('Bot Bot Cooldown', 0)).toBe(30_000_000)
      expect(toolkitUpgradeDurationSeconds('Bot Bot - Cooldown', 0)).toBe(139_980)
      expect(toolkitMarginalCoinCost('Bot Bot - Cooldown', 24)).toBe(398_880_000_000)
      expect(toolkitUpgradeDurationSeconds('Bot Bot - Cooldown', 24)).toBe(7_374_120)
      expect(toolkitMarginalCoinCost('Bot Bot - Cooldown', 25)).toBeUndefined()
    })

    it('Amplify Bot - Duration shares Gold duration Value + wiki T5 90 milestone', () => {
      const lab = bots.items.find((i) => i.name === 'Amplify Bot - Duration')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T5 90')
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('+5s')
      expect(toolkitMarginalCoinCost('Amplify Bot Duration', 0)).toBe(
        100_000_000_000,
      )
    })
  })

  describe('CARD MASTERY — shared ladder (wiki), effect tiers', () => {
    const mastery = loadAllSections().find((s) => s.title === 'CARD MASTERY')
    if (!mastery) throw new Error('fixture missing CARD MASTERY')

    it('wiki stone unlock cost per mastery row', () => {
      const cash = mastery.items.find((i) => i.name === 'Cash Mastery')
      const coins = mastery.items.find((i) => i.name === 'Coins Mastery')
      const pkg = mastery.items.find(
        (i) => i.name === 'Recovery Package Chance Mastery',
      )
      expect(cash?.stoneUnlockCost).toBe(500)
      expect(coins?.stoneUnlockCost).toBe(1250)
      expect(pkg?.stoneUnlockCost).toBe(1000)
    })

    it('marginal next cost for fixture Damage Mastery is wiki stones, not coin abbrev', () => {
      const lab = mastery.items.find((i) => i.name === 'Damage Mastery')
      expect(lab).toBeDefined()
      const max = 9
      expect(marginalCostForNextUpgrade(lab!, 0, max, 0)).toBe('750')
      expect(marginalCostForNextUpgrade(lab!, 0, max, 50)).toBe('750')
    })

    it('marginal cost/duration resolve via Card Mastery for any * Mastery display name', () => {
      expect(toolkitMarginalCoinCost('Damage Mastery', 0)).toBe(
        1_100_000_000_000_000,
      )
      expect(toolkitMarginalCoinCost('Critical Chance Mastery', 8)).toBe(
        10_000_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Slow Aura Mastery', 2)).toBe(
        3_600_000,
      )
      expect(toolkitUpgradeDurationSeconds('Area of Effect Mastery', 8)).toBe(
        9_000_000,
      )
    })

    it('research time uses Card Mastery DURATION (wiki L1 and L9)', () => {
      const lab = mastery.items.find((i) => i.name === 'Damage Mastery')
      expect(lab).toBeDefined()
      const max = 9
      expect(researchTimeForNextUpgrade(lab!, 0, max)).toBe('20d 20h 0m')
      expect(researchTimeForNextUpgrade(lab!, 8, max)).toBe('104d 4h 0m')
      expect(researchTimeForNextUpgrade(lab!, max, max)).toBe('Max')
    })

    it('Damage Mastery benefit follows wiki mastery columns 0–9', () => {
      const lab = mastery.items.find((i) => i.name === 'Damage Mastery')
      expect(lab).toBeDefined()
      const max = 9
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('x1.4')
      expect(benefitDisplayForCard(lab!, 9, max)).toBe('x5')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('x1.4 » x1.8')
      expect(benefitLineWithNextUpgrade(lab!, 8, max)).toBe('x4.6 » x5')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('x5')
    })

    it('marginal next cost uses wiki stone unlock; Labs Coin Discount does not apply', () => {
      const item: ResearchItem = {
        name: 'Damage Mastery',
        level: 'Lv.0',
        benefit: 'T16 100',
        time: '20d 20h 0m',
        cost: '1.1 q',
        state: 'default',
        currentLevel: 0,
        maxLevel: 9,
        costPlusOne: '1.3 q',
        stoneUnlockCost: 750,
      }
      expect(marginalCostForNextUpgrade(item, 0, 9, 0)).toBe('750')
      expect(marginalCostForNextUpgrade(item, 0, 9, 99)).toBe('750')
    })

    it('Free Upgrades Mastery and Wave Skip Mastery tier strings', () => {
      const free = mastery.items.find((i) => i.name === 'Free Upgrades Mastery')
      const skip = mastery.items.find((i) => i.name === 'Wave Skip Mastery')
      expect(free).toBeDefined()
      expect(skip).toBeDefined()
      const max = 9
      expect(benefitDisplayForCard(free!, 4, max)).toBe('5')
      expect(benefitDisplayForCard(skip!, 3, max)).toBe('25%')
    })
  })

  describe('MODULES — drop chance, shards, upgrade costs, unmerge, shatter', () => {
    const modules = loadAllSections().find((s) => s.title === 'MODULES')
    if (!modules) throw new Error('fixture missing MODULES')

    it('Module Coin Cost unlocks at T4 70; shard cost stays T10 40', () => {
      const coin = modules.items.find((i) => i.name === 'Module Coin Cost')
      const shard = modules.items.find((i) => i.name === 'Module Shards Cost')
      expect(coin?.benefit).toBe('T4 70')
      expect(shard?.benefit).toBe('T10 40')
    })

    it('Common Drop Chance +0.10% per level to +1.00%', () => {
      const lab = modules.items.find((i) => i.name === 'Common Drop Chance')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 10
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+0.00%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+0.10%')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('+1.00%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('+0.00% » +0.10%')
      expect(benefitLineWithNextUpgrade(lab!, 9, max)).toBe('+0.90% » +1.00%')
    })

    it('Rare Drop Chance +0.10% per level to +1.00%', () => {
      const lab = modules.items.find((i) => i.name === 'Rare Drop Chance')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 10
      expect(benefitDisplayForCard(lab!, 3, max)).toBe('+0.30%')
    })

    it('Reroll Shards +1 per level to +100', () => {
      const lab = modules.items.find((i) => i.name === 'Reroll Shards')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 100
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+0')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+1')
      expect(benefitDisplayForCard(lab!, 100, max)).toBe('+100')
    })

    it('Daily Mission Shards +1 per level to +50', () => {
      const lab = modules.items.find((i) => i.name === 'Daily Mission Shards')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 50
      expect(benefitDisplayForCard(lab!, 50, max)).toBe('+50')
    })

    it('Module Shards Cost and Module Coin Cost −n% shard/coin upgrade cost', () => {
      const shard = modules.items.find((i) => i.name === 'Module Shards Cost')
      const coin = modules.items.find((i) => i.name === 'Module Coin Cost')
      expect(shard).toBeDefined()
      expect(coin).toBeDefined()
      const max = 30
      expect(benefitDisplayForCard(shard!, 0, max)).toBe('0%')
      expect(benefitDisplayForCard(shard!, 1, max)).toBe('-1%')
      expect(benefitDisplayForCard(shard!, 30, max)).toBe('-30%')
      expect(benefitDisplayForCard(coin!, 15, max)).toBe('-15%')
    })

    it('Unmerge Module is single-level unlock lab', () => {
      const lab = modules.items.find((i) => i.name === 'Unmerge Module')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 1
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('Unlock Module Unmerge')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe(
        'Unlock Module Unmerge',
      )
    })

    it('Shatter Shards +20% per level to +100%', () => {
      const lab = modules.items.find((i) => i.name === 'Shatter Shards')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 5
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+20%')
      expect(benefitDisplayForCard(lab!, 5, max)).toBe('+100%')
    })

    it('tower-labs marginal COST/DURATION match wiki (spot rows)', () => {
      expect(toolkitMarginalCoinCost('Common Drop Chance', 0)).toBe(5_000_000)
      expect(toolkitUpgradeDurationSeconds('Common Drop Chance', 0)).toBe(
        360_000,
      )
      expect(toolkitMarginalCoinCost('Common Drop Chance', 9)).toBe(
        7_320_000_000,
      )

      expect(toolkitMarginalCoinCost('Reroll Shards', 0)).toBe(900_000)
      expect(toolkitUpgradeDurationSeconds('Reroll Shards', 0)).toBe(120_000)
      expect(toolkitMarginalCoinCost('Reroll Shards', 99)).toBe(
        488_930_000_000,
      )

      expect(toolkitMarginalCoinCost('Daily Mission Shards', 0)).toBe(
        1_200_000,
      )
      expect(toolkitMarginalCoinCost('Daily Mission Shards', 49)).toBe(
        352_950_000_000,
      )

      expect(toolkitMarginalCoinCost('Module Shards Cost', 0)).toBe(
        5_000_000_000,
      )
      expect(toolkitMarginalCoinCost('Module Shards Cost', 1)).toBe(
        5_120_000_000,
      )
      expect(toolkitMarginalCoinCost('Module Coin Cost', 0)).toBe(
        5_000_000_000,
      )
      expect(toolkitMarginalCoinCost('Module Coin Cost', 1)).toBe(
        5_130_000_000,
      )

      expect(toolkitMarginalCoinCost('Rare Drop Chance', 0)).toBe(
        70_000_000_000,
      )
      expect(toolkitMarginalCoinCost('Unmerge Module', 0)).toBe(10_000_000)
      expect(toolkitUpgradeDurationSeconds('Unmerge Module', 0)).toBe(
        172_800,
      )

      expect(toolkitMarginalCoinCost('Shatter Shards', 0)).toBe(
        10_000_000_000_000,
      )
      expect(toolkitMarginalCoinCost('Shatter Shards', 4)).toBe(
        1_190_000_000_000_000,
      )
    })

    it('Assist Module labs: Value n% per level; shared tower-labs (wiki 30 rows)', () => {
      const cannon = modules.items.find(
        (i) => i.name === 'Assist Module Substats - Cannon',
      )
      expect(cannon).toBeDefined()
      const max = cannon!.maxLevel ?? 30
      expect(benefitDisplayForCard(cannon!, 0, max)).toBe('0%')
      expect(benefitDisplayForCard(cannon!, 1, max)).toBe('1%')
      expect(benefitDisplayForCard(cannon!, 30, max)).toBe('30%')
      expect(benefitLineWithNextUpgrade(cannon!, 0, max)).toBe('0% » 1%')

      const bonus = modules.items.find(
        (i) => i.name === 'Assist Module Bonus - Armor',
      )
      expect(bonus).toBeDefined()
      expect(toolkitMarginalCoinCost('Assist Module Bonus - Armor', 0)).toBe(
        250_000_000_000_000,
      )
      expect(marginalCostForNextUpgrade(bonus!, 0, max, 0)).toBe('0.25 q')
      expect(toolkitUpgradeDurationSeconds('Assist Module Bonus - Armor', 0)).toBe(
        933_060,
      )
      expect(toolkitMarginalCoinCost('Assist Module Substats - Cannon', 29)).toBe(
        7_500_000_000_000_000,
      )
      expect(
        toolkitUpgradeDurationSeconds('Assist Module Substats - Cannon', 29),
      ).toBe(27_992_340)
    })

    it('Cannon Effect Bans T10 40; Value 0–4 bans; tower-labs wiki rows 1 and 4', () => {
      const lab = modules.items.find((i) => i.name === 'Cannon Effect Bans')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T10 40')
      const max = lab!.maxLevel ?? 4
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0')
      expect(benefitDisplayForCard(lab!, 4, max)).toBe('4')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0 » 1')
      expect(toolkitMarginalCoinCost('Cannon Effect Bans', 0)).toBe(
        500_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Cannon Effect Bans', 0)).toBe(
        3_240_000,
      )
      expect(toolkitMarginalCoinCost('Cannon Effect Bans', 3)).toBe(
        50_000_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Cannon Effect Bans', 3)).toBe(
        17_640_000,
      )
    })

    it('Armor Effect Bans T10 40; same ladder as Cannon (lab alias); Value 0–4 bans', () => {
      const lab = modules.items.find((i) => i.name === 'Armor Effect Bans')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T10 40')
      const max = lab!.maxLevel ?? 4
      expect(benefitDisplayForCard(lab!, 2, max)).toBe('2')
      expect(benefitLineWithNextUpgrade(lab!, 3, max)).toBe('3 » 4')
      expect(toolkitMarginalCoinCost('Armor Effect Bans', 0)).toBe(
        500_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Armor Effect Bans', 0)).toBe(
        3_240_000,
      )
    })

    it('Generator Effect Bans T10 40; 3 levels; Value 0–3 bans; wiki time/cost', () => {
      const lab = modules.items.find((i) => i.name === 'Generator Effect Bans')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T10 40')
      const max = lab!.maxLevel ?? 3
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0')
      expect(benefitDisplayForCard(lab!, 3, max)).toBe('3')
      expect(benefitLineWithNextUpgrade(lab!, 2, max)).toBe('2 » 3')
      expect(toolkitMarginalCoinCost('Generator Effect Bans', 0)).toBe(
        5_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Generator Effect Bans', 0)).toBe(
        5_400_000,
      )
      expect(toolkitMarginalCoinCost('Generator Effect Bans', 2)).toBe(
        50_000_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Generator Effect Bans', 2)).toBe(
        17_640_000,
      )
    })

    it('Core Effect Bans T10 40; 7 levels; Value 0–7 bans; wiki time/cost', () => {
      const lab = modules.items.find((i) => i.name === 'Core Effect Bans')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T10 40')
      const max = lab!.maxLevel ?? 7
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0')
      expect(benefitDisplayForCard(lab!, 7, max)).toBe('7')
      expect(benefitLineWithNextUpgrade(lab!, 6, max)).toBe('6 » 7')
      expect(toolkitMarginalCoinCost('Core Effect Bans', 0)).toBe(50_000_000_000)
      expect(toolkitUpgradeDurationSeconds('Core Effect Bans', 0)).toBe(
        1_440_000,
      )
      expect(toolkitMarginalCoinCost('Core Effect Bans', 6)).toBe(
        500_000_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Core Effect Bans', 6)).toBe(
        21_600_000,
      )
    })
  })

  describe('ENEMIES — Common, Fast, Tank, Ranged, Boss, Protector, Ray, Vampire, Scatter & Ranged Enemy Range', () => {
    const enemies = loadAllSections().find((s) => s.title === 'ENEMIES')
    if (!enemies) throw new Error('fixture missing ENEMIES')

    it('Common Enemy Health milestone T9 10; Value -0.40%/level', () => {
      const lab = enemies.items.find((i) => i.name === 'Common Enemy Health')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T9 10')
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('-0.00%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('-0.40%')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('-4.00%')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('-12.00%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('-0.00% » -0.40%')
      expect(benefitLineWithNextUpgrade(lab!, 29, max)).toBe(
        '-11.60% » -12.00%',
      )
    })

    it('Common Enemy Attack milestone T3 300; same curve as Health', () => {
      const lab = enemies.items.find((i) => i.name === 'Common Enemy Attack')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T3 300')
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 3, max)).toBe('-1.20%')
    })

    it('Common Enemy Health tower-labs match wiki rows 1 and 30', () => {
      expect(toolkitMarginalCoinCost('Common Enemy Health', 0)).toBe(
        20_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Common Enemy Health', 0)).toBe(
        199_980,
      )
      expect(toolkitMarginalCoinCost('Common Enemy Health', 29)).toBe(
        2_400_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Common Enemy Health', 29)).toBe(
        13_944_480,
      )
    })

    it('Common Enemy Attack shares Health marginal cost/duration', () => {
      expect(toolkitMarginalCoinCost('Common Enemy Attack', 0)).toBe(
        20_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Common Enemy Attack', 14)).toBe(
        1_555_740,
      )
    })

    it('Fast Enemy Health milestone T9 20; Value -0.40%/level; 30B curve', () => {
      const lab = enemies.items.find((i) => i.name === 'Fast Enemy Health')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T9 20')
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('-0.00%')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('-4.00%')
      expect(toolkitMarginalCoinCost('Fast Enemy Health', 0)).toBe(
        30_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Fast Enemy Health', 0)).toBe(
        199_980,
      )
      expect(toolkitMarginalCoinCost('Fast Enemy Health', 29)).toBe(
        2_700_000_000_000,
      )
    })

    it('Fast Enemy Attack matches Health marginal table', () => {
      expect(toolkitMarginalCoinCost('Fast Enemy Attack', 0)).toBe(
        30_000_000_000,
      )
    })

    it('Fast Enemy Speed milestone T9 300; steeper time/cost; same Value %', () => {
      const lab = enemies.items.find((i) => i.name === 'Fast Enemy Speed')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T9 300')
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 5, max)).toBe('-2.00%')
      expect(toolkitMarginalCoinCost('Fast Enemy Speed', 0)).toBe(60_000_000_000)
      expect(toolkitUpgradeDurationSeconds('Fast Enemy Speed', 0)).toBe(239_940)
      expect(toolkitMarginalCoinCost('Fast Enemy Speed', 29)).toBe(
        3_600_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Fast Enemy Speed', 29)).toBe(
        13_984_500,
      )
    })

    it('Tank Enemy Health milestone T9 20; same Value % and 30B curve as Fast', () => {
      const lab = enemies.items.find((i) => i.name === 'Tank Enemy Health')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T9 20')
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 15, max)).toBe('-6.00%')
      expect(toolkitMarginalCoinCost('Tank Enemy Health', 0)).toBe(
        30_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Tank Enemy Health', 9)).toBe(
        660_660,
      )
    })

    it('Tank Enemy Attack milestone T9 20; shares Health marginal table', () => {
      const lab = enemies.items.find((i) => i.name === 'Tank Enemy Attack')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T9 20')
      expect(toolkitMarginalCoinCost('Tank Enemy Attack', 29)).toBe(
        2_700_000_000_000,
      )
    })

    it('Ranged Enemy Health milestone T9 20; Value % and 30B toolkit', () => {
      const lab = enemies.items.find((i) => i.name === 'Ranged Enemy Health')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T9 20')
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('-8.00%')
      expect(toolkitMarginalCoinCost('Ranged Enemy Health', 0)).toBe(
        30_000_000_000,
      )
    })

    it('Ranged Enemy Attack milestone T9 20; shares Health marginal table', () => {
      const lab = enemies.items.find((i) => i.name === 'Ranged Enemy Attack')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T9 20')
      expect(toolkitUpgradeDurationSeconds('Ranged Enemy Attack', 19)).toBe(
        3_579_360,
      )
    })

    it('Boss Health milestone T9 20; Value -0.30%/level (max -9.00%)', () => {
      const lab = enemies.items.find((i) => i.name === 'Boss Health')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T9 20')
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('-0.00%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('-0.30%')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('-3.00%')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('-9.00%')
      expect(toolkitMarginalCoinCost('Boss Health', 0)).toBe(40_000_000_000)
      expect(toolkitMarginalCoinCost('Boss Health', 29)).toBe(
        3_000_000_000_000,
      )
    })

    it('Boss Attack matches Boss Health Value curve and marginal table', () => {
      const lab = enemies.items.find((i) => i.name === 'Boss Attack')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T9 20')
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('-6.00%')
      expect(toolkitUpgradeDurationSeconds('Boss Attack', 0)).toBe(199_980)
    })

    it('Protector Health & Radius milestone T9 20; same -0.30% curve as Boss', () => {
      const health = enemies.items.find((i) => i.name === 'Protector Health')
      const radius = enemies.items.find((i) => i.name === 'Protector Radius')
      expect(health).toBeDefined()
      expect(radius).toBeDefined()
      expect(health!.benefit).toBe('T9 20')
      expect(radius!.benefit).toBe('T9 20')
      const max30 = health!.maxLevel ?? 30
      expect(benefitDisplayForCard(health!, 30, max30)).toBe('-9.00%')
      expect(toolkitMarginalCoinCost('Protector Radius', 0)).toBe(
        40_000_000_000,
      )
    })

    it('Protector Damage Reduction T9 20; 20 levels max -6.00%; 80B / longer-time curve', () => {
      const lab = enemies.items.find(
        (i) => i.name === 'Protector Damage Reduction',
      )
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T9 20')
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('-3.00%')
      expect(benefitDisplayForCard(lab!, max, max)).toBe('-6.00%')
      expect(toolkitMarginalCoinCost('Protector Damage Reduction', 0)).toBe(
        80_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Protector Damage Reduction', 0)).toBe(
        239_940,
      )
      expect(toolkitMarginalCoinCost('Protector Damage Reduction', 19)).toBe(
        1_770_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Protector Damage Reduction', 19)).toBe(
        3_619_380,
      )
    })

    it('Ray Enemy Attack T19 60; -0.40%/level; tower-labs Q costs + wiki durations', () => {
      const lab = enemies.items.find((i) => i.name === 'Ray Enemy Attack')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T19 60')
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('-0.00%')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('-4.00%')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('-12.00%')
      expect(toolkitMarginalCoinCost('Ray Enemy Attack', 0)).toBe(
        250_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Ray Enemy Attack', 0)).toBe(933_060)
      expect(toolkitMarginalCoinCost('Ray Enemy Attack', 29)).toBe(
        7_500_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Ray Enemy Attack', 29)).toBe(
        27_992_340,
      )
    })

    it('Ray Enemy Health shares Ray Attack marginal Q table + -0.40%/level', () => {
      const lab = enemies.items.find((i) => i.name === 'Ray Enemy Health')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T19 60')
      expect(lab!.cost).toBe('0.25 q')
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 5, max)).toBe('-2.00%')
      expect(toolkitMarginalCoinCost('Ray Enemy Health', 0)).toBe(
        250_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Ray Enemy Health', 14)).toBe(
        13_996_140,
      )
    })

    it('Vampire Enemy Attack T19 60; -0.40%/level; shares Ray Attack Q tower-labs', () => {
      const lab = enemies.items.find((i) => i.name === 'Vampire Enemy Attack')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T19 60')
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('-0.40%')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('-12.00%')
      expect(toolkitMarginalCoinCost('Vampire Enemy Attack', 0)).toBe(
        250_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Vampire Enemy Attack', 9)).toBe(
        9_330_780,
      )
    })

    it('Vampire Enemy Health T19 60; shares Ray Q marginals + -0.40%/level', () => {
      const lab = enemies.items.find((i) => i.name === 'Vampire Enemy Health')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T19 60')
      expect(lab!.cost).toBe('0.25 q')
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 15, max)).toBe('-6.00%')
      expect(toolkitMarginalCoinCost('Vampire Enemy Health', 29)).toBe(
        7_500_000_000_000_000,
      )
    })

    it('Scatter Enemy Attack T19 60; shares Ray Q marginals + -0.40%/level', () => {
      const lab = enemies.items.find((i) => i.name === 'Scatter Enemy Attack')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T19 60')
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 25, max)).toBe('-10.00%')
      expect(toolkitMarginalCoinCost('Scatter Enemy Attack', 0)).toBe(
        250_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Scatter Enemy Attack', 24)).toBe(
        23_326_920,
      )
    })

    it('Scatter Enemy Health T19 60; shares Ray Q marginals + -0.40%/level', () => {
      const lab = enemies.items.find((i) => i.name === 'Scatter Enemy Health')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T19 60')
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 7, max)).toBe('-2.80%')
      expect(toolkitMarginalCoinCost('Scatter Enemy Health', 0)).toBe(
        250_000_000_000_000,
      )
    })

    it('Ranged Enemy Range T13 80; -0.50%/level; T marginal tower-labs', () => {
      const lab = enemies.items.find((i) => i.name === 'Ranged Enemy Range')
      expect(lab).toBeDefined()
      expect(lab!.benefit).toBe('T13 80')
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('-0.00%')
      expect(benefitDisplayForCard(lab!, 4, max)).toBe('-2.00%')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('-15.00%')
      expect(toolkitMarginalCoinCost('Ranged Enemy Range', 0)).toBe(
        1_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Ranged Enemy Range', 0)).toBe(
        233_220,
      )
      expect(toolkitMarginalCoinCost('Ranged Enemy Range', 29)).toBe(
        17_286_700_000_000_000,
      )
    })
  })

  describe('MAIN RESEARCH spot checks', () => {
    const main = loadAllSections().find((s) => s.title === 'MAIN RESEARCH')
    if (!main) throw new Error('fixture missing MAIN RESEARCH')

    const gameSpeed = main.items.find((i) => i.name === 'Game Speed')
    const labsCoin = main.items.find((i) => i.name === 'Labs Coin Discount')
    const startingCash = main.items.find((i) => i.name === 'Starting Cash')

    it('Starting Cash wiki Value, early tower-lab times, and benefit lines', () => {
      expect(startingCash).toBeDefined()
      const max = startingCash!.maxLevel ?? 99
      expect(benefitDisplayForCard(startingCash!, 0, max)).toBe('+$0')
      expect(benefitDisplayForCard(startingCash!, 1, max)).toBe('+$5')
      expect(benefitLineWithNextUpgrade(startingCash!, 4, max)).toBe(
        '+$20 » +$25',
      )
      expect(benefitLineWithNextUpgrade(startingCash!, max, max)).toBe('+$495')
      expect(toolkitMarginalCoinCost('Starting Cash', 0)).toBe(30)
      expect(toolkitUpgradeDurationSeconds('Starting Cash', 0)).toBe(0)
      expect(toolkitUpgradeDurationSeconds('Starting Cash', 1)).toBe(360)
      expect(toolkitUpgradeDurationSeconds('Starting Cash', 4)).toBe(3120)
      expect(researchTimeForNextUpgrade(startingCash!, 0, max)).toBe('0m')
      expect(researchTimeForNextUpgrade(startingCash!, 1, max)).toBe('6m')
    })

    it('Game Speed wiki Value, tower-lab times, and benefit lines', () => {
      expect(gameSpeed).toBeDefined()
      const max = gameSpeed!.maxLevel ?? 7
      expect(benefitDisplayForCard(gameSpeed!, 0, max)).toBe('x1.0')
      expect(benefitDisplayForCard(gameSpeed!, 1, max)).toBe('x2.0')
      expect(benefitLineWithNextUpgrade(gameSpeed!, 0, max)).toBe('x1.0 » x2.0')
      expect(benefitLineWithNextUpgrade(gameSpeed!, 4, max)).toBe(
        'x3.5 » x4.0',
      )
      expect(benefitLineWithNextUpgrade(gameSpeed!, max, max)).toBe('x5.0')
      expect(toolkitMarginalCoinCost('Game Speed', 0)).toBe(300)
      expect(toolkitMarginalCoinCost('Game Speed', 6)).toBe(1_000_000)
      expect(toolkitUpgradeDurationSeconds('Game Speed', 0)).toBe(540)
      expect(toolkitUpgradeDurationSeconds('Game Speed', 1)).toBe(9000)
      expect(toolkitUpgradeDurationSeconds('Game Speed', 2)).toBe(35280)
      expect(toolkitUpgradeDurationSeconds('Game Speed', 3)).toBe(122520)
      expect(researchTimeForNextUpgrade(gameSpeed!, 0, max)).toBe('9m')
      expect(researchTimeForNextUpgrade(gameSpeed!, 6, max)).toBe(
        '25d 11h 6m',
      )
    })

    it('Labs Coin Discount wiki Value, early tower-lab times, and benefit lines', () => {
      expect(labsCoin).toBeDefined()
      const max = labsCoin!.maxLevel ?? 99
      expect(benefitDisplayForCard(labsCoin!, 0, max)).toBe('0.00%')
      expect(benefitDisplayForCard(labsCoin!, 1, max)).toBe('0.30%')
      expect(benefitDisplayForCard(labsCoin!, 99, max)).toBe('29.70%')
      expect(
        benefitLineWithNextUpgrade(labsCoin!, 4, max),
      ).toBe('1.20% » 1.50%')
      expect(toolkitMarginalCoinCost('Labs Coin Discount', 0)).toBe(40)
      expect(toolkitUpgradeDurationSeconds('Labs Coin Discount', 0)).toBe(0)
      expect(toolkitUpgradeDurationSeconds('Labs Coin Discount', 1)).toBe(540)
      expect(researchTimeForNextUpgrade(labsCoin!, 0, max)).toBe('0m')
      expect(researchTimeForNextUpgrade(labsCoin!, 1, max)).toBe('9m')
    })

    it('Labs Coin Discount reduces other labs coin cost, not its own', () => {
      const labsCoin = main.items.find((i) => i.name === 'Labs Coin Discount')
      const workshop = main.items.find(
        (i) => i.name === 'Workshop Attack Discount',
      )
      expect(labsCoin).toBeDefined()
      expect(workshop).toBeDefined()
      const max = labsCoin!.maxLevel ?? 99
      expect(marginalCostForNextUpgrade(labsCoin!, 0, max, 29.7)).toBe('40')
      expect(marginalCostForNextUpgrade(workshop!, 0, max, 0)).toBe('30')
      expect(marginalCostForNextUpgrade(workshop!, 0, max, 10)).toBe('27')
    })

    it('Workshop Respec wiki unlock, cost, time, and benefit copy', () => {
      const wr = main.items.find((i) => i.name === 'Workshop Respec')
      expect(wr).toBeDefined()
      const max = wr!.maxLevel ?? 1
      expect(benefitDisplayForCard(wr!, 0, max)).toBe('Unlock Workshop Respec')
      expect(benefitDisplayForCard(wr!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(wr!, 0, max)).toBe('Unlock Workshop Respec')
      expect(benefitLineWithNextUpgrade(wr!, max, max)).toBe('Unlocked')
      expect(toolkitMarginalCoinCost('Workshop Respec', 0)).toBe(3_000_000)
      expect(toolkitUpgradeDurationSeconds('Workshop Respec', 0)).toBe(219_960)
      expect(researchTimeForNextUpgrade(wr!, 0, max)).toBe('2d 13h 6m')
    })

    it('Reroll Daily Mission wiki unlock, cost, time, and benefit copy', () => {
      const rdm = main.items.find((i) => i.name === 'Reroll Daily Mission')
      expect(rdm).toBeDefined()
      const max = rdm!.maxLevel ?? 1
      expect(benefitDisplayForCard(rdm!, 0, max)).toBe(
        'Unlock Reroll Daily Mission',
      )
      expect(benefitDisplayForCard(rdm!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(rdm!, 0, max)).toBe(
        'Unlock Reroll Daily Mission',
      )
      expect(benefitLineWithNextUpgrade(rdm!, max, max)).toBe('Unlocked')
      expect(toolkitMarginalCoinCost('Reroll Daily Mission', 0)).toBe(20_000_000)
      expect(toolkitUpgradeDurationSeconds('Reroll Daily Mission', 0)).toBe(
        143_940,
      )
      expect(researchTimeForNextUpgrade(rdm!, 0, max)).toBe('1d 15h 59m')
    })

    it('Workshop Enhancements wiki unlock, cost, time, and benefit copy', () => {
      const we = main.items.find((i) => i.name === 'Workshop Enhancements')
      expect(we).toBeDefined()
      const max = we!.maxLevel ?? 1
      expect(benefitDisplayForCard(we!, 0, max)).toBe(
        'Unlock Workshop Enhancements',
      )
      expect(benefitDisplayForCard(we!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(we!, 0, max)).toBe(
        'Unlock Workshop Enhancements',
      )
      expect(benefitLineWithNextUpgrade(we!, max, max)).toBe('Unlocked')
      expect(toolkitMarginalCoinCost('Workshop Enhancements', 0)).toBe(
        5_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Workshop Enhancements', 0)).toBe(
        575_940,
      )
      expect(researchTimeForNextUpgrade(we!, 0, max)).toBe('6d 15h 59m')
    })

    it('Card Presets wiki unlock, cost, time, and benefit copy', () => {
      const cp = main.items.find((i) => i.name === 'Card Presets')
      expect(cp).toBeDefined()
      const max = cp!.maxLevel ?? 1
      expect(benefitDisplayForCard(cp!, 0, max)).toBe('Unlock Card Presets')
      expect(benefitDisplayForCard(cp!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(cp!, 0, max)).toBe('Unlock Card Presets')
      expect(benefitLineWithNextUpgrade(cp!, max, max)).toBe('Unlocked')
      expect(toolkitMarginalCoinCost('Card Presets', 0)).toBe(350_000)
      expect(toolkitUpgradeDurationSeconds('Card Presets', 0)).toBe(49_980)
      expect(researchTimeForNextUpgrade(cp!, 0, max)).toBe('13h 53m')
    })

    it('More Round Stats wiki unlock, cost, time, and benefit copy', () => {
      const mrs = main.items.find((i) => i.name === 'More Round Stats')
      expect(mrs).toBeDefined()
      const max = mrs!.maxLevel ?? 1
      expect(benefitDisplayForCard(mrs!, 0, max)).toBe('Unlock Round Stats')
      expect(benefitDisplayForCard(mrs!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(mrs!, 0, max)).toBe('Unlock Round Stats')
      expect(benefitLineWithNextUpgrade(mrs!, max, max)).toBe('Unlocked')
      expect(toolkitMarginalCoinCost('More Round Stats', 0)).toBe(250_000)
      expect(toolkitUpgradeDurationSeconds('More Round Stats', 0)).toBe(43_140)
      expect(researchTimeForNextUpgrade(mrs!, 0, max)).toBe('11h 59m')
    })

    it('Target Priority three-stage benefit copy + wiki cost/time (no »)', () => {
      const tp = main.items.find((i) => i.name === 'Target Priority')
      expect(tp).toBeDefined()
      const max = tp!.maxLevel ?? 2
      expect(benefitDisplayForCard(tp!, 0, max)).toBe('Unlock Target Priority')
      expect(benefitDisplayForCard(tp!, 1, max)).toBe('Better Target Priority')
      expect(benefitDisplayForCard(tp!, 2, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(tp!, 0, max)).toBe('Unlock Target Priority')
      expect(benefitLineWithNextUpgrade(tp!, 1, max)).toBe('Better Target Priority')
      expect(benefitLineWithNextUpgrade(tp!, max, max)).toBe('Unlocked')
      expect(toolkitMarginalCoinCost('Target Priority', 0)).toBe(1_000_000)
      expect(toolkitMarginalCoinCost('Target Priority', 1)).toBe(1_000_000_000)
      expect(toolkitUpgradeDurationSeconds('Target Priority', 0)).toBe(172_740)
      expect(toolkitUpgradeDurationSeconds('Target Priority', 1)).toBe(691_200)
      expect(researchTimeForNextUpgrade(tp!, 0, max)).toBe('1d 23h 59m')
      expect(researchTimeForNextUpgrade(tp!, 1, max)).toBe('8d 0h 0m')
    })

    it('Buy Multiplier wiki Value (x1, x5, x10, Max, x100) and tower-lab time L1', () => {
      const buyMul = main.items.find((i) => i.name === 'Buy Multiplier')
      expect(buyMul).toBeDefined()
      const max = buyMul!.maxLevel ?? 4
      expect(benefitDisplayForCard(buyMul!, 0, max)).toBe('x1')
      expect(benefitDisplayForCard(buyMul!, 1, max)).toBe('x5')
      expect(benefitDisplayForCard(buyMul!, 2, max)).toBe('x10')
      expect(benefitDisplayForCard(buyMul!, 3, max)).toBe('Max')
      expect(benefitDisplayForCard(buyMul!, 4, max)).toBe('x100')
      expect(benefitLineWithNextUpgrade(buyMul!, 0, max)).toBe('x1 » x5')
      expect(benefitLineWithNextUpgrade(buyMul!, 1, max)).toBe('x5 » x10')
      expect(benefitLineWithNextUpgrade(buyMul!, 2, max)).toBe('x10 » Max')
      expect(benefitLineWithNextUpgrade(buyMul!, 3, max)).toBe('Max » x100')
      expect(benefitLineWithNextUpgrade(buyMul!, max, max)).toBe('x100')
      expect(toolkitMarginalCoinCost('Buy Multiplier', 0)).toBe(2500)
      expect(toolkitUpgradeDurationSeconds('Buy Multiplier', 0)).toBe(3540)
    })

    it('Labs Speed wiki Value, early tower-lab times, and benefit lines', () => {
      const labsSpeed = main.items.find((i) => i.name === 'Labs Speed')
      expect(labsSpeed).toBeDefined()
      const max = labsSpeed!.maxLevel ?? 99
      expect(benefitDisplayForCard(labsSpeed!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(labsSpeed!, 1, max)).toBe('x1.02')
      expect(benefitDisplayForCard(labsSpeed!, 27, max)).toBe('x1.54')
      expect(benefitDisplayForCard(labsSpeed!, 28, max)).toBe('x1.56')
      expect(benefitDisplayForCard(labsSpeed!, 33, max)).toBe('x1.66')
      expect(benefitDisplayForCard(labsSpeed!, 99, max)).toBe('x2.98')
      expect(benefitLineWithNextUpgrade(labsSpeed!, 0, max)).toBe(
        'x1.00 » x1.02',
      )
      expect(benefitLineWithNextUpgrade(labsSpeed!, 26, max)).toBe(
        'x1.52 » x1.54',
      )
      expect(benefitLineWithNextUpgrade(labsSpeed!, 27, max)).toBe(
        'x1.54 » x1.56',
      )
      expect(benefitLineWithNextUpgrade(labsSpeed!, max, max)).toBe('x2.98')
      expect(toolkitMarginalCoinCost('Labs Speed', 0)).toBe(40)
      expect(toolkitUpgradeDurationSeconds('Labs Speed', 0)).toBe(0)
      expect(toolkitUpgradeDurationSeconds('Labs Speed', 1)).toBe(540)
      expect(researchTimeForNextUpgrade(labsSpeed!, 0, max)).toBe('0m')
      expect(researchTimeForNextUpgrade(labsSpeed!, 1, max)).toBe('9m')
    })

    it('Labs Speed divides research time on other labs, not on itself', () => {
      const labsSpeed = main.items.find((i) => i.name === 'Labs Speed')
      const workshop = main.items.find(
        (i) => i.name === 'Workshop Attack Discount',
      )
      expect(labsSpeed).toBeDefined()
      expect(workshop).toBeDefined()
      const max = workshop!.maxLevel ?? 99
      const speedMax = 2.98
      expect(researchTimeForNextUpgrade(workshop!, 1, max, speedMax)).toBe('2m')
      expect(researchTimeForNextUpgrade(labsSpeed!, 1, max, speedMax)).toBe('9m')
    })

    it('Workshop Attack Discount wiki Value, early tower-lab times, and benefit lines', () => {
      const workshop = main.items.find(
        (i) => i.name === 'Workshop Attack Discount',
      )
      expect(workshop).toBeDefined()
      const max = workshop!.maxLevel ?? 99
      expect(benefitDisplayForCard(workshop!, 0, max)).toBe('0.00%')
      expect(benefitDisplayForCard(workshop!, 1, max)).toBe('0.50%')
      expect(benefitDisplayForCard(workshop!, 99, max)).toBe('49.50%')
      expect(benefitLineWithNextUpgrade(workshop!, 0, max)).toBe(
        '0.00% » 0.50%',
      )
      expect(benefitLineWithNextUpgrade(workshop!, 4, max)).toBe(
        '2.00% » 2.50%',
      )
      expect(benefitLineWithNextUpgrade(workshop!, 28, max)).toBe(
        '14.00% » 14.50%',
      )
      expect(toolkitMarginalCoinCost('Workshop Attack Discount', 0)).toBe(30)
      expect(toolkitUpgradeDurationSeconds('Workshop Attack Discount', 0)).toBe(
        0,
      )
      expect(toolkitUpgradeDurationSeconds('Workshop Attack Discount', 1)).toBe(
        360,
      )
      expect(researchTimeForNextUpgrade(workshop!, 0, max)).toBe('0m')
      expect(researchTimeForNextUpgrade(workshop!, 1, max)).toBe('6m')
    })

    it('Workshop Attack Discount reduces attack workshop marginal coins', () => {
      const m0 = workshopDamageNextMarginalCoins(0)!
      expect(applyWorkshopDiscountToCoins(m0, 0.5)).toBeCloseTo(m0 * 0.995, 5)
      expect(applyWorkshopDiscountToCoins(m0, 10)).toBe(27)
    })

    it('Workshop Defense Discount reduces defense workshop marginal coins', () => {
      const m0 = workshopDefenseNextMarginalCoins('healthLevel', 0)!
      expect(applyWorkshopDiscountToCoins(m0, 0.5)).toBeCloseTo(m0 * 0.995, 5)
      expect(applyWorkshopDiscountToCoins(m0, 10)).toBe(27)
    })

    it('Workshop Defense Discount shares Attack wiki ladder (tier 2 wave 50 unlock)', () => {
      const defense = main.items.find(
        (i) => i.name === 'Workshop Defense Discount',
      )
      expect(defense).toBeDefined()
      const max = defense!.maxLevel ?? 99
      expect(benefitDisplayForCard(defense!, 0, max)).toBe('0.00%')
      expect(benefitDisplayForCard(defense!, 99, max)).toBe('49.50%')
      expect(benefitLineWithNextUpgrade(defense!, 0, max)).toBe('0.00% » 0.50%')
      expect(toolkitMarginalCoinCost('Workshop Defense Discount', 0)).toBe(30)
      expect(toolkitUpgradeDurationSeconds('Workshop Defense Discount', 0)).toBe(
        0,
      )
      expect(toolkitUpgradeDurationSeconds('Workshop Defense Discount', 1)).toBe(
        360,
      )
      expect(researchTimeForNextUpgrade(defense!, 0, max)).toBe('0m')
      expect(researchTimeForNextUpgrade(defense!, 1, max)).toBe('6m')
    })

    it('Workshop Utility Discount shares Attack wiki ladder (tier 2 wave 60 unlock)', () => {
      const utility = main.items.find(
        (i) => i.name === 'Workshop Utility Discount',
      )
      expect(utility).toBeDefined()
      const max = utility!.maxLevel ?? 99
      expect(benefitDisplayForCard(utility!, 0, max)).toBe('0.00%')
      expect(benefitDisplayForCard(utility!, 99, max)).toBe('49.50%')
      expect(benefitLineWithNextUpgrade(utility!, 0, max)).toBe('0.00% » 0.50%')
      expect(toolkitMarginalCoinCost('Workshop Utility Discount', 0)).toBe(30)
      expect(toolkitUpgradeDurationSeconds('Workshop Utility Discount', 0)).toBe(
        0,
      )
      expect(toolkitUpgradeDurationSeconds('Workshop Utility Discount', 1)).toBe(
        360,
      )
      expect(researchTimeForNextUpgrade(utility!, 0, max)).toBe('0m')
      expect(researchTimeForNextUpgrade(utility!, 1, max)).toBe('6m')
    })

    it('Enhancement Coin Discount labs wiki Value (0.30%/level), shared ladder, research times', () => {
      const attack = main.items.find(
        (i) => i.name === 'Enhancement Attack - Coin Discount',
      )
      const defense = main.items.find(
        (i) => i.name === 'Enhancement Defense - Coin Discount',
      )
      const utility = main.items.find(
        (i) => i.name === 'Enhancement Utility - Coin Discount',
      )
      expect(attack).toBeDefined()
      expect(defense).toBeDefined()
      expect(utility).toBeDefined()
      const max = attack!.maxLevel ?? 100
      const towerLabs: Record<
        string,
        Record<string, { COST: number; DURATION: number }>
      > = JSON.parse(
        readFileSync(join(srcDir, 'data/tower-labs.json'), 'utf-8'),
      ) as Record<string, Record<string, { COST: number; DURATION: number }>>
      const table = towerLabs['Enhancement Attack - Coin Discount']
      expect(benefitLineWithNextUpgrade(attack!, 0, max)).toBe('0.00% » 0.30%')
      expect(benefitLineWithNextUpgrade(attack!, 4, max)).toBe(
        '1.20% » 1.50%',
      )
      expect(benefitLineWithNextUpgrade(attack!, 99, max)).toBe(
        '29.70% » 30.00%',
      )
      expect(toolkitMarginalCoinCost('Enhancement Attack - Coin Discount', 0)).toBe(
        table['1'].COST,
      )
      expect(
        toolkitUpgradeDurationSeconds('Enhancement Attack - Coin Discount', 0),
      ).toBe(table['1'].DURATION)
      expect(researchTimeForNextUpgrade(attack!, 0, max)).toBe('1d 1h 55m')
      expect(toolkitUpgradeDurationSeconds('Enhancement Attack - Coin Discount', 12)).toBe(
        table['13'].DURATION,
      )
      expect(researchTimeForNextUpgrade(attack!, 12, max)).toBe('14d 0h 56m')
      expect(toolkitMarginalCoinCost('Enhancement Attack - Coin Discount', 53)).toBe(
        table['54'].COST,
      )
      expect(toolkitMarginalCoinCost('Enhancement Defense - Coin Discount', 53)).toBe(
        table['54'].COST,
      )
      expect(toolkitMarginalCoinCost('Enhancement Utility - Coin Discount', 53)).toBe(
        table['54'].COST,
      )
      expect(toolkitMarginalCoinCost('Enhancement Attack - Coin Discount', 99)).toBe(
        table['100'].COST,
      )
      expect(
        toolkitUpgradeDurationSeconds('Enhancement Attack - Coin Discount', 99),
      ).toBe(table['100'].DURATION)
      expect(researchTimeForNextUpgrade(attack!, 99, max)).toBe('107d 23h 53m')
    })

    it('Dissonant Echo - Attack wiki Value (0.50%×(level+1)), ladder, and year-style research times', () => {
      const lab = main.items.find((i) => i.name === 'Dissonant Echo - Attack')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 20
      const towerLabs: Record<
        string,
        Record<string, { COST: number; DURATION: number }>
      > = JSON.parse(
        readFileSync(join(srcDir, 'data/tower-labs.json'), 'utf-8'),
      ) as Record<string, Record<string, { COST: number; DURATION: number }>>
      const attack = towerLabs['Dissonant Echo - Attack']
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0.50%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('1.00%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0.50% » 1.00%')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('1.00% » 1.50%')
      expect(benefitLineWithNextUpgrade(lab!, 3, max)).toBe('2.00% » 2.50%')
      expect(benefitLineWithNextUpgrade(lab!, 4, max)).toBe('2.50% » 3.00%')
      expect(benefitDisplayForCard(lab!, 19, max)).toBe('10.00%')
      expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe('10.00% » 10.50%')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('10.50%')
      expect(toolkitMarginalCoinCost('Dissonant Echo - Attack', 0)).toBe(
        attack['1'].COST,
      )
      expect(toolkitUpgradeDurationSeconds('Dissonant Echo - Attack', 0)).toBe(
        1_800_000,
      )
      expect(toolkitMarginalCoinCost('Dissonant Echo - Attack', 1)).toBe(
        attack['2'].COST,
      )
      expect(toolkitUpgradeDurationSeconds('Dissonant Echo - Attack', 5)).toBe(
        attack['6'].DURATION,
      )
      expect(toolkitMarginalCoinCost('Dissonant Echo - Attack', 18)).toBe(
        attack['19'].COST,
      )
      expect(toolkitMarginalCoinCost('Dissonant Echo - Attack', 19)).toBe(
        attack['20'].COST,
      )
      expect(toolkitUpgradeDurationSeconds('Dissonant Echo - Attack', 17)).toBe(
        32_400_000,
      )
      expect(researchTimeForNextUpgrade(lab!, 17, max)).toBe('1y 10d')
      expect(toolkitUpgradeDurationSeconds('Dissonant Echo - Attack', 18)).toBe(
        34_200_000,
      )
      expect(researchTimeForNextUpgrade(lab!, 18, max)).toBe('1y 30d 20h')
      expect(toolkitUpgradeDurationSeconds('Dissonant Echo - Attack', 19)).toBe(
        36_000_000,
      )
      expect(researchTimeForNextUpgrade(lab!, 19, max)).toBe('1y 51d 16h')
    })
  })

  describe('BATTLE CONDITION spot checks', () => {
    const battle = loadAllSections().find((s) => s.title === 'BATTLE CONDITION')
    if (!battle) throw new Error('fixture missing BATTLE CONDITION')

    it('Battle Condition Reduction — wiki Value 0%..20% (+2%/level) + marginal ladder', () => {
      const bcr = battle.items.find((i) => i.name === 'Battle Condition Reduction')
      expect(bcr).toBeDefined()
      const max = bcr!.maxLevel ?? 10
      expect(benefitDisplayForCard(bcr!, 0, max)).toBe('0%')
      expect(benefitDisplayForCard(bcr!, 1, max)).toBe('2%')
      expect(benefitDisplayForCard(bcr!, 10, max)).toBe('20%')
      expect(benefitLineWithNextUpgrade(bcr!, 0, max)).toBe('0% » 2%')
      expect(benefitLineWithNextUpgrade(bcr!, 9, max)).toBe('18% » 20%')
      expect(benefitLineWithNextUpgrade(bcr!, max, max)).toBe('20%')
      expect(toolkitMarginalCoinCost('Battle Condition Reduction', 0)).toBe(
        1_000_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Battle Condition Reduction', 5)).toBe(
        8_640_600,
      )
    })

    it('BC Group 1 resistances share Knockback marginal ladder + 1%/level', () => {
      const kb = battle.items.find((i) => i.name === 'Knockback Resistance')
      const orb = battle.items.find((i) => i.name === 'Orb Resistance')
      expect(kb).toBeDefined()
      expect(orb).toBeDefined()
      const max = 20
      expect(benefitDisplayForCard(kb!, 0, max)).toBe('0%')
      expect(benefitDisplayForCard(kb!, 1, max)).toBe('1%')
      expect(benefitDisplayForCard(orb!, 20, max)).toBe('20%')
      expect(benefitLineWithNextUpgrade(kb!, 0, max)).toBe('0% » 1%')
      expect(benefitLineWithNextUpgrade(kb!, 19, max)).toBe('19% » 20%')
      expect(toolkitMarginalCoinCost('Death Ray Resistance', 0)).toBe(
        200_000_000_000_000,
      )
      expect(toolkitMarginalCoinCost('Knockback Resistance', 19)).toBe(
        4_000_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Thorns Resistance', 0)).toBe(1_166_340)
      expect(researchTimeForNextUpgrade(kb!, 0, max)).toBe('13d 11h 59m')
    })

    it('BC Group 2 enemy buffs share Armored Enemies marginal ladder + 1%/level', () => {
      const arm = battle.items.find((i) => i.name === 'Armored Enemies')
      const more = battle.items.find((i) => i.name === 'More Enemies')
      expect(arm).toBeDefined()
      expect(more).toBeDefined()
      const max = 20
      expect(benefitDisplayForCard(arm!, 0, max)).toBe('0%')
      expect(benefitDisplayForCard(more!, 5, max)).toBe('5%')
      expect(toolkitMarginalCoinCost('Enemy Attack Speed', 0)).toBe(
        500_000_000_000_000,
      )
      expect(toolkitMarginalCoinCost('Armored Enemies', 19)).toBe(
        10_000_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Enemy Speed', 0)).toBe(1_399_560)
      expect(researchTimeForNextUpgrade(arm!, 0, max)).toBe('16d 4h 46m')
    })

    it('BC Group 3 enemy ultimates share Fast marginal ladder + 1%/level (max 10)', () => {
      const fast = battle.items.find((i) => i.name === "Fast's Ultimate")
      const boss = battle.items.find((i) => i.name === "Boss's Ultimate")
      expect(fast).toBeDefined()
      expect(boss).toBeDefined()
      const max = 10
      expect(benefitDisplayForCard(fast!, 0, max)).toBe('0%')
      expect(benefitDisplayForCard(boss!, 3, max)).toBe('3%')
      expect(benefitDisplayForCard(fast!, 10, max)).toBe('10%')
      expect(toolkitMarginalCoinCost('Protector\'s Ultimate', 0)).toBe(
        1_000_000_000_000_000,
      )
      expect(toolkitMarginalCoinCost("Fast's Ultimate", 9)).toBe(
        38_440_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Ranged Ultimate', 3)).toBe(5_131_920)
      expect(researchTimeForNextUpgrade(fast!, 0, max)).toBe('26d 23h 58m')
    })

    it('BC Group 4 durations/reductions share Ultimate Weapon Durations ladder + 1%/level', () => {
      const uwd = battle.items.find((i) => i.name === 'Ultimate Weapon Durations')
      const skip = battle.items.find((i) => i.name === 'Enemy Level Skip Reduction')
      expect(uwd).toBeDefined()
      expect(skip).toBeDefined()
      const max = 10
      expect(benefitDisplayForCard(uwd!, 4, max)).toBe('4%')
      expect(toolkitMarginalCoinCost('Death Defy Down', 9)).toBe(
        1_024_000_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Energy Shields Down', 3)).toBe(
        6_951_420,
      )
      expect(researchTimeForNextUpgrade(skip!, 0, max)).toBe('26d 23h 58m')
    })
  })

  describe('ATTACK RESEARCH spot checks', () => {
    const attack = loadAllSections().find((s) => s.title === 'ATTACK RESEARCH')
    if (!attack) throw new Error('fixture missing ATTACK RESEARCH')

    it('Damage wiki Value (+0.02/level to x3.00), cost/time ladder (100 levels)', () => {
      const dmg = attack.items.find((i) => i.name === 'Damage')
      expect(dmg).toBeDefined()
      const max = dmg!.maxLevel ?? 100
      const towerLabs: Record<
        string,
        Record<string, { COST: number; DURATION: number }>
      > = JSON.parse(
        readFileSync(join(srcDir, 'data/tower-labs.json'), 'utf-8'),
      ) as Record<string, Record<string, { COST: number; DURATION: number }>>
      const table = towerLabs.Damage
      expect(benefitDisplayForCard(dmg!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(dmg!, 1, max)).toBe('x1.02')
      expect(benefitDisplayForCard(dmg!, 50, max)).toBe('x2.00')
      expect(benefitDisplayForCard(dmg!, 100, max)).toBe('x3.00')
      expect(benefitLineWithNextUpgrade(dmg!, 0, max)).toBe('x1.00 » x1.02')
      expect(benefitLineWithNextUpgrade(dmg!, 99, max)).toBe('x2.98 » x3.00')
      expect(benefitLineWithNextUpgrade(dmg!, max, max)).toBe('x3.00')
      expect(toolkitMarginalCoinCost('Damage', 0)).toBe(table['1'].COST)
      expect(toolkitUpgradeDurationSeconds('Damage', 0)).toBe(table['1'].DURATION)
      expect(researchTimeForNextUpgrade(dmg!, 0, max)).toBe('0m')
      expect(toolkitMarginalCoinCost('Damage', 18)).toBe(table['19'].COST)
      expect(toolkitUpgradeDurationSeconds('Damage', 18)).toBe(table['19'].DURATION)
      expect(researchTimeForNextUpgrade(dmg!, 18, max)).toBe('21h 31m')
      expect(toolkitMarginalCoinCost('Damage', 58)).toBe(table['59'].COST)
      expect(researchTimeForNextUpgrade(dmg!, 58, max)).toBe('14d 0h 44m')
      expect(toolkitMarginalCoinCost('Damage', 98)).toBe(table['99'].COST)
      expect(toolkitMarginalCoinCost('Damage', 99)).toBe(table['100'].COST)
      expect(toolkitUpgradeDurationSeconds('Damage', 99)).toBe(table['100'].DURATION)
      expect(researchTimeForNextUpgrade(dmg!, 99, max)).toBe('50d 5h 52m')
    })

    it('Attack Speed wiki Value (+0.02/level to x2.98), same marginal ladder as Damage (99 levels)', () => {
      const as = attack.items.find((i) => i.name === 'Attack Speed')
      expect(as).toBeDefined()
      const max = as!.maxLevel ?? 99
      const towerLabs: Record<
        string,
        Record<string, { COST: number; DURATION: number }>
      > = JSON.parse(
        readFileSync(join(srcDir, 'data/tower-labs.json'), 'utf-8'),
      ) as Record<string, Record<string, { COST: number; DURATION: number }>>
      const damageTable = towerLabs.Damage
      const asTable = towerLabs['Attack Speed']
      expect(benefitDisplayForCard(as!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(as!, 1, max)).toBe('x1.02')
      expect(benefitDisplayForCard(as!, 99, max)).toBe('x2.98')
      expect(benefitLineWithNextUpgrade(as!, 0, max)).toBe('x1.00 » x1.02')
      expect(benefitLineWithNextUpgrade(as!, 98, max)).toBe('x2.96 » x2.98')
      expect(benefitLineWithNextUpgrade(as!, max, max)).toBe('x2.98')
      expect(asTable['99'].COST).toBe(damageTable['99'].COST)
      expect(asTable['99'].DURATION).toBe(damageTable['99'].DURATION)
      expect(toolkitMarginalCoinCost('Attack Speed', 0)).toBe(asTable['1'].COST)
      expect(toolkitUpgradeDurationSeconds('Attack Speed', 0)).toBe(
        asTable['1'].DURATION,
      )
      expect(researchTimeForNextUpgrade(as!, 0, max)).toBe('0m')
      expect(toolkitMarginalCoinCost('Attack Speed', 18)).toBe(asTable['19'].COST)
      expect(researchTimeForNextUpgrade(as!, 18, max)).toBe('21h 31m')
      expect(toolkitMarginalCoinCost('Attack Speed', 58)).toBe(asTable['59'].COST)
      expect(researchTimeForNextUpgrade(as!, 58, max)).toBe('14d 0h 44m')
      expect(toolkitMarginalCoinCost('Attack Speed', 98)).toBe(asTable['99'].COST)
      expect(toolkitUpgradeDurationSeconds('Attack Speed', 98)).toBe(
        asTable['99'].DURATION,
      )
      expect(researchTimeForNextUpgrade(as!, 98, max)).toBe('49d 0h 57m')
      expect(toolkitMarginalCoinCost('Attack Speed', 99)).toBeUndefined()
    })

    it('Critical Factor wiki Value (+0.03/level to x3.97), same marginal ladder as Damage (99 levels)', () => {
      const cf = attack.items.find((i) => i.name === 'Critical Factor')
      expect(cf).toBeDefined()
      const max = cf!.maxLevel ?? 99
      const towerLabs: Record<
        string,
        Record<string, { COST: number; DURATION: number }>
      > = JSON.parse(
        readFileSync(join(srcDir, 'data/tower-labs.json'), 'utf-8'),
      ) as Record<string, Record<string, { COST: number; DURATION: number }>>
      const damageTable = towerLabs.Damage
      const cfTable = towerLabs['Critical Factor']
      expect(benefitDisplayForCard(cf!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(cf!, 1, max)).toBe('x1.03')
      expect(benefitDisplayForCard(cf!, 29, max)).toBe('x1.87')
      expect(benefitDisplayForCard(cf!, 99, max)).toBe('x3.97')
      expect(benefitLineWithNextUpgrade(cf!, 0, max)).toBe('x1.00 » x1.03')
      expect(benefitLineWithNextUpgrade(cf!, 98, max)).toBe('x3.94 » x3.97')
      expect(benefitLineWithNextUpgrade(cf!, max, max)).toBe('x3.97')
      expect(cfTable['99'].COST).toBe(damageTable['99'].COST)
      expect(cfTable['99'].DURATION).toBe(damageTable['99'].DURATION)
      expect(toolkitMarginalCoinCost('Critical Factor', 0)).toBe(cfTable['1'].COST)
      expect(toolkitUpgradeDurationSeconds('Critical Factor', 0)).toBe(
        cfTable['1'].DURATION,
      )
      expect(researchTimeForNextUpgrade(cf!, 0, max)).toBe('0m')
      expect(toolkitMarginalCoinCost('Critical Factor', 18)).toBe(cfTable['19'].COST)
      expect(researchTimeForNextUpgrade(cf!, 18, max)).toBe('21h 31m')
      expect(toolkitMarginalCoinCost('Critical Factor', 58)).toBe(cfTable['59'].COST)
      expect(researchTimeForNextUpgrade(cf!, 58, max)).toBe('14d 0h 44m')
      expect(toolkitMarginalCoinCost('Critical Factor', 98)).toBe(cfTable['99'].COST)
      expect(toolkitUpgradeDurationSeconds('Critical Factor', 98)).toBe(
        cfTable['99'].DURATION,
      )
      expect(researchTimeForNextUpgrade(cf!, 98, max)).toBe('49d 0h 57m')
      expect(toolkitMarginalCoinCost('Critical Factor', 99)).toBeUndefined()
    })

    it('Range wiki Value (+0.02/level to x2.60), same marginal ladder as Damage (80 levels)', () => {
      const range = attack.items.find((i) => i.name === 'Range')
      expect(range).toBeDefined()
      const max = range!.maxLevel ?? 80
      const towerLabs: Record<
        string,
        Record<string, { COST: number; DURATION: number }>
      > = JSON.parse(
        readFileSync(join(srcDir, 'data/tower-labs.json'), 'utf-8'),
      ) as Record<string, Record<string, { COST: number; DURATION: number }>>
      const damageTable = towerLabs.Damage
      const rangeTable = towerLabs.Range
      expect(benefitDisplayForCard(range!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(range!, 1, max)).toBe('x1.02')
      expect(benefitDisplayForCard(range!, 80, max)).toBe('x2.60')
      expect(benefitLineWithNextUpgrade(range!, 0, max)).toBe('x1.00 » x1.02')
      expect(benefitLineWithNextUpgrade(range!, 79, max)).toBe('x2.58 » x2.60')
      expect(benefitLineWithNextUpgrade(range!, max, max)).toBe('x2.60')
      expect(rangeTable['80'].COST).toBe(damageTable['80'].COST)
      expect(rangeTable['80'].DURATION).toBe(damageTable['80'].DURATION)
      expect(toolkitMarginalCoinCost('Range', 0)).toBe(rangeTable['1'].COST)
      expect(toolkitUpgradeDurationSeconds('Range', 0)).toBe(rangeTable['1'].DURATION)
      expect(researchTimeForNextUpgrade(range!, 0, max)).toBe('0m')
      expect(toolkitMarginalCoinCost('Range', 18)).toBe(rangeTable['19'].COST)
      expect(researchTimeForNextUpgrade(range!, 18, max)).toBe('21h 31m')
      expect(toolkitMarginalCoinCost('Range', 58)).toBe(rangeTable['59'].COST)
      expect(researchTimeForNextUpgrade(range!, 58, max)).toBe('14d 0h 44m')
      expect(toolkitMarginalCoinCost('Range', 78)).toBe(rangeTable['79'].COST)
      expect(toolkitUpgradeDurationSeconds('Range', 78)).toBe(rangeTable['79'].DURATION)
      expect(researchTimeForNextUpgrade(range!, 78, max)).toBe('28d 10h 18m')
      expect(toolkitMarginalCoinCost('Range', 79)).toBe(rangeTable['80'].COST)
      expect(toolkitUpgradeDurationSeconds('Range', 79)).toBe(rangeTable['80'].DURATION)
      expect(researchTimeForNextUpgrade(range!, 79, max)).toBe('29d 7h 22m')
      expect(toolkitMarginalCoinCost('Range', 80)).toBeUndefined()
    })

    it('Damage / Meter wiki Value (+0.02/level to x2.98), same marginal ladder as Damage (99 levels)', () => {
      const dm = attack.items.find((i) => i.name === 'Damage / Meter')
      expect(dm).toBeDefined()
      const max = dm!.maxLevel ?? 99
      const towerLabs: Record<
        string,
        Record<string, { COST: number; DURATION: number }>
      > = JSON.parse(
        readFileSync(join(srcDir, 'data/tower-labs.json'), 'utf-8'),
      ) as Record<string, Record<string, { COST: number; DURATION: number }>>
      const damageTable = towerLabs.Damage
      const dmTable = towerLabs['Damage / Meter']
      expect(benefitDisplayForCard(dm!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(dm!, 1, max)).toBe('x1.02')
      expect(benefitDisplayForCard(dm!, 99, max)).toBe('x2.98')
      expect(benefitLineWithNextUpgrade(dm!, 0, max)).toBe('x1.00 » x1.02')
      expect(benefitLineWithNextUpgrade(dm!, 98, max)).toBe('x2.96 » x2.98')
      expect(benefitLineWithNextUpgrade(dm!, max, max)).toBe('x2.98')
      expect(dmTable['99'].COST).toBe(damageTable['99'].COST)
      expect(dmTable['99'].DURATION).toBe(damageTable['99'].DURATION)
      expect(toolkitMarginalCoinCost('Damage / Meter', 0)).toBe(dmTable['1'].COST)
      expect(toolkitUpgradeDurationSeconds('Damage / Meter', 0)).toBe(
        dmTable['1'].DURATION,
      )
      expect(researchTimeForNextUpgrade(dm!, 0, max)).toBe('0m')
      expect(toolkitMarginalCoinCost('Damage / Meter', 4)).toBe(dmTable['5'].COST)
      expect(dmTable['5'].COST).toBe(damageTable['5'].COST)
      expect(toolkitMarginalCoinCost('Damage / Meter', 18)).toBe(dmTable['19'].COST)
      expect(researchTimeForNextUpgrade(dm!, 18, max)).toBe('21h 31m')
      expect(toolkitMarginalCoinCost('Damage / Meter', 58)).toBe(dmTable['59'].COST)
      expect(researchTimeForNextUpgrade(dm!, 58, max)).toBe('14d 0h 44m')
      expect(toolkitMarginalCoinCost('Damage / Meter', 98)).toBe(dmTable['99'].COST)
      expect(toolkitUpgradeDurationSeconds('Damage / Meter', 98)).toBe(
        dmTable['99'].DURATION,
      )
      expect(researchTimeForNextUpgrade(dm!, 98, max)).toBe('49d 0h 57m')
      expect(toolkitMarginalCoinCost('Damage / Meter', 99)).toBeUndefined()
    })

    it('Super Crit Chance uses calculator Value (+0.10% per level, Include %)', () => {
      const scc = attack.items.find((i) => i.name === 'Super Crit Chance')
      expect(scc).toBeDefined()
      const max = scc!.maxLevel ?? 50
      expect(benefitDisplayForCard(scc!, 0, max)).toBe('+0.00%')
      expect(benefitDisplayForCard(scc!, 1, max)).toBe('+0.10%')
      expect(benefitDisplayForCard(scc!, 10, max)).toBe('+1.00%')
      expect(benefitDisplayForCard(scc!, 29, max)).toBe('+2.90%')
      expect(benefitDisplayForCard(scc!, 50, max)).toBe('+5.00%')
      expect(benefitLineWithNextUpgrade(scc!, 0, max)).toBe('+0.00% » +0.10%')
      expect(benefitLineWithNextUpgrade(scc!, 49, max)).toBe('+4.90% » +5.00%')
      expect(benefitLineWithNextUpgrade(scc!, max, max)).toBe('+5.00%')
    })

    it('Super Crit Multi wiki Value (+0.02/level to x1.80), cost/time ladder (40 levels)', () => {
      const scm = attack.items.find((i) => i.name === 'Super Crit Multi')
      expect(scm).toBeDefined()
      const max = scm!.maxLevel ?? 40
      const towerLabs: Record<
        string,
        Record<string, { COST: number; DURATION: number }>
      > = JSON.parse(
        readFileSync(join(srcDir, 'data/tower-labs.json'), 'utf-8'),
      ) as Record<string, Record<string, { COST: number; DURATION: number }>>
      const multTable = towerLabs['Super Crit Multi']
      expect(benefitDisplayForCard(scm!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(scm!, 1, max)).toBe('x1.02')
      expect(benefitDisplayForCard(scm!, 29, max)).toBe('x1.58')
      expect(benefitDisplayForCard(scm!, 40, max)).toBe('x1.80')
      expect(benefitLineWithNextUpgrade(scm!, 0, max)).toBe('x1.00 » x1.02')
      expect(benefitLineWithNextUpgrade(scm!, 39, max)).toBe('x1.78 » x1.80')
      expect(benefitLineWithNextUpgrade(scm!, max, max)).toBe('x1.80')
      expect(toolkitMarginalCoinCost('Super Crit Multi', 0)).toBe(multTable['1'].COST)
      expect(toolkitMarginalCoinCost('Super Crit Mult', 0)).toBe(multTable['1'].COST)
      expect(toolkitUpgradeDurationSeconds('Super Crit Multi', 0)).toBe(
        multTable['1'].DURATION,
      )
      expect(researchTimeForNextUpgrade(scm!, 0, max)).toBe('1d 3h 46m')
      expect(toolkitMarginalCoinCost('Super Crit Multi', 2)).toBe(multTable['3'].COST)
      expect(toolkitMarginalCoinCost('Super Crit Multi', 9)).toBe(multTable['10'].COST)
      expect(researchTimeForNextUpgrade(scm!, 9, max)).toBe('11d 16h 21m')
      expect(toolkitMarginalCoinCost('Super Crit Multi', 29)).toBe(multTable['30'].COST)
      expect(researchTimeForNextUpgrade(scm!, 29, max)).toBe('1y 225d 23h 14m')
      expect(toolkitMarginalCoinCost('Super Crit Multi', 38)).toBe(multTable['39'].COST)
      expect(toolkitMarginalCoinCost('Super Crit Multi', 39)).toBe(multTable['40'].COST)
      expect(toolkitUpgradeDurationSeconds('Super Crit Multi', 39)).toBe(
        multTable['40'].DURATION,
      )
      expect(researchTimeForNextUpgrade(scm!, 39, max)).toBe('5y 73d 1h 1m')
      expect(toolkitMarginalCoinCost('Super Crit Multi', 40)).toBeUndefined()
    })

    it('Max Rend Armor Multiplier wiki Rend Armor Max (x8.000…x15.500), cost/time ladder (30 levels)', () => {
      const mram = attack.items.find((i) => i.name === 'Max Rend Armor Multiplier')
      expect(mram).toBeDefined()
      const max = mram!.maxLevel ?? 30
      const towerLabs: Record<
        string,
        Record<string, { COST: number; DURATION: number }>
      > = JSON.parse(
        readFileSync(join(srcDir, 'data/tower-labs.json'), 'utf-8'),
      ) as Record<string, Record<string, { COST: number; DURATION: number }>>
      const table = towerLabs['Max Rend Armor Multiplier']
      expect(benefitDisplayForCard(mram!, 0, max)).toBe('x8.000')
      expect(benefitDisplayForCard(mram!, 1, max)).toBe('x8.250')
      expect(benefitDisplayForCard(mram!, 10, max)).toBe('x10.500')
      expect(benefitDisplayForCard(mram!, 30, max)).toBe('x15.500')
      expect(benefitLineWithNextUpgrade(mram!, 0, max)).toBe('x8.000 » x8.250')
      expect(benefitLineWithNextUpgrade(mram!, 29, max)).toBe('x15.250 » x15.500')
      expect(benefitLineWithNextUpgrade(mram!, max, max)).toBe('x15.500')
      expect(toolkitMarginalCoinCost('Max Rend Armor Multiplier', 0)).toBe(table['1'].COST)
      expect(toolkitUpgradeDurationSeconds('Max Rend Armor Multiplier', 0)).toBe(
        table['1'].DURATION,
      )
      expect(researchTimeForNextUpgrade(mram!, 0, max)).toBe('3d 11h 19m')
      expect(toolkitMarginalCoinCost('Max Rend Armor Multiplier', 9)).toBe(table['10'].COST)
      expect(researchTimeForNextUpgrade(mram!, 9, max)).toBe('8d 18h 46m')
      expect(toolkitMarginalCoinCost('Max Rend Armor Multiplier', 20)).toBe(table['21'].COST)
      expect(researchTimeForNextUpgrade(mram!, 20, max)).toBe('15d 15h 16m')
      expect(toolkitMarginalCoinCost('Max Rend Armor Multiplier', 28)).toBe(table['29'].COST)
      expect(toolkitUpgradeDurationSeconds('Max Rend Armor Multiplier', 29)).toBe(
        table['30'].DURATION,
      )
      expect(researchTimeForNextUpgrade(mram!, 29, max)).toBe('21d 14h 10m')
      expect(toolkitMarginalCoinCost('Max Rend Armor Multiplier', 30)).toBeUndefined()
    })

    it('Light Speed Shots is an unlock lab (single line, no »)', () => {
      const lss = attack.items.find((i) => i.name === 'Light Speed Shots')
      expect(lss).toBeDefined()
      const max = lss!.maxLevel ?? 1
      expect(benefitDisplayForCard(lss!, 0, max)).toBe('Unlock Light Speed Shots')
      expect(benefitDisplayForCard(lss!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(lss!, 0, max)).toBe('Unlock Light Speed Shots')
      expect(benefitLineWithNextUpgrade(lss!, max, max)).toBe('Unlocked')
    })

    it('Light Speed Shots tower-labs match wiki row 1 (tier 7 wave 10)', () => {
      const lss = attack.items.find((i) => i.name === 'Light Speed Shots')
      expect(lss).toBeDefined()
      const max = lss!.maxLevel ?? 1
      expect(toolkitMarginalCoinCost('Light Speed Shots', 0)).toBe(3_000_000)
      expect(toolkitUpgradeDurationSeconds('Light Speed Shots', 0)).toBe(71_940)
      // Formatter omits a leading "0d " (wiki table shows 0d 19h 59m).
      expect(researchTimeForNextUpgrade(lss!, 0, max)).toBe('19h 59m')
      expect(toolkitMarginalCoinCost('Light Speed Shots', 1)).toBeUndefined()
    })
  })

  describe('UTILITY RESEARCH spot checks', () => {
    const utility = loadAllSections().find((s) => s.title === 'UTILITY RESEARCH')
    if (!utility) throw new Error('fixture missing UTILITY RESEARCH')

    it('Cash Bonus uses calculator Value (x1 + 0.02 per level, same as Damage)', () => {
      const cb = utility.items.find((i) => i.name === 'Cash Bonus')
      expect(cb).toBeDefined()
      const max = cb!.maxLevel ?? 99
      expect(benefitDisplayForCard(cb!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(cb!, 1, max)).toBe('x1.02')
      expect(benefitDisplayForCard(cb!, 29, max)).toBe('x1.58')
      expect(benefitDisplayForCard(cb!, 99, max)).toBe('x2.98')
      expect(benefitLineWithNextUpgrade(cb!, 0, max)).toBe('x1.00 » x1.02')
      expect(benefitLineWithNextUpgrade(cb!, 98, max)).toBe('x2.96 » x2.98')
      expect(benefitLineWithNextUpgrade(cb!, max, max)).toBe('x2.98')
    })

    it('Cash / Wave uses same calculator Value as Cash Bonus (x1 + 0.02 per level)', () => {
      const cw = utility.items.find((i) => i.name === 'Cash / Wave')
      expect(cw).toBeDefined()
      const max = cw!.maxLevel ?? 99
      expect(benefitDisplayForCard(cw!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(cw!, 1, max)).toBe('x1.02')
      expect(benefitDisplayForCard(cw!, 29, max)).toBe('x1.58')
      expect(benefitDisplayForCard(cw!, 99, max)).toBe('x2.98')
      expect(benefitLineWithNextUpgrade(cw!, 0, max)).toBe('x1.00 » x1.02')
      expect(benefitLineWithNextUpgrade(cw!, max, max)).toBe('x2.98')
    })

    it('Coins / Kill Bonus uses same x1 + 0.02/level Value as Cash Bonus', () => {
      const item = utility.items.find((i) => i.name === 'Coins / Kill Bonus')
      expect(item).toBeDefined()
      const max = item!.maxLevel ?? 99
      expect(benefitDisplayForCard(item!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(item!, 1, max)).toBe('x1.02')
      expect(benefitDisplayForCard(item!, 99, max)).toBe('x2.98')
      expect(benefitLineWithNextUpgrade(item!, 0, max)).toBe('x1.00 » x1.02')
      expect(benefitLineWithNextUpgrade(item!, max, max)).toBe('x2.98')
    })

    it('Coins / Wave uses same x1 + 0.02/level Value as Cash Bonus', () => {
      const item = utility.items.find((i) => i.name === 'Coins / Wave')
      expect(item).toBeDefined()
      const max = item!.maxLevel ?? 99
      expect(benefitDisplayForCard(item!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(item!, 1, max)).toBe('x1.02')
      expect(benefitDisplayForCard(item!, 99, max)).toBe('x2.98')
      expect(benefitLineWithNextUpgrade(item!, 0, max)).toBe('x1.00 » x1.02')
      expect(benefitLineWithNextUpgrade(item!, max, max)).toBe('x2.98')
    })

    it('Interest uses same x1 + 0.02/level Value as Cash Bonus', () => {
      const item = utility.items.find((i) => i.name === 'Interest')
      expect(item).toBeDefined()
      const max = item!.maxLevel ?? 99
      expect(benefitDisplayForCard(item!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(item!, 1, max)).toBe('x1.02')
      expect(benefitDisplayForCard(item!, 29, max)).toBe('x1.58')
      expect(benefitDisplayForCard(item!, 99, max)).toBe('x2.98')
      expect(benefitLineWithNextUpgrade(item!, 0, max)).toBe('x1.00 » x1.02')
      expect(benefitLineWithNextUpgrade(item!, max, max)).toBe('x2.98')
    })

    it('Max Interest uses calculator Value column ($ per level, max 15)', () => {
      const item = utility.items.find((i) => i.name === 'Max Interest')
      expect(item).toBeDefined()
      const max = item!.maxLevel ?? 15
      expect(benefitDisplayForCard(item!, 0, max)).toBe('$50')
      expect(benefitDisplayForCard(item!, 1, max)).toBe('$100')
      expect(benefitDisplayForCard(item!, 4, max)).toBe('$500')
      expect(benefitDisplayForCard(item!, 10, max)).toBe('$3500')
      expect(benefitDisplayForCard(item!, 15, max)).toBe('$15000')
      expect(benefitLineWithNextUpgrade(item!, 0, max)).toBe('$50 » $100')
      expect(benefitLineWithNextUpgrade(item!, 14, max)).toBe('$12500 » $15000')
      expect(benefitLineWithNextUpgrade(item!, max, max)).toBe('$15000')
    })

    it('Package After Boss shows unlock copy (single line, no »)', () => {
      const pab = utility.items.find((i) => i.name === 'Package After Boss')
      expect(pab).toBeDefined()
      const max = pab!.maxLevel ?? 1
      expect(benefitDisplayForCard(pab!, 0, max)).toBe(
        'Unlock Package After Boss',
      )
      expect(benefitDisplayForCard(pab!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(pab!, 0, max)).toBe(
        'Unlock Package After Boss',
      )
      expect(benefitLineWithNextUpgrade(pab!, max, max)).toBe('Unlocked')
    })

    it('Recovery Package Amount uses +0.40%/level (Include %)', () => {
      const lab = utility.items.find((i) => i.name === 'Recovery Package Amount')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+0.00%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+0.40%')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('+8.00%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('+0.00% » +0.40%')
      expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe(
        '+7.60% » +8.00%',
      )
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('+8.00%')
    })

    it('Recovery Package Chance uses +0.20%/level (Include %)', () => {
      const lab = utility.items.find((i) => i.name === 'Recovery Package Chance')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+0.00%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+0.20%')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('+4.00%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('+0.00% » +0.20%')
      expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe(
        '+3.80% » +4.00%',
      )
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('+4.00%')
    })

    it('Recovery Package Max uses +1.00%/level (Include %)', () => {
      const lab = utility.items.find((i) => i.name === 'Recovery Package Max')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+0.00%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+1.00%')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('+20.00%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe(
        '+0.00% » +1.00%',
      )
      expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe(
        '+19.00% » +20.00%',
      )
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('+20.00%')
    })

    it('Enemy Attack & Health Level Skip use +0.10%/level (Include %)', () => {
      for (const name of [
        'Enemy Attack Level Skip',
        'Enemy Health Level Skip',
      ] as const) {
        const lab = utility.items.find((i) => i.name === name)
        expect(lab).toBeDefined()
        const max = lab!.maxLevel ?? 20
        expect(benefitDisplayForCard(lab!, 0, max)).toBe('+0.00%')
        expect(benefitDisplayForCard(lab!, 1, max)).toBe('+0.10%')
        expect(benefitDisplayForCard(lab!, 10, max)).toBe('+1.00%')
        expect(benefitDisplayForCard(lab!, 20, max)).toBe('+2.00%')
        expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe(
          '+0.00% » +0.10%',
        )
        expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe(
          '+1.90% » +2.00%',
        )
        expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('+2.00%')
      }
    })
  })

  describe('ULTIMATE WEAPON RESEARCH spot checks', () => {
    const ultimate = loadAllSections().find(
      (s) => s.title === 'ULTIMATE WEAPON RESEARCH',
    )
    if (!ultimate) throw new Error('fixture missing ULTIMATE WEAPON RESEARCH')

    it('Missile Despawn Time uses calculator Value (integer 1 per level)', () => {
      const m = ultimate.items.find((i) => i.name === 'Missile Despawn Time')
      expect(m).toBeDefined()
      const max = m!.maxLevel ?? 20
      expect(benefitDisplayForCard(m!, 0, max)).toBe('0')
      expect(benefitDisplayForCard(m!, 1, max)).toBe('1')
      expect(benefitDisplayForCard(m!, 20, max)).toBe('20')
      expect(benefitLineWithNextUpgrade(m!, 0, max)).toBe('0 » 1')
      expect(benefitLineWithNextUpgrade(m!, 19, max)).toBe('19 » 20')
      expect(benefitLineWithNextUpgrade(m!, max, max)).toBe('20')
    })

    it('Black Hole Damage uses calculator Value (0.20%/level of max HP)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Black Hole Damage')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 10
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0.00%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('0.20%')
      expect(benefitDisplayForCard(lab!, 5, max)).toBe('1.00%')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('2.00%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0.00% » 0.20%')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('0.20% » 0.40%')
      expect(benefitLineWithNextUpgrade(lab!, 9, max)).toBe('1.80% » 2.00%')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('2.00%')
    })

    it('Black Hole Coin Bonus uses calculator Value (x1.00 + 0.50/level)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Black Hole Coin Bonus')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('x1.50')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('x6.00')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('x11.00')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('x1.00 » x1.50')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('x1.50 » x2.00')
      expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe('x10.50 » x11.00')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('x11.00')
    })

    it('Spotlight Missiles uses calculator Value (20.00 − level, seconds)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Spotlight Missiles')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 18
      expect(benefitDisplayForCard(lab!, 0, max)).toBe(
        'Unlock Spotlight Missiles',
      )
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('19.00s')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('10.00s')
      expect(benefitDisplayForCard(lab!, 18, max)).toBe('2.00s')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe(
        'Unlock Spotlight Missiles',
      )
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('19.00s » 18.00s')
      expect(benefitLineWithNextUpgrade(lab!, 17, max)).toBe('3.00s » 2.00s')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('2.00s')
    })

    it('Spotlight Coin Bonus uses calculator Value (x1.00 + 0.10/level)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Spotlight Coin Bonus')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('x1.10')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('x2.00')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('x3.00')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('x1.00 » x1.10')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('x1.10 » x1.20')
      expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe('x2.90 » x3.00')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('x3.00')
    })

    it('Missile Amplifier uses calculator Value with x (x1.00 + 1.50/level)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Missile Amplifier')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 25
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('x2.50')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('x31.00')
      expect(benefitDisplayForCard(lab!, 25, max)).toBe('x38.50')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('x1.00 » x2.50')
      expect(benefitLineWithNextUpgrade(lab!, 24, max)).toBe('x37.00 » x38.50')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('x38.50')
    })

    it('Missile Barrage Quantity uses calculator Value (20 + 5/level)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Missile Barrage Quantity')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 6
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('20')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('25')
      expect(benefitDisplayForCard(lab!, 6, max)).toBe('50')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('20 » 25')
      expect(benefitLineWithNextUpgrade(lab!, 5, max)).toBe('45 » 50')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('50')
    })

    it('Recharge Missile Barrage uses calculator Value per level (wiki table)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Recharge Missile Barrage')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 7
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('1750 waves')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('1500 waves')
      expect(benefitDisplayForCard(lab!, 5, max)).toBe('500 waves')
      expect(benefitDisplayForCard(lab!, 7, max)).toBe('200 waves')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe(
        '1750 waves » 1500 waves',
      )
      expect(benefitLineWithNextUpgrade(lab!, 6, max)).toBe('350 waves » 200 waves')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('200 waves')
    })

    it('Recharge Missile Barrage tower-labs match Recharge Nuke tier (cost + duration)', () => {
      expect(toolkitMarginalCoinCost('Recharge Missile Barrage', 0)).toBe(
        550_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Recharge Missile Barrage', 0)).toBe(
        449940,
      )
      expect(toolkitMarginalCoinCost('Recharge Missile Barrage', 6)).toBe(
        3_600_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Recharge Missile Barrage', 6)).toBe(
        4435860,
      )
    })

    it('Chrono Field Duration uses calculator Value (1.00 per level)', () => {
      const c = ultimate.items.find((i) => i.name === 'Chrono Field Duration')
      expect(c).toBeDefined()
      const max = c!.maxLevel ?? 30
      expect(benefitDisplayForCard(c!, 0, max)).toBe('0.00')
      expect(benefitDisplayForCard(c!, 1, max)).toBe('1.00')
      expect(benefitDisplayForCard(c!, 30, max)).toBe('30.00')
      expect(benefitLineWithNextUpgrade(c!, 0, max)).toBe('0.00 » 1.00')
      expect(benefitLineWithNextUpgrade(c!, 29, max)).toBe('29.00 » 30.00')
      expect(benefitLineWithNextUpgrade(c!, max, max)).toBe('30.00')
    })

    it('Chrono Field Reduction % uses 10.00% + 0.50%/level (calculator Value)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Chrono Field Reduction %')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('10.00%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('10.50%')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('15.00%')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('25.00%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('10.00% » 10.50%')
      expect(benefitLineWithNextUpgrade(lab!, 29, max)).toBe('24.50% » 25.00%')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('25.00%')
    })

    it('Chrono Field Range uses calculator Value with + and m (3.00m per level)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Chrono Field Range')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+0.00m')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+3.00m')
      expect(benefitDisplayForCard(lab!, 7, max)).toBe('+21.00m')
      expect(benefitDisplayForCard(lab!, 8, max)).toBe('+24.00m')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('+30.00m')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('+60.00m')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('+0.00m » +3.00m')
      expect(benefitLineWithNextUpgrade(lab!, 7, max)).toBe('+21.00m » +24.00m')
      expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe('+57.00m » +60.00m')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('+60.00m')
    })

    it('Missile Radius uses 0.30 + 0.05/level (calculator Value)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Missile Radius')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0.30')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('0.35')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('0.80')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('1.30')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0.30 » 0.35')
      expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe('1.25 » 1.30')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('1.30')
    })

    it('Swamp Radius uses +0.04/level (calculator Value)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Swamp Radius')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+0.00')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+0.04')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('+0.40')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('+1.20')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('+0.00 » +0.04')
      expect(benefitLineWithNextUpgrade(lab!, 29, max)).toBe('+1.16 » +1.20')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('+1.20')
    })

    it('Swamp Stun Chance uses +5% + 2.50%/level (Include %)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Swamp Stun Chance')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+5.00%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+7.50%')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('+30.00%')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('+80.00%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('+5.00% » +7.50%')
      expect(benefitLineWithNextUpgrade(lab!, 29, max)).toBe(
        '+77.50% » +80.00%',
      )
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('+80.00%')
    })

    it('Swamp Stun Time uses +1.00s + 0.30s/level (calculator Value)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Swamp Stun Time')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+1.00s')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+1.30s')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('+4.00s')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('+10.00s')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('+1.00s » +1.30s')
      expect(benefitLineWithNextUpgrade(lab!, 29, max)).toBe(
        '+9.70s » +10.00s',
      )
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('+10.00s')
    })

    it('Swamp Rend uses calculator Value (3%/level rend on basics, 90% max)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Swamp Rend')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('3%')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('30%')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('90%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0% » 3%')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('3% » 6%')
      expect(benefitLineWithNextUpgrade(lab!, 29, max)).toBe('87% » 90%')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('90%')
    })

    it('Swamp Rend labs have tower-labs marginal coin costs', () => {
      expect(toolkitMarginalCoinCost('Swamp Rend', 0)).toBe(100_000_000_000)
      expect(toolkitMarginalCoinCost('Swamp Rend', 29)).toBe(
        12_780_000_000_000_000,
      )
      expect(toolkitMarginalCoinCost('Swamp Rend - Additional Enemies', 0)).toBe(
        100_000_000_000,
      )
      expect(toolkitMarginalCoinCost('Swamp Rend - Additional Enemies', 5)).toBe(
        759_380_000_000,
      )
    })

    it('Swamp Rend - Additional Enemies uses wiki Value labels per level', () => {
      const lab = ultimate.items.find(
        (i) => i.name === 'Swamp Rend - Additional Enemies',
      )
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 6
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('—')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('Ranged enemies')
      expect(benefitDisplayForCard(lab!, 2, max)).toBe('Fast enemies')
      expect(benefitDisplayForCard(lab!, 3, max)).toBe('Tank Enemies')
      expect(benefitDisplayForCard(lab!, 6, max)).toBe('Vampire')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('Ranged enemies')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe(
        'Ranged enemies » Fast enemies',
      )
      expect(benefitLineWithNextUpgrade(lab!, 5, max)).toBe(
        'Boss Enemies » Vampire',
      )
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('Vampire')
    })

    it('Chain Thunder uses calculator Value (3%/level max reduction, 90% cap)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Chain Thunder')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('3%')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('90%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0% » 3%')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('90%')
    })

    it('Chain Thunder and Lightning Amplifier - Scatter use tower-labs costs/times', () => {
      expect(toolkitMarginalCoinCost('Chain Thunder', 0)).toBe(100_000_000_000)
      expect(toolkitMarginalCoinCost('Chain Thunder', 29)).toBe(
        12_780_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Chain Thunder', 0)).toBe(719940)
      expect(toolkitUpgradeDurationSeconds('Chain Thunder', 1)).toBe(806400)
      expect(toolkitMarginalCoinCost('Lightning Amplifier - Scatter', 0)).toBe(
        100_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Lightning Amplifier - Scatter', 0)).toBe(
        720000,
      )
    })

    it('Lightning Amplifier - Scatter uses calculator Value (x1.25 × level)', () => {
      const lab = ultimate.items.find(
        (i) => i.name === 'Lightning Amplifier - Scatter',
      )
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('x0')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('x1.25')
      expect(benefitDisplayForCard(lab!, 2, max)).toBe('x2.5')
      expect(benefitDisplayForCard(lab!, 4, max)).toBe('x5')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('x12.5')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('x25')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('x37.5')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('x0 » x1.25')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('x1.25 » x2.5')
      expect(benefitLineWithNextUpgrade(lab!, 29, max)).toBe('x36.25 » x37.5')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('x37.5')
    })

    it('Golden Tower Bonus uses 0.15/level (calculator Value)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Golden Tower Bonus')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 25
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+0.00')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+0.15')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('+1.50')
      expect(benefitDisplayForCard(lab!, 25, max)).toBe('+3.75')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('+0.00 » +0.15')
      expect(benefitLineWithNextUpgrade(lab!, 24, max)).toBe('+3.60 » +3.75')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('+3.75')
    })

    it('Golden Tower Duration uses +1.0s/level display (one decimal)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Golden Tower Duration')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+0.0s')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+1.0s')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('+10.0s')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('+20.0s')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('+0.0s » +1.0s')
      expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe(
        '+19.0s » +20.0s',
      )
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('+20.0s')
    })

    it('Missiles Explosion is a single-level unlock (no » benefit line)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Missiles Explosion')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 1
      expect(benefitDisplayForCard(lab!, 0, max)).toBe(
        'Unlock Missiles Explosion',
      )
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe(
        'Unlock Missiles Explosion',
      )
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('Unlocked')
    })

    it('Missile Barrage is a single-level unlock (no » benefit line)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Missile Barrage')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 1
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('Unlock Missile Barrage')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('Unlock Missile Barrage')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('Unlocked')
    })

    it('Chrono Field Damage Reduction is a single-level unlock (no » benefit line)', () => {
      const lab = ultimate.items.find(
        (i) => i.name === 'Chrono Field Damage Reduction',
      )
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 1
      expect(benefitDisplayForCard(lab!, 0, max)).toBe(
        'Unlock Chrono Field Damage Reduction',
      )
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe(
        'Unlock Chrono Field Damage Reduction',
      )
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('Unlocked')
    })

    it('Swamp Stun is a single-level unlock (no » benefit line)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Swamp Stun')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 1
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('Unlock Swamp Stun')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('Unlock Swamp Stun')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('Unlocked')
    })

    it('Chain Lightning Shock is a single-level unlock (no » benefit line)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Chain Lightning Shock')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 1
      expect(benefitDisplayForCard(lab!, 0, max)).toBe(
        'Unlock Chain Lightning Shock',
      )
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe(
        'Unlock Chain Lightning Shock',
      )
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('Unlocked')
    })

    it('Shock Chance uses calculator Value with % (2.50% + 0.50%/level)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Shock Chance')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('2.50%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('3.00%')
      expect(benefitDisplayForCard(lab!, 5, max)).toBe('5.00%')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('7.50%')
      expect(benefitDisplayForCard(lab!, 15, max)).toBe('10.00%')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('17.50%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('2.50% » 3.00%')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('3.00% » 3.50%')
      expect(benefitLineWithNextUpgrade(lab!, 29, max)).toBe('17.00% » 17.50%')
      expect(benefitLineWithNextUpgrade(lab!, 30, max)).toBe('17.50%')
    })

    it('Shock Multiplier uses calculator Value with x (x1.10 + 0.04/level)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Shock Multiplier')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 14
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('x1.10')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('x1.14')
      expect(benefitDisplayForCard(lab!, 5, max)).toBe('x1.30')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('x1.50')
      expect(benefitDisplayForCard(lab!, 14, max)).toBe('x1.66')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('x1.10 » x1.14')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('x1.14 » x1.18')
      expect(benefitLineWithNextUpgrade(lab!, 13, max)).toBe('x1.62 » x1.66')
      expect(benefitLineWithNextUpgrade(lab!, 14, max)).toBe('x1.66')
    })

    it('Death Wave Health uses calculator Value with % (500% + 25%/level)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Death Wave Health')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('500%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('525%')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('750%')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('1250%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('500% » 525%')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('525% » 550%')
      expect(benefitLineWithNextUpgrade(lab!, 29, max)).toBe(
        '1225% » 1250%',
      )
      expect(benefitLineWithNextUpgrade(lab!, 30, max)).toBe('1250%')
    })

    it('Death Wave Coin Bonus uses calculator Value (x1.50 + 0.05/level)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Death Wave Coin Bonus')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('x1.50')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('x1.55')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('x2.00')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('x2.50')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('x1.50 » x1.55')
      expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe('x2.45 » x2.50')
      expect(benefitLineWithNextUpgrade(lab!, 20, max)).toBe('x2.50')
    })

    it('Death Wave Cells Bonus uses calculator Value (x1.00 + 0.10/level)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Death Wave Cells Bonus')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('x1.10')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('x2.00')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('x3.00')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('x1.00 » x1.10')
      expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe('x2.90 » x3.00')
      expect(benefitLineWithNextUpgrade(lab!, 20, max)).toBe('x3.00')
    })

    it('Death Wave Cells Bonus tower-labs match wiki time/cost (row 1 and max)', () => {
      expect(toolkitMarginalCoinCost('Death Wave Cells Bonus', 0)).toBe(1_000_000_000)
      expect(toolkitUpgradeDurationSeconds('Death Wave Cells Bonus', 0)).toBe(
        279999,
      )
      expect(toolkitMarginalCoinCost('Death Wave Cells Bonus', 19)).toBe(
        2_220_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Death Wave Cells Bonus', 19)).toBe(
        2411573,
      )
    })

    it('Death Wave Damage Amplifier uses calculator Value (x5.00 + 1.50/level)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Death Wave Damage Amplifier')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('x5.00')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('x6.50')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('x20.00')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('x50.00')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('x5.00 » x6.50')
      expect(benefitLineWithNextUpgrade(lab!, 29, max)).toBe('x48.50 » x50.00')
      expect(benefitLineWithNextUpgrade(lab!, 30, max)).toBe('x50.00')
    })

    it('Death Wave Armor Stripping uses calculator Value (1.00 per level)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Death Wave Armor Stripping')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 10
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0.00')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('1.00')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('10.00')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0.00 » 1.00')
      expect(benefitLineWithNextUpgrade(lab!, 9, max)).toBe('9.00 » 10.00')
      expect(benefitLineWithNextUpgrade(lab!, 10, max)).toBe('10.00')
    })

    it('Inner Mine Blast Radius uses +1.40 + 0.10/level display', () => {
      const lab = ultimate.items.find((i) => i.name === 'Inner Mine Blast Radius')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+1.40')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+1.50')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('+2.40')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('+3.40')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('+1.40 » +1.50')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('+1.50 » +1.60')
      expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe('+3.30 » +3.40')
      expect(benefitLineWithNextUpgrade(lab!, 20, max)).toBe('+3.40')
    })

    it('Inner Mine Rotation Speed uses calculator Value (0.80/level)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Inner Mine Rotation Speed')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 20
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0.00')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('0.80')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('8.00')
      expect(benefitDisplayForCard(lab!, 20, max)).toBe('16.00')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0.00 » 0.80')
      expect(benefitLineWithNextUpgrade(lab!, 19, max)).toBe('15.20 » 16.00')
      expect(benefitLineWithNextUpgrade(lab!, 20, max)).toBe('16.00')
    })

    it('Inner Land Mine - Chrono Jump uses calculator Value (5s/level)', () => {
      const lab = ultimate.items.find(
        (i) => i.name === 'Inner Land Mine - Chrono Jump',
      )
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 10
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0s')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('5s')
      expect(benefitDisplayForCard(lab!, 6, max)).toBe('30s')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('50s')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0s » 5s')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('5s » 10s')
      expect(benefitLineWithNextUpgrade(lab!, 9, max)).toBe('45s » 50s')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('50s')
    })

    it('Inner Land Mine - Chrono Jump tower-labs match wiki row 1 and row 6', () => {
      expect(toolkitMarginalCoinCost('Inner Land Mine - Chrono Jump', 0)).toBe(
        1_000_000_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Inner Land Mine - Chrono Jump', 0)).toBe(
        1440000,
      )
      expect(toolkitUpgradeDurationSeconds('Inner Land Mine - Chrono Jump', 5)).toBe(
        8640600,
      )
      expect(toolkitMarginalCoinCost('Inner Land Mine - Chrono Jump', 9)).toBe(
        639_400_000_000_000_000,
      )
    })

    it('Inner Mine Stun is a single-level unlock (no » benefit line)', () => {
      const lab = ultimate.items.find((i) => i.name === 'Inner Mine Stun')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 1
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('Unlock Inner Mine Stun')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('Unlock Inner Mine Stun')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('Unlocked')
    })
  })

  describe('CARDS RESEARCH spot checks', () => {
    const cards = loadAllSections().find((s) => s.title === 'CARDS RESEARCH')
    if (!cards) throw new Error('fixture missing CARDS RESEARCH')

    it('Second Wind Blast uses calculator Value (25%/level, 100% max)', () => {
      const lab = cards.items.find((i) => i.name === 'Second Wind Blast')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 4
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('25%')
      expect(benefitDisplayForCard(lab!, 4, max)).toBe('100%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0% » 25%')
      expect(benefitLineWithNextUpgrade(lab!, 3, max)).toBe('75% » 100%')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('100%')
    })

    it('Second Wind Blast tower-labs match wiki row 1 and row 4', () => {
      expect(toolkitMarginalCoinCost('Second Wind Blast', 0)).toBe(1_800_000)
      expect(toolkitUpgradeDurationSeconds('Second Wind Blast', 0)).toBe(
        99_960,
      )
      expect(toolkitMarginalCoinCost('Second Wind Blast', 3)).toBe(75_000_000)
      expect(toolkitUpgradeDurationSeconds('Second Wind Blast', 3)).toBe(
        299_940,
      )
    })

    it('Recharge Second Wind uses wiki Value table (waves)', () => {
      const lab = cards.items.find((i) => i.name === 'Recharge Second Wind')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 7
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('—')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('2000 waves')
      expect(benefitDisplayForCard(lab!, 4, max)).toBe('1000 waves')
      expect(benefitDisplayForCard(lab!, 7, max)).toBe('400 waves')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('2000 waves')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe(
        '2000 waves » 1500 waves',
      )
      expect(benefitLineWithNextUpgrade(lab!, 6, max)).toBe('550 waves » 400 waves')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('400 waves')
    })

    it('Recharge Second Wind tower-labs match wiki row 1 and row 3', () => {
      expect(toolkitMarginalCoinCost('Recharge Second Wind', 0)).toBe(
        550_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Recharge Second Wind', 0)).toBe(
        449940,
      )
      expect(toolkitUpgradeDurationSeconds('Recharge Second Wind', 2)).toBe(
        694479,
      )
    })

    it('Recharge Demon Mode uses wiki Value table (waves)', () => {
      const lab = cards.items.find((i) => i.name === 'Recharge Demon Mode')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 7
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('—')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('1500 waves')
      expect(benefitDisplayForCard(lab!, 4, max)).toBe('750 waves')
      expect(benefitDisplayForCard(lab!, 7, max)).toBe('300 waves')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('1500 waves')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe(
        '1500 waves » 1250 waves',
      )
      expect(benefitLineWithNextUpgrade(lab!, 6, max)).toBe(
        '400 waves » 300 waves',
      )
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('300 waves')
    })

    it('Recharge Demon Mode tower-labs match wiki row 1 and row 7', () => {
      expect(toolkitMarginalCoinCost('Recharge Demon Mode', 0)).toBe(
        550_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Recharge Demon Mode', 0)).toBe(
        449940,
      )
      expect(toolkitMarginalCoinCost('Recharge Demon Mode', 6)).toBe(
        3_600_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Recharge Demon Mode', 6)).toBe(
        4435860,
      )
    })

    it('Recharge Nuke uses wiki Value table (waves)', () => {
      const lab = cards.items.find((i) => i.name === 'Recharge Nuke')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 7
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('—')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('1500 waves')
      expect(benefitDisplayForCard(lab!, 4, max)).toBe('750 waves')
      expect(benefitDisplayForCard(lab!, 7, max)).toBe('300 waves')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('1500 waves')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('300 waves')
    })

    it('Recharge Nuke tower-labs match wiki row 1', () => {
      expect(toolkitMarginalCoinCost('Recharge Nuke', 0)).toBe(550_000_000_000)
      expect(toolkitUpgradeDurationSeconds('Recharge Nuke', 0)).toBe(449940)
    })

    it('Double Death Ray uses calculator Chance (1%/level, 30% max)', () => {
      const lab = cards.items.find((i) => i.name === 'Double Death Ray')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('1%')
      expect(benefitDisplayForCard(lab!, 15, max)).toBe('15%')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('30%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0% » 1%')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('1% » 2%')
      expect(benefitLineWithNextUpgrade(lab!, 29, max)).toBe('29% » 30%')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('30%')
    })

    it('Double Death Ray tower-labs match wiki row 1', () => {
      expect(toolkitMarginalCoinCost('Double Death Ray', 0)).toBe(2_500_000)
      expect(toolkitUpgradeDurationSeconds('Double Death Ray', 0)).toBe(3599)
    })

    it('Extra Orb Adjuster is a single-level unlock (no » benefit line)', () => {
      const lab = cards.items.find((i) => i.name === 'Extra Orb Adjuster')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 1
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('Unlock Extra Orb Adjuster')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe(
        'Unlock Extra Orb Adjuster',
      )
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('Unlocked')
    })

    it('Extra Extra Orbs uses calculator Value (+1 per level)', () => {
      const lab = cards.items.find((i) => i.name === 'Extra Extra Orbs')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 2
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+0')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+1')
      expect(benefitDisplayForCard(lab!, 2, max)).toBe('+2')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('+0 » +1')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('+1 » +2')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('+2')
    })

    it('Extra Extra Orbs tower-labs resolve via Extra Inner Orbs key', () => {
      expect(toolkitMarginalCoinCost('Extra Extra Orbs', 0)).toBe(25_000_000)
      expect(toolkitMarginalCoinCost('Extra Extra Orbs', 1)).toBe(900_000_000)
      expect(toolkitUpgradeDurationSeconds('Extra Extra Orbs', 0)).toBe(139980)
    })

    it('Energy Shield Extra Hit uses calculator Value (integer hits = level)', () => {
      const lab = cards.items.find((i) => i.name === 'Energy Shield Extra Hit')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 2
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('1')
      expect(benefitDisplayForCard(lab!, 2, max)).toBe('2')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0 » 1')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('1 » 2')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('2')
    })

    it('Energy Shield Extra Hit tower-labs match wiki row 1', () => {
      expect(toolkitMarginalCoinCost('Energy Shield Extra Hit', 0)).toBe(
        40_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Energy Shield Extra Hit', 0)).toBe(
        999960,
      )
    })

    it('Super Tower Bonus uses calculator Value (x1.00 + 0.03/level)', () => {
      const lab = cards.items.find((i) => i.name === 'Super Tower Bonus')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 30
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('x1.03')
      expect(benefitDisplayForCard(lab!, 4, max)).toBe('x1.12')
      expect(benefitDisplayForCard(lab!, 30, max)).toBe('x1.90')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('x1.00 » x1.03')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('x1.03 » x1.06')
      expect(benefitLineWithNextUpgrade(lab!, 29, max)).toBe('x1.87 » x1.90')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('x1.90')
    })

    it('Super Tower Bonus tower-labs match wiki row 1', () => {
      expect(toolkitMarginalCoinCost('Super Tower Bonus', 0)).toBe(2_000_000_000)
      expect(toolkitUpgradeDurationSeconds('Super Tower Bonus', 0)).toBe(17940)
    })
  })

  describe('PERKS RESEARCH spot checks', () => {
    const perks = loadAllSections().find((s) => s.title === 'PERKS RESEARCH')
    if (!perks) throw new Error('fixture missing PERKS RESEARCH')

    it('Unlock Perks is a single-level unlock (wiki Value Unlocked)', () => {
      const lab = perks.items.find((i) => i.name === 'Unlock Perks')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 1
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('Unlock Perks')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('Unlock Perks')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('Unlocked')
    })

    it('Unlock Perks tower-labs match wiki row 1', () => {
      expect(toolkitMarginalCoinCost('Unlock Perks', 0)).toBe(1_500_000)
      expect(toolkitUpgradeDurationSeconds('Unlock Perks', 0)).toBe(299_940)
    })

    it('Auto Pick Perks is a single-level unlock (wiki Value Unlocked)', () => {
      const lab = perks.items.find((i) => i.name === 'Auto Pick Perks')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 1
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('Unlock Auto Pick Perks')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe(
        'Unlock Auto Pick Perks',
      )
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('Unlocked')
    })

    it('Auto Pick Perks tower-labs match wiki row 1', () => {
      expect(toolkitMarginalCoinCost('Auto Pick Perks', 0)).toBe(100_000_000)
      expect(toolkitUpgradeDurationSeconds('Auto Pick Perks', 0)).toBe(429_960)
    })

    it('Perk Option Quantity uses +1 per lab level (+0 … +2)', () => {
      const lab = perks.items.find((i) => i.name === 'Perk Option Quantity')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 2
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('+0')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('+1')
      expect(benefitDisplayForCard(lab!, 2, max)).toBe('+2')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('+0 » +1')
      expect(benefitLineWithNextUpgrade(lab!, 1, max)).toBe('+1 » +2')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('+2')
    })

    it('Perk Option Quantity tower-labs match wiki rows 1–2', () => {
      expect(toolkitMarginalCoinCost('Perk Option Quantity', 0)).toBe(2_000_000)
      expect(toolkitUpgradeDurationSeconds('Perk Option Quantity', 0)).toBe(
        429_960,
      )
      expect(toolkitMarginalCoinCost('Perk Option Quantity', 1)).toBe(
        2_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Perk Option Quantity', 1)).toBe(
        879_960,
      )
    })

    it('Ban Perks Value equals lab level (0 … 8)', () => {
      const lab = perks.items.find((i) => i.name === 'Ban Perks')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 8
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('1')
      expect(benefitDisplayForCard(lab!, 8, max)).toBe('8')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0 » 1')
      expect(benefitLineWithNextUpgrade(lab!, 7, max)).toBe('7 » 8')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('8')
    })

    it('Ban Perks tower-labs match wiki rows 1 and 5', () => {
      expect(toolkitMarginalCoinCost('Ban Perks', 0)).toBe(10_000_000)
      expect(toolkitUpgradeDurationSeconds('Ban Perks', 0)).toBe(199_980)
      expect(toolkitMarginalCoinCost('Ban Perks', 4)).toBe(100_000_000_000)
      expect(toolkitUpgradeDurationSeconds('Ban Perks', 4)).toBe(3_600_900)
    })

    it('Auto Pick Ranking Value equals lab level (0 … 32)', () => {
      const lab = perks.items.find((i) => i.name === 'Auto Pick Ranking')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 32
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('1')
      expect(benefitDisplayForCard(lab!, 32, max)).toBe('32')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0 » 1')
      expect(benefitLineWithNextUpgrade(lab!, 31, max)).toBe('31 » 32')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('32')
    })

    it('Auto Pick Ranking tower-labs match wiki rows 1, 24, and 32', () => {
      expect(toolkitMarginalCoinCost('Auto Pick Ranking', 0)).toBe(100_000)
      expect(toolkitUpgradeDurationSeconds('Auto Pick Ranking', 0)).toBe(171_960)
      expect(toolkitMarginalCoinCost('Auto Pick Ranking', 23)).toBe(
        40_260_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Auto Pick Ranking', 23)).toBe(
        21_084_138,
      )
      expect(toolkitMarginalCoinCost('Auto Pick Ranking', 31)).toBe(
        154_260_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Auto Pick Ranking', 31)).toBe(
        66_301_200,
      )
    })

    it('Waves Required Value is −1 × lab level (plain ints: 0, -1 … -100)', () => {
      const lab = perks.items.find((i) => i.name === 'Waves Required')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 100
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('-1')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('-10')
      expect(benefitDisplayForCard(lab!, 100, max)).toBe('-100')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0 » -1')
      expect(benefitLineWithNextUpgrade(lab!, 5, max)).toBe('-5 » -6')
      expect(benefitLineWithNextUpgrade(lab!, 99, max)).toBe('-99 » -100')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('-100')
    })

    it('Waves Required tower-labs match wiki rows 1 and 100', () => {
      expect(toolkitMarginalCoinCost('Waves Required', 0)).toBe(100_000)
      expect(toolkitUpgradeDurationSeconds('Waves Required', 0)).toBe(5940)
      expect(toolkitMarginalCoinCost('Waves Required', 99)).toBe(
        190_200_000_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Waves Required', 99)).toBe(
        676_998_780,
      )
    })

    it('Standard Perks Bonus Value is n% at lab level n (wiki 1% … 25%)', () => {
      const lab = perks.items.find((i) => i.name === 'Standard Perks Bonus')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 25
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('1%')
      expect(benefitDisplayForCard(lab!, 25, max)).toBe('25%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0% » 1%')
      expect(benefitLineWithNextUpgrade(lab!, 24, max)).toBe('24% » 25%')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('25%')
    })

    it('Standard Perks Bonus tower-labs match wiki rows 1 and 25', () => {
      expect(toolkitMarginalCoinCost('Standard Perks Bonus', 0)).toBe(100_000)
      expect(toolkitUpgradeDurationSeconds('Standard Perks Bonus', 0)).toBe(
        5940,
      )
      expect(toolkitMarginalCoinCost('Standard Perks Bonus', 24)).toBe(
        238_880_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Standard Perks Bonus', 24)).toBe(
        5_082_600,
      )
    })

    it('First Perk Choice is a single-level unlock (wiki Value Unlocked)', () => {
      const lab = perks.items.find((i) => i.name === 'First Perk Choice')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 1
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('Unlock First Perk Choice')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('Unlocked')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe(
        'Unlock First Perk Choice',
      )
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('Unlocked')
    })

    it('First Perk Choice tower-labs match wiki row 1', () => {
      expect(toolkitMarginalCoinCost('First Perk Choice', 0)).toBe(1_000_000_000)
      expect(toolkitUpgradeDurationSeconds('First Perk Choice', 0)).toBe(
        399_960,
      )
    })

    it('Improve Trade-off Perks Value is n% at lab level n (wiki 1% … 10%)', () => {
      const lab = perks.items.find((i) => i.name === 'Improve Trade-off Perks')
      expect(lab).toBeDefined()
      const max = lab!.maxLevel ?? 10
      expect(benefitDisplayForCard(lab!, 0, max)).toBe('0%')
      expect(benefitDisplayForCard(lab!, 1, max)).toBe('1%')
      expect(benefitDisplayForCard(lab!, 10, max)).toBe('10%')
      expect(benefitLineWithNextUpgrade(lab!, 0, max)).toBe('0% » 1%')
      expect(benefitLineWithNextUpgrade(lab!, 9, max)).toBe('9% » 10%')
      expect(benefitLineWithNextUpgrade(lab!, max, max)).toBe('10%')
    })

    it('Improve Trade-off Perks tower-labs match wiki rows 1 and 10', () => {
      expect(toolkitMarginalCoinCost('Improve Trade-off Perks', 0)).toBe(
        600_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Improve Trade-off Perks', 0)).toBe(
        89_940,
      )
      expect(toolkitMarginalCoinCost('Improve Trade-off Perks', 9)).toBe(
        4_920_000_000,
      )
      expect(toolkitUpgradeDurationSeconds('Improve Trade-off Perks', 9)).toBe(
        730_680,
      )
    })
  })

  describe('DEFENSE RESEARCH spot checks', () => {
    const defense = loadAllSections().find((s) => s.title === 'DEFENSE RESEARCH')
    if (!defense) throw new Error('fixture missing DEFENSE RESEARCH')

    it('Health uses calculator Value (+0.03/level x…, same curve as Critical Factor)', () => {
      const h = defense.items.find((i) => i.name === 'Health')
      expect(h).toBeDefined()
      const max = h!.maxLevel ?? 100
      expect(benefitDisplayForCard(h!, 0, max)).toBe('x1.00')
      expect(benefitDisplayForCard(h!, 1, max)).toBe('x1.03')
      expect(benefitDisplayForCard(h!, 29, max)).toBe('x1.87')
      expect(benefitDisplayForCard(h!, 100, max)).toBe('x4.00')
      expect(benefitLineWithNextUpgrade(h!, 0, max)).toBe('x1.00 » x1.03')
      expect(benefitLineWithNextUpgrade(h!, max, max)).toBe('x4.00')
    })

    it('Health Regen matches Health wiki ladder (100 levels; same marginal cost/time)', () => {
      const regen = defense.items.find((i) => i.name === 'Health Regen')
      const abs = defense.items.find((i) => i.name === 'Defense Absolute')
      expect(regen).toBeDefined()
      expect(abs).toBeDefined()
      const maxR = regen!.maxLevel ?? 100
      const maxA = abs!.maxLevel ?? 100
      expect(benefitDisplayForCard(regen!, 0, maxR)).toBe('x1.00')
      expect(benefitDisplayForCard(regen!, 1, maxR)).toBe('x1.03')
      expect(benefitDisplayForCard(regen!, 29, maxR)).toBe('x1.87')
      expect(benefitDisplayForCard(regen!, 100, maxR)).toBe('x4.00')
      expect(benefitLineWithNextUpgrade(regen!, 0, maxR)).toBe('x1.00 » x1.03')
      expect(benefitLineWithNextUpgrade(regen!, maxR, maxR)).toBe('x4.00')
      expect(toolkitMarginalCoinCost('Health Regen', 0)).toBe(30)
      expect(toolkitMarginalCoinCost('Health Regen', 99)).toBe(4_310_000)
      expect(toolkitUpgradeDurationSeconds('Health Regen', 0)).toBe(14)
      expect(toolkitUpgradeDurationSeconds('Health Regen', 99)).toBe(4_341_120)
      for (const level of [17, 59, 98]) {
        expect(toolkitMarginalCoinCost('Health Regen', level)).toBe(
          toolkitMarginalCoinCost('Health', level),
        )
        expect(toolkitUpgradeDurationSeconds('Health Regen', level)).toBe(
          toolkitUpgradeDurationSeconds('Health', level),
        )
      }
      expect(benefitDisplayForCard(abs!, 100, maxA)).toBe('x4.00')
    })

    it('Defense % uses calculator Value (+0.20% per level, Include %)', () => {
      const dp = defense.items.find((i) => i.name === 'Defense %')
      expect(dp).toBeDefined()
      const max = dp!.maxLevel ?? 50
      expect(benefitDisplayForCard(dp!, 0, max)).toBe('+0.00%')
      expect(benefitDisplayForCard(dp!, 1, max)).toBe('+0.20%')
      expect(benefitDisplayForCard(dp!, 29, max)).toBe('+5.80%')
      expect(benefitDisplayForCard(dp!, 50, max)).toBe('+10.00%')
      expect(benefitLineWithNextUpgrade(dp!, 0, max)).toBe('+0.00% » +0.20%')
      expect(benefitLineWithNextUpgrade(dp!, 49, max)).toBe('+9.80% » +10.00%')
      expect(benefitLineWithNextUpgrade(dp!, max, max)).toBe('+10.00%')
    })

    it('Orb Boss Hit uses calculator Value (0.20%/level boss HP, 2.00% max)', () => {
      const obh = defense.items.find((i) => i.name === 'Orb Boss Hit')
      expect(obh).toBeDefined()
      const max = obh!.maxLevel ?? 10
      expect(benefitDisplayForCard(obh!, 0, max)).toBe('0.00%')
      expect(benefitDisplayForCard(obh!, 1, max)).toBe('0.20%')
      expect(benefitDisplayForCard(obh!, 10, max)).toBe('2.00%')
      expect(benefitLineWithNextUpgrade(obh!, 0, max)).toBe('0.00% » 0.20%')
      expect(benefitLineWithNextUpgrade(obh!, 9, max)).toBe('1.80% » 2.00%')
      expect(benefitLineWithNextUpgrade(obh!, max, max)).toBe('2.00%')
    })

    it('Wall Health uses calculator Value (+2.00% per level, Include %)', () => {
      const wh = defense.items.find((i) => i.name === 'Wall Health')
      expect(wh).toBeDefined()
      const max = wh!.maxLevel ?? 50
      expect(benefitDisplayForCard(wh!, 0, max)).toBe('+0.00%')
      expect(benefitDisplayForCard(wh!, 1, max)).toBe('+2.00%')
      expect(benefitDisplayForCard(wh!, 29, max)).toBe('+58.00%')
      expect(benefitDisplayForCard(wh!, 50, max)).toBe('+100.00%')
      expect(benefitLineWithNextUpgrade(wh!, 0, max)).toBe('+0.00% » +2.00%')
      expect(benefitLineWithNextUpgrade(wh!, max, max)).toBe('+100.00%')
    })

    it('Wall Regen uses calculator Value (+10.00% per level, Include %)', () => {
      const wrg = defense.items.find((i) => i.name === 'Wall Regen')
      expect(wrg).toBeDefined()
      const max = wrg!.maxLevel ?? 30
      expect(benefitDisplayForCard(wrg!, 0, max)).toBe('+0.00%')
      expect(benefitDisplayForCard(wrg!, 1, max)).toBe('+10.00%')
      expect(benefitDisplayForCard(wrg!, 10, max)).toBe('+100.00%')
      expect(benefitDisplayForCard(wrg!, 30, max)).toBe('+300.00%')
      expect(benefitLineWithNextUpgrade(wrg!, 0, max)).toBe('+0.00% » +10.00%')
      expect(benefitLineWithNextUpgrade(wrg!, max, max)).toBe('+300.00%')
    })

    it('Wall Thorns uses calculator Value (+1.00% per level, Include %)', () => {
      const wt = defense.items.find((i) => i.name === 'Wall Thorns')
      expect(wt).toBeDefined()
      const max = wt!.maxLevel ?? 20
      expect(benefitDisplayForCard(wt!, 0, max)).toBe('+0.00%')
      expect(benefitDisplayForCard(wt!, 1, max)).toBe('+1.00%')
      expect(benefitDisplayForCard(wt!, 10, max)).toBe('+10.00%')
      expect(benefitDisplayForCard(wt!, 20, max)).toBe('+20.00%')
      expect(benefitLineWithNextUpgrade(wt!, 0, max)).toBe('+0.00% » +1.00%')
      expect(benefitLineWithNextUpgrade(wt!, max, max)).toBe('+20.00%')
    })

    it('Wall Fortification uses calculator Value (+20.00% per level, Include %)', () => {
      const wf = defense.items.find((i) => i.name === 'Wall Fortification')
      expect(wf).toBeDefined()
      const max = wf!.maxLevel ?? 60
      expect(benefitDisplayForCard(wf!, 0, max)).toBe('+0.00%')
      expect(benefitDisplayForCard(wf!, 1, max)).toBe('+20.00%')
      expect(benefitDisplayForCard(wf!, 29, max)).toBe('+580.00%')
      expect(benefitDisplayForCard(wf!, 60, max)).toBe('+1200.00%')
      expect(benefitLineWithNextUpgrade(wf!, 0, max)).toBe('+0.00% » +20.00%')
      expect(benefitLineWithNextUpgrade(wf!, max, max)).toBe('+1200.00%')
    })

    it('Garlic Thorns uses calculator Value (+0.5% per level, one decimal, Include %)', () => {
      const gt = defense.items.find((i) => i.name === 'Garlic Thorns')
      expect(gt).toBeDefined()
      const max = gt!.maxLevel ?? 10
      expect(benefitDisplayForCard(gt!, 0, max)).toBe('+0.0%')
      expect(benefitDisplayForCard(gt!, 1, max)).toBe('+0.5%')
      expect(benefitDisplayForCard(gt!, 5, max)).toBe('+2.5%')
      expect(benefitDisplayForCard(gt!, 10, max)).toBe('+5.0%')
      expect(benefitLineWithNextUpgrade(gt!, 0, max)).toBe('+0.0% » +0.5%')
      expect(benefitLineWithNextUpgrade(gt!, max, max)).toBe('+5.0%')
    })

    it('Wall Invincibility uses calculator Value (+1.0s per level, one decimal)', () => {
      const wi = defense.items.find((i) => i.name === 'Wall Invincibility')
      expect(wi).toBeDefined()
      const max = wi!.maxLevel ?? 10
      expect(benefitDisplayForCard(wi!, 0, max)).toBe('+0.0s')
      expect(benefitDisplayForCard(wi!, 1, max)).toBe('+1.0s')
      expect(benefitDisplayForCard(wi!, 5, max)).toBe('+5.0s')
      expect(benefitDisplayForCard(wi!, 10, max)).toBe('+10.0s')
      expect(benefitLineWithNextUpgrade(wi!, 0, max)).toBe('+0.0s » +1.0s')
      expect(benefitLineWithNextUpgrade(wi!, max, max)).toBe('+10.0s')
    })

    it('Wall Rebuild uses calculator Value (−10s per level, one decimal)', () => {
      const wr = defense.items.find((i) => i.name === 'Wall Rebuild')
      expect(wr).toBeDefined()
      const max = wr!.maxLevel ?? 20
      expect(benefitDisplayForCard(wr!, 0, max)).toBe('-0.0s')
      expect(benefitDisplayForCard(wr!, 1, max)).toBe('-10.0s')
      expect(benefitDisplayForCard(wr!, 5, max)).toBe('-50.0s')
      expect(benefitDisplayForCard(wr!, 10, max)).toBe('-100.0s')
      expect(benefitDisplayForCard(wr!, 20, max)).toBe('-200.0s')
      expect(benefitLineWithNextUpgrade(wr!, 0, max)).toBe('-0.0s » -10.0s')
      expect(benefitLineWithNextUpgrade(wr!, max, max)).toBe('-200.0s')
    })

    it('Orbs Speed uses calculator stepping (+0.10 per level, no % suffix)', () => {
      const os = defense.items.find((i) => i.name === 'Orbs Speed')
      expect(os).toBeDefined()
      const max = os!.maxLevel ?? 20
      expect(benefitDisplayForCard(os!, 0, max)).toBe('+0.00')
      expect(benefitDisplayForCard(os!, 1, max)).toBe('+0.10')
      expect(benefitDisplayForCard(os!, 20, max)).toBe('+2.00')
      expect(benefitLineWithNextUpgrade(os!, 0, max)).toBe('+0.00 » +0.10')
      expect(benefitLineWithNextUpgrade(os!, max, max)).toBe('+2.00')
    })

    it('Land Mine Damage uses calculator Value (+10% per level, whole number %)', () => {
      const lmd = defense.items.find((i) => i.name === 'Land Mine Damage')
      expect(lmd).toBeDefined()
      const max = lmd!.maxLevel ?? 20
      expect(benefitDisplayForCard(lmd!, 0, max)).toBe('+0%')
      expect(benefitDisplayForCard(lmd!, 1, max)).toBe('+10%')
      expect(benefitDisplayForCard(lmd!, 20, max)).toBe('+200%')
      expect(benefitLineWithNextUpgrade(lmd!, 0, max)).toBe('+0% » +10%')
      expect(benefitLineWithNextUpgrade(lmd!, max, max)).toBe('+200%')
    })

    it('Land Mine Decay uses calculator Value (+0.50s per level, seconds)', () => {
      const decay = defense.items.find((i) => i.name === 'Land Mine Decay')
      expect(decay).toBeDefined()
      const max = decay!.maxLevel ?? 35
      expect(benefitDisplayForCard(decay!, 0, max)).toBe('+0.00s')
      expect(benefitDisplayForCard(decay!, 1, max)).toBe('+0.50s')
      expect(benefitDisplayForCard(decay!, 29, max)).toBe('+14.50s')
      expect(benefitDisplayForCard(decay!, 35, max)).toBe('+17.50s')
      expect(benefitLineWithNextUpgrade(decay!, 0, max)).toBe('+0.00s » +0.50s')
      expect(benefitLineWithNextUpgrade(decay!, max, max)).toBe('+17.50s')
    })

    it('Shockwave Size uses calculator Value (+0.05 per level, + only, trim zeros)', () => {
      const sw = defense.items.find((i) => i.name === 'Shockwave Size')
      expect(sw).toBeDefined()
      const max = sw!.maxLevel ?? 20
      expect(benefitDisplayForCard(sw!, 0, max)).toBe('+0.00')
      expect(benefitDisplayForCard(sw!, 1, max)).toBe('+0.05')
      expect(benefitDisplayForCard(sw!, 2, max)).toBe('+0.1')
      expect(benefitDisplayForCard(sw!, 20, max)).toBe('+1')
      expect(benefitLineWithNextUpgrade(sw!, 0, max)).toBe('+0.00 » +0.05')
      expect(benefitLineWithNextUpgrade(sw!, max, max)).toBe('+1')
    })
  })
})
