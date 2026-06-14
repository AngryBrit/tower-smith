import { useCallback, useMemo, useState, type CSSProperties } from 'react'
import {
  ASSIST_MODULE_LEVEL_KEY,
  WORKSHOP_ASSIST_MODULE_SLOTS,
  clampWorkshopAssistModuleLevel,
  workshopAssistModuleLabPercentPoints,
  workshopAssistModuleLevel,
  workshopCannonModulePercentFromLabs,
  type WorkshopAssistModuleSlot,
} from '../data/workshopSimModules'
import {
  formatWorkshopChassisModuleAbility,
  formatWorkshopChassisModuleValue,
  resolveChassisModuleEffectTier,
  workshopChassisModuleEffectTierCssClass,
  workshopChassisModuleMergeTierCssClass,
  type WorkshopChassisModuleMergeTier,
} from '../data/workshopChassisModuleShared'

/** @deprecated */
type WorkshopChassisModuleRarity = WorkshopChassisModuleMergeTier
import {
  ASSIST_CHASSIS_MODULE_ID_KEY,
  ASSIST_CHASSIS_MODULE_RARITY_KEY,
  assistModuleConflictsWithMain,
  mainModuleConflictsWithAssist,
  workshopAssistChassisModuleSelection,
} from '../data/workshopAssistChassisModule'
import {
  CHASSIS_MODULE_ID_KEY,
  CHASSIS_MODULE_LEVEL_KEY,
  CHASSIS_MODULE_RARITY_KEY,
  workshopChassisModuleDefForSlot,
  workshopChassisModuleLevel,
  workshopChassisModuleSelection,
} from '../data/workshopChassisModuleSelection'
import {
  toggleSubmoduleSelection,
  workshopPersistedWithSubmoduleSelections,
  workshopSubmoduleOrderedSlots,
  workshopSubmoduleSelections,
} from '../data/workshopSubmoduleSelection'
import type { WorkshopSubmoduleRarity } from '../data/workshopSubmoduleEffects'
import {
  MODULE_HUB_SLOT_ART,
  WORKSHOP_MODULES_TOWER_IMAGE,
  type ModuleHubShape,
} from '../data/workshopModuleArt'
import {
  workshopChassisModuleBorderImageUrl,
  workshopChassisModuleDedicatedImageUrl,
  workshopChassisModuleHasDedicatedArt,
} from '../data/workshopModuleImages'
import {
  buildTowerDamageHeroStatContext,
  buildTowerHealthHeroStatContext,
} from '../data/workshopChassisModuleHeroStat'
import { ChassisModulePickerDialog } from './ChassisModulePickerDialog'
import { WorkshopPresetToolbar } from './WorkshopPresetToolbar'
import { ChassisModulesCatalog } from './ChassisModulesCatalog'
import { AssistModuleReference } from './AssistModuleReference'
import { AssistUnlocksPanel } from './AssistUnlocksPanel'
import { SubmoduleEffectsCatalog } from './SubmoduleEffectsCatalog'
import { useAssistModuleCatalogVisible } from '../assistModuleCatalogVisibility'
import {
  WORKSHOP_ARMOR_MODULE_NOTES,
  WORKSHOP_ARMOR_MODULE_ORDER,
  workshopArmorModuleDef,
} from '../data/workshopArmorModules'
import {
  WORKSHOP_CORE_MODULE_NOTES,
  WORKSHOP_CORE_MODULE_ORDER,
  workshopCoreModuleDef,
} from '../data/workshopCoreModules'
import {
  WORKSHOP_GENERATOR_MODULE_NOTES,
  WORKSHOP_GENERATOR_MODULE_ORDER,
  workshopGeneratorModuleDef,
} from '../data/workshopGeneratorModules'
import {
  WORKSHOP_CANNON_MODULE_ORDER,
  workshopCannonModuleDef,
} from '../data/workshopCannonModules'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import {
  clampWorkshopModuleActivePresetIndex,
  patchWorkshopModules,
  selectWorkshopModulePreset,
} from '../data/workshopModulePresets'
import { useModulesCatalogVisible } from '../modulesCatalogVisibility'
import { useSubmodulesCatalogVisible } from '../submodulesCatalogVisibility'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'
import type { ResearchData } from '../types/research'

