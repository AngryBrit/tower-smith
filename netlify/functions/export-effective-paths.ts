import type { Config } from '@netlify/functions'
import { effectivePathsCors, googleAccessToken, SPREADSHEET_ID_RE } from './lib/effectivePathsHttp'
import { jsonResponse } from './lib/http'
import { summarizeGoogleSheetsApiError } from '../../src/effectivePaths/googleSheetsError'
import type { BotsEpSyncState } from '../../src/effectivePaths/botsEpStateFromPersisted'
import {
  exportBotsToGoogleSheet,
  exportCardsToGoogleSheet,
  exportRelicsToGoogleSheet,
  exportThemesToGoogleSheet,
  exportWorkshopToGoogleSheet,
  GoogleSheetsApiError,
} from './lib/googleSheets'

type ExportSyncTarget = 'relics' | 'themes' | 'cards' | 'workshop' | 'bots'

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
  }
}

function mapExportError(message: string | undefined): string {
  if (message === 'no_relic_rows') return 'no_relic_rows'
  if (message === 'no_theme_rows') return 'no_theme_rows'
  if (message === 'no_card_rows') return 'no_card_rows'
  if (message === 'no_card_preset_rows') return 'no_card_preset_rows'
  if (message === 'no_workshop_rows') return 'no_workshop_rows'
  if (message === 'no_bot_rows') return 'no_bot_rows'
  if (message === 'relic_workbook_not_found') return 'relic_workbook_not_found'
  if (message === 'themes_workbook_not_found') return 'themes_workbook_not_found'
  if (message === 'cards_workbook_not_found') return 'cards_workbook_not_found'
  if (message === 'workshop_workbook_not_found') return 'workshop_workbook_not_found'
  if (message === 'bots_workbook_not_found') return 'bots_workbook_not_found'
  if (message === 'relic_workbook_access_denied') return 'relic_workbook_access_denied'
  if (message === 'themes_workbook_access_denied') return 'themes_workbook_access_denied'
  if (message === 'cards_workbook_access_denied') return 'cards_workbook_access_denied'
  if (message === 'workshop_workbook_access_denied') return 'workshop_workbook_access_denied'
  if (message === 'bots_workbook_access_denied') return 'bots_workbook_access_denied'
  if (message === 'relic_tab_not_found') return 'relic_tab_not_found'
  if (message === 'themes_tab_not_found') return 'themes_tab_not_found'
  if (message === 'cards_tab_not_found') return 'cards_tab_not_found'
  if (message === 'workshop_tab_not_found') return 'workshop_tab_not_found'
  if (message === 'bots_tab_not_found') return 'bots_tab_not_found'
  if (message === 'ids_master_empty') return 'ids_master_empty'
  return 'sheets_api_error'
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
