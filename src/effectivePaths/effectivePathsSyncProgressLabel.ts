import type { EffectivePathsImportTarget } from './effectivePathsImportDialogSupport'
import type { StringId } from '../i18n'

export type EffectivePathsSyncProgress = {
  direction: 'import' | 'export'
  completed: number
  total: number
  currentWorkbookName: string
}

type Translate = (id: StringId) => string

export const EFFECTIVE_PATHS_SYNC_TARGET_DISPLAY_NAMES: Record<
  EffectivePathsImportTarget,
  string
> = {
  labs: 'Laboratory',
  workshop: 'Workshop',
  uws: 'Ultimate Weapons',
  cards: 'Cards',
  modules: 'Modules',
  bots: 'Bots',
  guardians: 'Guardians',
  themes: 'Themes & Songs',
  relics: 'Relics',
}

export function syncWorkbookNameForTarget(
  target: EffectivePathsImportTarget,
  linkedName: string | null | undefined,
): string {
  return linkedName?.trim() || EFFECTIVE_PATHS_SYNC_TARGET_DISPLAY_NAMES[target]
}

export function effectivePathsSyncProgressLabel(
  progress: EffectivePathsSyncProgress,
  t: Translate,
): string {
  const key: StringId =
    progress.direction === 'import'
      ? 'ep_import_syncing_workbook_named'
      : 'ep_export_syncing_workbook_named'
  return t(key).replace('{{name}}', progress.currentWorkbookName)
}

export function effectivePathsSyncProgressPercent(progress: EffectivePathsSyncProgress): number {
  if (progress.total <= 0) return 0
  return (progress.completed / progress.total) * 100
}
