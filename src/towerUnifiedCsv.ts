import {
  escapeCsvCell,
  parseCsvLine,
  sortOverrideKeys,
} from './labLevelOverridesCsv'
import {
  WORKSHOP_BOT_ACTIVE_ORDER,
  WORKSHOP_BOT_OWNED_ORDER,
  WORKSHOP_BOT_ORDER,
  WORKSHOP_BOT_SPECIAL_BY_BOT,
  WORKSHOP_BOT_SPECIAL_LEVEL_ORDER,
  WORKSHOP_BOT_UPGRADE_ORDER,
} from './data/workshopBots'
import {
  WORKSHOP_ULTIMATE_ACTIVE_ORDER,
  WORKSHOP_ULTIMATE_OWNED_ORDER,
  WORKSHOP_ULTIMATE_UPGRADE_ORDER,
} from './data/workshopUltimate'
import { WORKSHOP_ULTIMATE_PLUS_LEVEL_ORDER } from './data/workshopUltimatePlusData'
import {
  WORKSHOP_GAME_CARD_ORDER,
  type WorkshopGameCardId,
} from './data/workshopGameCards'
import { WORKSHOP_CARD_PRESET_COUNT } from './data/workshopGameCardWiki'
import {
  modulePresetSnapshotsFromPersisted,
  sanitizeModulePresetSnapshots,
  syncModulePresetsForExport,
  WORKSHOP_MODULE_PRESET_COUNT,
  clampWorkshopModuleActivePresetIndex,
} from './data/workshopModulePresets'
import {
  sanitizeChassisModuleEffectTier,
  sanitizeChassisModuleMergeTier,
} from './data/workshopChassisModuleShared'
import { parseRelicOwnedIdsCell } from './data/workshopRelics'
import { sanitizeWorkshopPersisted, type WorkshopPersistedV1 } from './labPresetsStorage'
import { sanitizeThemeOwnedIds, type TowerThemesSnapshot } from './towerDataThemes'

/** First line of a combined tower backup CSV. */
export const TOWER_UNIFIED_CSV_MAGIC = 'tower_csv_v1'

const HEADER = 'type,key,value'

const LAB_KEY_RE = /^\d+-\d+$/

const WS_BOOL_FIELDS = new Set<keyof WorkshopPersistedV1>([
  'hideMaxed',
  'simCannonAssistUnlocked',
  'simArmorAssistUnlocked',
  'simGeneratorAssistUnlocked',
  'simCoreAssistUnlocked',
  ...WORKSHOP_ULTIMATE_ACTIVE_ORDER,
  ...WORKSHOP_ULTIMATE_OWNED_ORDER,
  ...WORKSHOP_BOT_ACTIVE_ORDER,
  ...WORKSHOP_BOT_OWNED_ORDER,
  ...WORKSHOP_BOT_ORDER.map((id) => WORKSHOP_BOT_SPECIAL_BY_BOT[id]),
])

