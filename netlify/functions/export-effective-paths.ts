import type { Config } from '@netlify/functions'
import { effectivePathsCors, googleAccessToken, SPREADSHEET_ID_RE } from './lib/effectivePathsHttp'
import { jsonResponse } from './lib/http'
import { summarizeGoogleSheetsApiError } from '../../src/effectivePaths/googleSheetsError'
import type { BotsEpSyncState } from '../../src/effectivePaths/botsEpStateFromPersisted'
import { moduleEpInventorySlotForModuleId } from '../../src/effectivePaths/moduleEpInventoryLayout'
import {
  modulesEpDefaultSectionLevels,
  type ModulesEpEquippedModule,
  type ModulesEpEquippedSubstat,
  type ModulesEpSectionLevels,
  type ModulesEpSyncState,
} from '../../src/effectivePaths/modulesEpStateFromPersisted'
import type { GuardiansEpSyncState } from '../../src/effectivePaths/guardiansEpStateFromPersisted'
import type { UwsEpSyncState } from '../../src/effectivePaths/uwsEpStateFromPersisted'
import { GUARDIAN_CHIP_IDS, type GuardianChipId } from '../../src/data/guardianChips'
import {
  DEFAULT_GUARDIAN_ALLY_UPGRADES,
  DEFAULT_GUARDIAN_ATTACK_UPGRADES,
  DEFAULT_GUARDIAN_BOUNTY_UPGRADES,
  DEFAULT_GUARDIAN_FETCH_UPGRADES,
  DEFAULT_GUARDIAN_SCOUT_UPGRADES,
  DEFAULT_GUARDIAN_SUMMON_UPGRADES,
} from '../../src/guardianChipStorage'
import { WORKSHOP_ASSIST_MODULE_SLOTS } from '../../src/data/workshopSimModules'
import type { WorkshopSubmoduleRarity } from '../../src/data/workshopSubmoduleEffects'
import { sanitizeChassisModuleMergeTier } from '../../src/data/workshopChassisModuleSelection'
import { WORKSHOP_ULTIMATE_WEAPON_ORDER } from '../../src/data/workshopUltimateData'
import {
  exportBotsToGoogleSheet,
  exportLabsToGoogleSheet,
  exportUwsToGoogleSheet,
  exportGuardiansToGoogleSheet,
  exportModulesToGoogleSheet,
  exportCardsToGoogleSheet,
  exportRelicsToGoogleSheet,
  exportThemesToGoogleSheet,
  exportWorkshopToGoogleSheet,
  GoogleSheetsApiError,
  discardStagedSheets,
  promoteStagedSheets,
} from './lib/googleSheets'
import {
  accessContextForSyncTarget,
  type EffectivePathsStagedSheetRef,
  type EffectivePathsWorkbookAccessContext,
} from '../../src/effectivePaths/effectivePathsStaging'

type ExportSyncTarget =
  | 'relics'
  | 'themes'
  | 'cards'
  | 'workshop'
  | 'bots'
  | 'labs'
  | 'uws'
  | 'guardians'
  | 'modules'

