import { Fragment, useCallback, useEffect, useId, useMemo, useState } from 'react'
import {
  WORKSHOP_RELIC_COUNT,
  workshopRelicsDamageBonusFraction,
  workshopRelicsForUnlockGroup,
  workshopRelicsGroupedByRarity,
  type WorkshopRelicDef,
  type WorkshopRelicUnlockGroup,
} from '../data/workshopRelics'
import {
  formatRelicStatValue,
  parseWorkshopRelicEffect,
  RELIC_STAT_DEFS,
  workshopRelicsBonusTable,
  type RelicStatGroupId,
  type RelicStatId,
  type RelicStatRow,
} from '../data/workshopRelicStats'
import { workshopRelicImageUrl } from '../data/workshopRelicImages'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import { useRelicWorkshopBonusLinesVisible } from '../relicWorkshopBonusLinesVisibility'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'

type WorkshopRelicsPanelProps = {
  workshopPersisted: WorkshopPersistedV1
  onWorkshopPersistedChange: (next: WorkshopPersistedV1) => void
  searchQuery?: string
}

function relicMatchesSearch(relic: WorkshopRelicDef, query: string): boolean {
  if (query.length === 0) return true
  return (
    relic.name.toLowerCase().includes(query) ||
    relic.description.toLowerCase().includes(query) ||
    relic.unlock.toLowerCase().includes(query)
  )
}

/** Unlock-group tabs shown in the panel (`other` relics appear under All only). */
type RelicTabFilter = Exclude<WorkshopRelicUnlockGroup, 'other'> | 'all'

const FILTER_ORDER: readonly RelicTabFilter[] = [
  'all',
  'milestone',
  'tournament',
  'birthday',
  'event',
  'guild',
]

const FILTER_LABEL_IDS: Record<RelicTabFilter, StringId> = {
  all: 'ws_relics_filter_all',
  milestone: 'ws_relics_filter_milestone',
  tournament: 'ws_relics_filter_tournament',
  birthday: 'ws_relics_filter_birthday',
  event: 'ws_relics_filter_event',
  guild: 'ws_relics_filter_guild',
}

const RARITY_LABEL_IDS: Record<WorkshopRelicDef['rarity'], StringId> = {
  rare: 'ws_relics_rarity_rare',
  epic: 'ws_relics_rarity_epic',
  legendary: 'ws_relics_rarity_legendary',
}

const GROUP_LABEL_IDS: Record<RelicStatGroupId, StringId> = {
  misc: 'ws_relics_group_misc',
  damage: 'ws_relics_group_damage',
  defense: 'ws_relics_group_defense',
  utility: 'ws_relics_group_utility',
}

const RELIC_STAT_LABEL_IDS = new Map<RelicStatId, StringId>(
  RELIC_STAT_DEFS.map((def) => [def.id, def.labelId]),
)

const RELICS_SUMMARY_COLLAPSED_STORAGE_KEY = 'tower-export-relics-summary-collapsed-v1'

function formatBonusCell(value: number, unit: RelicStatRow['stat']['unit']): string {
  if (value === 0 && unit === 'percent') return '0.0%'
  return formatRelicStatValue(value, unit)
}