const WS_FIELDS: readonly (keyof WorkshopPersistedV1)[] = [
  'hideMaxed',
  'mainTab',
  'category',
  'multiplier',
  'damageLevel',
  'attackSpeedLevel',
  'critChanceLevel',
  'critFactorLevel',
  'attackRangeLevel',
  'damagePerMeterLevel',
  'multishotChanceLevel',
  'multishotTargetsLevel',
  'rapidFireChanceLevel',
  'rapidFireDurationLevel',
  'bounceShotChanceLevel',
  'bounceShotTargetsLevel',
  'bounceShotRangeLevel',
  'superCritChanceLevel',
  'superCritMultLevel',
  'rendArmorChanceLevel',
  'rendArmorMultLevel',
  'healthLevel',
  'healthRegenLevel',
  'defensePercentLevel',
  'defenseAbsoluteLevel',
  'thornDamageLevel',
  'lifestealLevel',
  'knockbackChanceLevel',
  'knockbackForceLevel',
  'orbSpeedLevel',
  'orbsLevel',
  'shockwaveSizeLevel',
  'shockwaveFrequencyLevel',
  'landMineChanceLevel',
  'landMineDamageLevel',
  'landMineRadiusLevel',
  'deathDefyLevel',
  'wallHealthLevel',
  'wallRebuildLevel',
  'cashBonusLevel',
  'cashPerWaveLevel',
  'coinsKillBonusLevel',
  'coinsWaveLevel',
  'freeAttackUpgradeLevel',
  'freeDefenseUpgradeLevel',
  'freeUtilityUpgradeLevel',
  'interestPerWaveLevel',
  'recoveryAmountLevel',
  'maxRecoveryLevel',
  'packageChanceLevel',
  'enemyAttackLevelSkipLevel',
  'enemyHealthLevelSkipLevel',
  'enhanceDamageLevel',
  'enhanceRendArmorLevel',
  'enhanceCritFactorLevel',
  'enhanceDamagePerMeterLevel',
  'enhanceSuperCritMultLevel',
  'enhanceAttackSpeedLevel',
  'enhanceHealthLevel',
  'enhanceHealthRegenLevel',
  'enhanceDefenseAbsoluteLevel',
  'enhanceLandMineDamageLevel',
  'enhanceWallHealthLevel',
  'enhanceOrbSizeLevel',
  'enhanceCashBonusLevel',
  'enhanceCoinBonusLevel',
  'enhanceCellsKillBonusLevel',
  'enhanceFreeUpgradesLevel',
  'enhanceRecoveryPackageLevel',
  'enhanceEnemyLevelSkipLevel',
  'simAttackSpeedModuleSubEffect',
  'simBerserkerDamageTaken',
  'simPerkDamageQuantity',
  'simAssistModuleSlot',
  'simCannonModuleLevel',
  'simArmorModuleLevel',
  'simGeneratorModuleLevel',
  'simCoreModuleLevel',
  'simCannonChassisModuleId',
  'simArmorChassisModuleId',
  'simGeneratorChassisModuleId',
  'simCoreChassisModuleId',
  'simCannonChassisModuleRarity',
  'simArmorChassisModuleRarity',
  'simGeneratorChassisModuleRarity',
  'simCoreChassisModuleRarity',
  'simSubmoduleSelections',
  'simCannonAssistUnlocked',
  'simArmorAssistUnlocked',
  'simGeneratorAssistUnlocked',
  'simCoreAssistUnlocked',
  'simCannonAssistChassisModuleId',
  'simArmorAssistChassisModuleId',
  'simGeneratorAssistChassisModuleId',
  'simCoreAssistChassisModuleId',
  'simCannonAssistChassisModuleRarity',
  'simArmorAssistChassisModuleRarity',
  'simGeneratorAssistChassisModuleRarity',
  'simCoreAssistChassisModuleRarity',
  'simCannonAssistUniqueRarity',
  'simArmorAssistUniqueRarity',
  'simGeneratorAssistUniqueRarity',
  'simCoreAssistUniqueRarity',
  'simCannonAssistStoneEfficiency',
  'simArmorAssistStoneEfficiency',
  'simGeneratorAssistStoneEfficiency',
  'simCoreAssistStoneEfficiency',
  'simCannonAssistMainStoneEfficiency',
  'simArmorAssistMainStoneEfficiency',
  'simGeneratorAssistMainStoneEfficiency',
  'simCoreAssistMainStoneEfficiency',
  'simCannonAssistSubStoneEfficiency',
  'simArmorAssistSubStoneEfficiency',
  'simGeneratorAssistSubStoneEfficiency',
  'simCoreAssistSubStoneEfficiency',
  ...WORKSHOP_ULTIMATE_UPGRADE_ORDER,
  ...WORKSHOP_ULTIMATE_ACTIVE_ORDER,
  ...WORKSHOP_ULTIMATE_OWNED_ORDER,
  ...WORKSHOP_ULTIMATE_PLUS_LEVEL_ORDER,
  ...WORKSHOP_BOT_UPGRADE_ORDER,
  ...WORKSHOP_BOT_ACTIVE_ORDER,
  ...WORKSHOP_BOT_OWNED_ORDER,
  ...WORKSHOP_BOT_ORDER.map((id) => WORKSHOP_BOT_SPECIAL_BY_BOT[id]),
  ...WORKSHOP_BOT_SPECIAL_LEVEL_ORDER,
]

const LEGACY_WS_FIELDS = ['relicOwnedIds', 'simRelicsBonusFraction'] as const satisfies readonly (keyof WorkshopPersistedV1)[]
const CARD_STAR_PREFIX = 'star.'
const CARD_PRESET_PREFIX = 'preset.'
const MODULE_PRESET_PREFIX = 'preset.'

export type TowerUnifiedCsvBuild = {
  name?: string
  overrides: Record<string, number>
  workshop: WorkshopPersistedV1
}