function parseGuardiansEpState(raw: unknown): GuardiansEpSyncState {
  const state: GuardiansEpSyncState = {
    upgrades: {
      attack: { ...DEFAULT_GUARDIAN_ATTACK_UPGRADES },
      ally: { ...DEFAULT_GUARDIAN_ALLY_UPGRADES },
      bounty: { ...DEFAULT_GUARDIAN_BOUNTY_UPGRADES },
      fetch: { ...DEFAULT_GUARDIAN_FETCH_UPGRADES },
      summon: { ...DEFAULT_GUARDIAN_SUMMON_UPGRADES },
      scout: { ...DEFAULT_GUARDIAN_SCOUT_UPGRADES },
    },
    unlockedChipIds: [],
  }
  if (!raw || typeof raw !== 'object') return state

  const upgradesRaw = (raw as { upgrades?: unknown }).upgrades
  if (upgradesRaw && typeof upgradesRaw === 'object') {
    for (const chipId of GUARDIAN_CHIP_IDS) {
      const chipRaw = (upgradesRaw as Record<string, unknown>)[chipId]
      if (!chipRaw || typeof chipRaw !== 'object') continue
      for (const [trackId, val] of Object.entries(chipRaw)) {
        if (typeof val === 'number' && Number.isFinite(val)) {
          ;(state.upgrades[chipId] as Record<string, number>)[trackId] = Math.max(
            1,
            Math.trunc(val),
          )
        }
      }
    }
  }

  const unlockedRaw = (raw as { unlockedChipIds?: unknown }).unlockedChipIds
  if (Array.isArray(unlockedRaw)) {
    state.unlockedChipIds = unlockedRaw.filter(
      (id): id is GuardianChipId =>
        typeof id === 'string' && GUARDIAN_CHIP_IDS.includes(id as GuardianChipId),
    )
  }

  return state
}

