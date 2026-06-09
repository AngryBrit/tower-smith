import { describe, expect, it } from 'vitest'
import { formatCoinAbbrev } from '../labCosts'
import {
  workshopDefenseMaxLevel,
  workshopDefenseNextMarginalCoins,
  workshopDefenseStatDisplay,
} from './workshopDefense'
import {
  WORKSHOP_DEFENSE_ABSOLUTE_MAX_LEVEL,
  workshopDefenseAbsoluteNextMarginalCoins,
  workshopDefenseAbsoluteStatValue,
} from './workshopDefenseAbsolute'
import {
  WORKSHOP_DEFENSE_PERCENT_MAX_LEVEL,
  workshopDefensePercentNextMarginalCoins,
} from './workshopDefensePercent'
import { WORKSHOP_HEALTH_MAX_LEVEL, workshopHealthNextMarginalCoins, workshopHealthStatValue } from './workshopHealth'
import {
  WORKSHOP_HEALTH_REGEN_MAX_LEVEL,
  workshopHealthRegenNextMarginalCoins,
} from './workshopHealthRegen'
import {
  WORKSHOP_THORN_DAMAGE_MAX_LEVEL,
  workshopThornDamageNextMarginalCoins,
} from './workshopThornDamage'
import {
  WORKSHOP_LIFESTEAL_MAX_LEVEL,
  workshopLifestealNextMarginalCoins,
} from './workshopLifesteal'
import {
  WORKSHOP_KNOCKBACK_CHANCE_MAX_LEVEL,
  workshopKnockbackChanceNextMarginalCoins,
} from './workshopKnockbackChance'
import {
  WORKSHOP_KNOCKBACK_FORCE_MAX_LEVEL,
  workshopKnockbackForceNextMarginalCoins,
} from './workshopKnockbackForce'
import {
  WORKSHOP_ORB_SPEED_MAX_LEVEL,
  workshopOrbSpeedNextMarginalCoins,
} from './workshopOrbSpeed'
import { WORKSHOP_ORBS_MAX_LEVEL, workshopOrbsNextMarginalCoins } from './workshopOrbs'
import {
  WORKSHOP_SHOCKWAVE_SIZE_MAX_LEVEL,
  workshopShockwaveSizeNextMarginalCoins,
} from './workshopShockwaveSize'
import {
  WORKSHOP_SHOCKWAVE_FREQUENCY_MAX_LEVEL,
  workshopShockwaveFrequencyNextMarginalCoins,
} from './workshopShockwaveFrequency'
import {
  WORKSHOP_LAND_MINE_CHANCE_MAX_LEVEL,
  workshopLandMineChanceNextMarginalCoins,
} from './workshopLandMineChance'
import {
  WORKSHOP_LAND_MINE_DAMAGE_MAX_LEVEL,
  workshopLandMineDamageNextMarginalCoins,
} from './workshopLandMineDamage'
import {
  WORKSHOP_LAND_MINE_RADIUS_MAX_LEVEL,
  workshopLandMineRadiusNextMarginalCoins,
} from './workshopLandMineRadius'
import { WORKSHOP_DEATH_DEFY_MAX_LEVEL, workshopDeathDefyNextMarginalCoins } from './workshopDeathDefy'
import { WORKSHOP_WALL_HEALTH_MAX_LEVEL, workshopWallHealthNextMarginalCoins } from './workshopWallHealth'
import { WORKSHOP_WALL_REBUILD_MAX_LEVEL, workshopWallRebuildNextMarginalCoins } from './workshopWallRebuild'