export type ParseTowerUnifiedCsv =
  | { tag: 'none' }
  | { tag: 'invalid' }
  | { tag: 'ok'; builds: TowerUnifiedCsvBuild[]; themes?: TowerThemesSnapshot }

/** First build in a parsed file (compare / single-build callers). */
export function towerUnifiedPrimaryBuild(
  parsed: Extract<ParseTowerUnifiedCsv, { tag: 'ok' }>,
): TowerUnifiedCsvBuild {
  return parsed.builds[0]!
}

function sortLabKeys(keys: string[]): string[] {
  return sortOverrideKeys(keys)
}

function serializeWsValue(v: WorkshopPersistedV1, k: keyof WorkshopPersistedV1): string {
  const x = v[k]
  if (typeof x === 'boolean') return x ? 'true' : 'false'
  if (k === 'simSubmoduleSelections') {
    return JSON.stringify(x)
  }
  return String(x)
}

function appendCardRows(lines: string[], workshop: WorkshopPersistedV1): void {
  for (const id of WORKSHOP_GAME_CARD_ORDER) {
    lines.push(`card,${CARD_STAR_PREFIX}${id},${workshop.cardStars[id] ?? 0}`)
  }
  for (let i = 0; i < WORKSHOP_CARD_PRESET_COUNT; i++) {
    const ids = workshop.cardPresetLoadouts[i] ?? []
    lines.push(`card,${CARD_PRESET_PREFIX}${i},${escapeCsvCell(ids.join('|'))}`)
  }
  lines.push(`card,activePresetIndex,${workshop.cardActivePresetIndex}`)
  lines.push(`card,equipSlots,${workshop.cardEquipSlots}`)
}

function appendModuleRows(lines: string[], workshop: WorkshopPersistedV1): void {
  const synced = syncModulePresetsForExport(workshop)
  const snapshots = modulePresetSnapshotsFromPersisted(synced)
  for (let i = 0; i < WORKSHOP_MODULE_PRESET_COUNT; i++) {
    lines.push(
      `module,${MODULE_PRESET_PREFIX}${i},${escapeCsvCell(JSON.stringify(snapshots[i]))}`,
    )
  }
  lines.push(
    `module,activePresetIndex,${clampWorkshopModuleActivePresetIndex(synced.moduleActivePresetIndex)}`,
  )
}

function appendThemeRows(lines: string[], themes: TowerThemesSnapshot): void {
  lines.push(`theme,ownedIds,${escapeCsvCell(JSON.stringify(themes.ownedIds))}`)
}

function appendRelicRows(lines: string[], workshop: WorkshopPersistedV1): void {
  lines.push(`relic,ownedIds,${escapeCsvCell(JSON.stringify(workshop.relicOwnedIds))}`)
  lines.push(`relic,simBonusFraction,${workshop.simRelicsBonusFraction}`)
}

function appendBuildRows(
  lines: string[],
  build: {
    name?: string
    levelOverrides: Record<string, number>
    workshop: WorkshopPersistedV1
  },
): void {
  const trimmedName = build.name?.trim()
  if (trimmedName) {
    lines.push(`build,name,${escapeCsvCell(trimmedName)}`)
  }
  for (const k of sortLabKeys(Object.keys(build.levelOverrides))) {
    lines.push(`lab,${escapeCsvCell(k)},${build.levelOverrides[k] ?? 0}`)
  }
  for (const k of WS_FIELDS) {
    lines.push(`ws,${k},${serializeWsValue(build.workshop, k)}`)
  }
  appendRelicRows(lines, build.workshop)
  appendCardRows(lines, build.workshop)
  appendModuleRows(lines, build.workshop)
}

/** One or more named builds plus optional global themes in a single tower CSV file. */
export function serializeTowerUnifiedCsvBuilds(
  builds: readonly {
    name?: string
    levelOverrides: Record<string, number>
    workshop: WorkshopPersistedV1
  }[],
  themes?: TowerThemesSnapshot,
): string {
  const lines: string[] = [TOWER_UNIFIED_CSV_MAGIC, HEADER]
  if (themes) appendThemeRows(lines, themes)
  for (const b of builds) {
    appendBuildRows(lines, b)
  }
  return `${lines.join('\r\n')}\r\n`
}