function parseBody(raw: unknown):
  | {
      ok: true
      syncTarget: ExportSyncTarget
      masterSpreadsheetId: string | null
      masterSheetGid: number | null
      spreadsheetId: string | null
      sheetGid: number | null
      relicOwnedIds: string[]
      themeOwnedIds: string[]
      cardStars: Record<string, number>
      cardMasteryUnlockedIds: string[]
      cardEquipSlots: number
      cardPresetLoadouts: string[][]
      workshopLevels: Record<string, number>
      botsEpState: BotsEpSyncState
      uwsEpState: UwsEpSyncState
      guardiansEpState: GuardiansEpSyncState
      modulesEpState: ModulesEpSyncState
      labLevelOverrides: Record<string, number>
    }
  | { ok: false; error: 'invalid_json' | 'invalid_spreadsheet' } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'invalid_json' }
  }

  const masterRaw = (raw as { masterSpreadsheetId?: unknown }).masterSpreadsheetId
  const masterSpreadsheetId =
    typeof masterRaw === 'string' && masterRaw.trim() ? masterRaw.trim() : null
  if (masterSpreadsheetId && !SPREADSHEET_ID_RE.test(masterSpreadsheetId)) {
    return { ok: false, error: 'invalid_spreadsheet' }
  }

  const spreadsheetRaw = (raw as { spreadsheetId?: unknown }).spreadsheetId
  const spreadsheetId =
    typeof spreadsheetRaw === 'string' && spreadsheetRaw.trim() ? spreadsheetRaw.trim() : null
  if (spreadsheetId && !SPREADSHEET_ID_RE.test(spreadsheetId)) {
    return { ok: false, error: 'invalid_spreadsheet' }
  }

  if (!masterSpreadsheetId && !spreadsheetId) {
    return { ok: false, error: 'invalid_spreadsheet' }
  }

  const masterGidRaw = (raw as { masterSheetGid?: unknown }).masterSheetGid
  const masterSheetGid =
    typeof masterGidRaw === 'number' && Number.isInteger(masterGidRaw) ? masterGidRaw : null

  const gidRaw = (raw as { sheetGid?: unknown }).sheetGid
  const sheetGid = typeof gidRaw === 'number' && Number.isInteger(gidRaw) ? gidRaw : null

  const targetRaw = (raw as { syncTarget?: unknown }).syncTarget
  const syncTarget: ExportSyncTarget =
    targetRaw === 'themes'
      ? 'themes'
      : targetRaw === 'cards'
        ? 'cards'
        : targetRaw === 'workshop'
          ? 'workshop'
          : targetRaw === 'bots'
            ? 'bots'
            : targetRaw === 'labs'
              ? 'labs'
              : targetRaw === 'uws'
                ? 'uws'
                : targetRaw === 'guardians'
                  ? 'guardians'
                  : targetRaw === 'modules'
                    ? 'modules'
                    : 'relics'

  const relicRaw = (raw as { relicOwnedIds?: unknown }).relicOwnedIds
  const relicOwnedIds = Array.isArray(relicRaw)
    ? relicRaw.filter((id): id is string => typeof id === 'string' && id.length > 0)
    : []

  const themeRaw = (raw as { themeOwnedIds?: unknown }).themeOwnedIds
  const themeOwnedIds = Array.isArray(themeRaw)
    ? themeRaw.filter((id): id is string => typeof id === 'string' && id.length > 0)
    : []

  const cardStars: Record<string, number> = {}
  const cardStarsRaw = (raw as { cardStars?: unknown }).cardStars
  if (cardStarsRaw && typeof cardStarsRaw === 'object') {
    for (const [key, val] of Object.entries(cardStarsRaw)) {
      if (typeof key === 'string' && typeof val === 'number' && Number.isFinite(val)) {
        cardStars[key] = val
      }
    }
  }

  const masteryRaw = (raw as { cardMasteryUnlockedIds?: unknown }).cardMasteryUnlockedIds
  const cardMasteryUnlockedIds = Array.isArray(masteryRaw)
    ? masteryRaw.filter((id): id is string => typeof id === 'string' && id.length > 0)
    : []

  const slotsRaw = (raw as { cardEquipSlots?: unknown }).cardEquipSlots
  const cardEquipSlots =
    typeof slotsRaw === 'number' && Number.isFinite(slotsRaw) ? Math.max(0, Math.round(slotsRaw)) : 0

  const presetRaw = (raw as { cardPresetLoadouts?: unknown }).cardPresetLoadouts
  const cardPresetLoadouts: string[][] = []
  if (Array.isArray(presetRaw)) {
    for (const row of presetRaw) {
      if (!Array.isArray(row)) continue
      cardPresetLoadouts.push(
        row.filter((id): id is string => typeof id === 'string' && id.length > 0),
      )
    }
  }

  const workshopLevels: Record<string, number> = {}
  const workshopLevelsRaw = (raw as { workshopLevels?: unknown }).workshopLevels
  if (workshopLevelsRaw && typeof workshopLevelsRaw === 'object') {
    for (const [key, val] of Object.entries(workshopLevelsRaw)) {
      if (typeof key === 'string' && typeof val === 'number' && Number.isFinite(val)) {
        workshopLevels[key] = val
      }
    }
  }

  const botLevels: Record<string, number> = {}
  const botLevelsRaw = (raw as { botLevels?: unknown }).botLevels
  if (botLevelsRaw && typeof botLevelsRaw === 'object') {
    for (const [key, val] of Object.entries(botLevelsRaw)) {
      if (typeof key === 'string' && typeof val === 'number' && Number.isFinite(val)) {
        botLevels[key] = val
      }
    }
  }

  const botOwnedByBotId: BotsEpSyncState['ownedByBotId'] = {
    flame: false,
    thunder: false,
    golden: false,
    amplify: false,
    botBot: false,
  }
  const botOwnedRaw = (raw as { botOwnedByBotId?: unknown }).botOwnedByBotId
  if (botOwnedRaw && typeof botOwnedRaw === 'object') {
    for (const botId of ['flame', 'thunder', 'golden', 'amplify', 'botBot'] as const) {
      const val = (botOwnedRaw as Record<string, unknown>)[botId]
      if (val === true) botOwnedByBotId[botId] = true
    }
  }

  const botLabLevels: Record<string, number> = {}
  const botLabLevelsRaw = (raw as { botLabLevels?: unknown }).botLabLevels
  if (botLabLevelsRaw && typeof botLabLevelsRaw === 'object') {
    for (const [key, val] of Object.entries(botLabLevelsRaw)) {
      if (typeof key === 'string' && typeof val === 'number' && Number.isFinite(val)) {
        botLabLevels[key] = val
      }
    }
  }

  const labLevelOverrides: Record<string, number> = {}
  const labLevelsRaw = (raw as { labLevelOverrides?: unknown }).labLevelOverrides
  if (labLevelsRaw && typeof labLevelsRaw === 'object') {
    for (const [key, val] of Object.entries(labLevelsRaw)) {
      if (typeof key === 'string' && typeof val === 'number' && Number.isFinite(val)) {
        labLevelOverrides[key] = val
      }
    }
  }

  const uwsLevels: Record<string, number> = {}
  const uwsLevelsRaw = (raw as { uwsLevels?: unknown }).uwsLevels
  if (uwsLevelsRaw && typeof uwsLevelsRaw === 'object') {
    for (const [key, val] of Object.entries(uwsLevelsRaw)) {
      if (typeof key === 'string' && typeof val === 'number' && Number.isFinite(val)) {
        uwsLevels[key] = val
      }
    }
  }

  const uwsOwnedByWeaponId: UwsEpSyncState['ownedByWeaponId'] = {
    chainLightning: false,
    smartMissiles: false,
    deathWave: false,
    chronoField: false,
    innerLandMines: false,
    goldenTower: false,
    poisonSwamp: false,
    blackHole: false,
    spotlight: false,
  }
  const uwsOwnedRaw = (raw as { uwsOwnedByWeaponId?: unknown }).uwsOwnedByWeaponId
  if (uwsOwnedRaw && typeof uwsOwnedRaw === 'object') {
    for (const weaponId of WORKSHOP_ULTIMATE_WEAPON_ORDER) {
      const val = (uwsOwnedRaw as Record<string, unknown>)[weaponId]
      if (val === true) uwsOwnedByWeaponId[weaponId] = true
    }
  }

  const modulesEpState: ModulesEpSyncState = {
    modules: [],
    sectionLevels: modulesEpDefaultSectionLevels(),
  }
  const modulesRaw = (raw as { modulesEpState?: unknown }).modulesEpState
  if (modulesRaw && typeof modulesRaw === 'object') {
    const sectionLevelsRaw = (modulesRaw as { sectionLevels?: unknown }).sectionLevels
    if (sectionLevelsRaw && typeof sectionLevelsRaw === 'object') {
      for (const slot of WORKSHOP_ASSIST_MODULE_SLOTS) {
        const entry = (sectionLevelsRaw as Record<string, unknown>)[slot]
        if (!entry || typeof entry !== 'object') continue
        const primaryRaw = (entry as { highestPrimaryLevel?: unknown }).highestPrimaryLevel
        const assistRaw = (entry as { highestAssistLevel?: unknown }).highestAssistLevel
        const next: ModulesEpSectionLevels = {
          highestPrimaryLevel: 0,
          highestAssistLevel: 0,
        }
        if (typeof primaryRaw === 'number' && Number.isFinite(primaryRaw)) {
          next.highestPrimaryLevel = Math.max(0, Math.trunc(primaryRaw))
        }
        if (typeof assistRaw === 'number' && Number.isFinite(assistRaw)) {
          next.highestAssistLevel = Math.max(0, Math.trunc(assistRaw))
        }
        modulesEpState.sectionLevels[slot] = next
      }
    }
    const submoduleRarities = new Set<WorkshopSubmoduleRarity>([
      'common',
      'rare',
      'epic',
      'legendary',
      'mythic',
      'ancestral',
    ])
    const parseModule = (entry: unknown): ModulesEpEquippedModule | null => {
      if (!entry || typeof entry !== 'object') return null
      const moduleId =
        typeof (entry as { moduleId?: unknown }).moduleId === 'string'
          ? (entry as { moduleId: string }).moduleId
          : ''
      const mergeRaw = (entry as { mergeTier?: unknown }).mergeTier
      const levelRaw = (entry as { level?: unknown }).level
      if (!moduleId || typeof levelRaw !== 'number' || !Number.isFinite(levelRaw)) return null
      const hubSlotRaw = (entry as { hubSlot?: unknown }).hubSlot
      const roleRaw = (entry as { role?: unknown }).role
      const hubSlot =
        hubSlotRaw === 'cannon' ||
        hubSlotRaw === 'armor' ||
        hubSlotRaw === 'generator' ||
        hubSlotRaw === 'core'
          ? hubSlotRaw
          : moduleEpInventorySlotForModuleId(moduleId)
      if (!hubSlot) return null
      const role = roleRaw === 'assist' ? 'assist' : 'main'
      const substats: ModulesEpEquippedSubstat[] = []
      const substatsRaw =
        (entry as { substats?: unknown }).substats ??
        (entry as { mainSubstats?: unknown }).mainSubstats
      if (Array.isArray(substatsRaw)) {
        for (const sub of substatsRaw) {
          if (!sub || typeof sub !== 'object') continue
          const effectId =
            typeof (sub as { effectId?: unknown }).effectId === 'string'
              ? (sub as { effectId: string }).effectId
              : ''
          const catalogLabel =
            typeof (sub as { catalogLabel?: unknown }).catalogLabel === 'string'
              ? (sub as { catalogLabel: string }).catalogLabel
              : ''
          const rarity = (sub as { rarity?: unknown }).rarity
          if (!effectId || !catalogLabel || typeof rarity !== 'string') continue
          if (!submoduleRarities.has(rarity as WorkshopSubmoduleRarity)) continue
          substats.push({
            effectId,
            catalogLabel,
            rarity: rarity as WorkshopSubmoduleRarity,
          })
        }
      }
      return {
        moduleId,
        hubSlot,
        role,
        mergeTier: sanitizeChassisModuleMergeTier(mergeRaw),
        level: Math.max(0, Math.trunc(levelRaw)),
        substats,
      }
    }

    const modulesListRaw = (modulesRaw as { modules?: unknown }).modules
    if (Array.isArray(modulesListRaw)) {
      const byKey = new Map<string, ModulesEpEquippedModule>()
      for (const entry of modulesListRaw) {
        const mod = parseModule(entry)
        if (mod) byKey.set(`${mod.hubSlot}:${mod.role}`, mod)
      }
      modulesEpState.modules = [...byKey.values()]
    } else {
      const slotsRaw = (modulesRaw as { slots?: unknown }).slots
      if (slotsRaw && typeof slotsRaw === 'object') {
        for (const slot of WORKSHOP_ASSIST_MODULE_SLOTS) {
          const mod = parseModule((slotsRaw as Record<string, unknown>)[slot])
          if (mod) modulesEpState.modules.push(mod)
        }
      }
    }
  }

  return {
    ok: true,
    syncTarget,
    masterSpreadsheetId,
    masterSheetGid,
    spreadsheetId,
    sheetGid,
    relicOwnedIds,
    themeOwnedIds,
    cardStars,
    cardMasteryUnlockedIds,
    cardEquipSlots,
    cardPresetLoadouts,
    workshopLevels,
    botsEpState: {
      levels: botLevels,
      ownedByBotId: botOwnedByBotId,
      labLevels: botLabLevels,
    },
    labLevelOverrides,
    uwsEpState: {
      levels: uwsLevels,
      ownedByWeaponId: uwsOwnedByWeaponId,
    },
    guardiansEpState: parseGuardiansEpState(
      (raw as { guardiansEpState?: unknown }).guardiansEpState,
    ),
    modulesEpState,
  }
}

