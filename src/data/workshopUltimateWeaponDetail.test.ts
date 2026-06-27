import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseResearchManifest, parseResearchSection } from '../types/research'
import {
  ultimateWeaponCoreScaledDamageSubtotal,
  ultimateWeaponCritCardChanceFraction,
  ultimateWeaponCritDamageMultiplier,
  ultimateWeaponEnhancementRows,
  ultimateWeaponGlobalDamageMultiplier,
  ultimateWeaponLabLevel,
  workshopUltimateWeaponCritDamageDisplay,
  workshopUltimateWeaponDescriptionLine,
  workshopUltimateWeaponDetailLabNamesValid,
  workshopUltimateWeaponDetailStatKeysValid,
  workshopUltimateWeaponStatDetailRows,
} from './workshopUltimateWeaponDetail'
import { WORKSHOP_ULTIMATE_DAMAGE_RELIC_SHARE } from './workshopRelicStats'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'

/**
 * Minimal workshop with just the Ultimate Crit card fields the chance helper reads. Ultimate weapons
 * only crit while the card is **equipped**, so `equipped` controls the active loadout.
 */
function ultimateCritWorkshop(opts: { stars: number; equipped?: boolean }): WorkshopPersistedV1 {
  return {
    cardActivePresetIndex: 0,
    cardPresetLoadouts: [opts.equipped ? ['ultimateCrit'] : []],
    cardEquipSlots: 28,
    cardStars: { ultimateCrit: opts.stars },
  } as unknown as WorkshopPersistedV1
}

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

