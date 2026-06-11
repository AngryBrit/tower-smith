import {
  isBotsWorkbookName,
  isCardsWorkbookName,
  isLaboratoryWorkbookName,
  isModulesWorkbookName,
  isRelicsWorkbookName,
  isThemesWorkbookName,
  isUwsWorkbookName,
  isWorkshopWorkbookName,
} from './effectivePathsCategoryNames'
import type { BotsEpSyncState } from './botsEpStateFromPersisted'
import type {
  EffectivePathsBotsImportResult,
  EffectivePathsCardsImportResult,
  EffectivePathsLabsImportResult,
  EffectivePathsModulesImportResult,
  EffectivePathsRelicsImportResult,
  EffectivePathsThemesImportResult,
  EffectivePathsUwsImportResult,
  EffectivePathsWorkshopImportResult,
} from './exportEffectivePathsApi'
import type { ModulesEpSyncState } from './modulesEpStateFromPersisted'
import type { UwsEpSyncState } from './uwsEpStateFromPersisted'
import type { WorkshopGameCardId } from '../data/workshopGameCards'
import type { StringId } from '../i18n'

export type EffectivePathsImportTarget =
  | 'relics'
  | 'themes'
  | 'cards'
  | 'workshop'
  | 'bots'
  | 'labs'
  | 'uws'
  | 'modules'

export const EFFECTIVE_PATHS_IMPORT_TARGET_ORDER: readonly EffectivePathsImportTarget[] = [
  'relics',
  'themes',
  'cards',
  'workshop',
  'bots',
  'labs',
  'uws',
  'modules',
]

export type EffectivePathsImportPayload =
  | { syncTarget: 'relics'; relicOwnedIds: string[] }
  | { syncTarget: 'themes'; themeOwnedIds: string[] }
  | {
      syncTarget: 'cards'
      cardStars: Record<string, number>
      cardEquipSlots: number
      cardMasteryUnlockedIds: string[]
      cardPresetLoadouts: WorkshopGameCardId[][]
    }
  | { syncTarget: 'workshop'; workshopLevels: Record<string, number> }
  | { syncTarget: 'bots'; botsEpState: BotsEpSyncState }
  | { syncTarget: 'labs'; labLevelOverrides: Record<string, number> }
  | { syncTarget: 'uws'; uwsEpState: UwsEpSyncState }
  | { syncTarget: 'modules'; modulesEpState: ModulesEpSyncState }

type Translate = (id: StringId) => string

function fillTemplate(template: string, values: Record<string, string | number>): string {
  let out = template
  for (const [key, value] of Object.entries(values)) {
    out = out.replaceAll(`{{${key}}}`, String(value))
  }
  return out
}

export type ImportTargetUiConfig = {
  target: EffectivePathsImportTarget
  btnKey: StringId
  syncingKey: StringId
  missingKey: StringId
  accessDeniedKey: StringId
}

export function importTargetForWorkbookName(name: string): EffectivePathsImportTarget | null {
  if (isRelicsWorkbookName(name)) return 'relics'
  if (isThemesWorkbookName(name)) return 'themes'
  if (isCardsWorkbookName(name)) return 'cards'
  if (isWorkshopWorkbookName(name)) return 'workshop'
  if (isBotsWorkbookName(name)) return 'bots'
  if (isLaboratoryWorkbookName(name)) return 'labs'
  if (isUwsWorkbookName(name)) return 'uws'
  if (isModulesWorkbookName(name)) return 'modules'
  return null
}

export function importUiForTarget(target: EffectivePathsImportTarget): ImportTargetUiConfig {
  return IMPORT_TARGET_UI.find((entry) => entry.target === target)!
}

export const IMPORT_TARGET_UI: readonly ImportTargetUiConfig[] = [
  {
    target: 'relics',
    btnKey: 'ep_import_relics_btn',
    syncingKey: 'ep_import_syncing_relics',
    missingKey: 'ep_export_relics_missing_in_master',
    accessDeniedKey: 'ep_export_error_relic_workbook_access_denied',
  },
  {
    target: 'themes',
    btnKey: 'ep_import_themes_btn',
    syncingKey: 'ep_import_syncing_themes',
    missingKey: 'ep_export_themes_missing_in_master',
    accessDeniedKey: 'ep_export_error_themes_workbook_access_denied',
  },
  {
    target: 'cards',
    btnKey: 'ep_import_cards_btn',
    syncingKey: 'ep_import_syncing_cards',
    missingKey: 'ep_export_cards_missing_in_master',
    accessDeniedKey: 'ep_export_error_cards_workbook_access_denied',
  },
  {
    target: 'workshop',
    btnKey: 'ep_import_workshop_btn',
    syncingKey: 'ep_import_syncing_workshop',
    missingKey: 'ep_export_workshop_missing_in_master',
    accessDeniedKey: 'ep_export_error_workshop_workbook_access_denied',
  },
  {
    target: 'bots',
    btnKey: 'ep_import_bots_btn',
    syncingKey: 'ep_import_syncing_bots',
    missingKey: 'ep_export_bots_missing_in_master',
    accessDeniedKey: 'ep_export_error_bots_workbook_access_denied',
  },
  {
    target: 'labs',
    btnKey: 'ep_import_labs_btn',
    syncingKey: 'ep_import_syncing_labs',
    missingKey: 'ep_export_labs_missing_in_master',
    accessDeniedKey: 'ep_export_error_laboratory_workbook_access_denied',
  },
  {
    target: 'uws',
    btnKey: 'ep_import_uws_btn',
    syncingKey: 'ep_import_syncing_uws',
    missingKey: 'ep_export_uws_missing_in_master',
    accessDeniedKey: 'ep_export_error_uws_workbook_access_denied',
  },
  {
    target: 'modules',
    btnKey: 'ep_import_modules_btn',
    syncingKey: 'ep_import_syncing_modules',
    missingKey: 'ep_export_modules_missing_in_master',
    accessDeniedKey: 'ep_export_error_modules_workbook_access_denied',
  },
]

