import {
  WORKSHOP_SUBMODULE_GLOBAL_INTRO,
  WORKSHOP_SUBMODULE_GLOBAL_NOTES,
  WORKSHOP_SUBMODULE_SECTIONS,
  submoduleEffectDisplayName,
  submoduleEffectId,
  type WorkshopSubmoduleSection,
} from '../data/workshopSubmoduleCatalog'
import type { WorkshopSubmoduleSelectionMap } from '../data/workshopSubmoduleSelection'
import {
  WORKSHOP_SUBMODULE_RARITIES,
  WORKSHOP_SUBMODULE_RARITY_CLASS,
  type WorkshopSubmoduleRarity,
} from '../data/workshopSubmoduleEffects'
import type { WorkshopAssistModuleSlot } from '../data/workshopSimModules'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'

const RARITY_COL: Record<(typeof WORKSHOP_SUBMODULE_RARITIES)[number], StringId> = {
  common: 'ws_submodules_col_common',
  rare: 'ws_submodules_col_rare',
  epic: 'ws_submodules_col_epic',
  legendary: 'ws_submodules_col_legendary',
  mythic: 'ws_submodules_col_mythic',
  ancestral: 'ws_submodules_col_ancestral',
}

function SubmoduleSectionTable({
  section,
  domId,
  selectedEffects,
  onSelectEffect,
}: {
  section: WorkshopSubmoduleSection
  domId: string
  selectedEffects: WorkshopSubmoduleSelectionMap
  onSelectEffect: (
    effectId: string,
    rarity: WorkshopSubmoduleRarity,
    cellValue: string | null,
  ) => void
}) {
  const { t } = useI18n()

  return (
    <div className="modules-catalog modules-catalog--submodules">
      <h4 id={domId} className="modules-catalog__subtitle">
        {section.title}
      </h4>
      <p className="modules-catalog__hint">{t('ws_submodules_catalog_select_hint')}</p>
      <div className="modules-catalog__scroll">
        <table className="modules-catalog__table modules-catalog__table--submodules">
          <thead>
            <tr>
              <th scope="col">{t('ws_submodules_col_effect')}</th>
              {WORKSHOP_SUBMODULE_RARITIES.map((rarity) => (
                <th
                  key={rarity}
                  scope="col"
                  className={`modules-catalog__th-num ${WORKSHOP_SUBMODULE_RARITY_CLASS[rarity]}`}
                >
                  {t(RARITY_COL[rarity])}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((effectRow) => {
              const effectId = submoduleEffectId(effectRow.label)
              const rowRarity = selectedEffects[effectId]
              const rowSelected = rowRarity != null
              return (
                <tr
                  key={effectRow.label}
                  className={[
                    'modules-catalog__row',
                    rowSelected ? 'modules-catalog__row--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <th scope="row" className="modules-catalog__name">
                    {submoduleEffectDisplayName(effectRow.label)}
                  </th>
                  {WORKSHOP_SUBMODULE_RARITIES.map((rarity) => {
                    const cell = effectRow.cells[rarity]
                    const tierSelected = rowRarity === rarity
                    if (cell == null) {
                      return (
                        <td
                          key={rarity}
                          className={`modules-catalog__num ${WORKSHOP_SUBMODULE_RARITY_CLASS[rarity]}`}
                        >
                          {t('ws_submodules_na')}
                        </td>
                      )
                    }
                    return (
                      <td key={rarity} className="modules-catalog__num">
                        <button
                          type="button"
                          className={[
                            'modules-catalog__pick',
                            'modules-catalog__pick--tier',
                            WORKSHOP_SUBMODULE_RARITY_CLASS[rarity],
                            tierSelected ? 'modules-catalog__pick--tier-on' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          aria-pressed={tierSelected}
                          onClick={() => onSelectEffect(effectId, rarity, cell)}
                        >
                          {cell}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {section.footnotes != null && section.footnotes.length > 0 ? (
        <div className="modules-catalog__notes">
          <p className="modules-catalog__notes-title">{t('ws_modules_notes_title')}</p>
          <ul className="modules-catalog__notes-list">
            {section.footnotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

type SubmoduleEffectsCatalogProps = {
  slot: WorkshopAssistModuleSlot
  selectedEffects: WorkshopSubmoduleSelectionMap
  onSelectEffect: (
    effectId: string,
    rarity: WorkshopSubmoduleRarity,
    cellValue: string | null,
  ) => void
}

export function SubmoduleEffectsCatalog({
  slot,
  selectedEffects,
  onSelectEffect,
}: SubmoduleEffectsCatalogProps) {
  const { t } = useI18n()
  const section = WORKSHOP_SUBMODULE_SECTIONS[slot]
  const sectionDomId = `modules-submodules-${slot}`

  return (
    <section className="modules-submodules" aria-labelledby="modules-submodules-title">
      <h3 id="modules-submodules-title" className="modules-catalog__title">
        {t('ws_submodules_title')}
      </h3>
      <div className="modules-catalog__notes modules-catalog__notes--intro">
        <ul className="modules-catalog__notes-list">
          {WORKSHOP_SUBMODULE_GLOBAL_INTRO.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
      <SubmoduleSectionTable
        section={section}
        domId={sectionDomId}
        selectedEffects={selectedEffects}
        onSelectEffect={onSelectEffect}
      />
      <div className="modules-catalog__notes">
        <ul className="modules-catalog__notes-list">
          {WORKSHOP_SUBMODULE_GLOBAL_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