function formatTierCell(value: number | null, unit: RelicStatRow['stat']['unit']): string {
  if (value == null) return '—'
  return formatRelicStatValue(value, unit)
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

function relicCardWorkshopBonusLine(
  relic: WorkshopRelicDef,
  t: (id: StringId, params?: Record<string, string | number>) => string,
): string | null {
  const effect = parseWorkshopRelicEffect(relic.description)
  if (!effect || effect.sign !== 1) return null
  const labelId = RELIC_STAT_LABEL_IDS.get(effect.statId)
  if (!labelId) return null

  if (effect.unit === 'meters' && effect.statId === 'botRange') {
    return withParams(t('ws_relics_bots_line'), {
      value: formatRelicStatValue(effect.value, effect.unit),
    })
  }
  if (effect.unit === 'percent' && effect.statId === 'labSpeed') {
    return withParams(t('ws_relics_labs_line'), { percent: effect.value })
  }
  if (effect.unit !== 'percent') return null

  if (effect.statId === 'damage') {
    return withParams(t('ws_relics_workshop_damage_line'), { percent: effect.value })
  }
  if (effect.statId === 'damagePerMeter') {
    return withParams(t('ws_relics_workshop_damage_meter_line'), {
      percent: effect.value,
    })
  }

  return withParams(t('ws_relics_workshop_line'), {
    percent: effect.value,
    stat: t(labelId),
  })
}

export function WorkshopRelicsPanel({
  workshopPersisted,
  onWorkshopPersistedChange,
  searchQuery = '',
}: WorkshopRelicsPanelProps) {
  const { t } = useI18n()
  const [relicWorkshopBonusLinesVisible] = useRelicWorkshopBonusLinesVisible()
  const summaryBodyId = useId().replace(/:/g, '')
  const [filter, setFilter] = useState<RelicTabFilter>('all')
  const [summaryCollapsed, setSummaryCollapsed] = useState(() => {
    try {
      return localStorage.getItem(RELICS_SUMMARY_COLLAPSED_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(
        RELICS_SUMMARY_COLLAPSED_STORAGE_KEY,
        summaryCollapsed ? '1' : '0',
      )
    } catch {
      /* ignore quota / private mode */
    }
  }, [summaryCollapsed])

  const ownedSet = useMemo(
    () => new Set(workshopPersisted.relicOwnedIds),
    [workshopPersisted.relicOwnedIds],
  )

  const bonusTable = useMemo(() => workshopRelicsBonusTable(ownedSet), [ownedSet])

  const searchNormalized = searchQuery.trim().toLowerCase()

  const visibleRelics = useMemo(() => {
    const groupFiltered = workshopRelicsForUnlockGroup(filter)
    if (searchNormalized.length === 0) return groupFiltered
    return groupFiltered.filter((r) => relicMatchesSearch(r, searchNormalized))
  }, [filter, searchNormalized])

  const relicsByRarity = useMemo(
    () => workshopRelicsGroupedByRarity(visibleRelics),
    [visibleRelics],
  )

  const ownedInFilter = useMemo(
    () => visibleRelics.filter((r) => ownedSet.has(r.id)).length,
    [visibleRelics, ownedSet],
  )

  const allVisibleOwned =
    visibleRelics.length > 0 && ownedInFilter === visibleRelics.length

  const patch = useCallback(
    (partial: Partial<WorkshopPersistedV1>) => {
      onWorkshopPersistedChange({ ...workshopPersisted, ...partial })
    },
    [onWorkshopPersistedChange, workshopPersisted],
  )

  const setOwned = useCallback(
    (id: string, owned: boolean) => {
      const next = new Set(workshopPersisted.relicOwnedIds)
      if (owned) next.add(id)
      else next.delete(id)
      const relicOwnedIds = [...next]
      patch({
        relicOwnedIds,
        simRelicsBonusFraction: workshopRelicsDamageBonusFraction(next),
      })
    },
    [patch, workshopPersisted.relicOwnedIds],
  )

  const setVisibleOwned = useCallback(
    (owned: boolean) => {
      const next = new Set(workshopPersisted.relicOwnedIds)
      for (const relic of visibleRelics) {
        if (owned) next.add(relic.id)
        else next.delete(relic.id)
      }
      const relicOwnedIds = [...next]
      patch({
        relicOwnedIds,
        simRelicsBonusFraction: workshopRelicsDamageBonusFraction(next),
      })
    },
    [patch, visibleRelics, workshopPersisted.relicOwnedIds],
  )

  const renderRelicCard = (relic: WorkshopRelicDef) => {
    const owned = ownedSet.has(relic.id)
    const imageUrl = workshopRelicImageUrl(relic.id)
    const workshopBonusLine = relicCardWorkshopBonusLine(relic, t)
    return (
      <div
        key={relic.id}
        className={
          owned ? 'relics-page__card relics-page__card--owned' : 'relics-page__card'
        }
      >
        <div className="relics-page__card-main">
          <div className="relics-page__card-head">
            {imageUrl != null ? (
              <span className="relics-page__card-icon" aria-hidden>
                <img src={imageUrl} alt="" decoding="async" draggable={false} />
              </span>
            ) : null}
            <span className="relics-page__card-name">{relic.name}</span>
          </div>
          <p className="relics-page__card-effect">{relic.description}</p>
          {relicWorkshopBonusLinesVisible && workshopBonusLine ? (
            <p className="relics-page__card-damage">{workshopBonusLine}</p>
          ) : null}
          <p className="relics-page__card-unlock" title={relic.unlock}>
            {relic.unlock}
          </p>
        </div>
        <button
          type="button"
          className={
            owned ? 'relics-page__owned relics-page__owned--on' : 'relics-page__owned'
          }
          aria-pressed={owned}
          aria-label={
            owned
              ? withParams(t('ws_relics_owned_toggle_off'), { name: relic.name })
              : withParams(t('ws_relics_owned_toggle_on'), { name: relic.name })
          }
          onClick={() => setOwned(relic.id, !owned)}
        >
          {owned ? t('ws_relics_owned_true') : t('ws_relics_owned_false')}
        </button>
      </div>
    )
  }

  return (
    <div className="relics-page">
      <div
        className={
          summaryCollapsed
            ? 'select-research__budget select-research__budget--collapsed relics-page__summary'
            : 'select-research__budget relics-page__summary'
        }
        role="region"
        aria-labelledby="relics-summary-title"
      >
        <div className="select-research__budget-head relics-page__summary-head">
          <div className="relics-page__summary-head-stack">
            <h3 id="relics-summary-title" className="select-research__budget-title relics-page__summary-title">
              {t('ws_relics_damage_total')}
            </h3>
            {summaryCollapsed ? (
              <p className="relics-page__summary-head-compact">
                {withParams(t('ws_relics_owned_count'), {
                  owned: workshopPersisted.relicOwnedIds.length,
                  total: WORKSHOP_RELIC_COUNT,
                })}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="select-research__budget-toggle"
            aria-expanded={!summaryCollapsed}
            aria-controls={summaryBodyId}
            aria-label={
              summaryCollapsed
                ? t('ws_relics_summary_toggle_expand')
                : t('ws_relics_summary_toggle_collapse')
            }
            onClick={() => setSummaryCollapsed((c) => !c)}
          >
            <span className="select-research__budget-chevron" aria-hidden>
              ▼
            </span>
          </button>
        </div>
        <div
          id={summaryBodyId}
          className="select-research__budget-body relics-page__summary-body"
          hidden={summaryCollapsed}
        >
          <p className="relics-page__summary-stats">
            {withParams(t('ws_relics_owned_count'), {
              owned: workshopPersisted.relicOwnedIds.length,
              total: WORKSHOP_RELIC_COUNT,
            })}
          </p>
          <div className="relics-page__bonus-table-wrap">
            <table className="relics-page__bonus-table">
              <caption className="relics-page__bonus-table-caption">
                {t('ws_relics_breakdown_title')}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{t('ws_relics_table_stat')}</th>
                  <th scope="col">{t('ws_relics_table_active')}</th>
                  <th scope="col">{t('ws_relics_table_total')}</th>
                  <th scope="col">{t('ws_relics_table_standard')}</th>
                  <th scope="col">{t('ws_relics_table_premium')}</th>
                  <th scope="col" colSpan={2}>
                    {t('ws_relics_table_per_relic')}
                  </th>
                </tr>
                <tr className="relics-page__bonus-table-subhead">
                  <th scope="col" colSpan={5} />
                  <th scope="col">{t('ws_relics_rarity_rare')}</th>
                  <th scope="col">{t('ws_relics_rarity_epic')}</th>
                </tr>
              </thead>
              <tbody>
                {bonusTable.map((group) => (
                  <Fragment key={group.groupId}>
                    <tr
                      className={`relics-page__bonus-table-group relics-page__bonus-table-group--${group.groupId}`}
                    >
                      <th scope="rowgroup" colSpan={7}>
                        {t(GROUP_LABEL_IDS[group.groupId])}
                      </th>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.stat.id}>
                        <th scope="row">{t(row.stat.labelId)}</th>
                        <td
                          className={
                            row.activeCount > 0
                              ? 'relics-page__bonus-table-cell--active'
                              : undefined
                          }
                        >
                          {formatBonusCell(row.active, row.stat.unit)}
                        </td>
                        <td>{formatBonusCell(row.total, row.stat.unit)}</td>
                        <td>{formatBonusCell(row.standard, row.stat.unit)}</td>
                        <td>{formatBonusCell(row.premium, row.stat.unit)}</td>
                        <td>{formatTierCell(row.rareBonus, row.stat.unit)}</td>
                        <td>{formatTierCell(row.epicBonus, row.stat.unit)}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="relics-page__tabs" role="tablist" aria-label={t('ws_relics_tabs_aria')}>
        {FILTER_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            className={
              filter === key ? 'relics-page__tab relics-page__tab--on' : 'relics-page__tab'
            }
            onClick={() => setFilter(key)}
          >
            {t(FILTER_LABEL_IDS[key])}
          </button>
        ))}
      </div>

      <div className="relics-page__filter-bar">
        <p className="relics-page__filter-count" aria-live="polite">
          {withParams(t('ws_relics_filter_count'), {
            owned: ownedInFilter,
            shown: visibleRelics.length,
          })}
        </p>
        <button
          type="button"
          className="relics-page__filter-select-all"
          disabled={visibleRelics.length === 0}
          aria-label={
            allVisibleOwned
              ? withParams(t('ws_relics_clear_all_shown_aria'), {
                  count: visibleRelics.length,
                })
              : withParams(t('ws_relics_select_all_shown_aria'), {
                  count: visibleRelics.length,
                })
          }
          onClick={() => setVisibleOwned(!allVisibleOwned)}
        >
          {allVisibleOwned ? t('ws_relics_clear_all_shown') : t('ws_relics_select_all_shown')}
        </button>
      </div>

      <div
        role="tabpanel"
        className="relics-page__catalog"
        aria-label={t(FILTER_LABEL_IDS[filter])}
      >
        {visibleRelics.length === 0 && searchNormalized.length > 0 ? (
          <p className="relics-page__search-empty" role="status">
            {t('ws_relics_search_no_results')}
          </p>
        ) : null}
        {relicsByRarity.map(({ rarity, relics }) => {
          const ownedInRarity = relics.filter((r) => ownedSet.has(r.id)).length
          const sectionId = `relics-section-${rarity}`
          return (
            <section
              key={rarity}
              className={`relics-page__section relics-page__section--${rarity}`}
              aria-labelledby={sectionId}
            >
              <header className="relics-page__section-head">
                <h3 id={sectionId} className="relics-page__section-title">
                  <span
                    className={`relics-page__rarity relics-page__rarity--${rarity}`}
                  >
                    {t(RARITY_LABEL_IDS[rarity])}
                  </span>
                </h3>
                <p className="relics-page__section-count">
                  {withParams(t('ws_relics_rarity_count'), {
                    owned: ownedInRarity,
                    total: relics.length,
                  })}
                </p>
              </header>
              <div className="relics-page__grid">{relics.map(renderRelicCard)}</div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
