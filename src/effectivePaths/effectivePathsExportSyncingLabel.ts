import type { StringId } from '../i18n'

export type EffectivePathsExportTarget =
  | 'relics'
  | 'themes'
  | 'cards'
  | 'workshop'
  | 'bots'
  | 'labs'
  | 'uws'
  | 'guardians'
  | 'modules'

const EXPORT_SYNCING_LABEL_KEYS: Record<EffectivePathsExportTarget, StringId> = {
  relics: 'ep_export_syncing_relics',
  themes: 'ep_export_syncing_themes',
  cards: 'ep_export_syncing_cards',
  workshop: 'ep_export_syncing_workshop',
  bots: 'ep_export_syncing_bots',
  labs: 'ep_export_syncing_labs',
  uws: 'ep_export_syncing_uws',
  guardians: 'ep_export_syncing_guardians',
  modules: 'ep_export_syncing_modules',
}

export function effectivePathsExportSyncingLabel(
  target: EffectivePathsExportTarget,
  t: (id: StringId) => string,
): string {
  return t(EXPORT_SYNCING_LABEL_KEYS[target])
}