describe('workshopUltimateWeaponDetail', () => {
  const data = loadResearchData()

  it('maps every configured lab to ultimate-weapon research', () => {
    expect(workshopUltimateWeaponDetailLabNamesValid(data)).toBe(true)
  })

  it('maps description stat keys to existing tracks', () => {
    expect(workshopUltimateWeaponDetailStatKeysValid()).toBe(true)
  })

  it('interpolates chain lightning description from stat levels', () => {
    const line = workshopUltimateWeaponDescriptionLine(
      'chainLightning',
      {
        chainLightningChanceLevel: 8,
        chainLightningQuantityLevel: 3,
        chainLightningDamageLevel: 5,
      },
      'On Hit: {0} chance to cast {1} Chain Lightnings dealing {2} Tower Damage.',
    )
    expect(line).toContain('17.00%')
    expect(line).toContain('4')
    expect(line).toContain('x22')
  })

  it('returns stat rows with current and next values', () => {
    const rows = workshopUltimateWeaponStatDetailRows('chainLightning', {
      chainLightningChanceLevel: 8,
      chainLightningQuantityLevel: 3,
      chainLightningDamageLevel: 5,
    })
    expect(rows).toHaveLength(3)
    const chance = rows.find((r) => r.stat === 'chance')
    expect(chance?.current).toBe('17.00%')
    expect(chance?.next).toBe('18.50%')
    expect(chance?.maxed).toBe(false)
  })

  it('marks maxed stat rows without a next value', () => {
    const rows = workshopUltimateWeaponStatDetailRows('chainLightning', {
      chainLightningChanceLevel: 15,
      chainLightningQuantityLevel: 4,
      chainLightningDamageLevel: 5,
    })
    const chance = rows.find((r) => r.stat === 'chance')
    expect(chance?.maxed).toBe(true)
    expect(chance?.next).toBeNull()
  })

  it('reads ultimate weapon lab level from simulator overrides', () => {
    const uwSi = data.sections.findIndex((s) => s.sectionSlug === 'ultimate-weapon-research')
    expect(uwSi).toBeGreaterThanOrEqual(0)
    const shockIdx =
      data.sections[uwSi]?.items.findIndex((i) => i.name === 'Shock Chance') ?? -1
    expect(shockIdx).toBeGreaterThanOrEqual(0)
    const overrides = { [`${uwSi}-${shockIdx}`]: 14 }
    expect(ultimateWeaponLabLevel(data, overrides, 'Shock Chance')).toBe(14)
  })

  it('returns enhancement rows with live shock chance value', () => {
    const uwSi = data.sections.findIndex((s) => s.sectionSlug === 'ultimate-weapon-research')
    const shockIdx =
      data.sections[uwSi]?.items.findIndex((i) => i.name === 'Shock Chance') ?? -1
    const overrides = { [`${uwSi}-${shockIdx}`]: 14 }
    const rows = ultimateWeaponEnhancementRows('chainLightning', data, overrides)
    const shock = rows.find((r) => r.labName === 'Shock Chance')
    expect(shock?.value).toBe('9.50%')
    expect(shock?.locked).toBe(false)
  })

  it('marks level-0 enhancement rows as locked', () => {
    const rows = ultimateWeaponEnhancementRows('chainLightning', data, {})
    const shock = rows.find((r) => r.labName === 'Shock Chance')
    expect(shock?.level).toBe(0)
    expect(shock?.locked).toBe(true)
    expect(shock?.value).toBe('2.50%')
  })

  it('formats crit-scaled tower damage as a suffix multiple (incl. submodule)', () => {
    // chainLightningDamageLevel 12 → 191; +50 module → 241; core ×5.5 + global ×1.0545 ≈ 1398.
    expect(
      workshopUltimateWeaponCritDamageDisplay(
        'chainLightningDamageLevel',
        12,
        50,
        5.5,
        1.0545,
      ),
    ).toBe('1398x')
    // Below 100 keeps one decimal (e.g. milestone[0]=2 × 1.25 = 2.5).
    expect(
      workshopUltimateWeaponCritDamageDisplay('chainLightningDamageLevel', 0, 0, 1, 1.25),
    ).toBe('2.5x')
  })

  it('applies per-term core rounding on the damage subtotal', () => {
    expect(ultimateWeaponCoreScaledDamageSubtotal(191, 50, 5.5)).toBe(1326)
  })

  it('applies the core-module multiplier on the damage subtotal', () => {
    // 191 + 50 submodule = 241; core ×5.5 only = 1326x.
    expect(
      workshopUltimateWeaponCritDamageDisplay(
        'chainLightningDamageLevel',
        12,
        50,
        5.5,
        1,
      ),
    ).toBe('1326x')
    // Core × crit: 1326 × 2 = 2652.
    expect(
      workshopUltimateWeaponCritDamageDisplay(
        'chainLightningDamageLevel',
        12,
        50,
        5.5,
        2,
      ),
    ).toBe('2652x')
  })

  it('applies calibrated ultimate-damage relic share into the global UW multiplier', () => {
    const workshop = {
      relicOwnedIds: ['party_mask', 'duck'],
    } as unknown as WorkshopPersistedV1
    const expected = 1 + (7 * WORKSHOP_ULTIMATE_DAMAGE_RELIC_SHARE) / 100
    expect(ultimateWeaponGlobalDamageMultiplier(workshop)).toBeCloseTo(expected, 5)
  })

  it('overrides the damage placeholder in the description line', () => {
    const line = workshopUltimateWeaponDescriptionLine(
      'chainLightning',
      {
        chainLightningChanceLevel: 8,
        chainLightningQuantityLevel: 3,
        chainLightningDamageLevel: 12,
      },
      'On Hit: {0} chance to cast {1} Chain Lightnings dealing {2} Tower Damage (scales with all Crit).',
      { chainLightningDamageLevel: '1398x' },
    )
    expect(line).toContain('17.00%')
    expect(line).toContain('dealing 1398x Tower Damage')
    expect(line).not.toContain('x191')
  })

  it('returns the Ultimate Crit chance only when the card is equipped (no mastery → 3% at 7★)', () => {
    expect(
      ultimateWeaponCritCardChanceFraction(
        ultimateCritWorkshop({ stars: 7, equipped: true }),
        null,
        {},
      ),
    ).toBeCloseTo(0.03, 5)
    // Owned (7★) but unequipped → no crit, like the live build's Ultimate Crit card.
    expect(
      ultimateWeaponCritCardChanceFraction(
        ultimateCritWorkshop({ stars: 7, equipped: false }),
        null,
        {},
      ),
    ).toBe(0)
    expect(
      ultimateWeaponCritCardChanceFraction(ultimateCritWorkshop({ stars: 0 }), null, {}),
    ).toBe(0)
  })

  it('yields a unit crit multiplier when the Ultimate Crit card is not equipped', () => {
    expect(
      ultimateWeaponCritDamageMultiplier(
        ultimateCritWorkshop({ stars: 7, equipped: false }),
        null,
        {},
      ),
    ).toBe(1)
  })
})