export function importPayloadFromResult(
  result:
    | EffectivePathsRelicsImportResult
    | EffectivePathsThemesImportResult
    | EffectivePathsCardsImportResult
    | EffectivePathsWorkshopImportResult
    | EffectivePathsBotsImportResult
    | EffectivePathsLabsImportResult
    | EffectivePathsUwsImportResult
    | EffectivePathsModulesImportResult,
): EffectivePathsImportPayload {
  switch (result.syncTarget) {
    case 'relics':
      return { syncTarget: 'relics', relicOwnedIds: result.relicOwnedIds }
    case 'themes':
      return { syncTarget: 'themes', themeOwnedIds: result.themeOwnedIds }
    case 'cards':
      return {
        syncTarget: 'cards',
        cardStars: result.cardStars,
        cardEquipSlots: result.cardEquipSlots,
        cardMasteryUnlockedIds: result.cardMasteryUnlockedIds,
        cardPresetLoadouts: result.cardPresetLoadouts as unknown as WorkshopGameCardId[][],
      }
    case 'workshop':
      return { syncTarget: 'workshop', workshopLevels: result.workshopLevels }
    case 'bots':
      return { syncTarget: 'bots', botsEpState: result.botsEpState }
    case 'labs':
      return { syncTarget: 'labs', labLevelOverrides: result.labLevelOverrides }
    case 'uws':
      return { syncTarget: 'uws', uwsEpState: result.uwsEpState }
    case 'modules':
      return { syncTarget: 'modules', modulesEpState: result.modulesEpState }
  }
}

export function importSuccessMessage(
  t: Translate,
  result:
    | EffectivePathsRelicsImportResult
    | EffectivePathsThemesImportResult
    | EffectivePathsCardsImportResult
    | EffectivePathsWorkshopImportResult
    | EffectivePathsBotsImportResult
    | EffectivePathsLabsImportResult
    | EffectivePathsUwsImportResult
    | EffectivePathsModulesImportResult,
): string {
  switch (result.syncTarget) {
    case 'relics': {
      let message = fillTemplate(t('ep_import_relics_success'), {
        rows: result.matchedRows,
        sheet: result.sheetTitle,
      })
      if (result.unmappedSheetNames.length > 0) {
        message += ` ${fillTemplate(t('ep_export_relics_unmapped_hint'), { count: result.unmappedSheetNames.length })}`
      }
      return message
    }
    case 'themes': {
      let message = fillTemplate(t('ep_import_themes_success'), {
        rows: result.matchedRows,
        sheet: result.sheetTitle,
      })
      if (result.unmappedSheetNames.length > 0) {
        message += ` ${fillTemplate(t('ep_export_themes_unmapped_hint'), { count: result.unmappedSheetNames.length })}`
      }
      return message
    }
    case 'cards': {
      let message = fillTemplate(t('ep_import_cards_success'), {
        rows: result.matchedRows,
        sheet: result.sheetTitle,
      })
      if (result.presetMatchedRows > 0 && result.presetSheetTitle) {
        message += ` ${fillTemplate(t('ep_import_cards_presets_success_suffix'), {
          presetRows: result.presetMatchedRows,
          presetSheet: result.presetSheetTitle,
        })}`
      }
      if (result.unmappedSheetNames.length > 0) {
        message += ` ${fillTemplate(t('ep_export_cards_unmapped_hint'), { count: result.unmappedSheetNames.length })}`
      }
      return message
    }
    case 'workshop': {
      let message = fillTemplate(t('ep_import_workshop_success'), {
        rows: result.matchedRows,
        sheet: result.sheetTitle,
      })
      if (result.enhanceMatchedRows > 0) {
        message += ` ${fillTemplate(t('ep_import_workshop_enhance_success_suffix'), {
          enhanceRows: result.enhanceMatchedRows,
        })}`
      }
      if (result.unmappedSheetNames.length > 0) {
        message += ` ${fillTemplate(t('ep_export_workshop_unmapped_hint'), { count: result.unmappedSheetNames.length })}`
      }
      return message
    }
    case 'bots': {
      let message = fillTemplate(t('ep_import_bots_success'), {
        rows: result.matchedRows,
        sheet: result.sheetTitle,
      })
      if (result.labMatchedRows > 0) {
        message += ` ${fillTemplate(t('ep_import_bots_lab_success_suffix'), {
          labRows: result.labMatchedRows,
        })}`
      }
      if (result.unmappedSheetNames.length > 0) {
        message += ` ${fillTemplate(t('ep_export_bots_unmapped_hint'), { count: result.unmappedSheetNames.length })}`
      }
      return message
    }
    case 'labs': {
      let message = fillTemplate(t('ep_import_labs_success'), {
        rows: result.matchedRows,
        sheet: result.sheetTitle,
      })
      if (result.unmappedSheetNames.length > 0) {
        message += ` ${fillTemplate(t('ep_export_labs_unmapped_hint'), { count: result.unmappedSheetNames.length })}`
      }
      return message
    }
    case 'uws':
      return fillTemplate(t('ep_import_uws_success'), {
        rows: result.matchedRows,
        sheet: result.sheetTitle,
      })
    case 'modules':
      return fillTemplate(t('ep_import_modules_success'), {
        rows: result.matchedRows,
        effects: result.matchedSubstats,
        sheet: result.sheetTitle,
      })
  }
}
