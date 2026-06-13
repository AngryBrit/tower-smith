import type { StringId } from './i18n/dictionary'

export type WhatsNewCopy = {
  headline: StringId
  body: StringId
}

/** Per-release in-app highlight — add an entry when shipping user-visible changes. */
export const WHATS_NEW_BY_VERSION: Partial<Record<string, WhatsNewCopy>> = {
  '3.1.3': {
    headline: 'whats_new_313_headline',
    body: 'whats_new_313_body',
  },
  '3.1.2': {
    headline: 'whats_new_312_headline',
    body: 'whats_new_312_body',
  },
  '3.1.1': {
    headline: 'whats_new_311_headline',
    body: 'whats_new_311_body',
  },
  '3.1.0': {
    headline: 'whats_new_310_headline',
    body: 'whats_new_310_body',
  },
  '3.0.8': {
    headline: 'whats_new_308_headline',
    body: 'whats_new_308_body',
  },
  '3.0.7': {
    headline: 'whats_new_307_headline',
    body: 'whats_new_307_body',
  },
  '3.0.6': {
    headline: 'whats_new_306_headline',
    body: 'whats_new_306_body',
  },
  '3.0.5': {
    headline: 'whats_new_305_headline',
    body: 'whats_new_305_body',
  },
  '3.0.4': {
    headline: 'whats_new_304_headline',
    body: 'whats_new_304_body',
  },
  '3.0.3': {
    headline: 'whats_new_303_headline',
    body: 'whats_new_303_body',
  },
  '3.0.2': {
    headline: 'whats_new_302_headline',
    body: 'whats_new_302_body',
  },
  '3.0.1': {
    headline: 'whats_new_301_headline',
    body: 'whats_new_301_body',
  },
  '3.0.0': {
    headline: 'whats_new_300_headline',
    body: 'whats_new_300_body',
  },
  '2.8.11': {
    headline: 'whats_new_2811_headline',
    body: 'whats_new_2811_body',
  },
}

export function getWhatsNewForVersion(version: string): WhatsNewCopy | null {
  return WHATS_NEW_BY_VERSION[version] ?? null
}