const SLOT_LABEL: Record<WorkshopAssistModuleSlot, StringId> = {
  cannon: 'ws_sim_module_cannon',
  armor: 'ws_sim_module_armor',
  generator: 'ws_sim_module_generator',
  core: 'ws_sim_module_core',
}

const MODULE_PRESET_KEYS = [
  'ws_modules_preset_1',
  'ws_modules_preset_2',
  'ws_modules_preset_3',
  'ws_modules_preset_4',
  'ws_modules_preset_5',
] as const satisfies readonly StringId[]

type WorkshopModulesPanelProps = {
  workshopPersisted: WorkshopPersistedV1
  onWorkshopPersistedChange: (next: WorkshopPersistedV1) => void
  researchData: ResearchData | null
  labLevelOverrides: Record<string, number>
}

function ModuleLevelDisplay({ value }: { value: number }) {
  const { t } = useI18n()
  return (
    <span className="modules-slot__level" aria-hidden>
      <span className="modules-slot__level-prefix">{t('ws_modules_level_prefix')}</span>
      <span className="modules-slot__level-value">{value}</span>
    </span>
  )
}

function AssistStoneEfficiencyDisplay({
  slot,
  main,
  sub,
}: {
  slot: WorkshopAssistModuleSlot
  main: number
  sub: number
}) {
  const { t } = useI18n()
  return (
    <span
      className="modules-slot__efficiency modules-slot__efficiency--display"
      aria-label={`${t('ws_modules_assist_stone_efficiency')} ${t(SLOT_LABEL[slot])}: ${main}% / ${sub}%`}
    >
      {t('ws_modules_assist_efficiency_prefix')} {main}% / {sub}%
    </span>
  )
}

