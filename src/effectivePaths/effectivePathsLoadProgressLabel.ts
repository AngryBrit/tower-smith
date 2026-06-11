import type { EffectivePathsLoadProgress } from './exportEffectivePathsApi'
import type { StringId } from '../i18n'

type Translate = (id: StringId) => string

export function effectivePathsLoadProgressLabel(
  progress: EffectivePathsLoadProgress,
  t: Translate,
): string {
  if (progress.phase === 'gateway' && progress.completed === 0) {
    return t('ep_export_loading_ids_gateway')
  }
  if (progress.currentWorkbookName) {
    return t('ep_export_loading_workbook_named').replace(
      '{{name}}',
      progress.currentWorkbookName,
    )
  }
  return t('ep_export_loading_linked_workbooks')
}

export function effectivePathsLoadProgressPercent(progress: EffectivePathsLoadProgress): number {
  if (progress.total <= 0) return 0
  return (progress.completed / progress.total) * 100
}