function mapExportError(message: string | undefined): string {
  if (message === 'no_relic_rows') return 'no_relic_rows'
  if (message === 'no_theme_rows') return 'no_theme_rows'
  if (message === 'no_card_rows') return 'no_card_rows'
  if (message === 'no_card_preset_rows') return 'no_card_preset_rows'
  if (message === 'no_workshop_rows') return 'no_workshop_rows'
  if (message === 'no_bot_rows') return 'no_bot_rows'
  if (message === 'no_lab_rows') return 'no_lab_rows'
  if (message === 'no_uws_rows') return 'no_uws_rows'
  if (message === 'no_guardians_rows') return 'no_guardians_rows'
  if (message === 'no_modules_rows') return 'no_modules_rows'
  if (message === 'relic_workbook_not_found') return 'relic_workbook_not_found'
  if (message === 'themes_workbook_not_found') return 'themes_workbook_not_found'
  if (message === 'cards_workbook_not_found') return 'cards_workbook_not_found'
  if (message === 'workshop_workbook_not_found') return 'workshop_workbook_not_found'
  if (message === 'bots_workbook_not_found') return 'bots_workbook_not_found'
  if (message === 'laboratory_workbook_not_found') return 'laboratory_workbook_not_found'
  if (message === 'uws_workbook_not_found') return 'uws_workbook_not_found'
  if (message === 'guardians_workbook_not_found') return 'guardians_workbook_not_found'
  if (message === 'modules_workbook_not_found') return 'modules_workbook_not_found'
  if (message === 'relic_workbook_access_denied') return 'relic_workbook_access_denied'
  if (message === 'themes_workbook_access_denied') return 'themes_workbook_access_denied'
  if (message === 'cards_workbook_access_denied') return 'cards_workbook_access_denied'
  if (message === 'workshop_workbook_access_denied') return 'workshop_workbook_access_denied'
  if (message === 'bots_workbook_access_denied') return 'bots_workbook_access_denied'
  if (message === 'laboratory_workbook_access_denied') return 'laboratory_workbook_access_denied'
  if (message === 'uws_workbook_access_denied') return 'uws_workbook_access_denied'
  if (message === 'guardians_workbook_access_denied') return 'guardians_workbook_access_denied'
  if (message === 'modules_workbook_access_denied') return 'modules_workbook_access_denied'
  if (message === 'relic_tab_not_found') return 'relic_tab_not_found'
  if (message === 'themes_tab_not_found') return 'themes_tab_not_found'
  if (message === 'cards_tab_not_found') return 'cards_tab_not_found'
  if (message === 'workshop_tab_not_found') return 'workshop_tab_not_found'
  if (message === 'bots_tab_not_found') return 'bots_tab_not_found'
  if (message === 'laboratory_tab_not_found') return 'laboratory_tab_not_found'
  if (message === 'uws_tab_not_found') return 'uws_tab_not_found'
  if (message === 'guardians_tab_not_found') return 'guardians_tab_not_found'
  if (message === 'modules_tab_not_found') return 'modules_tab_not_found'
  if (message === 'ids_master_empty') return 'ids_master_empty'
  return 'sheets_api_error'
}