describe('workshopDefenseNextMarginalCoins', () => {
  it('Health uses workshop wiki ladder', () => {
    expect(workshopDefenseMaxLevel('healthLevel')).toBe(WORKSHOP_HEALTH_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('healthLevel', 0)).toBe(30)
    expect(workshopDefenseNextMarginalCoins('healthLevel', 90)).toBe(
      workshopHealthNextMarginalCoins(90),
    )
    expect(workshopDefenseNextMarginalCoins('healthLevel', 5099)).toBe(1.67e9)
  })

  it('Health Regen uses workshop wiki ladder (differs from Health at high tiers)', () => {
    expect(workshopDefenseMaxLevel('healthRegenLevel')).toBe(WORKSHOP_HEALTH_REGEN_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('healthRegenLevel', 5099)).toBe(1.25e9)
    expect(workshopDefenseNextMarginalCoins('healthRegenLevel', 5099)).toBe(
      workshopHealthRegenNextMarginalCoins(5099),
    )
  })

  it('Defense Absolute uses workshop wiki ladder (5000 levels)', () => {
    expect(workshopDefenseMaxLevel('defenseAbsoluteLevel')).toBe(WORKSHOP_DEFENSE_ABSOLUTE_MAX_LEVEL)
    expect(workshopDefenseAbsoluteStatValue(0)).toBe(0)
    expect(workshopDefenseAbsoluteStatValue(1)).toBe(1)
    expect(workshopDefenseAbsoluteStatValue(100)).toBe(1020)
    expect(workshopDefenseNextMarginalCoins('defenseAbsoluteLevel', 0)).toBe(50)
    expect(workshopDefenseNextMarginalCoins('defenseAbsoluteLevel', 99)).toBe(77_240)
    expect(workshopDefenseNextMarginalCoins('defenseAbsoluteLevel', 4999)).toBe(797.45e6)
    expect(workshopDefenseNextMarginalCoins('defenseAbsoluteLevel', 4999)).toBe(
      workshopDefenseAbsoluteNextMarginalCoins(4999),
    )
  })

  it('Defense % uses workshop wiki ladder (99 levels)', () => {
    expect(workshopDefenseMaxLevel('defensePercentLevel')).toBe(WORKSHOP_DEFENSE_PERCENT_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('defensePercentLevel', 0)).toBe(50)
    expect(workshopDefenseNextMarginalCoins('defensePercentLevel', 1)).toBe(76)
    expect(workshopDefenseNextMarginalCoins('defensePercentLevel', 75)).toBe(50_260)
    expect(workshopDefenseNextMarginalCoins('defensePercentLevel', 98)).toBe(90_730)
    expect(workshopDefenseNextMarginalCoins('defensePercentLevel', 98)).toBe(
      workshopDefensePercentNextMarginalCoins(98),
    )
    expect(workshopDefenseStatDisplay('defensePercentLevel', 0)).toBe('0.00%')
    expect(workshopDefenseStatDisplay('defensePercentLevel', 1)).toBe('0.50%')
    expect(workshopDefenseStatDisplay('defensePercentLevel', 99)).toBe('49.50%')
  })

  it('Thorn Damage uses workshop wiki ladder (99 levels)', () => {
    expect(workshopDefenseMaxLevel('thornDamageLevel')).toBe(WORKSHOP_THORN_DAMAGE_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('thornDamageLevel', 0)).toBe(60)
    expect(workshopDefenseNextMarginalCoins('thornDamageLevel', 98)).toBe(75_550)
    expect(workshopDefenseNextMarginalCoins('thornDamageLevel', 98)).toBe(
      workshopThornDamageNextMarginalCoins(98),
    )
    expect(workshopDefenseStatDisplay('thornDamageLevel', 0)).toBe('0.00%')
    expect(workshopDefenseStatDisplay('thornDamageLevel', 99)).toBe('99.00%')
  })

  it('Lifesteal uses workshop wiki ladder (80 levels)', () => {
    expect(workshopDefenseMaxLevel('lifestealLevel')).toBe(WORKSHOP_LIFESTEAL_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('lifestealLevel', 0)).toBe(60)
    expect(workshopDefenseNextMarginalCoins('lifestealLevel', 79)).toBe(61_320)
    expect(workshopDefenseNextMarginalCoins('lifestealLevel', 79)).toBe(
      workshopLifestealNextMarginalCoins(79),
    )
    expect(workshopDefenseStatDisplay('lifestealLevel', 0)).toBe('0.00%')
    expect(workshopDefenseStatDisplay('lifestealLevel', 80)).toBe('4.46%')
  })

  it('Knockback Chance uses workshop wiki ladder (80 levels)', () => {
    expect(workshopDefenseMaxLevel('knockbackChanceLevel')).toBe(WORKSHOP_KNOCKBACK_CHANCE_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('knockbackChanceLevel', 0)).toBe(80)
    expect(workshopDefenseNextMarginalCoins('knockbackChanceLevel', 79)).toBe(66_330)
    expect(workshopDefenseNextMarginalCoins('knockbackChanceLevel', 79)).toBe(
      workshopKnockbackChanceNextMarginalCoins(79),
    )
    expect(workshopDefenseStatDisplay('knockbackChanceLevel', 0)).toBe('0.00%')
    expect(workshopDefenseStatDisplay('knockbackChanceLevel', 80)).toBe('80.00%')
  })

  it('Knockback Force uses workshop wiki ladder (40 levels)', () => {
    expect(workshopDefenseMaxLevel('knockbackForceLevel')).toBe(WORKSHOP_KNOCKBACK_FORCE_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('knockbackForceLevel', 0)).toBe(80)
    expect(workshopDefenseNextMarginalCoins('knockbackForceLevel', 39)).toBe(14_010)
    expect(workshopDefenseNextMarginalCoins('knockbackForceLevel', 39)).toBe(
      workshopKnockbackForceNextMarginalCoins(39),
    )
    expect(workshopDefenseStatDisplay('knockbackForceLevel', 0)).toBe('0.40')
    expect(workshopDefenseStatDisplay('knockbackForceLevel', 1)).toBe('0.55')
    expect(workshopDefenseStatDisplay('knockbackForceLevel', 40)).toBe('6.08')
  })

  it('Orb Speed uses workshop wiki ladder (38 levels)', () => {
    expect(workshopDefenseMaxLevel('orbSpeedLevel')).toBe(WORKSHOP_ORB_SPEED_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('orbSpeedLevel', 0)).toBe(125)
    expect(workshopDefenseNextMarginalCoins('orbSpeedLevel', 37)).toBe(29_730)
    expect(workshopDefenseNextMarginalCoins('orbSpeedLevel', 37)).toBe(
      workshopOrbSpeedNextMarginalCoins(37),
    )
    expect(workshopDefenseStatDisplay('orbSpeedLevel', 0)).toBe('0.40')
    expect(workshopDefenseStatDisplay('orbSpeedLevel', 38)).toBe('6.10')
  })

  it('Orbs uses workshop wiki ladder (4 levels)', () => {
    expect(workshopDefenseMaxLevel('orbsLevel')).toBe(WORKSHOP_ORBS_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('orbsLevel', 0)).toBe(3_000)
    expect(workshopDefenseNextMarginalCoins('orbsLevel', 3)).toBe(350_000)
    expect(workshopDefenseNextMarginalCoins('orbsLevel', 3)).toBe(workshopOrbsNextMarginalCoins(3))
    expect(workshopDefenseStatDisplay('orbsLevel', 0)).toBe('0')
    expect(workshopDefenseStatDisplay('orbsLevel', 4)).toBe('4')
  })

  it('Shockwave Size uses workshop wiki ladder (35 levels)', () => {
    expect(workshopDefenseMaxLevel('shockwaveSizeLevel')).toBe(WORKSHOP_SHOCKWAVE_SIZE_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('shockwaveSizeLevel', 0)).toBe(250)
    expect(workshopDefenseNextMarginalCoins('shockwaveSizeLevel', 34)).toBe(59_600)
    expect(workshopDefenseNextMarginalCoins('shockwaveSizeLevel', 34)).toBe(
      workshopShockwaveSizeNextMarginalCoins(34),
    )
    expect(workshopDefenseStatDisplay('shockwaveSizeLevel', 0)).toBe('0.60')
    expect(workshopDefenseStatDisplay('shockwaveSizeLevel', 35)).toBe('2.35')
  })

  it('Shockwave Frequency uses workshop wiki ladder (40 levels)', () => {
    expect(workshopDefenseMaxLevel('shockwaveFrequencyLevel')).toBe(
      WORKSHOP_SHOCKWAVE_FREQUENCY_MAX_LEVEL,
    )
    expect(workshopDefenseNextMarginalCoins('shockwaveFrequencyLevel', 0)).toBe(250)
    expect(workshopDefenseNextMarginalCoins('shockwaveFrequencyLevel', 39)).toBe(85_600)
    expect(workshopDefenseNextMarginalCoins('shockwaveFrequencyLevel', 39)).toBe(
      workshopShockwaveFrequencyNextMarginalCoins(39),
    )
    expect(workshopDefenseStatDisplay('shockwaveFrequencyLevel', 0)).toBe('20.00s')
    expect(workshopDefenseStatDisplay('shockwaveFrequencyLevel', 40)).toBe('14.00s')
  })

  it('Land Mine Chance uses workshop wiki ladder (50 levels)', () => {
    expect(workshopDefenseMaxLevel('landMineChanceLevel')).toBe(WORKSHOP_LAND_MINE_CHANCE_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('landMineChanceLevel', 0)).toBe(500)
    expect(workshopDefenseNextMarginalCoins('landMineChanceLevel', 49)).toBe(1_260_000)
    expect(workshopDefenseNextMarginalCoins('landMineChanceLevel', 49)).toBe(
      workshopLandMineChanceNextMarginalCoins(49),
    )
    expect(workshopDefenseStatDisplay('landMineChanceLevel', 0)).toBe('0.00%')
    expect(workshopDefenseStatDisplay('landMineChanceLevel', 50)).toBe('30.00%')
  })

  it('Land Mine Damage uses workshop wiki ladder (200 levels)', () => {
    expect(workshopDefenseMaxLevel('landMineDamageLevel')).toBe(WORKSHOP_LAND_MINE_DAMAGE_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('landMineDamageLevel', 0)).toBe(500)
    expect(workshopDefenseNextMarginalCoins('landMineDamageLevel', 199)).toBe(217.61e12)
    expect(workshopDefenseNextMarginalCoins('landMineDamageLevel', 199)).toBe(
      workshopLandMineDamageNextMarginalCoins(199),
    )
    expect(workshopDefenseStatDisplay('landMineDamageLevel', 0)).toBe('x1.0')
    expect(workshopDefenseStatDisplay('landMineDamageLevel', 200)).toBe('x21.0')
  })

  it('Land Mine Radius uses workshop wiki ladder (50 levels)', () => {
    expect(workshopDefenseMaxLevel('landMineRadiusLevel')).toBe(WORKSHOP_LAND_MINE_RADIUS_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('landMineRadiusLevel', 0)).toBe(500)
    expect(workshopDefenseNextMarginalCoins('landMineRadiusLevel', 49)).toBe(19_820_000_000)
    expect(workshopDefenseNextMarginalCoins('landMineRadiusLevel', 49)).toBe(
      workshopLandMineRadiusNextMarginalCoins(49),
    )
    expect(workshopDefenseStatDisplay('landMineRadiusLevel', 0)).toBe('0.50')
    expect(workshopDefenseStatDisplay('landMineRadiusLevel', 50)).toBe('1.50')
  })

  it('Death Defy uses workshop wiki ladder (75 levels)', () => {
    expect(workshopDefenseMaxLevel('deathDefyLevel')).toBe(WORKSHOP_DEATH_DEFY_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('deathDefyLevel', 0)).toBe(1000)
    expect(workshopDefenseNextMarginalCoins('deathDefyLevel', 74)).toBe(110_500_000)
    expect(workshopDefenseNextMarginalCoins('deathDefyLevel', 74)).toBe(
      workshopDeathDefyNextMarginalCoins(74),
    )
    expect(workshopDefenseStatDisplay('deathDefyLevel', 0)).toBe('0.00%')
    expect(workshopDefenseStatDisplay('deathDefyLevel', 75)).toBe('30.00%')
  })

  it('Wall Health uses workshop wiki ladder (1800 levels)', () => {
    expect(workshopDefenseMaxLevel('wallHealthLevel')).toBe(WORKSHOP_WALL_HEALTH_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('wallHealthLevel', 0)).toBe(8e6)
    expect(workshopDefenseNextMarginalCoins('wallHealthLevel', 1799)).toBe(23.48e12)
    expect(workshopDefenseNextMarginalCoins('wallHealthLevel', 1799)).toBe(
      workshopWallHealthNextMarginalCoins(1799),
    )
    expect(workshopDefenseStatDisplay('wallHealthLevel', 0)).toBe('20.00%')
    expect(workshopDefenseStatDisplay('wallHealthLevel', 1800)).toBe('200.00%')
  })

  it('Wall Rebuild uses workshop wiki ladder (300 levels)', () => {
    expect(workshopDefenseMaxLevel('wallRebuildLevel')).toBe(WORKSHOP_WALL_REBUILD_MAX_LEVEL)
    expect(workshopDefenseNextMarginalCoins('wallRebuildLevel', 0)).toBe(16e6)
    expect(workshopDefenseNextMarginalCoins('wallRebuildLevel', 299)).toBe(923.56e9)
    expect(workshopDefenseNextMarginalCoins('wallRebuildLevel', 299)).toBe(
      workshopWallRebuildNextMarginalCoins(299),
    )
    expect(workshopDefenseStatDisplay('wallRebuildLevel', 0)).toBe('1200s')
    expect(workshopDefenseStatDisplay('wallRebuildLevel', 300)).toBe('600s')
  })

  it('returns undefined when maxed', () => {
    expect(workshopDefenseNextMarginalCoins('healthLevel', WORKSHOP_HEALTH_MAX_LEVEL)).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins('healthRegenLevel', WORKSHOP_HEALTH_REGEN_MAX_LEVEL),
    ).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins('defenseAbsoluteLevel', WORKSHOP_DEFENSE_ABSOLUTE_MAX_LEVEL),
    ).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins('defensePercentLevel', WORKSHOP_DEFENSE_PERCENT_MAX_LEVEL),
    ).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins('thornDamageLevel', WORKSHOP_THORN_DAMAGE_MAX_LEVEL),
    ).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins('lifestealLevel', WORKSHOP_LIFESTEAL_MAX_LEVEL),
    ).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins('knockbackChanceLevel', WORKSHOP_KNOCKBACK_CHANCE_MAX_LEVEL),
    ).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins('knockbackForceLevel', WORKSHOP_KNOCKBACK_FORCE_MAX_LEVEL),
    ).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins('orbSpeedLevel', WORKSHOP_ORB_SPEED_MAX_LEVEL),
    ).toBeUndefined()
    expect(workshopDefenseNextMarginalCoins('orbsLevel', WORKSHOP_ORBS_MAX_LEVEL)).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins('shockwaveSizeLevel', WORKSHOP_SHOCKWAVE_SIZE_MAX_LEVEL),
    ).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins(
        'shockwaveFrequencyLevel',
        WORKSHOP_SHOCKWAVE_FREQUENCY_MAX_LEVEL,
      ),
    ).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins('landMineChanceLevel', WORKSHOP_LAND_MINE_CHANCE_MAX_LEVEL),
    ).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins('landMineDamageLevel', WORKSHOP_LAND_MINE_DAMAGE_MAX_LEVEL),
    ).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins('landMineRadiusLevel', WORKSHOP_LAND_MINE_RADIUS_MAX_LEVEL),
    ).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins('deathDefyLevel', WORKSHOP_DEATH_DEFY_MAX_LEVEL),
    ).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins('wallHealthLevel', WORKSHOP_WALL_HEALTH_MAX_LEVEL),
    ).toBeUndefined()
    expect(
      workshopDefenseNextMarginalCoins('wallRebuildLevel', WORKSHOP_WALL_REBUILD_MAX_LEVEL),
    ).toBeUndefined()
  })
})

