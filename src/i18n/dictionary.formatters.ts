import {
  createI18nFormatters,
  STRINGS_EN,
  type I18nFormatters,
  type StringId,
} from './dictionary'
import { STRINGS_DE } from './dictionary.de'
import { STRINGS_ES } from './dictionary.es'

export const FORMAT_EN: I18nFormatters = createI18nFormatters(
  STRINGS_EN as unknown as Record<StringId, string>,
)

export const FORMAT_ES: I18nFormatters = createI18nFormatters(
  STRINGS_ES as unknown as Record<StringId, string>,
)

export const FORMAT_DE: I18nFormatters = createI18nFormatters(
  STRINGS_DE as unknown as Record<StringId, string>,
)