const WORKBOOK_ACCESS_CONTEXTS = new Set<EffectivePathsWorkbookAccessContext>([
  'relic_workbook',
  'themes_workbook',
  'cards_workbook',
  'workshop_workbook',
  'bots_workbook',
  'laboratory_workbook',
  'uws_workbook',
  'guardians_workbook',
  'modules_workbook',
])

function parseAccessContext(raw: unknown): EffectivePathsWorkbookAccessContext | null {
  return typeof raw === 'string' && WORKBOOK_ACCESS_CONTEXTS.has(raw as EffectivePathsWorkbookAccessContext)
    ? (raw as EffectivePathsWorkbookAccessContext)
    : null
}

function parseStagedSheets(raw: unknown): EffectivePathsStagedSheetRef[] | null {
  if (!Array.isArray(raw)) return null
  const out: EffectivePathsStagedSheetRef[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') return null
    const workbookId = (entry as { workbookId?: unknown }).workbookId
    const originalSheetId = (entry as { originalSheetId?: unknown }).originalSheetId
    const originalTitle = (entry as { originalTitle?: unknown }).originalTitle
    const stagingSheetId = (entry as { stagingSheetId?: unknown }).stagingSheetId
    const stagingTitle = (entry as { stagingTitle?: unknown }).stagingTitle
    const accessContext = parseAccessContext((entry as { accessContext?: unknown }).accessContext)
    const syncTarget =
      typeof (entry as { syncTarget?: unknown }).syncTarget === 'string'
        ? (entry as { syncTarget: string }).syncTarget
        : null
    if (
      typeof workbookId !== 'string' ||
      typeof originalSheetId !== 'number' ||
      !Number.isInteger(originalSheetId) ||
      typeof originalTitle !== 'string' ||
      typeof stagingSheetId !== 'number' ||
      !Number.isInteger(stagingSheetId) ||
      typeof stagingTitle !== 'string'
    ) {
      return null
    }
    out.push({
      workbookId,
      originalSheetId,
      originalTitle,
      stagingSheetId,
      stagingTitle,
      accessContext: accessContext ?? accessContextForSyncTarget(syncTarget ?? 'relics'),
    })
  }
  return out.length > 0 ? out : null
}

