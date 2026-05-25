import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import {
  THEME_CATEGORIES,
  themeUnlockLabel,
  themesForCategory,
  backgroundThemesByGroup,
  towerThemesByGroup,
  type GameThemeEntry,
  type ThemeCategory,
} from '../data/gameThemes'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'
import {
  THEME_COIN_BONUS_CATEGORIES,
  THEME_COIN_BONUS_PERCENT,
  computeThemeCoinBonusMultiplier,
  countOwnedThemesForCoinBonus,
  formatThemeCoinBonusMultiplier,
  formatThemeCoinBonusPercentAboveBase,
  type ThemeCoinBonusCategory,
} from '../themeCoinBonus'
import { useBudgetPanelsVisible } from '../budgetPanelsVisibility'
import { resetAllThemes } from '../resetThemes'
import { isThemeOwned, setThemesOwnedBatch, useThemeOwned } from '../themeOwnedStorage'
import { useThemeSelection } from '../themeSelectionStorage'
import { ThemeIcon } from './ThemeIcon'

const THEMES_COIN_BONUS_COLLAPSED_STORAGE_KEY = 'tower-export-themes-coin-bonus-collapsed-v1'

type ThemesPageProps = {
  embeddedInPanel?: boolean
  toolbarMount?: HTMLDivElement | null
}

function themesOverlayPortal(node: ReactNode) {
  return createPortal(node, document.body)
}

function ThemesToolbar({
  onResetThemes,
  search,
  onSearchChange,
  searchInputRef,
}: {
  onResetThemes: () => void
  search: string
  onSearchChange: (value: string) => void
  searchInputRef: RefObject<HTMLInputElement | null>
}) {
  const { t } = useI18n()
  const searchFieldId = 'themes-search'
  const searchSlashHintId = 'themes-search-slash-hint'
  return (
    <div className="select-research__toolbar">
      <div className="select-research__toolbar-quick select-research__toolbar-quick--themes-only">
        <button
          type="button"
          className="glow-btn glow-btn--danger glow-btn--block"
          onClick={onResetThemes}
          aria-label={t('themes_reset_aria')}
        >
          {t('themes_reset')}
        </button>
      </div>
      <label className="visually-hidden" htmlFor={searchFieldId}>
        {t('themes_search_label_hidden')}
      </label>
      <input
        ref={searchInputRef}
        id={searchFieldId}
        className="select-research__search glow-input"
        type="search"
        placeholder={t('themes_search_placeholder')}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        autoComplete="off"
        aria-describedby={searchSlashHintId}
      />
      <p id={searchSlashHintId} className="visually-hidden">
        {t('themes_search_slash_hint')}
      </p>
    </div>
  )
}