/** Lab + workshop + cards (+ optional build name) as one CSV. */
export function serializeTowerUnifiedCsv(
  levelOverrides: Record<string, number>,
  workshop: WorkshopPersistedV1,
  buildName?: string,
  themes?: TowerThemesSnapshot,
): string {
  return serializeTowerUnifiedCsvBuilds(
    [{ name: buildName, levelOverrides, workshop }],
    themes,
  )
}

function parseBoolCell(s: string): boolean | null {
  const t = s.trim().toLowerCase()
  if (t === 'true' || t === '1' || t === 'yes') return true
  if (t === 'false' || t === '0' || t === 'no' || t === '') return false
  return null
}

function isWorkshopGameCardId(s: string): s is WorkshopGameCardId {
  return (WORKSHOP_GAME_CARD_ORDER as readonly string[]).includes(s)
}

type BuildAccumulator = {
  name?: string
  overrides: Record<string, number>
  wsRaw: Record<string, unknown>
  cardStars: Record<string, number>
  cardPresetLoadouts: string[][]
  modulePresetSnapshots: (unknown | undefined)[]
  moduleActivePresetIndex?: number
}

function newBuildAccumulator(): BuildAccumulator {
  return {
    overrides: {},
    wsRaw: {},
    cardStars: {},
    cardPresetLoadouts: Array.from({ length: WORKSHOP_CARD_PRESET_COUNT }, () => []),
    modulePresetSnapshots: Array.from({ length: WORKSHOP_MODULE_PRESET_COUNT }, () => undefined),
  }
}

function flushBuildAccumulator(
  builds: TowerUnifiedCsvBuild[],
  acc: BuildAccumulator,
): BuildAccumulator {
  const hasModuleRows =
    acc.moduleActivePresetIndex !== undefined ||
    acc.modulePresetSnapshots.some((snap) => snap !== undefined)
  if (
    Object.keys(acc.overrides).length === 0 &&
    Object.keys(acc.wsRaw).length === 0 &&
    Object.keys(acc.cardStars).length === 0 &&
    !hasModuleRows
  ) {
    return newBuildAccumulator()
  }
  const wsRaw = { ...acc.wsRaw }
  if (Object.keys(acc.cardStars).length > 0) {
    wsRaw.cardStars = acc.cardStars
  }
  if (acc.cardPresetLoadouts.some((tab) => tab.length > 0)) {
    wsRaw.cardPresetLoadouts = acc.cardPresetLoadouts
  }
  if (hasModuleRows) {
    const live = sanitizeWorkshopPersisted(wsRaw)
    wsRaw.modulePresetSnapshots = sanitizeModulePresetSnapshots(
      acc.modulePresetSnapshots,
      live,
    )
    wsRaw.moduleActivePresetIndex = clampWorkshopModuleActivePresetIndex(
      acc.moduleActivePresetIndex ?? live.moduleActivePresetIndex,
    )
  }
  builds.push({
    name: acc.name,
    overrides: { ...acc.overrides },
    workshop: sanitizeWorkshopPersisted(wsRaw),
  })
  return newBuildAccumulator()
}

