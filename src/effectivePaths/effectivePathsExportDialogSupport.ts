import {
  EFFECTIVE_PATHS_IMPORT_TARGET_ORDER,
  importTargetForWorkbookName,
} from './effectivePathsImportDialogSupport'
import type { EffectivePathsExportTarget } from './effectivePathsExportSyncingLabel'
import type { StringId } from '../i18n'

export type ExportTargetUiConfig = {
  target: EffectivePathsExportTarget
  btnKey: StringId
  syncingKey: StringId
}

export const exportTargetForWorkbookName = importTargetForWorkbookName as (
  name: string,
) => EffectivePathsExportTarget | null

export const EFFECTIVE_PATHS_EXPORT_TARGET_ORDER = EFFECTIVE_PATHS_IMPORT_TARGET_ORDER

export function exportUiForTarget(target: EffectivePathsExportTarget): ExportTargetUiConfig {
  return EXPORT_TARGET_UI.find((entry) => entry.target === target)!
}

export const EXPORT_TARGET_UI: readonly ExportTargetUiConfig[] = [
  {
    target: 'relics',
    btnKey: 'ep_export_sync_relics_btn',
    syncingKey: 'ep_export_syncing_relics',
  },
  {
    target: 'themes',
    btnKey: 'ep_export_sync_themes_btn',
    syncingKey: 'ep_export_syncing_themes',
  },
  {
    target: 'cards',
    btnKey: 'ep_export_sync_cards_btn',
    syncingKey: 'ep_export_syncing_cards',
  },
  {
    target: 'workshop',
    btnKey: 'ep_export_sync_workshop_btn',
    syncingKey: 'ep_export_syncing_workshop',
  },
  {
    target: 'bots',
    btnKey: 'ep_export_sync_bots_btn',
    syncingKey: 'ep_export_syncing_bots',
  },
  {
    target: 'labs',
    btnKey: 'ep_export_sync_labs_btn',
    syncingKey: 'ep_export_syncing_labs',
  },
  {
    target: 'uws',
    btnKey: 'ep_export_sync_uws_btn',
    syncingKey: 'ep_export_syncing_uws',
  },
  {
    target: 'modules',
    btnKey: 'ep_export_sync_modules_btn',
    syncingKey: 'ep_export_syncing_modules',
  },
]