function themeMatchesSearch(
  t: (id: StringId) => string,
  theme: GameThemeEntry,
  query: string,
): boolean {
  if (query.length === 0) return true
  const haystack = [
    t(theme.nameId),
    theme.eventNameId != null ? t(theme.eventNameId) : '',
    themeUnlockLabel(t, theme) ?? '',
    theme.milestoneTier != null ? String(theme.milestoneTier) : '',
    theme.guildSeason != null ? String(theme.guildSeason) : '',
    theme.id,
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

function filterThemes(
  themes: readonly GameThemeEntry[],
  t: (id: StringId) => string,
  query: string,
): GameThemeEntry[] {
  return themes.filter((theme) => themeMatchesSearch(t, theme, query))
}

const TAB_LABEL_IDS: Record<ThemeCategory, StringId> = {
  tower: 'themes_tab_tower',
  background: 'themes_tab_background',
  music: 'themes_tab_music',
  menus: 'themes_tab_menus',
  banners: 'themes_tab_banners',
  guardian: 'themes_tab_guardian',
}

const COIN_TAB_LABEL_IDS: Record<ThemeCoinBonusCategory, StringId> = {
  tower: 'themes_tab_tower',
  background: 'themes_tab_background',
  music: 'themes_tab_music',
  menus: 'themes_tab_menus',
  banners: 'themes_tab_banners',
  guardian: 'themes_tab_guardian',
}

function withParams(
  template: string,
  params: Record<string, string | number>,
): string {
  let out = template
  for (const [key, value] of Object.entries(params)) {
    out = out.split(`{{${key}}}`).join(String(value))
  }
  return out
}

function themeCardAriaLabel(
  t: (id: StringId) => string,
  theme: GameThemeEntry,
): string {
  const name = t(theme.nameId)
  if (theme.milestoneTier != null) {
    const unlock = themeUnlockLabel(t, theme) ?? ''
    return withParams(t('themes_card_aria_milestone'), {
      name,
      tier: theme.milestoneTier,
      unlock,
    })
  }
  if (theme.eventNameId != null) {
    return withParams(t('themes_card_aria_event'), {
      name,
      event: t(theme.eventNameId),
    })
  }
  if (theme.guildSeason != null) {
    return withParams(t('themes_card_aria_guild'), {
      name,
      season: theme.guildSeason,
    })
  }
  return name
}

function themeCardMeta(
  t: (id: StringId) => string,
  theme: GameThemeEntry,
): ReactNode {
  if (theme.milestoneTier != null) {
    return (
      <span className="themes-page__card-meta">
        {withParams(t('themes_milestone_tier'), { tier: theme.milestoneTier })}
        {themeUnlockLabel(t, theme) ? (
          <>
            {' · '}
            <span className="themes-page__card-unlock">{themeUnlockLabel(t, theme)}</span>
          </>
        ) : null}
      </span>
    )
  }
  if (theme.eventNameId != null) {
    return <span className="themes-page__card-meta">{t(theme.eventNameId)}</span>
  }
  if (theme.guildSeason != null) {
    return (
      <span className="themes-page__card-meta">
        {withParams(t('themes_guild_season'), { season: theme.guildSeason })}
      </span>
    )
  }
  return null
}

function tabPassivePercent(category: ThemeCategory): number | undefined {
  if (category in THEME_COIN_BONUS_PERCENT) {
    return THEME_COIN_BONUS_PERCENT[category as ThemeCoinBonusCategory]
  }
  return undefined
}

function themesPanelClassName(category: ThemeCategory): string {
  if (category === 'tower' || category === 'background') {
    return 'themes-page__tower-panels'
  }
  if (category === 'banners') {
    return 'themes-page__grid themes-page__grid--banners'
  }
  return 'themes-page__grid'
}

export function ThemesPage({
  embeddedInPanel = false,
  toolbarMount = null,
}: ThemesPageProps) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [budgetPanelsVisible] = useBudgetPanelsVisible()
  const coinBonusBodyId = useId().replace(/:/g, '')
  const [resetThemesConfirmOpen, setResetThemesConfirmOpen] = useState(false)
  const [coinBonusCollapsed, setCoinBonusCollapsed] = useState(() => {
    try {
      return localStorage.getItem(THEMES_COIN_BONUS_COLLAPSED_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [activeCategory, setActiveCategory] = useState<ThemeCategory>('tower')
  const [selection, selectTheme] = useThemeSelection()
  const [ownedIds, setThemeOwned] = useThemeOwned()
  const items = themesForCategory(activeCategory)
  const towerGroups = towerThemesByGroup()
  const backgroundGroups = backgroundThemesByGroup()
  const searchNormalized = search.trim().toLowerCase()
  const visibleItems = useMemo(
    () => filterThemes(items, t, searchNormalized),
    [items, t, searchNormalized],
  )
  const visibleTowerGroups = useMemo(
    () => ({
      milestone: filterThemes(towerGroups.milestone, t, searchNormalized),
      event: filterThemes(towerGroups.event, t, searchNormalized),
      guild: filterThemes(towerGroups.guild, t, searchNormalized),
    }),
    [towerGroups, t, searchNormalized],
  )
  const visibleBackgroundGroups = useMemo(
    () => ({
      event: filterThemes(backgroundGroups.event, t, searchNormalized),
      guild: filterThemes(backgroundGroups.guild, t, searchNormalized),
    }),
    [backgroundGroups, t, searchNormalized],
  )
  const selectedId = selection[activeCategory]
  const tabPassive = tabPassivePercent(activeCategory)

  const renderThemeCard = (theme: GameThemeEntry) => {
    const selected = theme.id === selectedId
    const owned = isThemeOwned(theme, ownedIds)
    return (
      <div
        key={theme.id}
        className={
          selected
            ? 'themes-page__card themes-page__card--selected'
            : 'themes-page__card'
        }
      >
        <button
          type="button"
          className="themes-page__card-main"
          aria-pressed={selected}
          aria-label={themeCardAriaLabel(t, theme)}
          onClick={() => selectTheme(activeCategory, theme.id)}
        >
          <span className="themes-page__card-label">{t(theme.nameId)}</span>
          {themeCardMeta(t, theme)}
          <span
            className={
              theme.image
                ? 'themes-page__card-art themes-page__card-art--img'
                : 'themes-page__card-art'
            }
            data-theme-icon={theme.icon}
          >
            {theme.image ? (
              <img className="themes-page__card-img" src={theme.image} alt="" />
            ) : (
              <ThemeIcon icon={theme.icon} />
            )}
          </span>
        </button>
        <button
          type="button"
          className={
            owned ? 'themes-page__owned themes-page__owned--on' : 'themes-page__owned'
          }
          aria-pressed={owned}
          aria-label={
            owned
              ? withParams(t('themes_owned_toggle_off'), { name: t(theme.nameId) })
              : withParams(t('themes_owned_toggle_on'), { name: t(theme.nameId) })
          }
          onClick={(e) => {
            e.stopPropagation()
            setThemeOwned(theme.id, !owned)
          }}
        >
          {owned ? t('themes_owned_true') : t('themes_owned_false')}
        </button>
      </div>
    )
  }

  const ownedCountInCategory = useMemo(
    () => visibleItems.filter((entry) => isThemeOwned(entry, ownedIds)).length,
    [visibleItems, ownedIds],
  )

  const visibleThemeIds = useMemo(
    () => visibleItems.map((entry) => entry.id),
    [visibleItems],
  )

  const allVisibleOwned =
    visibleThemeIds.length > 0 && ownedCountInCategory === visibleThemeIds.length

  const setVisibleOwned = useCallback(
    (owned: boolean) => {
      setThemesOwnedBatch(visibleThemeIds, owned)
    },
    [visibleThemeIds],
  )

  const anyVisibleInPanel = useMemo(() => {
    if (activeCategory === 'tower') {
      return (
        visibleTowerGroups.milestone.length +
          visibleTowerGroups.event.length +
          visibleTowerGroups.guild.length >
        0
      )
    }
    if (activeCategory === 'background') {
      return (
        visibleBackgroundGroups.event.length + visibleBackgroundGroups.guild.length > 0
      )
    }
    return visibleItems.length > 0
  }, [activeCategory, visibleItems, visibleTowerGroups, visibleBackgroundGroups])

  const coinQuantities = useMemo(
    () => countOwnedThemesForCoinBonus(ownedIds),
    [ownedIds],
  )

  const coinMultiplier = useMemo(
    () => computeThemeCoinBonusMultiplier(coinQuantities),
    [coinQuantities],
  )

  const openResetThemesConfirm = useCallback(() => {
    setResetThemesConfirmOpen(true)
  }, [])

  const performResetThemes = useCallback(() => {
    setResetThemesConfirmOpen(false)
    resetAllThemes()
  }, [])

  useEffect(() => {
    if (!resetThemesConfirmOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setResetThemesConfirmOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [resetThemesConfirmOpen])

  useEffect(() => {
    try {
      localStorage.setItem(
        THEMES_COIN_BONUS_COLLAPSED_STORAGE_KEY,
        coinBonusCollapsed ? '1' : '0',
      )
    } catch {
      /* ignore quota / private mode */
    }
  }, [coinBonusCollapsed])

  useEffect(() => {
    const onDocKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.repeat) return
      const panel = document.getElementById('inpanel-panel-themes')
      if (!panel || panel.hidden) return
      if (e.target === searchInputRef.current) return
      const target = e.target
      if (target instanceof HTMLElement && target.isContentEditable) return
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return
      }
      e.preventDefault()
      const el = searchInputRef.current
      if (!el) return
      el.focus()
      el.select()
    }
    document.addEventListener('keydown', onDocKeyDown)
    return () => document.removeEventListener('keydown', onDocKeyDown)
  }, [])

  const toolbar = (
    <ThemesToolbar
      onResetThemes={openResetThemesConfirm}
      search={search}
      onSearchChange={setSearch}
      searchInputRef={searchInputRef}
    />
  )

  return (
    <div className="themes-page" role="region" aria-label={t('app_nav_themes')}>
      {embeddedInPanel && toolbarMount
        ? createPortal(toolbar, toolbarMount)
        : toolbar}
      {budgetPanelsVisible ? (
      <div
        className={
          coinBonusCollapsed
            ? 'select-research__budget select-research__budget--collapsed themes-page__coin-bonus'
            : 'select-research__budget themes-page__coin-bonus'
        }
        role="region"
        aria-labelledby="themes-coin-bonus-title"
      >
        <div className="select-research__budget-head">
          <div className="themes-page__coin-bonus-head-stack">
            <h2 id="themes-coin-bonus-title" className="select-research__budget-title">
              {t('themes_coin_bonus_title')}
            </h2>
            {coinBonusCollapsed ? (
              <p className="themes-page__coin-bonus-head-summary">
                <span className="themes-page__coin-bonus-multiplier themes-page__coin-bonus-multiplier--compact">
                  {formatThemeCoinBonusMultiplier(coinMultiplier)}
                </span>{' '}
                <span className="themes-page__coin-bonus-pct themes-page__coin-bonus-pct--compact">
                  {formatThemeCoinBonusPercentAboveBase(coinMultiplier)}
                </span>
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="select-research__budget-toggle"
            aria-expanded={!coinBonusCollapsed}
            aria-controls={coinBonusBodyId}
            aria-label={
              coinBonusCollapsed
                ? t('themes_coin_bonus_toggle_expand')
                : t('themes_coin_bonus_toggle_collapse')
            }
            onClick={() => setCoinBonusCollapsed((c) => !c)}
          >
            <span className="select-research__budget-chevron" aria-hidden>
              ▼
            </span>
          </button>
        </div>
        <div
          id={coinBonusBodyId}
          className="select-research__budget-body themes-page__coin-bonus-body"
          hidden={coinBonusCollapsed}
        >
          <p className="themes-page__coin-bonus-total">
            <span className="themes-page__coin-bonus-multiplier">
              {formatThemeCoinBonusMultiplier(coinMultiplier)}
            </span>
            <span className="themes-page__coin-bonus-pct">
              {formatThemeCoinBonusPercentAboveBase(coinMultiplier)}
            </span>
          </p>
          <p className="themes-page__coin-bonus-formula">{t('themes_coin_bonus_formula')}</p>
          <ul className="themes-page__coin-bonus-breakdown">
            {THEME_COIN_BONUS_CATEGORIES.map((category) => (
              <li key={category}>
                {withParams(t('themes_coin_bonus_line'), {
                  category: t(COIN_TAB_LABEL_IDS[category]),
                  percent: THEME_COIN_BONUS_PERCENT[category],
                  count: coinQuantities[category],
                })}
              </li>
            ))}
          </ul>
        </div>
      </div>
      ) : null}

      <div className="themes-page__tabs" role="tablist" aria-label={t('themes_tabs_aria')}>
        {THEME_CATEGORIES.map((category) => {
          const percent = tabPassivePercent(category)
          return (
            <button
              key={category}
              type="button"
              role="tab"
              id={`themes-tab-${category}`}
              aria-selected={activeCategory === category}
              aria-controls={`themes-panel-${category}`}
              className={
                activeCategory === category
                  ? 'themes-page__tab themes-page__tab--on'
                  : 'themes-page__tab'
              }
              onClick={() => setActiveCategory(category)}
            >
              <span className="themes-page__tab-label">{t(TAB_LABEL_IDS[category])}</span>
              {percent != null ? (
                <span className="themes-page__tab-bonus">+{percent}%</span>
              ) : null}
            </button>
          )
        })}
      </div>

      {tabPassive != null ? (
        <p className="themes-page__passive" role="note">
          {withParams(t('themes_passive_bonus'), {
            category: t(TAB_LABEL_IDS[activeCategory]),
            percent: tabPassive,
            owned: ownedCountInCategory,
            total: visibleItems.length,
          })}
        </p>
      ) : null}

      <div className="themes-page__filter-bar">
        <p className="themes-page__filter-count" aria-live="polite">
          {withParams(t('themes_filter_count'), {
            owned: ownedCountInCategory,
            shown: visibleThemeIds.length,
          })}
        </p>
        <button
          type="button"
          className="themes-page__filter-select-all"
          disabled={visibleThemeIds.length === 0}
          aria-label={
            allVisibleOwned
              ? withParams(t('themes_clear_all_shown_aria'), {
                  count: visibleThemeIds.length,
                })
              : withParams(t('themes_select_all_shown_aria'), {
                  count: visibleThemeIds.length,
                })
          }
          onClick={() => setVisibleOwned(!allVisibleOwned)}
        >
          {allVisibleOwned ? t('themes_clear_all_shown') : t('themes_select_all_shown')}
        </button>
      </div>

      <div
        id={`themes-panel-${activeCategory}`}
        role="tabpanel"
        aria-labelledby={`themes-tab-${activeCategory}`}
        className={themesPanelClassName(activeCategory)}
      >
        {!anyVisibleInPanel && searchNormalized.length > 0 ? (
          <p className="themes-page__search-empty" role="status">
            {t('themes_search_no_results')}
          </p>
        ) : null}
        {activeCategory === 'background' ? (
          <>
            {visibleBackgroundGroups.event.length > 0 ? (
              <section
                className="themes-page__section"
                aria-labelledby="themes-bg-event-title"
              >
                <h3 id="themes-bg-event-title" className="themes-page__section-title">
                  {t('themes_tower_group_event')}
                </h3>
                <div className="themes-page__grid">
                  {visibleBackgroundGroups.event.map(renderThemeCard)}
                </div>
              </section>
            ) : null}
            {visibleBackgroundGroups.guild.length > 0 ? (
              <section
                className="themes-page__section"
                aria-labelledby="themes-bg-guild-title"
              >
              <h3 id="themes-bg-guild-title" className="themes-page__section-title">
                {t('themes_tower_group_guild')}
              </h3>
              <div className="themes-page__grid">
                {visibleBackgroundGroups.guild.map(renderThemeCard)}
              </div>
            </section>
            ) : null}
          </>
        ) : activeCategory === 'tower' ? (
          <>
            {visibleTowerGroups.milestone.length > 0 ? (
              <section
                className="themes-page__section"
                aria-labelledby="themes-tower-milestone-title"
              >
              <h3 id="themes-tower-milestone-title" className="themes-page__section-title">
                {t('themes_tower_group_milestone')}
              </h3>
              <div className="themes-page__grid">
                {visibleTowerGroups.milestone.map(renderThemeCard)}
              </div>
            </section>
            ) : null}
            {visibleTowerGroups.event.length > 0 ? (
              <section
                className="themes-page__section"
                aria-labelledby="themes-tower-event-title"
              >
                <h3 id="themes-tower-event-title" className="themes-page__section-title">
                  {t('themes_tower_group_event')}
                </h3>
                <div className="themes-page__grid">
                  {visibleTowerGroups.event.map(renderThemeCard)}
                </div>
              </section>
            ) : null}
            {visibleTowerGroups.guild.length > 0 ? (
              <section
                className="themes-page__section"
                aria-labelledby="themes-tower-guild-title"
              >
                <h3 id="themes-tower-guild-title" className="themes-page__section-title">
                  {t('themes_tower_group_guild')}
                </h3>
                <div className="themes-page__grid">
                  {visibleTowerGroups.guild.map(renderThemeCard)}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          visibleItems.map(renderThemeCard)
        )}
      </div>

      {resetThemesConfirmOpen
        ? themesOverlayPortal(
            <div
              className="select-research__reset-confirm-backdrop"
              role="presentation"
              onClick={() => setResetThemesConfirmOpen(false)}
            >
              <div
                className="select-research__reset-confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="reset-themes-confirm-title"
                aria-describedby="reset-themes-confirm-desc"
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  id="reset-themes-confirm-title"
                  className="select-research__reset-confirm-title"
                >
                  {t('themes_reset_confirm_title')}
                </h2>
                <p
                  id="reset-themes-confirm-desc"
                  className="select-research__reset-confirm-desc"
                >
                  {t('themes_reset_confirm_body')}
                </p>
                <div className="select-research__reset-confirm-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => setResetThemesConfirmOpen(false)}
                  >
                    {t('sr_cancel')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--danger glow-btn--block"
                    onClick={performResetThemes}
                  >
                    {t('themes_reset')}
                  </button>
                </div>
              </div>
            </div>,
          )
        : null}
    </div>
  )
}



