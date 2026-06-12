import { describe, expect, it } from 'vitest'
import {
  parseTowerUnifiedCsv,
  serializeTowerUnifiedCsv,
  serializeTowerUnifiedCsvBuilds,
  towerUnifiedPrimaryBuild,
  TOWER_UNIFIED_CSV_MAGIC,
} from './towerUnifiedCsv'
import { DEFAULT_THEME_SELECTION } from './data/gameThemes'
import { defaultWorkshopPersisted } from './labPresetsStorage'
import {
  defaultModulePresetSnapshots,
  extractWorkshopModulePresetSnapshot,
  modulePresetSnapshotsFromPersisted,
  workshopPersistedWithModulePresets,
  type WorkshopModulePresetSnapshot,
} from './data/workshopModulePresets'
import type { TowerThemesSnapshot } from './towerDataThemes'
import type { GuardianChipState } from './guardianChipStorage'
import { GAME_RESEARCH_SLOT_COUNT } from './playerSave/gameResearchIndex'

describe('towerUnifiedCsv', () => {
  it('roundtrips lab levels and workshop', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      damageLevel: 9,
      category: 'utility' as const,
      multiplier: 5 as const,
    }
    const overrides = { '0-0': 2, '1-1': 7 }
    const csv = serializeTowerUnifiedCsv(overrides, ws)
    expect(csv.startsWith(`${TOWER_UNIFIED_CSV_MAGIC}\r\n`)).toBe(true)
    const parsed = parseTowerUnifiedCsv(csv)
    expect(parsed.tag).toBe('ok')
    if (parsed.tag === 'ok') {
      const primary = towerUnifiedPrimaryBuild(parsed)
      expect(primary.overrides).toEqual(overrides)
      expect(primary.workshop.damageLevel).toBe(9)
      expect(primary.workshop.category).toBe('utility')
      expect(primary.workshop.multiplier).toBe(5)
    }
  })

  it('roundtrips build name and multiple builds', () => {
    const wsA = { ...defaultWorkshopPersisted(), damageLevel: 1 }
    const wsB = { ...defaultWorkshopPersisted(), damageLevel: 2 }
    const csv = serializeTowerUnifiedCsvBuilds([
      { name: 'Raid', levelOverrides: { '0-0': 1 }, workshop: wsA },
      { name: 'Farm', levelOverrides: { '1-1': 3 }, workshop: wsB },
    ])
    expect(csv).toContain('build,name,Raid')
    expect(csv).toContain('build,name,Farm')
    const parsed = parseTowerUnifiedCsv(csv)
    expect(parsed.tag).toBe('ok')
    if (parsed.tag === 'ok') {
      expect(parsed.builds).toHaveLength(2)
      expect(parsed.builds[0]?.name).toBe('Raid')
      expect(parsed.builds[0]?.overrides['0-0']).toBe(1)
      expect(parsed.builds[1]?.name).toBe('Farm')
      expect(parsed.builds[1]?.workshop.damageLevel).toBe(2)
    }
  })

  it('serializes optional build name on single export', () => {
    const csv = serializeTowerUnifiedCsv({}, defaultWorkshopPersisted(), 'My build')
    expect(csv).toContain('build,name,My build')
    const parsed = parseTowerUnifiedCsv(csv)
    if (parsed.tag === 'ok') {
      expect(towerUnifiedPrimaryBuild(parsed).name).toBe('My build')
    }
  })

  it('roundtrips cards, modules sim, themes, and relics', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      simAssistModuleSlot: 'armor' as const,
      simAttackSpeedModuleSubEffect: 0.12,
      cardStars: { ...defaultWorkshopPersisted().cardStars, damage: 5 },
      relicOwnedIds: ['t_iv_harmonic', 't_xiv_arcane'],
      simRelicsBonusFraction: 0.12,
    }
    const themes: TowerThemesSnapshot = {
      selection: { ...DEFAULT_THEME_SELECTION, tower: 'tower-plasma' },
      ownedIds: ['tower-plasma', 'bg-interstellar'],
    }
    const csv = serializeTowerUnifiedCsv({ '2-2': 4 }, ws, undefined, themes)
    expect(csv).toContain('theme,ownedIds,')
    expect(csv).toContain('theme,selection,')
    expect(csv).toContain('relic,ownedIds,')
    expect(csv).toContain('relic,simBonusFraction,0.12')
    expect(csv).not.toContain('ws,relicOwnedIds,')
    expect(csv).not.toContain('theme,owned,')
    expect(csv).not.toContain('theme,sel.')
    const parsed = parseTowerUnifiedCsv(csv)
    expect(parsed.tag).toBe('ok')
    if (parsed.tag === 'ok') {
      const b = towerUnifiedPrimaryBuild(parsed)
      expect(b.overrides['2-2']).toBe(4)
      expect(b.workshop.simAssistModuleSlot).toBe('armor')
      expect(b.workshop.cardStars.damage).toBe(5)
      expect(b.workshop.relicOwnedIds).toEqual(['t_iv_harmonic', 't_xiv_arcane'])
      expect(b.workshop.simRelicsBonusFraction).toBeCloseTo(0.12)
      expect(parsed.themes?.selection?.tower).toBe('tower-plasma')
      expect(parsed.themes?.ownedIds).toContain('tower-plasma')
    }
  })

  it('roundtrips guardian chips and gameResearchLevel', () => {
    const researchLevel = Array.from({ length: GAME_RESEARCH_SLOT_COUNT }, (_, i) =>
      i === 0 ? 42 : 0,
    )
    const guardianChips: GuardianChipState = {
      slots: ['attack', null, 'fetch', null],
      unlockedSlots: [true, false, true, false],
      unlockedChipIds: ['attack', 'fetch'],
      upgrades: {
        attack: { percent: 3, cooldown: 2, targets: 4 },
        ally: { recovery: 1, maxRecovery: 1, cooldown: 1 },
        bounty: { multiplier: 1, cooldown: 1, targets: 1 },
        fetch: { cooldown: 5, findChance: 2, doubleFindChance: 1 },
        summon: { cooldown: 1, duration: 1, cashBonus: 1 },
        scout: { cooldown: 1, rangeBonus: 1, duration: 1 },
      },
    }
    const csv = serializeTowerUnifiedCsv(
      { '0-0': 1 },
      defaultWorkshopPersisted(),
      undefined,
      { ownedIds: ['tower-plasma'], selection: { ...DEFAULT_THEME_SELECTION, music: 'music-retro' } },
      guardianChips,
      researchLevel,
    )
    expect(csv).toContain('guardian,state,')
    expect(csv).toContain('lab,gameResearchLevel,')
    const parsed = parseTowerUnifiedCsv(csv)
    expect(parsed.tag).toBe('ok')
    if (parsed.tag === 'ok') {
      const primary = towerUnifiedPrimaryBuild(parsed)
      expect(primary.gameResearchLevel?.[0]).toBe(42)
      expect(parsed.guardianChips?.slots[0]).toBe('attack')
      expect(parsed.guardianChips?.upgrades.fetch.cooldown).toBe(5)
      expect(parsed.themes?.selection?.music).toBe('music-retro')
    }
  })

  it('imports legacy ws relic rows from older tower CSV exports', () => {
    const lines = [
      TOWER_UNIFIED_CSV_MAGIC,
      'type,key,value',
      'ws,relicOwnedIds,["t_iv_harmonic","t_xiv_arcane"]',
      'ws,simRelicsBonusFraction,0.12',
    ]
    const parsed = parseTowerUnifiedCsv(lines.join('\n'))
    expect(parsed.tag).toBe('ok')
    if (parsed.tag === 'ok') {
      const w = towerUnifiedPrimaryBuild(parsed).workshop
      expect(w.relicOwnedIds).toEqual(['t_iv_harmonic', 't_xiv_arcane'])
      expect(w.simRelicsBonusFraction).toBeCloseTo(0.12)
    }
  })

  it('roundtrips all five module loadout presets', () => {
    const snapshots = defaultModulePresetSnapshots()
    const preset2: WorkshopModulePresetSnapshot = {
      ...extractWorkshopModulePresetSnapshot(defaultWorkshopPersisted()),
      simCoreModuleLevel: 42,
      simGeneratorChassisModuleId: 'pulsarHarvester',
      simGeneratorChassisModuleRarity: 'legendary',
    }
    snapshots[2] = preset2
    const ws = workshopPersistedWithModulePresets(defaultWorkshopPersisted(), snapshots, 2)
    const csv = serializeTowerUnifiedCsv({}, ws)
    expect(csv).toContain('module,preset.2,')
    expect(csv).toContain('module,activePresetIndex,2')
    const parsed = parseTowerUnifiedCsv(csv)
    expect(parsed.tag).toBe('ok')
    if (parsed.tag === 'ok') {
      const out = towerUnifiedPrimaryBuild(parsed).workshop
      expect(out.moduleActivePresetIndex).toBe(2)
      const outSnapshots = modulePresetSnapshotsFromPersisted(out)
      expect(outSnapshots[2]?.simCoreModuleLevel).toBe(42)
      expect(outSnapshots[2]?.simGeneratorChassisModuleId).toBe('pulsarHarvester')
      expect(out.simCoreModuleLevel).toBe(42)
      expect(out.simGeneratorChassisModuleId).toBe('pulsarHarvester')
    }
  })

  it('roundtrips all chassis module merge tiers', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      simCannonChassisModuleRarity: 'rare' as const,
      simArmorChassisModuleRarity: 'star_5' as const,
      simGeneratorAssistChassisModuleRarity: 'legendary_plus' as const,
    }
    const csv = serializeTowerUnifiedCsv({}, ws)
    const withBom = `\uFEFF${csv}`
    const parsed = parseTowerUnifiedCsv(withBom)
    expect(parsed.tag).toBe('ok')
    if (parsed.tag === 'ok') {
      const w = towerUnifiedPrimaryBuild(parsed).workshop
      expect(w.simCannonChassisModuleRarity).toBe('rare')
      expect(w.simArmorChassisModuleRarity).toBe('star_5')
      expect(w.simGeneratorAssistChassisModuleRarity).toBe('legendary_plus')
    }
  })

  it('roundtrips bot workshop fields', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      flameOwned: true,
      goldenBotBonusLevel: 12,
      botBotActive: false,
      amplifyBotEchoingShotUnlocked: true,
      goldenBotBonusCellsUnlocked: true,
      goldenBotBonusCellsLevel: 18,
      botBotMaximumPowerLevel: -1,
    }
    const csv = serializeTowerUnifiedCsv({}, ws)
    expect(csv).toContain('ws,flameOwned,true')
    expect(csv).toContain('ws,goldenBotBonusLevel,12')
    expect(csv).toContain('ws,botBotActive,false')
    expect(csv).toContain('ws,amplifyBotEchoingShotUnlocked,true')
    expect(csv).toContain('ws,goldenBotBonusCellsLevel,18')
    const parsed = parseTowerUnifiedCsv(csv)
    expect(parsed.tag).toBe('ok')
    if (parsed.tag === 'ok') {
      const w = towerUnifiedPrimaryBuild(parsed).workshop
      expect(w.flameOwned).toBe(true)
      expect(w.goldenBotBonusLevel).toBe(12)
      expect(w.botBotActive).toBe(false)
      expect(w.amplifyBotEchoingShotUnlocked).toBe(true)
      expect(w.goldenBotBonusCellsLevel).toBe(18)
      expect(w.botBotMaximumPowerLevel).toBe(-1)
    }
  })

  it('rejects unknown theme row keys', () => {
    const lines = [
      TOWER_UNIFIED_CSV_MAGIC,
      'type,key,value',
      'theme,sel.tower,tower-plasma',
    ]
    expect(parseTowerUnifiedCsv(lines.join('\n')).tag).toBe('invalid')
  })

  it('accepts theme selection without ownedIds', () => {
    const csv = serializeTowerUnifiedCsv(
      {},
      defaultWorkshopPersisted(),
      undefined,
      { ownedIds: [], selection: { ...DEFAULT_THEME_SELECTION, tower: 'tower-plasma' } },
    )
    const parsed = parseTowerUnifiedCsv(csv)
    expect(parsed.tag).toBe('ok')
    if (parsed.tag === 'ok') {
      expect(parsed.themes?.selection?.tower).toBe('tower-plasma')
    }
  })

  it('returns none for non-tower CSV', () => {
    const r = parseTowerUnifiedCsv('key,level\n0-0,1\n')
    expect(r.tag).toBe('none')
  })

  it('returns invalid for bad ws multiplier', () => {
    const lines = [
      TOWER_UNIFIED_CSV_MAGIC,
      'type,key,value',
      'ws,multiplier,3',
    ]
    expect(parseTowerUnifiedCsv(lines.join('\n')).tag).toBe('invalid')
  })

  it('returns invalid for bad module preset index', () => {
    const lines = [
      TOWER_UNIFIED_CSV_MAGIC,
      'type,key,value',
      'module,activePresetIndex,9',
    ]
    expect(parseTowerUnifiedCsv(lines.join('\n')).tag).toBe('invalid')
  })
})