export default async (req: Request): Promise<Response> => {
  const origin = req.headers.get('Origin')
  const cors = effectivePathsCors(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'method_not_allowed' }, cors)
  }

  const token = googleAccessToken(req)
  if (!token) {
    return jsonResponse(401, { error: 'sheets_auth_failed' }, cors)
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return jsonResponse(400, { error: 'invalid_json' }, cors)
  }

  const phaseRaw = raw && typeof raw === 'object' ? (raw as { phase?: unknown }).phase : undefined
  if (phaseRaw === 'promote' || phaseRaw === 'discard') {
    const stagedSheets = parseStagedSheets(
      raw && typeof raw === 'object' ? (raw as { stagedSheets?: unknown }).stagedSheets : null,
    )
    if (!stagedSheets) {
      return jsonResponse(400, { error: 'invalid_json' }, cors)
    }
    try {
      if (phaseRaw === 'promote') {
        await promoteStagedSheets(token, stagedSheets)
        return jsonResponse(200, { ok: true, phase: 'promote' }, cors)
      }
      await discardStagedSheets(token, stagedSheets)
      return jsonResponse(200, { ok: true, phase: 'discard' }, cors)
    } catch (err) {
      if (err instanceof GoogleSheetsApiError) {
        const status = err.reason === 'sheets_auth_failed' ? 401 : err.status >= 400 ? err.status : 502
        const detail = summarizeGoogleSheetsApiError(err.message) ?? err.message
        return jsonResponse(status, { error: err.reason, message: detail }, cors)
      }
      return jsonResponse(502, { error: 'sheets_api_error' }, cors)
    }
  }

  const parsed = parseBody(raw)
  if (!parsed.ok) {
    return jsonResponse(
      400,
      { error: parsed.error === 'invalid_spreadsheet' ? 'invalid_spreadsheet' : 'invalid_json' },
      cors,
    )
  }

  try {
    if (parsed.syncTarget === 'themes') {
      const result = await exportThemesToGoogleSheet({
        accessToken: token,
        masterSpreadsheetId: parsed.masterSpreadsheetId,
        masterSheetGid: parsed.masterSheetGid,
        spreadsheetId: parsed.spreadsheetId,
        sheetGid: parsed.sheetGid,
        themeOwnedIds: parsed.themeOwnedIds,
      })
      return jsonResponse(200, { ok: true, syncTarget: 'themes', ...result }, cors)
    }

    if (parsed.syncTarget === 'cards') {
      const result = await exportCardsToGoogleSheet({
        accessToken: token,
        masterSpreadsheetId: parsed.masterSpreadsheetId,
        masterSheetGid: parsed.masterSheetGid,
        spreadsheetId: parsed.spreadsheetId,
        sheetGid: parsed.sheetGid,
        cardStars: parsed.cardStars,
        cardMasteryUnlockedIds: parsed.cardMasteryUnlockedIds,
        cardEquipSlots: parsed.cardEquipSlots,
        cardPresetLoadouts: parsed.cardPresetLoadouts,
      })
      return jsonResponse(200, { ok: true, syncTarget: 'cards', ...result }, cors)
    }

    if (parsed.syncTarget === 'workshop') {
      const result = await exportWorkshopToGoogleSheet({
        accessToken: token,
        masterSpreadsheetId: parsed.masterSpreadsheetId,
        masterSheetGid: parsed.masterSheetGid,
        spreadsheetId: parsed.spreadsheetId,
        sheetGid: parsed.sheetGid,
        workshopLevels: parsed.workshopLevels,
      })
      return jsonResponse(200, { ok: true, syncTarget: 'workshop', ...result }, cors)
    }

    if (parsed.syncTarget === 'bots') {
      const result = await exportBotsToGoogleSheet({
        accessToken: token,
        masterSpreadsheetId: parsed.masterSpreadsheetId,
        masterSheetGid: parsed.masterSheetGid,
        spreadsheetId: parsed.spreadsheetId,
        sheetGid: parsed.sheetGid,
        botsEpState: parsed.botsEpState,
      })
      return jsonResponse(200, { ok: true, syncTarget: 'bots', ...result }, cors)
    }

    if (parsed.syncTarget === 'labs') {
      const result = await exportLabsToGoogleSheet({
        accessToken: token,
        masterSpreadsheetId: parsed.masterSpreadsheetId,
        masterSheetGid: parsed.masterSheetGid,
        spreadsheetId: parsed.spreadsheetId,
        sheetGid: parsed.sheetGid,
        labLevelOverrides: parsed.labLevelOverrides,
      })
      return jsonResponse(200, { ok: true, syncTarget: 'labs', ...result }, cors)
    }

    if (parsed.syncTarget === 'uws') {
      const result = await exportUwsToGoogleSheet({
        accessToken: token,
        masterSpreadsheetId: parsed.masterSpreadsheetId,
        masterSheetGid: parsed.masterSheetGid,
        spreadsheetId: parsed.spreadsheetId,
        sheetGid: parsed.sheetGid,
        uwsEpState: parsed.uwsEpState,
      })
      return jsonResponse(200, { ok: true, syncTarget: 'uws', ...result }, cors)
    }

    if (parsed.syncTarget === 'guardians') {
      const result = await exportGuardiansToGoogleSheet({
        accessToken: token,
        masterSpreadsheetId: parsed.masterSpreadsheetId,
        masterSheetGid: parsed.masterSheetGid,
        spreadsheetId: parsed.spreadsheetId,
        sheetGid: parsed.sheetGid,
        guardiansEpState: parsed.guardiansEpState,
      })
      return jsonResponse(200, { ok: true, syncTarget: 'guardians', ...result }, cors)
    }

    if (parsed.syncTarget === 'modules') {
      const result = await exportModulesToGoogleSheet({
        accessToken: token,
        masterSpreadsheetId: parsed.masterSpreadsheetId,
        masterSheetGid: parsed.masterSheetGid,
        spreadsheetId: parsed.spreadsheetId,
        sheetGid: parsed.sheetGid,
        modulesEpState: parsed.modulesEpState,
      })
      return jsonResponse(200, { ok: true, syncTarget: 'modules', ...result }, cors)
    }

    const result = await exportRelicsToGoogleSheet({
      accessToken: token,
      masterSpreadsheetId: parsed.masterSpreadsheetId,
      masterSheetGid: parsed.masterSheetGid,
      spreadsheetId: parsed.spreadsheetId,
      sheetGid: parsed.sheetGid,
      relicOwnedIds: parsed.relicOwnedIds,
    })
    return jsonResponse(200, { ok: true, syncTarget: 'relics', ...result }, cors)
  } catch (err) {
    if (err instanceof GoogleSheetsApiError) {
      const mapped = mapExportError(err.message)
      if (mapped !== 'sheets_api_error') {
        return jsonResponse(400, { error: mapped }, cors)
      }
      const status = err.reason === 'sheets_auth_failed' ? 401 : err.status >= 400 ? err.status : 502
      const detail = summarizeGoogleSheetsApiError(err.message) ?? err.message
      return jsonResponse(status, { error: err.reason, message: detail }, cors)
    }
    return jsonResponse(502, { error: 'sheets_api_error' }, cors)
  }
}

export const config: Config = {
  path: '/api/effective-paths/export',
}
