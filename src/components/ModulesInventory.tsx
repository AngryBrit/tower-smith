import { useMemo, useState } from 'react'
import {
  CHASSIS_MODULE_ORDERS,
  workshopChassisModuleDefForSlot,
  workshopChassisModuleSelection,
} from '../data/workshopChassisModuleSelection'
import { workshopAssistChassisModuleSelection } from '../data/workshopAssistChassisModule'
import { MODULE_HUB_SLOT_ART } from '../data/workshopModuleArt'
import {
  workshopChassisModuleBorderImageUrl,
  workshopChassisModuleDedicatedImageUrl,
  workshopChassisModuleImageUrl,
} from '../data/workshopModuleImages'
import {
  workshopChassisModuleMergeTierCssClass,
  type WorkshopChassisModuleMergeTier,
} from '../data/workshopChassisModuleShared'
import {
  workshopModuleConfigEntry,
  workshopModuleIsOwned,
} from '../data/workshopModuleConfigLibrary'
import { workshopModuleCopySummary } from '../data/workshopModuleCopyCounts'
import {
  WORKSHOP_ASSIST_MODULE_SLOTS,
  type WorkshopAssistModuleSlot,
} from '../data/workshopSimModules'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import { ModuleLevelOverlay } from './ModuleLevelOverlay'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'

const SLOT_FILTER_LABEL: Record<WorkshopAssistModuleSlot, StringId> = {
  cannon: 'ws_sim_module_cannon',
  armor: 'ws_sim_module_armor',
  generator: 'ws_sim_module_generator',
  core: 'ws_sim_module_core',
}

type SlotFilter = WorkshopAssistModuleSlot | ''

type ModulesInventoryProps = {
  workshopPersisted: WorkshopPersistedV1
  selectedModule?: { slot: WorkshopAssistModuleSlot; moduleId: string } | null
  onSelectModule: (slot: WorkshopAssistModuleSlot, moduleId: string) => void
}

function ModuleInventoryCopyBadge({ count }: { count: number }) {
  const { t } = useI18n()
  if (count <= 1) return null
  return (
    <span className="modules-inventory__copy-badge" aria-hidden>
      {t('ws_modules_inventory_copy_badge').replace('{{count}}', String(count))}
    </span>
  )
}

