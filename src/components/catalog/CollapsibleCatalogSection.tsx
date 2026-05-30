import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'

type CollapsibleCatalogSectionProps = {
  sectionId: string
  title: ReactNode
  countLabel?: ReactNode
  collapsed: boolean
  onToggle: () => void
  sectionClassName?: string
  gridClassName?: string
  children: ReactNode
}

/** Section header + body; body is not mounted when collapsed. */
export function CollapsibleCatalogSection({
  sectionId,
  title,
  countLabel,
  collapsed,
  onToggle,
  sectionClassName,
  gridClassName,
  children,
}: CollapsibleCatalogSectionProps) {
  const { t } = useI18n()

  return (
    <section
      className={sectionClassName}
      aria-labelledby={sectionId}
    >
      <header className="relics-page__section-head catalog-section__head">
        <h3 id={sectionId} className="relics-page__section-title catalog-section__title">
          {title}
        </h3>
        {countLabel ? (
          <p className="relics-page__section-count">{countLabel}</p>
        ) : null}
        <button
          type="button"
          className="select-research__budget-toggle catalog-section__toggle"
          aria-expanded={!collapsed}
          aria-controls={`${sectionId}-body`}
          aria-label={
            collapsed ? t('catalog_section_expand') : t('catalog_section_collapse')
          }
          onClick={onToggle}
        >
          <span className="select-research__budget-chevron" aria-hidden>
            ▼
          </span>
        </button>
      </header>
      {!collapsed ? (
        <div
          id={`${sectionId}-body`}
          className={gridClassName ?? 'catalog-section__body'}
        >
          {children}
        </div>
      ) : null}
    </section>
  )
}
