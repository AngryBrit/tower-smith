import type { StringId } from './i18n/dictionary'

export type WhatsNewCopy = {
  headline: StringId
  /** Single paragraph — use when the release note is one short sentence. */
  body?: StringId
  /** Bulleted highlights — preferred when several distinct changes ship together. */
  bodyItems?: StringId[]
}

/** Per-release in-app highlight — add an entry when shipping user-visible changes. */
export const WHATS_NEW_BY_VERSION: Partial<Record<string, WhatsNewCopy>> = {
  '3.2.0': {
    headline: 'whats_new_320_headline',
    bodyItems: [
      'whats_new_320_body_vault',
      'whats_new_320_body_cards',
      'whats_new_320_body_workshop',
      'whats_new_320_body_dialog',
      'whats_new_320_body_damage',
    ],
  },
  '3.1.18': {
    headline: 'whats_new_3118_headline',
    bodyItems: [
      'whats_new_3118_body_event',
      'whats_new_3118_body_relics',
      'whats_new_3118_body_import',
    ],
  },
  '3.1.17': {
    headline: 'whats_new_3117_headline',
    body: 'whats_new_3117_body',
  },
  '3.1.16': {
    headline: 'whats_new_3116_headline',
    body: 'whats_new_3116_body',
  },
  '3.1.15': {
    headline: 'whats_new_3115_headline',
    body: 'whats_new_3115_body',
  },
  '3.1.14': {
    headline: 'whats_new_3114_headline',
    body: 'whats_new_3114_body',
  },
  '3.1.13': {
    headline: 'whats_new_3113_headline',
    body: 'whats_new_3113_body',
  },
  '3.1.12': {
    headline: 'whats_new_3112_headline',
    body: 'whats_new_3112_body',
  },
  '3.1.11': {
    headline: 'whats_new_3111_headline',
    body: 'whats_new_3111_body',
  },
  '3.1.10': {
    headline: 'whats_new_3110_headline',
    body: 'whats_new_3110_body',
  },
  '3.1.9': {
    headline: 'whats_new_319_headline',
    body: 'whats_new_319_body',
  },
  '3.1.8': {
    headline: 'whats_new_318_headline',
    body: 'whats_new_318_body',
  },
  '3.1.7': {
    headline: 'whats_new_317_headline',
    body: 'whats_new_317_body',
  },
  '3.1.6': {
    headline: 'whats_new_316_headline',
    body: 'whats_new_316_body',
  },
  '3.1.5': {
    headline: 'whats_new_315_headline',
    body: 'whats_new_315_body',
  },
  '3.1.4': {
    headline: 'whats_new_314_headline',
    body: 'whats_new_314_body',
  },
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
