import { readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseResearchManifest, parseResearchSection } from '../types/research'
import {
  cardMasterySectionIndex,
  clearWorkshopCardMasteryOverrides,
  formatCardMasteryTierLabelDetail,
  formatCardMasteryTierLabelDetailForCard,
  formatWorkshopGameCardStarLevelEffectForDetail,
  parseCardMasteryTierMultiplier,
  workshopCardMasteryDetailAbilityDescId,
  workshopCardMasteryDetailAbilityLabel,
  workshopCardMasteryDetailMasteryDescId,
  workshopCardMasteryDetailMasteryDescStyle,
  workshopCardMasteryDetailResearchDescId,
  workshopCardMasteryDetailTierLabelStyle,
  workshopCardMasteryDetailTitleId,
  workshopCardMasteryLevel,
  workshopCardMasteryMultiplier,
  workshopCardMasteryTierLabel,
  workshopCardMasteryUnlocked,
} from './workshopCardMastery'
import { formatWorkshopGameCardStarEffectWithMastery } from './workshopGameCardWiki'

const srcDir = dirname(fileURLToPath(import.meta.url))

function loadResearchData() {
  const manifestRaw: unknown = JSON.parse(
    readFileSync(join(srcDir, '../../public/research/manifest.json'), 'utf-8'),
  )
  const { sectionFiles } = parseResearchManifest(manifestRaw)
  const sections = sectionFiles.map((rel: string) => {
    const raw: unknown = JSON.parse(
      readFileSync(join(srcDir, '../../public', rel.replace(/^\//, '')), 'utf-8'),
    )
    return parseResearchSection(raw, basename(rel, '.json'))
  })
  return { sections }
}

describe('workshopCardMastery', () => {
  const data = loadResearchData()

  it('maps card ids to card-mastery section rows', () => {
    const si = cardMasterySectionIndex(data)
    expect(si).toBe(10)
    expect(data.sections[si]?.sectionSlug).toBe('card-mastery')
    expect(data.sections[si]?.items[0]?.name).toBe('Damage Mastery')
    expect(data.sections[si]?.items[27]?.name).toBe('Berserker Mastery')
  })

  it('treats mastery as unlocked when simulator level is above 0', () => {
    const si = cardMasterySectionIndex(data)
    const overrides = { [`${si}-0`]: 2 }
    expect(workshopCardMasteryLevel('damage', data, overrides)).toBe(2)
    expect(workshopCardMasteryUnlocked('damage', data, overrides)).toBe(true)
    expect(workshopCardMasteryUnlocked('attackSpeed', data, overrides)).toBe(false)
  })

  it('parses tier labels and scales card effects', () => {
    expect(parseCardMasteryTierMultiplier('x5')).toBe(5)
    const si = cardMasterySectionIndex(data)
    const overrides = { [`${si}-0`]: 9 }
    expect(workshopCardMasteryMultiplier('damage', data, overrides)).toBe(5)
    expect(formatWorkshopGameCardStarEffectWithMastery('damage', 7, 5)).toBe('×20')
  })

  it('clears card mastery lab overrides', () => {
    const si = cardMasterySectionIndex(data)
    const overrides = { [`${si}-0`]: 3, [`${si}-5`]: 1, '4-2': 7 }
    const cleared = clearWorkshopCardMasteryOverrides(data, overrides)
    expect(cleared[`${si}-0`]).toBe(0)
    expect(cleared[`${si}-5`]).toBe(0)
    expect(cleared['4-2']).toBe(7)
    expect(workshopCardMasteryUnlocked('damage', data, cleared)).toBe(false)
  })

  it('formats mastery tier labels with two fixed decimals for detail UI', () => {
    expect(formatCardMasteryTierLabelDetail('x1.2')).toBe('x1.20')
    expect(formatCardMasteryTierLabelDetail('x1.03')).toBe('x1.03')
    expect(formatCardMasteryTierLabelDetail('0.4%')).toBe('0.40%')
    expect(formatCardMasteryTierLabelDetail('+1%')).toBe('+1.00%')
  })

  it('shows Slow Aura mastery tiers as incremental % in card detail', () => {
    expect(formatCardMasteryTierLabelDetailForCard('slowAura', 'x1.05')).toBe('+5%')
    expect(formatCardMasteryTierLabelDetailForCard('slowAura', 'x1.5')).toBe('+50%')
    expect(formatCardMasteryTierLabelDetailForCard('damage', 'x1.4')).toBe('x1.40')
  })

  it('shows Critical Chance mastery tiers as plain % in card detail', () => {
    expect(formatCardMasteryTierLabelDetailForCard('criticalChance', '+1%')).toBe('1%')
    expect(formatCardMasteryTierLabelDetailForCard('criticalChance', '+10%')).toBe('10%')
    expect(formatCardMasteryTierLabelDetailForCard('extraDefense', '+0.7%')).toBe('0.7%')
    expect(formatCardMasteryTierLabelDetailForCard('extraDefense', '+1.4%')).toBe('1.4%')
    expect(formatCardMasteryTierLabelDetailForCard('fortress', '-10s')).toBe('10s')
    expect(formatCardMasteryTierLabelDetailForCard('fortress', '-100s')).toBe('100s')
    expect(formatCardMasteryTierLabelDetailForCard('plasmaCannon', '5%')).toBe('5%')
    expect(formatCardMasteryTierLabelDetailForCard('plasmaCannon', '25%')).toBe('25%')
    expect(formatCardMasteryTierLabelDetailForCard('criticalCoin', '10%')).toBe('10%')
    expect(formatCardMasteryTierLabelDetailForCard('waveSkip', '10%')).toBe('10%')
    expect(formatCardMasteryTierLabelDetailForCard('introSprint', 'x1.8')).toBe('x1.8')
    expect(formatCardMasteryTierLabelDetailForCard('introSprint', 'x18')).toBe('x18')
    expect(formatCardMasteryTierLabelDetailForCard('landMineStun', '2.5%')).toBe('2.5%')
    expect(formatCardMasteryTierLabelDetailForCard('landMineStun', '5%')).toBe('5%')
    expect(formatCardMasteryTierLabelDetailForCard('recoveryPackageChance', '0.4%')).toBe('0.4%')
    expect(formatCardMasteryTierLabelDetailForCard('deathRay', '5%')).toBe('5%')
    expect(formatCardMasteryTierLabelDetailForCard('energyNet', 'x2')).toBe('x2.00')
    expect(formatCardMasteryTierLabelDetailForCard('energyNet', 'x20')).toBe('x20.00')
    expect(formatCardMasteryTierLabelDetailForCard('superTower', '-3s')).toBe('3s')
    expect(formatCardMasteryTierLabelDetailForCard('superTower', '-30s')).toBe('30s')
    expect(formatCardMasteryTierLabelDetailForCard('secondWind', 'x1.9')).toBe('x1.90')
    expect(formatCardMasteryTierLabelDetailForCard('secondWind', 'x10')).toBe('x10.00')
  })

  it('formats card detail star levels with plain_percent when configured', () => {
    expect(formatWorkshopGameCardStarLevelEffectForDetail('criticalChance', 1)).toBe('5%')
    expect(formatWorkshopGameCardStarLevelEffectForDetail('criticalChance', 7)).toBe('11%')
    expect(formatWorkshopGameCardStarLevelEffectForDetail('extraDefense', 7)).toBe('11%')
    expect(formatWorkshopGameCardStarLevelEffectForDetail('damage', 7)).toBe('×4.00')
    expect(formatWorkshopGameCardStarLevelEffectForDetail('slowAura', 7)).toBe('31%')
  })

  it('maps card mastery lab level to tier labels (same index as research benefit)', () => {
    const si = cardMasterySectionIndex(data)
    expect(workshopCardMasteryTierLabel('extraDefense', data, 0)).toBe('+0.7%')
    expect(workshopCardMasteryTierLabel('extraDefense', data, 1)).toBe('+1.4%')
    const overrides = { [`${si}-10`]: 1 }
    expect(workshopCardMasteryLevel('extraDefense', data, overrides)).toBe(1)
    expect(workshopCardMasteryTierLabel('extraDefense', data, 1)).toBe('+1.4%')
    expect(workshopCardMasteryTierLabel('damage', data, 0)).toBe('x1.4')
    expect(workshopCardMasteryTierLabel('damage', data, 1)).toBe('x1.8')
  })

  it('uses in-game mastery stat labels in card detail copy', () => {
    expect(workshopCardMasteryDetailTitleId('range')).toBe('ws_stat_damagePerMeter')
    expect(workshopCardMasteryDetailTitleId('damage')).toBe('ws_card_damage')
    expect(workshopCardMasteryDetailAbilityLabel('range', 'Damage / Meter')).toBe('Damage / Meter')
    expect(workshopCardMasteryDetailAbilityLabel('damage', 'Damage')).toBe('Damage+')
    expect(workshopCardMasteryDetailTitleId('plasmaCannon')).toBe('ws_card_elite_cannon')
    expect(workshopCardMasteryDetailAbilityLabel('plasmaCannon', 'Elite Cannon')).toBe(
      'Elite Cannon',
    )
    expect(workshopCardMasteryDetailMasteryDescId('cash')).toBe('ws_cards_detail_mastery_desc_cash')
    expect(workshopCardMasteryDetailTitleId('cash')).toBe('ws_card_elite_farming')
    expect(workshopCardMasteryDetailAbilityLabel('cash', 'Elite Farming')).toBe('Elite Farming')
    expect(workshopCardMasteryDetailMasteryDescId('slowAura')).toBe(
      'ws_cards_detail_mastery_desc_slow_aura',
    )
    expect(workshopCardMasteryDetailTitleId('slowAura')).toBe('ws_card_slow_attack')
    expect(workshopCardMasteryDetailAbilityLabel('slowAura', 'Slow Attack')).toBe('Slow Attack')
    expect(workshopCardMasteryDetailAbilityDescId('slowAura')).toBe(
      'ws_cards_detail_mastery_ability_desc_slow_aura',
    )
    expect(workshopCardMasteryDetailResearchDescId('slowAura')).toBe(
      'ws_cards_detail_mastery_research_desc_slow_aura',
    )
    expect(workshopCardMasteryDetailMasteryDescId('criticalChance')).toBe(
      'ws_cards_detail_mastery_desc_critical_chance',
    )
    expect(workshopCardMasteryDetailTitleId('criticalChance')).toBe(
      'ws_card_super_critical_chance',
    )
    expect(workshopCardMasteryDetailAbilityLabel('criticalChance', 'Super Critical Chance')).toBe(
      'Super Critical Chance',
    )
    expect(workshopCardMasteryDetailAbilityDescId('criticalChance')).toBe(
      'ws_cards_detail_mastery_ability_desc_critical_chance',
    )
    expect(workshopCardMasteryDetailResearchDescId('criticalChance')).toBe(
      'ws_cards_detail_mastery_research_desc_critical_chance',
    )
    expect(workshopCardMasteryDetailAbilityDescId('cash')).toBe(
      'ws_cards_detail_mastery_ability_desc_cash',
    )
    expect(workshopCardMasteryDetailResearchDescId('cash')).toBe(
      'ws_cards_detail_mastery_research_desc_cash',
    )
    expect(workshopCardMasteryDetailTitleId('enemyBalance')).toBe('ws_card_elite_balance')
    expect(workshopCardMasteryDetailAbilityLabel('enemyBalance', 'Elite Balance')).toBe(
      'Elite Balance',
    )
    expect(workshopCardMasteryDetailMasteryDescId('enemyBalance')).toBe(
      'ws_cards_detail_mastery_desc_enemy_balance',
    )
    expect(workshopCardMasteryDetailAbilityDescId('enemyBalance')).toBe(
      'ws_cards_detail_mastery_ability_desc_enemy_balance',
    )
    expect(workshopCardMasteryDetailResearchDescId('enemyBalance')).toBe(
      'ws_cards_detail_mastery_research_desc_enemy_balance',
    )
    expect(workshopCardMasteryDetailMasteryDescStyle('extraDefense')).toBe('stat_multiplier')
    expect(workshopCardMasteryDetailAbilityDescId('extraDefense')).toBe(
      'ws_cards_detail_mastery_ability_desc_extra_defense',
    )
    expect(workshopCardMasteryDetailResearchDescId('extraDefense')).toBe(
      'ws_cards_detail_mastery_research_desc_extra_defense',
    )
    expect(workshopCardMasteryDetailMasteryDescId('fortress')).toBe(
      'ws_cards_detail_mastery_desc_fortress',
    )
    expect(workshopCardMasteryDetailTitleId('fortress')).toBe('ws_card_fortress_walls')
    expect(workshopCardMasteryDetailAbilityLabel('fortress', 'Fortress Walls')).toBe(
      'Fortress Walls',
    )
    expect(workshopCardMasteryDetailAbilityDescId('fortress')).toBe(
      'ws_cards_detail_mastery_ability_desc_fortress',
    )
    expect(workshopCardMasteryDetailResearchDescId('fortress')).toBe(
      'ws_cards_detail_mastery_research_desc_fortress',
    )
    expect(workshopCardMasteryDetailMasteryDescId('freeUpgrades')).toBe(
      'ws_cards_detail_mastery_desc_free_upgrades',
    )
    expect(workshopCardMasteryDetailTitleId('freeUpgrades')).toBe('ws_card_locked_upgrade')
    expect(workshopCardMasteryDetailAbilityLabel('freeUpgrades', 'Locked Upgrade')).toBe(
      'Locked Upgrade',
    )
    expect(workshopCardMasteryDetailAbilityDescId('freeUpgrades')).toBe(
      'ws_cards_detail_mastery_ability_desc_free_upgrades',
    )
    expect(workshopCardMasteryDetailResearchDescId('freeUpgrades')).toBe(
      'ws_cards_detail_mastery_research_desc_free_upgrades',
    )
    expect(workshopCardMasteryDetailMasteryDescId('extraOrb')).toBe(
      'ws_cards_detail_mastery_desc_extra_orb',
    )
    expect(workshopCardMasteryDetailTitleId('extraOrb')).toBe('ws_card_coin_orb')
    expect(workshopCardMasteryDetailAbilityLabel('extraOrb', 'Coin Orb')).toBe('Coin Orb')
    expect(workshopCardMasteryDetailAbilityDescId('extraOrb')).toBe(
      'ws_cards_detail_mastery_ability_desc_extra_orb',
    )
    expect(workshopCardMasteryDetailResearchDescId('extraOrb')).toBe(
      'ws_cards_detail_mastery_research_desc_extra_orb',
    )
    expect(workshopCardMasteryDetailMasteryDescId('plasmaCannon')).toBe(
      'ws_cards_detail_mastery_desc_plasma_cannon',
    )
    expect(workshopCardMasteryDetailAbilityDescId('plasmaCannon')).toBe(
      'ws_cards_detail_mastery_ability_desc_plasma_cannon',
    )
    expect(workshopCardMasteryDetailResearchDescId('plasmaCannon')).toBe(
      'ws_cards_detail_mastery_research_desc_plasma_cannon',
    )
    expect(workshopCardMasteryDetailTierLabelStyle('plasmaCannon')).toBe('plain_percent')
    expect(workshopCardMasteryDetailMasteryDescId('criticalCoin')).toBe(
      'ws_cards_detail_mastery_desc_critical_coin',
    )
    expect(workshopCardMasteryDetailTitleId('criticalCoin')).toBe('ws_card_double_coins')
    expect(workshopCardMasteryDetailAbilityLabel('criticalCoin', 'Double Coins')).toBe(
      'Double Coins',
    )
    expect(workshopCardMasteryDetailAbilityDescId('criticalCoin')).toBe(
      'ws_cards_detail_mastery_ability_desc_critical_coin',
    )
    expect(workshopCardMasteryDetailResearchDescId('criticalCoin')).toBe(
      'ws_cards_detail_mastery_research_desc_critical_coin',
    )
    expect(workshopCardMasteryDetailTierLabelStyle('criticalCoin')).toBe('plain_percent')
    expect(workshopCardMasteryDetailMasteryDescId('waveSkip')).toBe(
      'ws_cards_detail_mastery_desc_wave_skip',
    )
    expect(workshopCardMasteryDetailTitleId('waveSkip')).toBe('ws_card_double_wave_skip')
    expect(workshopCardMasteryDetailAbilityLabel('waveSkip', 'Double Wave Skip')).toBe(
      'Double Wave Skip',
    )
    expect(workshopCardMasteryDetailAbilityDescId('waveSkip')).toBe(
      'ws_cards_detail_mastery_ability_desc_wave_skip',
    )
    expect(workshopCardMasteryDetailResearchDescId('waveSkip')).toBe(
      'ws_cards_detail_mastery_research_desc_wave_skip',
    )
    expect(workshopCardMasteryDetailTierLabelStyle('waveSkip')).toBe('plain_percent')
    expect(workshopCardMasteryDetailMasteryDescId('introSprint')).toBe(
      'ws_cards_detail_mastery_desc_intro_sprint',
    )
    expect(workshopCardMasteryDetailTitleId('introSprint')).toBe('ws_card_warp_speed')
    expect(workshopCardMasteryDetailAbilityLabel('introSprint', 'Warp Speed')).toBe('Warp Speed')
    expect(workshopCardMasteryDetailAbilityDescId('introSprint')).toBe(
      'ws_cards_detail_mastery_ability_desc_intro_sprint',
    )
    expect(workshopCardMasteryDetailResearchDescId('introSprint')).toBe(
      'ws_cards_detail_mastery_research_desc_intro_sprint',
    )
    expect(workshopCardMasteryDetailTierLabelStyle('introSprint')).toBe('compact_mult')
    expect(workshopCardMasteryDetailMasteryDescId('landMineStun')).toBe(
      'ws_cards_detail_mastery_desc_land_mine_stun',
    )
    expect(workshopCardMasteryDetailTitleId('landMineStun')).toBe('ws_card_flashbang')
    expect(workshopCardMasteryDetailAbilityLabel('landMineStun', 'Flashbang')).toBe('Flashbang')
    expect(workshopCardMasteryDetailAbilityDescId('landMineStun')).toBe(
      'ws_cards_detail_mastery_ability_desc_land_mine_stun',
    )
    expect(workshopCardMasteryDetailResearchDescId('landMineStun')).toBe(
      'ws_cards_detail_mastery_research_desc_land_mine_stun',
    )
    expect(workshopCardMasteryDetailTierLabelStyle('landMineStun')).toBe('plain_percent')
    expect(workshopCardMasteryDetailMasteryDescId('recoveryPackageChance')).toBe(
      'ws_cards_detail_mastery_desc_recovery_package_chance',
    )
    expect(workshopCardMasteryDetailTitleId('recoveryPackageChance')).toBe('ws_card_care_package')
    expect(workshopCardMasteryDetailAbilityLabel('recoveryPackageChance', 'Care Package')).toBe(
      'Care Package',
    )
    expect(workshopCardMasteryDetailAbilityDescId('recoveryPackageChance')).toBe(
      'ws_cards_detail_mastery_ability_desc_recovery_package_chance',
    )
    expect(workshopCardMasteryDetailResearchDescId('recoveryPackageChance')).toBe(
      'ws_cards_detail_mastery_research_desc_recovery_package_chance',
    )
    expect(workshopCardMasteryDetailTierLabelStyle('recoveryPackageChance')).toBe('plain_percent')
    expect(workshopCardMasteryDetailMasteryDescId('deathRay')).toBe(
      'ws_cards_detail_mastery_desc_death_ray',
    )
    expect(workshopCardMasteryDetailTitleId('deathRay')).toBe('ws_card_enhanced_ray')
    expect(workshopCardMasteryDetailAbilityLabel('deathRay', 'Enhanced Ray')).toBe('Enhanced Ray')
    expect(workshopCardMasteryDetailResearchDescId('deathRay')).toBe(
      'ws_cards_detail_mastery_research_desc_death_ray',
    )
    expect(workshopCardMasteryDetailTierLabelStyle('deathRay')).toBe('plain_percent')
    expect(workshopCardMasteryDetailMasteryDescId('energyNet')).toBe(
      'ws_cards_detail_mastery_desc_energy_net',
    )
    expect(workshopCardMasteryDetailTitleId('energyNet')).toBe('ws_card_electrified_net')
    expect(workshopCardMasteryDetailAbilityLabel('energyNet', 'Electrified Net')).toBe(
      'Electrified Net',
    )
    expect(workshopCardMasteryDetailAbilityDescId('energyNet')).toBe(
      'ws_cards_detail_mastery_ability_desc_energy_net',
    )
    expect(workshopCardMasteryDetailResearchDescId('energyNet')).toBe(
      'ws_cards_detail_mastery_research_desc_energy_net',
    )
    expect(workshopCardMasteryDetailTierLabelStyle('energyNet')).toBe('default')
    expect(workshopCardMasteryDetailMasteryDescId('superTower')).toBe(
      'ws_cards_detail_mastery_desc_super_tower',
    )
    expect(workshopCardMasteryDetailTitleId('superTower')).toBe('ws_card_ultimate_tower')
    expect(workshopCardMasteryDetailAbilityLabel('superTower', 'Ultimate Tower')).toBe(
      'Ultimate Tower',
    )
    expect(workshopCardMasteryDetailAbilityDescId('superTower')).toBe(
      'ws_cards_detail_mastery_ability_desc_super_tower',
    )
    expect(workshopCardMasteryDetailResearchDescId('superTower')).toBe(
      'ws_cards_detail_mastery_research_desc_super_tower',
    )
    expect(workshopCardMasteryDetailTierLabelStyle('superTower')).toBe('plain_sec')
    expect(workshopCardMasteryDetailMasteryDescId('secondWind')).toBe(
      'ws_cards_detail_mastery_desc_second_wind',
    )
    expect(workshopCardMasteryDetailTitleId('secondWind')).toBe('ws_card_angel_wings')
    expect(workshopCardMasteryDetailAbilityLabel('secondWind', 'Angel Wings')).toBe('Angel Wings')
    expect(workshopCardMasteryDetailAbilityDescId('secondWind')).toBe(
      'ws_cards_detail_mastery_ability_desc_second_wind',
    )
    expect(workshopCardMasteryDetailResearchDescId('secondWind')).toBe(
      'ws_cards_detail_mastery_research_desc_second_wind',
    )
    expect(workshopCardMasteryDetailTierLabelStyle('secondWind')).toBe('default')
    expect(workshopCardMasteryDetailMasteryDescId('damage')).toBeNull()
    expect(workshopCardMasteryDetailMasteryDescStyle('damage')).toBe('stat_multiplier')
    expect(workshopCardMasteryDetailAbilityDescId('damage')).toBe(
      'ws_cards_detail_mastery_ability_desc_damage',
    )
    expect(workshopCardMasteryDetailResearchDescId('damage')).toBe(
      'ws_cards_detail_mastery_research_desc_damage',
    )
    expect(workshopCardMasteryDetailMasteryDescStyle('attackSpeed')).toBe('stat_multiplier')
    expect(workshopCardMasteryDetailAbilityDescId('attackSpeed')).toBe(
      'ws_cards_detail_mastery_ability_desc_attack_speed',
    )
    expect(workshopCardMasteryDetailResearchDescId('attackSpeed')).toBe(
      'ws_cards_detail_mastery_research_desc_attack_speed',
    )
    expect(workshopCardMasteryDetailMasteryDescStyle('health')).toBe('stat_multiplier')
    expect(workshopCardMasteryDetailAbilityDescId('health')).toBe(
      'ws_cards_detail_mastery_ability_desc_health',
    )
    expect(workshopCardMasteryDetailResearchDescId('health')).toBe(
      'ws_cards_detail_mastery_research_desc_health',
    )
    expect(workshopCardMasteryDetailMasteryDescStyle('healthRegen')).toBe('stat_multiplier')
    expect(workshopCardMasteryDetailAbilityDescId('healthRegen')).toBe(
      'ws_cards_detail_mastery_ability_desc_health_regen',
    )
    expect(workshopCardMasteryDetailResearchDescId('healthRegen')).toBe(
      'ws_cards_detail_mastery_research_desc_health_regen',
    )
    expect(workshopCardMasteryDetailMasteryDescStyle('coins')).toBe('stat_multiplier')
    expect(workshopCardMasteryDetailAbilityDescId('coins')).toBe(
      'ws_cards_detail_mastery_ability_desc_coins',
    )
    expect(workshopCardMasteryDetailResearchDescId('coins')).toBe(
      'ws_cards_detail_mastery_research_desc_coins',
    )
  })
})