function parseWsRow(wsRaw: Record<string, unknown>, wsKey: keyof WorkshopPersistedV1, valCell: string): boolean {
  if (WS_BOOL_FIELDS.has(wsKey)) {
    const b = parseBoolCell(valCell)
    if (b === null) return false
    wsRaw[wsKey] = b
    return true
  }
  if (wsKey === 'mainTab') {
    const t = valCell.toLowerCase()
    if (t !== 'upgrade' && t !== 'enhance' && t !== 'modules' && t !== 'cards') return false
    wsRaw[wsKey] = t
    return true
  }
  if (wsKey === 'simAssistModuleSlot') {
    const t = valCell.toLowerCase()
    if (t !== 'cannon' && t !== 'armor' && t !== 'generator' && t !== 'core') return false
    wsRaw[wsKey] = t
    return true
  }
  if (
    wsKey === 'simCannonChassisModuleId' ||
    wsKey === 'simArmorChassisModuleId' ||
    wsKey === 'simGeneratorChassisModuleId' ||
    wsKey === 'simCoreChassisModuleId' ||
    wsKey === 'simCannonAssistChassisModuleId' ||
    wsKey === 'simArmorAssistChassisModuleId' ||
    wsKey === 'simGeneratorAssistChassisModuleId' ||
    wsKey === 'simCoreAssistChassisModuleId'
  ) {
    wsRaw[wsKey] = valCell.trim()
    return true
  }
  if (
    wsKey === 'simCannonChassisModuleRarity' ||
    wsKey === 'simArmorChassisModuleRarity' ||
    wsKey === 'simGeneratorChassisModuleRarity' ||
    wsKey === 'simCoreChassisModuleRarity' ||
    wsKey === 'simCannonAssistChassisModuleRarity' ||
    wsKey === 'simArmorAssistChassisModuleRarity' ||
    wsKey === 'simGeneratorAssistChassisModuleRarity' ||
    wsKey === 'simCoreAssistChassisModuleRarity'
  ) {
    wsRaw[wsKey] = sanitizeChassisModuleMergeTier(valCell.trim().toLowerCase())
    return true
  }
  if (
    wsKey === 'simCannonAssistUniqueRarity' ||
    wsKey === 'simArmorAssistUniqueRarity' ||
    wsKey === 'simGeneratorAssistUniqueRarity' ||
    wsKey === 'simCoreAssistUniqueRarity'
  ) {
    wsRaw[wsKey] = sanitizeChassisModuleEffectTier(valCell.trim().toLowerCase())
    return true
  }
  if (wsKey === 'simSubmoduleSelections') {
    wsRaw[wsKey] = valCell.trim()
    return true
  }
  if (wsKey === 'relicOwnedIds') {
    wsRaw[wsKey] = parseRelicOwnedIdsCell(valCell)
    return true
  }
  if (
    wsKey === 'simRelicsBonusFraction' ||
    wsKey === 'simBerserkerDamageTaken' ||
    wsKey === 'simAttackSpeedModuleSubEffect'
  ) {
    const n = valCell === '' ? 0 : Number(valCell)
    if (!Number.isFinite(n) || n < 0) return false
    wsRaw[wsKey] = n
    return true
  }
  if (wsKey === 'category') {
    const t = valCell.toLowerCase()
    if (!['attack', 'defense', 'utility', 'ultimate'].includes(t)) return false
    wsRaw[wsKey] = t
    return true
  }
  if (wsKey === 'multiplier') {
    if (valCell === 'max') {
      wsRaw[wsKey] = 'max'
      return true
    }
    const n = Number(valCell)
    if (![1, 5, 10, 100].includes(n)) return false
    wsRaw[wsKey] = n
    return true
  }
  const n = valCell === '' ? 0 : Number(valCell)
  if (!Number.isFinite(n) || !Number.isInteger(n)) return false
  wsRaw[wsKey] = n
  return true
}

/**
 * Parse combined tower CSV. `none` if the file is not this format.
 */
