import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  STRINGS_EN,
  type StringId,
} from './dictionary'
import {
  FORMAT_DE,
  FORMAT_EN,
  FORMAT_ES,
} from './dictionary.formatters'
import { STRINGS_DE } from './dictionary.de'
import { STRINGS_ES } from './dictionary.es'
import { LOCALE_STORAGE_KEY, readStoredLocale } from './constants'
import { I18nReactContext, type I18nContextValue } from './I18nContext'
import researchOverlayDe from './research-overlay.de.json' with { type: 'json' }
import researchOverlayEs from './research-overlay.es.json' with { type: 'json' }
import { translateResearchBenefitLine } from './researchBenefitTranslate'
import type { AppLocale, ResearchLabelKind } from './types'

type ResearchOverlayFile = {
  sections: Record<string, string>
  items: Record<string, string>
}

const RESEARCH_OVERLAY_BY_LOCALE: Partial<
  Record<AppLocale, ResearchOverlayFile>
> = {
  es: researchOverlayEs as ResearchOverlayFile,
  de: researchOverlayDe as ResearchOverlayFile,
}

const HTML_LANG_BY_LOCALE: Record<AppLocale, string> = {
  en: 'en',
  es: 'es',
  de: 'de',
}

const STRINGS_BY_LOCALE: Record<AppLocale, Record<StringId, string>> = {
  en: STRINGS_EN as unknown as Record<StringId, string>,
  es: STRINGS_ES as unknown as Record<StringId, string>,
  de: STRINGS_DE as unknown as Record<StringId, string>,
}

const FORMAT_BY_LOCALE = {
  en: FORMAT_EN,
  es: FORMAT_ES,
  de: FORMAT_DE,
} as const

function pickResearchLabel(
  locale: AppLocale,
  sectionSlug: string,
  itemIndex: number | undefined,
  english: string,
  kind: ResearchLabelKind,
): string {
  const overlay = RESEARCH_OVERLAY_BY_LOCALE[locale]
  if (!overlay) return english
  if (kind === 'section') {
    return overlay.sections[sectionSlug] ?? english
  }
  if (itemIndex == null) return english
  return overlay.items[`${sectionSlug}:${itemIndex}`] ?? english
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(readStoredLocale)

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  useLayoutEffect(() => {
    document.documentElement.lang = HTML_LANG_BY_LOCALE[locale]
  }, [locale])

  const value = useMemo((): I18nContextValue => {
    const strings = STRINGS_BY_LOCALE[locale]
    const fmt = FORMAT_BY_LOCALE[locale]
    const fallback = STRINGS_EN

    function t(id: StringId): string {
      const s = strings[id]
      if (s !== undefined && s !== '') return s
      return fallback[id] ?? id
    }

    const researchLabel: I18nContextValue['researchLabel'] = (
      sectionSlug,
      itemIndex,
      english,
      kind,
    ) => pickResearchLabel(locale, sectionSlug, itemIndex, english, kind)

    const researchBenefitLine: I18nContextValue['researchBenefitLine'] = (
      line,
    ) => translateResearchBenefitLine(locale, line)

    return { locale, setLocale, t, fmt, researchLabel, researchBenefitLine }
  }, [locale, setLocale])

  return (
    <I18nReactContext.Provider value={value}>
      {children}
    </I18nReactContext.Provider>
  )
}