function ModuleInventoryTileIcon({
  slot,
  moduleId,
  rarity,
  moduleLevel,
  copyCount,
}: {
  slot: WorkshopAssistModuleSlot
  moduleId: string
  rarity: WorkshopChassisModuleMergeTier
  moduleLevel: number | null
  copyCount: number | null
}) {
  const shape = MODULE_HUB_SLOT_ART[slot].shape
  const dedicatedUrl = workshopChassisModuleDedicatedImageUrl(slot, moduleId)
  const [iconFailed, setIconFailed] = useState(false)
  const iconUrl =
    dedicatedUrl != null && !iconFailed
      ? dedicatedUrl
      : workshopChassisModuleImageUrl(slot, moduleId, rarity)
  const borderUrl = workshopChassisModuleBorderImageUrl(slot, rarity)

  return (
    <span
      className={[
        'modules-inventory__icon',
        `modules-inventory__icon--${shape}`,
        workshopChassisModuleMergeTierCssClass(rarity),
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      <img
        className="modules-inventory__border"
        src={borderUrl}
        alt=""
        decoding="async"
        draggable={false}
      />
      {iconUrl != null ? (
        <img
          key={iconUrl}
          className="modules-inventory__icon-img"
          src={iconUrl}
          alt=""
          decoding="async"
          draggable={false}
          onError={() => setIconFailed(true)}
        />
      ) : null}
      {copyCount != null && copyCount > 1 ? (
        <ModuleInventoryCopyBadge count={copyCount} />
      ) : null}
      {moduleLevel != null ? <ModuleLevelOverlay value={moduleLevel} /> : null}
    </span>
  )
}

export function ModulesInventory({
  workshopPersisted,
  selectedModule = null,
  onSelectModule,
}: ModulesInventoryProps) {
  const { t } = useI18n()
  const [slotFilter, setSlotFilter] = useState<SlotFilter>('')

  const visibleSlots = useMemo(
    () =>
      slotFilter === ''
        ? WORKSHOP_ASSIST_MODULE_SLOTS
        : WORKSHOP_ASSIST_MODULE_SLOTS.filter((slot) => slot === slotFilter),
    [slotFilter],
  )

  return (
    <>
      <header className="modules-inventory__head">
        <h3 className="modules-inventory__title">{t('ws_modules_inventory_title')}</h3>
        <div
          className="gallery-category-chips modules-inventory__filters"
          role="group"
          aria-label={t('ws_modules_inventory_filter_aria')}
        >
          <button
            type="button"
            className={
              slotFilter === ''
                ? 'gallery-category-chips__chip gallery-category-chips__chip--on'
                : 'gallery-category-chips__chip'
            }
            aria-pressed={slotFilter === ''}
            onClick={() => setSlotFilter('')}
          >
            {t('ws_modules_inventory_filter_all')}
          </button>
          {WORKSHOP_ASSIST_MODULE_SLOTS.map((slot) => {
            const on = slotFilter === slot
            return (
              <button
                key={slot}
                type="button"
                className={
                  on
                    ? 'gallery-category-chips__chip gallery-category-chips__chip--on'
                    : 'gallery-category-chips__chip'
                }
                aria-pressed={on}
                onClick={() => setSlotFilter(on ? '' : slot)}
              >
                {t(SLOT_FILTER_LABEL[slot])}
              </button>
            )
          })}
        </div>
      </header>

      <section className="modules-inventory" aria-label={t('ws_modules_inventory_aria')}>
        {visibleSlots.map((slot) => {
          const chassis = workshopChassisModuleSelection(workshopPersisted, slot)
          const assist = workshopAssistChassisModuleSelection(workshopPersisted, slot)
          const sectionDomId = `modules-inventory-${slot}`
          const showSectionTitle = slotFilter === ''

          return (
            <div key={slot} className="modules-inventory__section">
              {showSectionTitle ? (
                <h4 id={sectionDomId} className="modules-inventory__section-title">
                  {t(SLOT_FILTER_LABEL[slot])}
                </h4>
              ) : null}
              <ul
                className="modules-inventory__grid"
                aria-label={t(SLOT_FILTER_LABEL[slot])}
                {...(showSectionTitle ? { 'aria-labelledby': sectionDomId } : {})}
              >
                {CHASSIS_MODULE_ORDERS[slot].map((moduleId) => {
                  const def = workshopChassisModuleDefForSlot(slot, moduleId)
                  const equippedMain = chassis.moduleId === moduleId
                  const equippedAssist = assist.moduleId === moduleId
                  const mainConfig = workshopModuleConfigEntry(
                    workshopPersisted,
                    slot,
                    'main',
                    moduleId,
                  )
                  const assistConfig = workshopModuleConfigEntry(
                    workshopPersisted,
                    slot,
                    'assist',
                    moduleId,
                  )
                  const tileRarity = equippedMain
                    ? chassis.rarity
                    : equippedAssist
                      ? assist.rarity
                      : mainConfig.rarity
                  const isOwned = workshopModuleIsOwned(workshopPersisted, slot, moduleId)
                  const copySummary = workshopModuleCopySummary(
                    workshopPersisted,
                    slot,
                    moduleId,
                  )
                  const copyCount = copySummary?.count ?? null
                  const moduleLevel = !isOwned
                    ? null
                    : equippedAssist && !equippedMain
                      ? assistConfig.level
                      : mainConfig.level

                  const isEquipped = equippedMain || equippedAssist
                  const isSelected =
                    isOwned &&
                    selectedModule?.slot === slot &&
                    selectedModule.moduleId === moduleId

                  return (
                    <li key={moduleId}>
                      <button
                        type="button"
                        className={[
                          'modules-inventory__tile',
                          !isOwned
                            ? 'modules-inventory__tile--unowned'
                            : isEquipped
                              ? 'modules-inventory__tile--equipped'
                              : 'modules-inventory__tile--muted',
                          isSelected ? 'modules-inventory__tile--selected' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        disabled={!isOwned}
                        onClick={() => onSelectModule(slot, moduleId)}
                        aria-pressed={isSelected}
                        aria-disabled={!isOwned}
                        aria-label={
                          !isOwned
                            ? t('ws_modules_module_unowned_aria').replace('{{module}}', def.name)
                            : copyCount != null && copyCount > 1
                              ? t('ws_modules_module_owned_copies_aria')
                                  .replace('{{module}}', def.name)
                                  .replace('{{count}}', String(copyCount))
                              : t('ws_modules_module_select_aria').replace('{{module}}', def.name)
                        }
                      >
                        <ModuleInventoryTileIcon
                          slot={slot}
                          moduleId={moduleId}
                          rarity={tileRarity}
                          moduleLevel={moduleLevel}
                          copyCount={copyCount}
                        />
                        <span
                          className={[
                            'modules-inventory__label',
                            isEquipped ? workshopChassisModuleMergeTierCssClass(tileRarity) : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {def.name}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </section>
    </>
  )
}