function ModuleSlotMetaBelow({
  name,
  moduleRarity,
  frameRole,
  moduleLevel,
}: {
  name: string
  moduleRarity: WorkshopChassisModuleRarity
  frameRole: 'main' | 'assist'
  moduleLevel?: number
}) {
  return (
    <span className="modules-slot__meta-below">
      <span
        className={[
          'modules-slot__name',
          'modules-slot__name--below',
          'modules-slot__name--module',
          frameRole === 'assist' ? 'modules-slot__name--below-assist' : '',
          workshopChassisModuleMergeTierCssClass(moduleRarity),
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden
      >
        {name}
      </span>
      {moduleLevel != null ? <ModuleLevelDisplay value={moduleLevel} /> : null}
    </span>
  )
}

function ModuleSlotFrame({
  slot,
  shape,
  moduleId,
  moduleRarity,
  frameRole = 'main',
  locked = false,
  showNameBelow = true,
}: {
  slot: WorkshopAssistModuleSlot
  shape: ModuleHubShape
  moduleId: string | null
  moduleRarity: WorkshopChassisModuleRarity
  frameRole?: 'main' | 'assist'
  locked?: boolean
  showNameBelow?: boolean
}) {
  const { t } = useI18n()
  const equipped =
    moduleId != null ? workshopChassisModuleDefForSlot(slot, moduleId) : null
  const dedicatedIconUrl =
    moduleId != null && workshopChassisModuleHasDedicatedArt(slot, moduleId)
      ? workshopChassisModuleDedicatedImageUrl(slot, moduleId)
      : null
  const [iconFailed, setIconFailed] = useState(false)

  const showIcon = dedicatedIconUrl != null && !iconFailed
  const borderUrl = workshopChassisModuleBorderImageUrl(
    slot,
    locked || moduleId == null ? 'empty' : moduleRarity,
  )

  const frameClass = [
    'modules-slot__frame',
    'modules-slot__frame--has-border',
    `modules-slot__frame--${shape}`,
    frameRole === 'assist' ? 'modules-slot__frame--assist' : 'modules-slot__frame--main',
    locked ? 'modules-slot__frame--locked' : '',
    moduleId != null && !locked ? 'modules-slot__frame--equipped' : 'modules-slot__frame--empty',
    moduleId != null && !locked ? workshopChassisModuleMergeTierCssClass(moduleRarity) : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className="modules-slot__frame-wrap">
      <span className={frameClass}>
        <img
          className="modules-slot__border"
          src={borderUrl}
          alt=""
          decoding="async"
          draggable={false}
        />
        {showIcon ? (
          <span className={`modules-slot__icon modules-slot__icon--${shape}`} aria-hidden>
            <img
              key={dedicatedIconUrl}
              className="modules-slot__icon-img"
              src={dedicatedIconUrl!}
              alt=""
              decoding="async"
              draggable={false}
              onError={() => setIconFailed(true)}
            />
          </span>
        ) : null}
        {locked ? (
          <span className="modules-slot__frame-label" aria-hidden>
            <span className="modules-slot__name modules-slot__name--empty">
              {t('ws_modules_assist_locked')}
            </span>
          </span>
        ) : null}
      </span>
      {showNameBelow && equipped != null ? (
        <ModuleSlotMetaBelow
          name={equipped.name}
          moduleRarity={moduleRarity}
          frameRole={frameRole}
        />
      ) : null}
    </span>
  )
}

function ModulesLabDetail({
  slot,
  labPercents,
  cannonDecimal,
  moduleId,
  moduleRarity,
  assist,
}: {
  slot: WorkshopAssistModuleSlot
  labPercents: { substatsPercent: number; bonusPercent: number }
  cannonDecimal: number
  moduleId: string | null
  moduleRarity: WorkshopChassisModuleRarity
  assist: ReturnType<typeof workshopAssistChassisModuleSelection>
}) {
  const { t } = useI18n()
  const equipped =
    moduleId != null ? workshopChassisModuleDefForSlot(slot, moduleId) : null
  const assistEquipped =
    assist.moduleId != null ? workshopChassisModuleDefForSlot(slot, assist.moduleId) : null

  return (
    <ul className="workshop__grid workshop__grid--sim modules-detail">
      {equipped != null ? (
        <li
          className={[
            'workshop__card',
            'workshop__card--active',
            'workshop__card--sim',
            'workshop__card--sim-wide',
            workshopChassisModuleMergeTierCssClass(moduleRarity),
          ].join(' ')}
        >
          <div className="workshop__card-damage-head">
            <span className="workshop__card-name">{equipped.name}</span>
            <span className="workshop__card-value">
              {formatWorkshopChassisModuleValue(
                equipped.kind,
                equipped.values[resolveChassisModuleEffectTier(moduleRarity)],
              )}
            </span>
          </div>
          <p className="workshop__sim-foot">
            {formatWorkshopChassisModuleAbility(equipped, moduleRarity)}
          </p>
        </li>
      ) : null}
      {assistEquipped != null ? (
        <li
          className={[
            'workshop__card',
            'workshop__card--active',
            'workshop__card--sim',
            'workshop__card--sim-wide',
            workshopChassisModuleEffectTierCssClass(assist.uniqueRarity),
          ].join(' ')}
        >
          <div className="workshop__card-damage-head">
            <span className="workshop__card-name">
              {t('ws_modules_assist_label')}: {assistEquipped.name}
            </span>
            <span className="workshop__card-value">
              {formatWorkshopChassisModuleValue(
                assistEquipped.kind,
                assistEquipped.values[assist.uniqueRarity],
              )}
              {' · '}
              {assist.mainStoneEfficiencyPercent}% / {assist.subStoneEfficiencyPercent}%
            </span>
          </div>
          <p className="workshop__sim-foot">
            {formatWorkshopChassisModuleAbility(assistEquipped, assist.uniqueRarity)}
          </p>
          <p className="workshop__sim-foot">{t('ws_modules_assist_efficiency_hint')}</p>
        </li>
      ) : null}
      <li className="workshop__card workshop__card--active workshop__card--sim workshop__card--sim-wide">
        <div className="workshop__card-damage-head">
          <span className="workshop__card-name">
            {t(SLOT_LABEL[slot])} · {t('ws_sim_module_lab_substats')}
          </span>
          <span className="workshop__card-value">+{labPercents.substatsPercent}%</span>
        </div>
        <p className="workshop__sim-foot">{t('ws_sim_module_substats_hint')}</p>
      </li>
      <li className="workshop__card workshop__card--active workshop__card--sim workshop__card--sim-wide">
        <div className="workshop__card-damage-head">
          <span className="workshop__card-name">
            {t(SLOT_LABEL[slot])} · {t('ws_sim_module_lab_bonus')}
          </span>
          <span className="workshop__card-value">+{labPercents.bonusPercent}%</span>
        </div>
        <p className="workshop__sim-foot">{t('ws_sim_module_bonus_hint')}</p>
      </li>
      {slot === 'cannon' ? (
        <li className="workshop__card workshop__card--active workshop__card--sim workshop__card--sim-wide">
          <div className="workshop__card-damage-head">
            <span className="workshop__card-name">{t('ws_sim_module_cannon_damage')}</span>
            <span className="workshop__card-value">+{(cannonDecimal * 100).toFixed(0)}%</span>
          </div>
          <p className="workshop__sim-foot">{t('ws_sim_module_cannon_hint')}</p>
        </li>
      ) : null}
    </ul>
  )
}

function ModulesHubLines() {
  return (
    <svg
      className="modules-hub__lines"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline className="modules-hub__line" points="26,30 50,42" />
      <polyline className="modules-hub__line" points="74,30 50,42" />
      <polyline className="modules-hub__line" points="26,70 50,58" />
      <polyline className="modules-hub__line" points="74,70 50,58" />
    </svg>
  )
}

export function WorkshopModulesPanel({
  workshopPersisted,
  onWorkshopPersistedChange,
  researchData,
  labLevelOverrides,
}: WorkshopModulesPanelProps) {
  const { t } = useI18n()
  const [modulesCatalogVisible] = useModulesCatalogVisible()
  const [submodulesCatalogVisible] = useSubmodulesCatalogVisible()
  const [assistModuleCatalogVisible] = useAssistModuleCatalogVisible()
  const presetIndex = clampWorkshopModuleActivePresetIndex(
    workshopPersisted.moduleActivePresetIndex,
  )
  const slot = workshopPersisted.simAssistModuleSlot

  const patch = useCallback(
    (partial: Partial<WorkshopPersistedV1>) => {
      onWorkshopPersistedChange(patchWorkshopModules(workshopPersisted, partial))
    },
    [onWorkshopPersistedChange, workshopPersisted],
  )

  const selectPreset = useCallback(
    (i: number) => {
      onWorkshopPersistedChange(selectWorkshopModulePreset(workshopPersisted, i))
    },
    [onWorkshopPersistedChange, workshopPersisted],
  )

  const setPresetLabel = useCallback(
    (index: number, label: string) => {
      const modulePresetLabels = [...workshopPersisted.modulePresetLabels]
      modulePresetLabels[index] = label
      patch({ modulePresetLabels })
    },
    [patch, workshopPersisted.modulePresetLabels],
  )

  const labPercents = useMemo(() => {
    if (researchData == null) {
      return { substatsPercent: 0, bonusPercent: 0, totalPercent: 0 }
    }
    return workshopAssistModuleLabPercentPoints(researchData, labLevelOverrides, slot)
  }, [researchData, labLevelOverrides, slot])

  const cannonDecimal = useMemo(() => {
    if (researchData == null) return 0
    return workshopCannonModulePercentFromLabs(researchData, labLevelOverrides, slot)
  }, [researchData, labLevelOverrides, slot])

  const selectSlot = useCallback(
    (next: WorkshopAssistModuleSlot) => {
      patch({ simAssistModuleSlot: next })
    },
    [patch],
  )

  const setChassisModuleLevel = useCallback(
    (target: WorkshopAssistModuleSlot, level: number) => {
      patch({
        [CHASSIS_MODULE_LEVEL_KEY[target]]: clampWorkshopAssistModuleLevel(level),
      })
    },
    [patch],
  )

  const setAssistModuleLevel = useCallback(
    (target: WorkshopAssistModuleSlot, level: number) => {
      patch({
        [ASSIST_MODULE_LEVEL_KEY[target]]: clampWorkshopAssistModuleLevel(level),
      })
    },
    [patch],
  )

  const activeChassisSelection = workshopChassisModuleSelection(workshopPersisted, slot)

  const selectChassisModule = useCallback(
    (targetSlot: WorkshopAssistModuleSlot, moduleId: string, rarity: WorkshopChassisModuleRarity) => {
      const next = {
        ...workshopPersisted,
        [CHASSIS_MODULE_ID_KEY[targetSlot]]: moduleId,
        [CHASSIS_MODULE_RARITY_KEY[targetSlot]]: rarity,
      }
      if (mainModuleConflictsWithAssist(targetSlot, workshopPersisted, moduleId)) {
        next[ASSIST_CHASSIS_MODULE_ID_KEY[targetSlot]] = ''
      }
      patch(next)
    },
    [patch, workshopPersisted],
  )

  const selectAssistChassisModule = useCallback(
    (targetSlot: WorkshopAssistModuleSlot, moduleId: string, rarity: WorkshopChassisModuleRarity) => {
      if (moduleId !== '' && assistModuleConflictsWithMain(targetSlot, workshopPersisted, moduleId)) {
        return
      }
      patch({
        [ASSIST_CHASSIS_MODULE_ID_KEY[targetSlot]]: moduleId,
        [ASSIST_CHASSIS_MODULE_RARITY_KEY[targetSlot]]: rarity,
      })
    },
    [patch, workshopPersisted],
  )

  type ModulePickerTarget = { slot: WorkshopAssistModuleSlot; role: 'main' | 'assist' }
  const [pickerTarget, setPickerTarget] = useState<ModulePickerTarget | null>(null)

  const openModulePicker = useCallback(
    (target: WorkshopAssistModuleSlot, role: 'main' | 'assist') => {
      setPickerTarget({ slot: target, role })
      selectSlot(target)
    },
    [selectSlot],
  )

  const handleMainSlotClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, key: WorkshopAssistModuleSlot) => {
      if ((e.target as HTMLElement).closest('.modules-slot__frame--main')) {
        e.preventDefault()
        openModulePicker(key, 'main')
        return
      }
      selectSlot(key)
    },
    [openModulePicker, selectSlot],
  )

  const activeSubmoduleSelections = workshopSubmoduleSelections(workshopPersisted, slot, 'main')

  const selectSubmoduleEffect = useCallback(
    (
      effectId: string,
      rarity: WorkshopSubmoduleRarity,
      cellValue: string | null,
      role: 'main' | 'assist',
    ) => {
      const current = workshopSubmoduleSelections(workshopPersisted, slot, role)
      const nextRoleSelections = toggleSubmoduleSelection(
        current,
        effectId,
        rarity,
        cellValue,
      )
      patch(
        workshopPersistedWithSubmoduleSelections(
          workshopPersisted,
          slot,
          role,
          nextRoleSelections,
          effectId,
        ),
      )
    },
    [patch, slot, workshopPersisted],
  )

  return (
    <div className="modules-layout">
      <WorkshopPresetToolbar
        ariaLabel="ws_modules_presets_aria"
        fallbackKeys={MODULE_PRESET_KEYS}
        labels={workshopPersisted.modulePresetLabels}
        activeIndex={presetIndex}
        onSelect={selectPreset}
        onLabelChange={setPresetLabel}
      />
      <div className="modules-hub" role="group" aria-label={t('ws_modules_hub_aria')}>
        <div className="modules-hub__stage">
          <div className="modules-hub__pcb" aria-hidden />
          <ModulesHubLines />
          <div className="modules-hub__grid">
          {WORKSHOP_ASSIST_MODULE_SLOTS.map((key) => {
            const art = MODULE_HUB_SLOT_ART[key]
            const mainLevel = workshopChassisModuleLevel(workshopPersisted, key)
            const assistLevel = workshopAssistModuleLevel(workshopPersisted, key)
            const assistActive = slot === key
            const chassis = workshopChassisModuleSelection(workshopPersisted, key)
            const assistChassis = workshopAssistChassisModuleSelection(workshopPersisted, key)
            const slotStyle = {
              '--module-glow-rgb': art.glowRgb,
            } as CSSProperties
            const equippedName =
              chassis.moduleId != null
                ? workshopChassisModuleDefForSlot(key, chassis.moduleId).name
                : t('ws_modules_none_selected')

            const assistEquipped =
              assistChassis.moduleId != null
                ? workshopChassisModuleDefForSlot(key, assistChassis.moduleId)
                : null

            const assistCol = (
              <div className="modules-assist-col">
                <span className="modules-slot__chassis modules-slot__chassis--assist" aria-hidden>
                  {t('ws_modules_assist_label')}
                </span>
                <div className="modules-assist-stack">
                  <button
                    type="button"
                    className="modules-assist-hit"
                    aria-label={`${t('ws_modules_assist_label')} ${t(SLOT_LABEL[key])}`}
                    aria-disabled={!assistChassis.unlocked}
                    disabled={!assistChassis.unlocked}
                    title={
                      !assistChassis.unlocked ? t('ws_assist_unlock_cost_title') : undefined
                    }
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!assistChassis.unlocked) return
                      openModulePicker(key, 'assist')
                    }}
                  >
                    <ModuleSlotFrame
                      slot={key}
                      shape={art.shape}
                      frameRole="assist"
                      locked={!assistChassis.unlocked}
                      moduleId={assistChassis.moduleId}
                      moduleRarity={assistChassis.rarity}
                      showNameBelow={false}
                    />
                  </button>
                </div>
                {assistChassis.unlocked && assistEquipped != null ? (
                  <div className="modules-assist-meta">
                    <div className="modules-assist-meta__copy">
                      <ModuleSlotMetaBelow
                        name={assistEquipped.name}
                        moduleRarity={assistChassis.rarity}
                        frameRole="assist"
                        moduleLevel={assistLevel}
                      />
                      <AssistStoneEfficiencyDisplay
                        slot={key}
                        main={assistChassis.mainStoneEfficiencyPercent}
                        sub={assistChassis.subStoneEfficiencyPercent}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            )

            return (
              <div
                key={key}
                className={[
                  'modules-slot-pair',
                  `modules-slot--${art.placement}`,
                  `modules-slot-pair--assist-${art.assistSide}`,
                  assistActive ? 'modules-slot-pair--on' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={slotStyle}
              >
                {art.assistSide === 'before' ? assistCol : null}
                {art.assistSide === 'before' ? (
                  <span className="modules-slot-pair__connector" aria-hidden />
                ) : null}
                <div
                  className={[
                    'modules-slot',
                    'modules-slot--main',
                    `modules-slot--${key}`,
                    `modules-slot--shape-${art.shape}`,
                    assistActive ? 'modules-slot--on' : '',
                    chassis.moduleId != null ? 'modules-slot--equipped' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <button
                    type="button"
                    className="modules-slot__hit"
                    aria-pressed={assistActive}
                    aria-current={assistActive ? 'true' : undefined}
                    aria-label={`${t(SLOT_LABEL[key])}: ${equippedName}`}
                    onClick={(e) => handleMainSlotClick(e, key)}
                  >
                    <span className="modules-slot__chassis" aria-hidden>
                      {t(SLOT_LABEL[key])}
                    </span>
                    <ModuleSlotFrame
                      slot={key}
                      shape={art.shape}
                      frameRole="main"
                      moduleId={chassis.moduleId}
                      moduleRarity={chassis.rarity}
                      showNameBelow={false}
                    />
                  </button>
                  {chassis.moduleId != null ? (
                    <ModuleSlotMetaBelow
                      name={equippedName}
                      moduleRarity={chassis.rarity}
                      frameRole="main"
                      moduleLevel={mainLevel}
                    />
                  ) : null}
                </div>
                {art.assistSide === 'after' ? (
                  <span className="modules-slot-pair__connector" aria-hidden />
                ) : null}
                {art.assistSide === 'after' ? assistCol : null}
              </div>
            )
          })}
          <div className="modules-hub__tower" aria-hidden>
            <img
              className="modules-hub__tower-img"
              src={WORKSHOP_MODULES_TOWER_IMAGE}
              alt=""
              decoding="async"
            />
          </div>
          </div>
        </div>
        <ModulesLabDetail
          slot={slot}
          labPercents={labPercents}
          cannonDecimal={cannonDecimal}
          moduleId={activeChassisSelection.moduleId}
          moduleRarity={activeChassisSelection.rarity}
          assist={workshopAssistChassisModuleSelection(workshopPersisted, slot)}
        />
      </div>

      <AssistUnlocksPanel
        workshopPersisted={workshopPersisted}
        onWorkshopPersistedChange={onWorkshopPersistedChange}
      />

      {modulesCatalogVisible ? (
        slot === 'cannon' ? (
          <ChassisModulesCatalog
            titleId="ws_modules_cannons_title"
            titleDomId="modules-cannons-title"
            moduleOrder={WORKSHOP_CANNON_MODULE_ORDER}
            getDef={(id) => workshopCannonModuleDef(id as (typeof WORKSHOP_CANNON_MODULE_ORDER)[number])}
            selectedModuleId={activeChassisSelection.moduleId}
            selectedRarity={activeChassisSelection.rarity}
            onSelectModule={(moduleId, rarity) => selectChassisModule('cannon', moduleId, rarity)}
          />
        ) : slot === 'armor' ? (
          <ChassisModulesCatalog
            titleId="ws_modules_armor_title"
            titleDomId="modules-armor-title"
            moduleOrder={WORKSHOP_ARMOR_MODULE_ORDER}
            getDef={(id) => workshopArmorModuleDef(id as (typeof WORKSHOP_ARMOR_MODULE_ORDER)[number])}
            notes={WORKSHOP_ARMOR_MODULE_NOTES}
            selectedModuleId={activeChassisSelection.moduleId}
            selectedRarity={activeChassisSelection.rarity}
            onSelectModule={(moduleId, rarity) => selectChassisModule('armor', moduleId, rarity)}
          />
        ) : slot === 'generator' ? (
          <ChassisModulesCatalog
            titleId="ws_modules_generators_title"
            titleDomId="modules-generators-title"
            moduleOrder={WORKSHOP_GENERATOR_MODULE_ORDER}
            getDef={(id) =>
              workshopGeneratorModuleDef(id as (typeof WORKSHOP_GENERATOR_MODULE_ORDER)[number])
            }
            notes={WORKSHOP_GENERATOR_MODULE_NOTES}
            selectedModuleId={activeChassisSelection.moduleId}
            selectedRarity={activeChassisSelection.rarity}
            onSelectModule={(moduleId, rarity) => selectChassisModule('generator', moduleId, rarity)}
          />
        ) : (
          <ChassisModulesCatalog
            titleId="ws_modules_cores_title"
            titleDomId="modules-cores-title"
            moduleOrder={WORKSHOP_CORE_MODULE_ORDER}
            getDef={(id) => workshopCoreModuleDef(id as (typeof WORKSHOP_CORE_MODULE_ORDER)[number])}
            notes={WORKSHOP_CORE_MODULE_NOTES}
            selectedModuleId={activeChassisSelection.moduleId}
            selectedRarity={activeChassisSelection.rarity}
            onSelectModule={(moduleId, rarity) => selectChassisModule('core', moduleId, rarity)}
          />
        )
      ) : null}

      {submodulesCatalogVisible ? (
        <SubmoduleEffectsCatalog
          slot={slot}
          selectedEffects={activeSubmoduleSelections}
          onSelectEffect={(effectId, rarity, cellValue) =>
            selectSubmoduleEffect(effectId, rarity, cellValue, 'main')
          }
        />
      ) : null}

      {assistModuleCatalogVisible ? <AssistModuleReference /> : null}

      {pickerTarget != null ? (
        <ChassisModulePickerDialog
          slot={pickerTarget.slot}
          pickerRole={pickerTarget.role}
          excludeModuleIds={(() => {
            const main = workshopChassisModuleSelection(
              workshopPersisted,
              pickerTarget.slot,
            )
            const assist = workshopAssistChassisModuleSelection(
              workshopPersisted,
              pickerTarget.slot,
            )
            if (pickerTarget.role === 'assist' && main.moduleId != null) {
              return [main.moduleId]
            }
            if (pickerTarget.role === 'main' && assist.moduleId != null) {
              return [assist.moduleId]
            }
            return []
          })()}
          selectedModuleId={
            pickerTarget.role === 'main'
              ? workshopChassisModuleSelection(workshopPersisted, pickerTarget.slot).moduleId
              : workshopAssistChassisModuleSelection(workshopPersisted, pickerTarget.slot).moduleId
          }
          selectedRarity={
            pickerTarget.role === 'main'
              ? workshopChassisModuleSelection(workshopPersisted, pickerTarget.slot).rarity
              : workshopAssistChassisModuleSelection(workshopPersisted, pickerTarget.slot).rarity
          }
          uniqueEffectRarity={
            pickerTarget.role === 'assist'
              ? workshopAssistChassisModuleSelection(workshopPersisted, pickerTarget.slot)
                  .uniqueRarity
              : undefined
          }
          moduleLevel={
            pickerTarget.role === 'main'
              ? workshopChassisModuleLevel(workshopPersisted, pickerTarget.slot)
              : workshopAssistModuleLevel(workshopPersisted, pickerTarget.slot)
          }
          onModuleLevelCommit={(next) => {
            if (pickerTarget.role === 'main') {
              setChassisModuleLevel(pickerTarget.slot, next)
            } else {
              setAssistModuleLevel(pickerTarget.slot, next)
            }
          }}
          heroStatContext={(() => {
            const moduleLevel =
              pickerTarget.role === 'main'
                ? workshopChassisModuleLevel(workshopPersisted, pickerTarget.slot)
                : workshopAssistModuleLevel(workshopPersisted, pickerTarget.slot)
            if (pickerTarget.slot === 'cannon') {
              return buildTowerDamageHeroStatContext(
                workshopPersisted,
                researchData,
                labLevelOverrides,
                moduleLevel,
              )
            }
            if (pickerTarget.slot === 'armor') {
              return buildTowerHealthHeroStatContext(
                workshopPersisted,
                researchData,
                labLevelOverrides,
                moduleLevel,
              )
            }
            return { moduleLevel }
          })()}
          submoduleSelections={workshopSubmoduleSelections(
            workshopPersisted,
            pickerTarget.slot,
            pickerTarget.role,
          )}
          submoduleOrderedSlots={workshopSubmoduleOrderedSlots(
            workshopPersisted,
            pickerTarget.slot,
            pickerTarget.role,
          )}
          assistSubmoduleBonusContext={
            pickerTarget.role === 'assist'
              ? {
                  ws: workshopPersisted,
                  research: researchData,
                  labOverrides: labLevelOverrides,
                }
              : undefined
          }
          onSelect={(moduleId, rarity) => {
            if (pickerTarget.role === 'main') {
              selectChassisModule(pickerTarget.slot, moduleId, rarity)
            } else {
              selectAssistChassisModule(pickerTarget.slot, moduleId, rarity)
            }
          }}
          onClear={(rarity) => {
            if (pickerTarget.role === 'main') {
              selectChassisModule(pickerTarget.slot, '', rarity)
            } else {
              selectAssistChassisModule(pickerTarget.slot, '', rarity)
            }
          }}
          onSelectEffect={(effectId, rarity, cellValue, role) =>
            selectSubmoduleEffect(effectId, rarity, cellValue, role)
          }
          onClose={() => setPickerTarget(null)}
        />
      ) : null}
    </div>
  )
}