describe('workshopDefenseStatDisplay', () => {
  it('applies Defense Health lab multiplier to workshop HP display', () => {
    const level = 3500
    const mult = 4
    expect(
      workshopDefenseStatDisplay('healthLevel', level, { healthLabMultiplier: mult }),
    ).toBe(formatCoinAbbrev(Math.round(workshopHealthStatValue(level) * mult)))
  })

  it('adds Garlic Thorns lab % to workshop Thorn Damage display', () => {
    expect(
      workshopDefenseStatDisplay('thornDamageLevel', 99, { thornDamageLabPercentPoints: 5 }),
    ).toBe('104.00%')
  })

  it('adds Defense % lab to workshop Defense % display', () => {
    expect(
      workshopDefenseStatDisplay('defensePercentLevel', 99, { defensePercentLabPercentPoints: 0.4 }),
    ).toBe('49.90%')
  })

  it('shows Health Regen lab multiplier when wiki Value is still 0', () => {
    expect(
      workshopDefenseStatDisplay('healthRegenLevel', 0, { healthRegenLabMultiplier: 1.03 }),
    ).toBe('0/sec ×1.03')
    expect(
      workshopDefenseStatDisplay('healthRegenLevel', 1, { healthRegenLabMultiplier: 1.03 }),
    ).toBe('0/sec ×1.03')
  })

  it('shows Health lab multiplier when wiki HP is still 0', () => {
    expect(workshopDefenseStatDisplay('healthLevel', 0, { healthLabMultiplier: 1.03 })).toBe('5')
  })

  it('applies displayed-health factors on the Health workshop card', () => {
    const level = 5500
    const labMult = 51.556
    expect(workshopHealthStatValue(level)).toBe(2_500_000_000)
    expect(
      workshopDefenseStatDisplay('healthLevel', level, { healthLabMultiplier: labMult }),
    ).toBe('128.89B')
    expect(
      workshopDefenseStatDisplay('healthLevel', level, {
        healthLabMultiplier: labMult,
        healthEnhancementsMultiplier: 1.687,
      }),
    ).toBe('217.44B')
  })
})
