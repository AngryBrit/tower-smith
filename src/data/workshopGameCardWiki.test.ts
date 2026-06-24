import { describe, expect, it } from 'vitest'
import {
  formatWorkshopGameCardStarEffect,
  formatWorkshopGameCardStarEffectForDetail,
  formatWorkshopGameCardStarEffectWithMastery,
  WORKSHOP_GAME_CARD_WIKI,
  workshopBerserkerCardRateFromStars,
  workshopEnemyBalanceSpawnStarValue,
  workshopGameCardDescriptionLineForDetail,
  workshopGameCardStarValue,
} from './workshopGameCardWiki'

describe('workshopGameCardWiki', () => {
  it('has 31 cards with seven star values each', () => {
    expect(Object.keys(WORKSHOP_GAME_CARD_WIKI)).toHaveLength(31)
    for (const def of Object.values(WORKSHOP_GAME_CARD_WIKI)) {
      expect(def.stars).toHaveLength(7)
    }
  })

  it('formats damage and berserker like wiki tables', () => {
    expect(formatWorkshopGameCardStarEffect('damage', 1)).toBe('×1.5')
    expect(formatWorkshopGameCardStarEffect('attackSpeed', 7)).toBe('×2.15')
    expect(formatWorkshopGameCardStarEffect('berserker', 1)).toBe('+0.8%')
    expect(workshopBerserkerCardRateFromStars(1)).toBe(0.008)
  })

  it('formats card detail values with two fixed decimals', () => {
    expect(formatWorkshopGameCardStarEffect('damage', 1, 2)).toBe('×1.50')
    expect(formatWorkshopGameCardStarEffect('damage', 2, 2)).toBe('×2.00')
    expect(formatWorkshopGameCardStarEffect('damage', 4, 2)).toBe('×2.80')
    expect(formatWorkshopGameCardStarEffect('berserker', 1, 2)).toBe('+0.80%')
  })

  it('omits decimals for cards whose wiki star table is all whole numbers', () => {
    expect(formatWorkshopGameCardStarEffect('slowAura', 7)).toBe('31%')
    expect(formatWorkshopGameCardStarEffect('slowAura', 1)).toBe('13%')
    expect(formatWorkshopGameCardStarEffect('criticalChance', 7)).toBe('+11%')
  })

  it('formats card detail: two decimals for mult, trimmed % for percent cards', () => {
    expect(formatWorkshopGameCardStarEffectForDetail('health', 1)).toBe('×1.50')
    expect(formatWorkshopGameCardStarEffectForDetail('health', 7)).toBe('×4.00')
    expect(formatWorkshopGameCardStarEffectForDetail('slowAura', 7)).toBe('31%')
    expect(formatWorkshopGameCardStarEffectForDetail('criticalChance', 7)).toBe('11%')
    expect(formatWorkshopGameCardStarEffectForDetail('berserker', 1)).toBe('+0.8%')
    expect(formatWorkshopGameCardStarEffectForDetail('berserker', 3)).toBe('+1.0%')
    expect(formatWorkshopGameCardStarEffectForDetail('berserker', 7)).toBe('+1.4%')
  })

  it('uses in-game Fortress summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('fortress', 7)).toBe(
      'Increases Defense Absolute by ×2.20',
    )
  })

  it('uses in-game Free Upgrades summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('freeUpgrades', 7)).toBe(
      'Increases Free Upgrade Chance by 10%',
    )
  })

  it('uses in-game Extra Orb summary copy in card detail', () => {
    expect(formatWorkshopGameCardStarEffectForDetail('extraOrb', 1)).toBe('.30')
    expect(formatWorkshopGameCardStarEffectForDetail('extraOrb', 7)).toBe('.90')
    expect(formatWorkshopGameCardStarEffectWithMastery('extraOrb', 7, 1)).toBe('.90')
    expect(workshopGameCardDescriptionLineForDetail('extraOrb', 7)).toBe(
      'Spawns a rotating Orb at .90 speed which instantly kills Common Enemies on contact',
    )
  })

  it('uses in-game Extra Defense summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('extraDefense', 7)).toBe(
      'Increases Defense Percent by 11%',
    )
  })

  it('uses in-game Enemy Balance summary copy in card detail', () => {
    expect(workshopEnemyBalanceSpawnStarValue(7)).toBe(1.8)
    expect(workshopGameCardDescriptionLineForDetail('enemyBalance', 7)).toBe(
      'Increases Enemy Spawns by ×1.8 & Cash on Kill increased by ×1.90',
    )
  })

  it('uses in-game Critical Chance summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('criticalChance', 7)).toBe(
      'Increases critical chance by 11%',
    )
  })

  it('uses in-game Slow Aura summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('slowAura', 7)).toBe(
      'Reduces Enemy Speed in Range by 31%',
    )
  })

  it('uses in-game Attack Speed summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('attackSpeed', 7)).toBe(
      'Increases Attack Speed by ×2.15',
    )
  })

  it('uses in-game Damage summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('damage', 7)).toBe(
      'Increases Tower Damage by ×4.00',
    )
  })

  it('uses in-game Health summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('health', 7)).toBe(
      'Increases Tower Health by ×4.00',
    )
  })

  it('uses in-game Coins summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('coins', 7)).toBe(
      'Increase all Coins earned by ×1.45',
    )
  })

  it('uses in-game Cash summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('cash', 7)).toBe(
      'Increase all Cash earned by ×2.40',
    )
  })

  it('uses in-game Range summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('range', 7)).toBe(
      'Increases Tower Range by ×1.45',
    )
  })

  it('uses in-game Health Regen summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('healthRegen', 7)).toBe(
      'Increases Health Regen by ×2.60 / sec',
    )
  })

  it('uses in-game Plasma Cannon summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('plasmaCannon', 7)).toBe(
      'Fires a Plasma Shot at the Boss, reducing Health by 54%',
    )
  })

  it('uses in-game Critical Coin summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('criticalCoin', 7)).toBe(
      'On Basic Enemy Crit Kill: Base 1 coin drop at a chance of 33%',
    )
  })

  it('uses in-game Wave Skip summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('waveSkip', 7)).toBe(
      'Gain a 19% chance of skipping waves while still earning cash and coins equal to x1.10 the value of the wave enemies',
    )
  })

  it('uses in-game Intro Sprint summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('introSprint', 7)).toBe(
      'Skips 10 Waves at a time for the first 100 Waves (capped at your Highest Wave). Bosses spawn every Wave and no Coins are granted during Intro Sprint',
    )
  })

  it('formats Intro Sprint star levels without decimals in card detail', () => {
    expect(formatWorkshopGameCardStarEffectForDetail('introSprint', 1)).toBe('20')
    expect(formatWorkshopGameCardStarEffectForDetail('introSprint', 7)).toBe('100')
  })

  it('uses in-game Land Mine Stun summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('landMineStun', 7)).toBe(
      'Land Mines have a 40% chance to Stun for 3.8 sec (except Bosses)',
    )
  })

  it('formats Land Mine Stun star levels with one decimal in card detail', () => {
    expect(formatWorkshopGameCardStarEffectForDetail('landMineStun', 1)).toBe('1.4 sec')
    expect(formatWorkshopGameCardStarEffectForDetail('landMineStun', 5)).toBe('3.0 sec')
    expect(formatWorkshopGameCardStarEffectForDetail('landMineStun', 7)).toBe('3.8 sec')
  })

  it('uses in-game Recovery Package Chance summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('recoveryPackageChance', 7)).toBe(
      'Increase Recovery package Chance by 33%',
    )
  })

  it('uses in-game Death Ray summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('deathRay', 7)).toBe(
      'Fires a Death Ray that instantly kills Common Enemies on contact with a duration of 4.9 sec',
    )
  })

  it('formats Death Ray star levels with one decimal sec in card detail', () => {
    expect(formatWorkshopGameCardStarEffectForDetail('deathRay', 1)).toBe('2.3 sec')
    expect(formatWorkshopGameCardStarEffectForDetail('deathRay', 7)).toBe('4.9 sec')
  })

  it('uses in-game Energy Net summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('energyNet', 7)).toBe(
      'Fires an Energy Net at the Boss, Immobilizing it for 4.3 sec',
    )
  })

  it('formats Energy Net star levels with one decimal sec in card detail', () => {
    expect(formatWorkshopGameCardStarEffectForDetail('energyNet', 1)).toBe('2.5 sec')
    expect(formatWorkshopGameCardStarEffectForDetail('energyNet', 6)).toBe('4.0 sec')
    expect(formatWorkshopGameCardStarEffectForDetail('energyNet', 7)).toBe('4.3 sec')
  })

  it('uses in-game Super Tower summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('superTower', 7)).toBe(
      'Periodically activates Super Tower for 15s, Increases Projectile damage by x5.00 (30 sec cooldown)',
    )
    expect(
      workshopGameCardDescriptionLineForDetail('superTower', 7, 1, {
        superTowerBonusLabLevel: 2,
      }),
    ).toBe(
      'Periodically activates Super Tower for 15s, Increases Projectile damage by x5.30 (30 sec cooldown)',
    )
  })

  it('uses in-game Second Wind summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('secondWind', 7)).toBe(
      'Once per Round: Revive Tower with 50% Health, respawn Wall, & grant Invincibility for 40 sec',
    )
  })

  it('formats Second Wind star levels with integer sec in card detail', () => {
    expect(formatWorkshopGameCardStarEffectForDetail('secondWind', 1)).toBe('10 sec')
    expect(formatWorkshopGameCardStarEffectForDetail('secondWind', 7)).toBe('40 sec')
  })

  it('uses in-game Demon Mode summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('demonMode', 7)).toBe(
      'Once per round: Activate Demon Mode, Grants 300x Projectile Damage & Invincibility for 300 sec',
    )
  })

  it('formats Demon Mode star levels with integer sec in card detail', () => {
    expect(formatWorkshopGameCardStarEffectForDetail('demonMode', 1)).toBe('180 sec')
    expect(formatWorkshopGameCardStarEffectForDetail('demonMode', 7)).toBe('300 sec')
  })

  it('uses in-game Energy Shield summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('energyShield', 7)).toBe(
      'Gain an Energy Shield that blocks 1 attack, replenishes after 8 min',
    )
  })

  it('formats Energy Shield star levels with integer min in card detail', () => {
    expect(formatWorkshopGameCardStarEffectForDetail('energyShield', 1)).toBe('20 min')
    expect(formatWorkshopGameCardStarEffectForDetail('energyShield', 7)).toBe('8 min')
  })

  it('uses in-game Berserker summary copy in card detail', () => {
    expect(workshopGameCardDescriptionLineForDetail('berserker', 7)).toBe(
      'Increase damage by 1.4% of total damage absorbed this round (max of x8 tower damage)',
    )
  })

  it('formats Ultimate Crit level values as plain two-decimal percents', () => {
    expect(formatWorkshopGameCardStarEffectForDetail('ultimateCrit', 1)).toBe('1.00%')
    expect(formatWorkshopGameCardStarEffectForDetail('ultimateCrit', 2)).toBe('1.33%')
    expect(formatWorkshopGameCardStarEffectForDetail('ultimateCrit', 7)).toBe('3.00%')
  })

  it('uses in-game Ultimate Crit summary copy with the tower crit factor', () => {
    expect(
      workshopGameCardDescriptionLineForDetail('ultimateCrit', 7, 1, {
        ultimateCritTowerFactor: 109.83,
      }),
    ).toBe('Ultimate Weapons gain 3% chance to Crit for 109.83x Damage (Tower Crit Factor)')
  })

  it('returns null for zero stars', () => {
    expect(workshopGameCardStarValue('nuke', 0)).toBeNull()
    expect(formatWorkshopGameCardStarEffect('nuke', 0)).toBe('')
  })
})