export function parseTowerUnifiedCsv(text: string): ParseTowerUnifiedCsv {
  const content = text.replace(/^\uFEFF/, '')
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+$/, ''))
    .filter((l) => l.length > 0)
  if (lines.length === 0) return { tag: 'none' }
  if (lines[0]!.trim() !== TOWER_UNIFIED_CSV_MAGIC) return { tag: 'none' }

  let start = 1
  if (lines.length >= 2) {
    const h = parseCsvLine(lines[1]!)
    const h0 = String(h[0] ?? '')
      .trim()
      .toLowerCase()
    const h1 = String(h[1] ?? '')
      .trim()
      .toLowerCase()
    const h2 = String(h[2] ?? '')
      .trim()
      .toLowerCase()
    if (h0 === 'type' && h1 === 'key' && h2 === 'value') start = 2
  }

  const builds: TowerUnifiedCsvBuild[] = []
  let acc = newBuildAccumulator()
  const themeOwned = new Set<string>()

  for (let i = start; i < lines.length; i += 1) {
    const r = parseCsvLine(lines[i]!)
    if (r.length < 3) return { tag: 'invalid' }
    const kind = String(r[0] ?? '')
      .trim()
      .toLowerCase()
    const key = String(r[1] ?? '').trim()
    const valCell =
      r.length > 3 ? r.slice(2).join(',') : String(r[2] ?? '').trim()
    if (!kind || !key) return { tag: 'invalid' }

    if (kind === 'theme') {
      if (key === 'ownedIds') {
        let parsed: unknown
        try {
          parsed = JSON.parse(valCell)
        } catch {
          return { tag: 'invalid' }
        }
        for (const id of sanitizeThemeOwnedIds(parsed)) {
          themeOwned.add(id)
        }
        continue
      }
      return { tag: 'invalid' }
    }

    if (kind === 'relic') {
      if (key === 'ownedIds') {
        acc.wsRaw.relicOwnedIds = parseRelicOwnedIdsCell(valCell)
        continue
      }
      if (key === 'simBonusFraction' || key === 'simRelicsBonusFraction') {
        const n = valCell === '' ? 0 : Number(valCell)
        if (!Number.isFinite(n) || n < 0) return { tag: 'invalid' }
        acc.wsRaw.simRelicsBonusFraction = n
        continue
      }
      return { tag: 'invalid' }
    }

    if (kind === 'build') {
      if (key !== 'name') return { tag: 'invalid' }
      acc = flushBuildAccumulator(builds, acc)
      const trimmed = valCell.trim()
      acc.name = trimmed.length > 0 ? trimmed : undefined
      continue
    }

    if (kind === 'lab') {
      if (!LAB_KEY_RE.test(key)) return { tag: 'invalid' }
      const n = valCell === '' ? 0 : Number(valCell)
      if (!Number.isFinite(n)) return { tag: 'invalid' }
      acc.overrides[key] = n
      continue
    }

    if (kind === 'ws') {
      const allowed = new Set<keyof WorkshopPersistedV1>([...WS_FIELDS, ...LEGACY_WS_FIELDS])
      if (!allowed.has(key as keyof WorkshopPersistedV1)) return { tag: 'invalid' }
      const wsKey = key as keyof WorkshopPersistedV1
      if (!parseWsRow(acc.wsRaw, wsKey, valCell)) return { tag: 'invalid' }
      continue
    }

    if (kind === 'card') {
      if (key.startsWith(CARD_STAR_PREFIX)) {
        const cardId = key.slice(CARD_STAR_PREFIX.length)
        if (!isWorkshopGameCardId(cardId)) return { tag: 'invalid' }
        const n = valCell === '' ? 0 : Number(valCell)
        if (!Number.isFinite(n) || n < 0) return { tag: 'invalid' }
        acc.cardStars[cardId] = n
        continue
      }
      if (key.startsWith(CARD_PRESET_PREFIX)) {
        const tab = Number(key.slice(CARD_PRESET_PREFIX.length))
        if (!Number.isInteger(tab) || tab < 0 || tab >= WORKSHOP_CARD_PRESET_COUNT) {
          return { tag: 'invalid' }
        }
        const ids = valCell
          ? valCell.split('|').map((s) => s.trim()).filter(isWorkshopGameCardId)
          : []
        acc.cardPresetLoadouts[tab] = ids
        continue
      }
      if (key === 'activePresetIndex' || key === 'equipSlots') {
        const n = valCell === '' ? 0 : Number(valCell)
        if (!Number.isFinite(n) || !Number.isInteger(n)) return { tag: 'invalid' }
        acc.wsRaw[key] = n
        continue
      }
      return { tag: 'invalid' }
    }

    if (kind === 'module') {
      if (key.startsWith(MODULE_PRESET_PREFIX)) {
        const tab = Number(key.slice(MODULE_PRESET_PREFIX.length))
        if (!Number.isInteger(tab) || tab < 0 || tab >= WORKSHOP_MODULE_PRESET_COUNT) {
          return { tag: 'invalid' }
        }
        let parsed: unknown
        try {
          parsed = JSON.parse(valCell)
        } catch {
          return { tag: 'invalid' }
        }
        acc.modulePresetSnapshots[tab] = parsed
        continue
      }
      if (key === 'activePresetIndex') {
        const n = valCell === '' ? 0 : Number(valCell)
        if (!Number.isFinite(n) || !Number.isInteger(n)) return { tag: 'invalid' }
        if (n < 0 || n >= WORKSHOP_MODULE_PRESET_COUNT) return { tag: 'invalid' }
        acc.moduleActivePresetIndex = n
        continue
      }
      return { tag: 'invalid' }
    }

    return { tag: 'invalid' }
  }

  flushBuildAccumulator(builds, acc)
  if (builds.length === 0) {
    builds.push({
      overrides: {},
      workshop: sanitizeWorkshopPersisted({}),
    })
  }

  const hasThemes = themeOwned.size > 0
  const themes: TowerThemesSnapshot | undefined = hasThemes
    ? { ownedIds: sanitizeThemeOwnedIds([...themeOwned]) }
    : undefined

  return { tag: 'ok', builds, ...(themes ? { themes } : {}) }
}
