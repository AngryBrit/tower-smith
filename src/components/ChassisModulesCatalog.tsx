import {
  defaultMergeTierForEffectTier,
  formatWorkshopChassisModuleValue,
  WORKSHOP_CHASSIS_MODULE_EFFECT_TIERS,
  workshopChassisModuleEffectTier,
  workshopChassisModuleMergeTierCssClass,
  type WorkshopChassisModuleDef,
  type WorkshopChassisModuleEffectTier,
  type WorkshopChassisModuleMergeTier,
} from '../data/workshopChassisModuleShared'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'

const EFFECT_COL: Record<WorkshopChassisModuleEffectTier, StringId> = {
  epic: 'ws_modules_col_epic',
  legendary: 'ws_modules_col_legendary',
  mythic: 'ws_modules_col_mythic',
  ancestral: 'ws_modules_col_ancestral',
}

type ChassisModulesCatalogProps = {
  titleId: StringId
  titleDomId: string
  moduleOrder: readonly string[]
  getDef: (id: string) => WorkshopChassisModuleDef
  notes?: readonly string[]
  selectedModuleId: string | null
  selectedRarity: WorkshopChassisModuleMergeTier
  onSelectModule: (moduleId: string, rarity: WorkshopChassisModuleMergeTier) => void
}

export function ChassisModulesCatalog({
  titleId,
  titleDomId,
  moduleOrder,
  getDef,
  notes,
  selectedModuleId,
  selectedRarity,
  onSelectModule,
}: ChassisModulesCatalogProps) {
  const { t } = useI18n()
  const selectedEffect = workshopChassisModuleEffectTier(selectedRarity)

  return (
    <section className="modules-catalog" aria-labelledby={titleDomId}>
      <h3 id={titleDomId} className="modules-catalog__title">
        {t(titleId)}
      </h3>
      <p className="modules-catalog__hint">{t('ws_modules_catalog_select_hint')}</p>
      <div className="modules-catalog__scroll">
        <table className="modules-catalog__table">
          <thead>
            <tr>
              <th scope="col">{t('ws_modules_col_module')}</th>
              <th scope="col">{t('ws_modules_col_ability')}</th>
              {WORKSHOP_CHASSIS_MODULE_EFFECT_TIERS.map((effect) => (
                <th
                  key={effect}
                  scope="col"
                  className={`modules-catalog__th-num ${workshopChassisModuleMergeTierCssClass(defaultMergeTierForEffectTier(effect))}`}
                >
                  {t(EFFECT_COL[effect])}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {moduleOrder.map((id) => {
              const def = getDef(id)
              const rowSelected = selectedModuleId === id
              return (
                <tr
                  key={id}
                  className={[
                    'modules-catalog__row',
                    rowSelected ? 'modules-catalog__row--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <th scope="row" className="modules-catalog__name">
                    <button
                      type="button"
                      className="modules-catalog__pick modules-catalog__pick--name"
                      aria-pressed={rowSelected}
                      onClick={() => onSelectModule(id, selectedRarity)}
                    >
                      {def.name}
                    </button>
                  </th>
                  <td className="modules-catalog__ability">{def.description}</td>
                  {WORKSHOP_CHASSIS_MODULE_EFFECT_TIERS.map((effect) => {
                    const merge = defaultMergeTierForEffectTier(effect)
                    const tierSelected = rowSelected && selectedEffect === effect
                    return (
                      <td key={effect} className="modules-catalog__num">
                        <button
                          type="button"
                          className={[
                            'modules-catalog__pick',
                            'modules-catalog__pick--tier',
                            workshopChassisModuleMergeTierCssClass(merge),
                            tierSelected ? 'modules-catalog__pick--tier-on' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          aria-pressed={tierSelected}
                          onClick={() => onSelectModule(id, merge)}
                        >
                          {formatWorkshopChassisModuleValue(def.kind, def.values[effect])}
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
      {notes != null && notes.length > 0 ? (
        <div className="modules-catalog__notes">
          <p className="modules-catalog__notes-title">{t('ws_modules_notes_title')}</p>
          <ul className="modules-catalog__notes-list">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
