import type { StringId } from './i18n/dictionary'

export type WhatsNewCopy = {
  headline: StringId
  body: StringId
}

/** Per-release in-app highlight — add an entry when shipping user-visible changes. */
export const WHATS_NEW_BY_VERSION: Partial<Record<string, WhatsNewCopy>> = {
  '2.8.11': {
    headline: 'whats_new_2811_headline',
    body: 'whats_new_2811_body',
  },
}

export function getWhatsNewForVersion(version: string): WhatsNewCopy | null {
  return WHATS_NEW_BY_VERSION[version] ?? null
}
