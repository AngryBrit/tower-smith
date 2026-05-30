import { memo } from 'react'
import type { WorkshopRelicDef } from '../../data/workshopRelics'
import { workshopRelicImageUrl } from '../../data/workshopRelicImages'
import type { StringId } from '../../i18n/dictionary'

type RelicCatalogCardProps = {
  relic: WorkshopRelicDef
  owned: boolean
  workshopBonusLine: string | null
  showWorkshopBonusLine: boolean
  onToggleOwned: (id: string, owned: boolean) => void
  t: (id: StringId, params?: Record<string, string | number>) => string
  withParams: (template: string, params: Record<string, string | number>) => string
}

export const RelicCatalogCard = memo(function RelicCatalogCard({
  relic,
  owned,
  workshopBonusLine,
  showWorkshopBonusLine,
  onToggleOwned,
  t,
  withParams,
}: RelicCatalogCardProps) {
  const imageUrl = workshopRelicImageUrl(relic.id)

  return (
    <div
      className={
        owned ? 'relics-page__card relics-page__card--owned' : 'relics-page__card'
      }
    >
      <div className="relics-page__card-main">
        <div className="relics-page__card-head">
          {imageUrl != null ? (
            <span className="relics-page__card-icon" aria-hidden>
              <img src={imageUrl} alt="" decoding="async" draggable={false} loading="lazy" />
            </span>
          ) : null}
          <span className="relics-page__card-name">{relic.name}</span>
        </div>
        <p className="relics-page__card-effect">{relic.description}</p>
        {showWorkshopBonusLine && workshopBonusLine ? (
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
        onClick={() => onToggleOwned(relic.id, !owned)}
      >
        {owned ? t('ws_relics_owned_true') : t('ws_relics_owned_false')}
      </button>
    </div>
  )
})
