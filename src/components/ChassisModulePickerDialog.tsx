import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  formatWorkshopChassisModuleHeroStat,
  type WorkshopChassisModuleHeroStatContext,
} from '../data/workshopChassisModuleHeroStat'
import {
  formatWorkshopChassisModuleAbility,
  formatWorkshopChassisModuleValue,
  WORKSHOP_CHASSIS_MODULE_MERGE_TIERS,
  WORKSHOP_CHASSIS_MODULE_RARITY_CLASS,
  workshopChassisModuleEffectTier,
  workshopChassisModuleMaxLevel,
  type WorkshopChassisModuleEffectTier,
  type WorkshopChassisModuleMergeTier,
} from '../data/workshopChassisModuleShared'
import {
  workshopChassisModuleDefForSlot,
} from '../data/workshopChassisModuleSelection'
import {
  clampWorkshopAssistModuleLevel,
  WORKSHOP_ASSIST_MODULE_MAX_LEVEL,
  type WorkshopAssistModuleSlot,
} from '../data/workshopSimModules'
import { MODULE_HUB_SLOT_ART } from '../data/workshopModuleArt'
import {
  workshopChassisModuleBorderImageUrl,
  workshopChassisModuleDedicatedImageUrl,
  workshopChassisModuleHasDedicatedArt,
} from '../data/workshopModuleImages'
import {
  assistSubmodulePickerSlotText,
  type WorkshopSubmoduleBonusContext,
} from '../data/workshopAssistSubmoduleScale'
import {
  WORKSHOP_SUBMODULE_SECTIONS,
  WORKSHOP_SUBMODULE_SLOT_COUNT,
  WORKSHOP_SUBMODULE_SLOT_UNLOCK_LEVEL,
  workshopSubmoduleSlotUnlocked,
  formatSubmoduleCellDisplay,
  submoduleEffectDisplayName,
  submoduleEffectId,
  submoduleEffectPickerSlotText,
} from '../data/workshopSubmoduleCatalog'
import type {
  WorkshopSubmoduleEffectPick,
  WorkshopSubmoduleModuleRole,
  WorkshopSubmoduleOrderedSlots,
  WorkshopSubmoduleSelectionMap,
} from '../data/workshopSubmoduleSelection'
import {
  WORKSHOP_SUBMODULE_RARITIES,
  WORKSHOP_SUBMODULE_RARITY_CLASS,
  type WorkshopSubmoduleRarity,
} from '../data/workshopSubmoduleEffects'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'

const SLOT_LABEL: Record<WorkshopAssistModuleSlot, StringId> = {
  cannon: 'ws_sim_module_cannon',
  armor: 'ws_sim_module_armor',
  generator: 'ws_sim_module_generator',
  core: 'ws_sim_module_core',
}

const MERGE_TIER_LABEL: Record<WorkshopChassisModuleMergeTier, StringId> = {
  rare: 'ws_modules_merge_rare',
  rare_plus: 'ws_modules_merge_rare_plus',
  epic: 'ws_modules_merge_epic',
  epic_plus: 'ws_modules_merge_epic_plus',
  legendary: 'ws_modules_merge_legendary',
  legendary_plus: 'ws_modules_merge_legendary_plus',
  mythic: 'ws_modules_merge_mythic',
  mythic_plus: 'ws_modules_merge_mythic_plus',
  ancestral: 'ws_modules_merge_ancestral',
  star_1: 'ws_modules_merge_star_1',
  star_2: 'ws_modules_merge_star_2',
  star_3: 'ws_modules_merge_star_3',
  star_4: 'ws_modules_merge_star_4',
  star_5: 'ws_modules_merge_star_5',
}

const EFFECT_TIER_LABEL: Record<WorkshopChassisModuleEffectTier, StringId> = {
  epic: 'ws_modules_col_epic',
  legendary: 'ws_modules_col_legendary',
  mythic: 'ws_modules_col_mythic',
  ancestral: 'ws_modules_col_ancestral',
}

function mergeTierSelectLabel(
  t: (id: StringId) => string,
  merge: WorkshopChassisModuleMergeTier,
): string {
  const max = workshopChassisModuleMaxLevel(merge)
  return `${t(MERGE_TIER_LABEL[merge])} (${t('ws_modules_merge_max_level').replace('{{max}}', String(max))})`
}

const SUB_RARITY_LABEL: Record<WorkshopSubmoduleRarity, StringId> = {
  common: 'ws_submodules_col_common',
  rare: 'ws_submodules_col_rare',
  epic: 'ws_submodules_col_epic',
  legendary: 'ws_submodules_col_legendary',
  mythic: 'ws_submodules_col_mythic',
  ancestral: 'ws_submodules_col_ancestral',
}

type ChassisModulePickerDialogProps = {
  slot: WorkshopAssistModuleSlot
  pickerRole?: 'main' | 'assist'
  /** Inline panel below inventory (no modal). */
  embedded?: boolean
  viewModuleId: string | null
  isEquippedOnSlot: boolean
  /** Assist unique-effect tier (unlock panel); defaults to selected module tier for main. */
  uniqueEffectRarity?: WorkshopChassisModuleEffectTier
  moduleRarity: WorkshopChassisModuleMergeTier
  moduleLevel: number
  onRarityChange: (rarity: WorkshopChassisModuleMergeTier) => void
  onModuleLevelCommit: (level: number) => void
  heroStatContext: WorkshopChassisModuleHeroStatContext
  submoduleSelections: WorkshopSubmoduleSelectionMap
  submoduleOrderedSlots?: WorkshopSubmoduleOrderedSlots
  /** When `pickerRole` is assist, scales equipped sub-effect values by sub-stone + lab %. */
  assistSubmoduleBonusContext?: WorkshopSubmoduleBonusContext
  onEquip: () => void
  onUnequip: () => void
  onSelectEffect: (
    effectId: string,
    rarity: WorkshopSubmoduleRarity,
    cellValue: string | null,
    role: WorkshopSubmoduleModuleRole,
  ) => void
  onClose: () => void
}

import { deferInEffect } from '../deferInEffect'
import {
  shouldHighlightModuleAbilityPart,
  splitModuleAbilityUniqueParts,
} from './chassisModuleAbilityText'

function PickerModuleLevelInput({
  slot,
  rarity,
  value,
  onCommit,
}: {
  slot: WorkshopAssistModuleSlot
  rarity: WorkshopChassisModuleMergeTier
  value: number
  onCommit: (level: number) => void
}) {
  const { t } = useI18n()
  const maxLevel = workshopChassisModuleMaxLevel(rarity)
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    deferInEffect(() => setDraft(String(value)))
  }, [value])

  const commit = () => {
    const raw = draft.trim().replace(/,/g, '')
    if (raw === '') {
      setDraft(String(value))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setDraft(String(value))
      return
    }
    const stored = clampWorkshopAssistModuleLevel(n)
    setDraft(String(stored))
    onCommit(stored)
  }

  const onDraftChange = (next: string) => {
    const raw = next.replace(/,/g, '')
    if (raw === '') {
      setDraft('')
      return
    }
    if (!/^\d+$/.test(raw)) return
    const n = Number(raw)
    if (n > WORKSHOP_ASSIST_MODULE_MAX_LEVEL) {
      setDraft(String(WORKSHOP_ASSIST_MODULE_MAX_LEVEL))
      return
    }
    setDraft(raw)
  }

  return (
    <label className="modules-picker__hero-level">
      <span className="modules-picker__hero-level-prefix">{t('ws_modules_level_prefix')}</span>
      <input
        className="modules-picker__hero-level-input"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={`${t('ws_modules_level_input_aria')} ${t(SLOT_LABEL[slot])}`}
        value={draft}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onDraftChange(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          e.stopPropagation()
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
            ;(e.target as HTMLInputElement).blur()
          }
        }}
      />
      <span className="modules-picker__hero-level-suffix">/ {maxLevel}</span>
    </label>
  )
}

function ModuleAbilityUniqueText({
  text,
  highlightTokens = [],
}: {
  text: string
  highlightTokens?: readonly string[]
}) {
  const parts = splitModuleAbilityUniqueParts(text, highlightTokens)
  return (
    <>
      {parts.map((part, index) => {
        if (part === '') return null
        if (shouldHighlightModuleAbilityPart(part, highlightTokens)) {
          return (
            <span key={index} className="modules-picker__unique-highlight">
              {part}
            </span>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}

type SubmodulePickerEntry = {
  effectId: string
  rarity: WorkshopSubmoduleRarity
  label: string
  pickerText: string
}

function submodulePickerEntry(
  slot: WorkshopAssistModuleSlot,
  pick: WorkshopSubmoduleEffectPick,
  assistScale?: WorkshopSubmoduleBonusContext,
): SubmodulePickerEntry | null {
  const section = WORKSHOP_SUBMODULE_SECTIONS[slot]
  const row = section.rows.find((r) => submoduleEffectId(r.label) === pick.effectId)
  if (row == null) return null
  const cell = row.cells[pick.rarity]
  if (cell == null) return null
  const effectId = pick.effectId
  return {
    effectId,
    rarity: pick.rarity,
    label: row.label,
    pickerText:
      assistScale != null
        ? assistSubmodulePickerSlotText(cell, row.label, effectId, assistScale, slot)
        : submoduleEffectPickerSlotText(cell, row.label),
  }
}

function submoduleCellDisplayForPicker(
  cell: string,
  effectLabel: string,
  effectId: string,
  slot: WorkshopAssistModuleSlot,
  pickerRole: 'main' | 'assist',
  assistScale?: WorkshopSubmoduleBonusContext,
): string {
  if (pickerRole === 'assist' && assistScale != null) {
    return assistSubmodulePickerSlotText(cell, effectLabel, effectId, assistScale, slot)
  }
  return formatSubmoduleCellDisplay(cell, effectLabel)
}

export function ChassisModulePickerDialog({
  slot,
  pickerRole = 'main',
  embedded = false,
  viewModuleId,
  isEquippedOnSlot,
  uniqueEffectRarity,
  moduleRarity,
  moduleLevel,
  onRarityChange,
  onModuleLevelCommit,
  heroStatContext,
  submoduleSelections,
  submoduleOrderedSlots,
  assistSubmoduleBonusContext,
  onEquip,
  onUnequip,
  onSelectEffect,
  onClose,
}: ChassisModulePickerDialogProps) {
  const { t } = useI18n()
  const titleId = `modules-picker-title-${slot}-${pickerRole}`
  const [optionsEffectId, setOptionsEffectId] = useState('')
  const [optionsRarity, setOptionsRarity] = useState<WorkshopSubmoduleRarity>('legendary')

  const section = WORKSHOP_SUBMODULE_SECTIONS[slot]
  const previewModule =
    viewModuleId != null ? workshopChassisModuleDefForSlot(slot, viewModuleId) : null
  const equipRoleLabel =
    pickerRole === 'assist'
      ? t('ws_modules_picker_equipped_assist')
      : t('ws_modules_picker_equipped_primary')
  const uniqueEffectTier =
    uniqueEffectRarity ?? workshopChassisModuleEffectTier(moduleRarity)
  const moduleEffectTier = workshopChassisModuleEffectTier(moduleRarity)
  const iconUrl =
    viewModuleId != null && workshopChassisModuleHasDedicatedArt(slot, viewModuleId)
      ? workshopChassisModuleDedicatedImageUrl(slot, viewModuleId)
      : null
  const shape = MODULE_HUB_SLOT_ART[slot].shape
  const borderUrl = workshopChassisModuleBorderImageUrl(
    slot,
    viewModuleId == null ? 'empty' : moduleRarity,
  )

  const assignedEffectIds = useMemo(
    () => new Set(Object.keys(submoduleSelections)),
    [submoduleSelections],
  )

  const availableOptionRows = useMemo(
    () =>
      section.rows.filter((row) => !assignedEffectIds.has(submoduleEffectId(row.label))),
    [section.rows, assignedEffectIds],
  )

  useEffect(() => {
    if (optionsEffectId !== '' && assignedEffectIds.has(optionsEffectId)) {
      deferInEffect(() => setOptionsEffectId(''))
    }
  }, [optionsEffectId, assignedEffectIds])

  useEffect(() => {
    if (embedded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [embedded, onClose])

  const optionsRow = availableOptionRows.find(
    (r) => submoduleEffectId(r.label) === optionsEffectId,
  )

  const assignOptionsEffect = () => {
    if (optionsRow == null) return
    const cell = optionsRow.cells[optionsRarity]
    if (cell == null) return
    onSelectEffect(optionsEffectId, optionsRarity, cell, pickerRole)
    setOptionsEffectId('')
  }

  const toggleEquip = () => {
    if (viewModuleId == null || viewModuleId === '') return
    if (isEquippedOnSlot) {
      onUnequip()
      return
    }
    onEquip()
  }

  const panel = (
      <div
        className={
          embedded
            ? 'modules-picker__panel modules-picker__panel--embedded'
            : 'modules-picker__dialog modules-picker__dialog--detail'
        }
        role={embedded ? 'region' : 'dialog'}
        aria-modal={embedded ? undefined : true}
        aria-labelledby={titleId}
        onClick={embedded ? undefined : (e) => e.stopPropagation()}
      >
        {embedded ? null : (
          <button
            type="button"
            className="modules-picker__close"
            onClick={onClose}
            aria-label={t('sr_cancel')}
          >
            ×
          </button>
        )}

        <div className="modules-picker__hero">
          <div className="modules-picker__hero-icon-wrap">
            <span
              className={[
                'modules-picker__hero-icon',
                `modules-picker__hero-icon--${shape}`,
                viewModuleId == null ? 'modules-picker__hero-icon--empty' : '',
                viewModuleId != null
                  ? WORKSHOP_CHASSIS_MODULE_RARITY_CLASS[moduleRarity]
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden
            >
              <img
                className="modules-picker__hero-border"
                src={borderUrl}
                alt=""
                decoding="async"
                draggable={false}
              />
              {iconUrl != null ? (
                <span
                  className={[
                    'modules-picker__hero-module-icon',
                    `modules-picker__hero-module-icon--${shape}`,
                  ].join(' ')}
                >
                  <img src={iconUrl} alt="" decoding="async" draggable={false} />
                </span>
              ) : null}
            </span>
            <PickerModuleLevelInput
              slot={slot}
              rarity={moduleRarity}
              value={moduleLevel}
              onCommit={onModuleLevelCommit}
            />
          </div>
          <div className="modules-picker__hero-body">
            <p
              className={[
                'modules-picker__hero-rarity',
                WORKSHOP_CHASSIS_MODULE_RARITY_CLASS[moduleRarity],
              ].join(' ')}
            >
              {t(MERGE_TIER_LABEL[moduleRarity])}
            </p>
            <div className="modules-picker__hero-title-row">
              <h2 id={titleId} className="modules-picker__hero-name">
                {previewModule?.name ?? t('ws_modules_none_selected')}
              </h2>
              {viewModuleId != null ? (
                <button
                  type="button"
                  className={
                    isEquippedOnSlot
                      ? 'workshop__uw-active-toggle workshop__uw-active-toggle--on'
                      : 'workshop__uw-active-toggle'
                  }
                  aria-pressed={isEquippedOnSlot}
                  aria-label={
                    isEquippedOnSlot
                      ? t('ws_modules_equipped_aria')
                          .replace('{{module}}', previewModule?.name ?? '')
                          .replace('{{role}}', equipRoleLabel)
                      : t('ws_modules_equip_aria')
                          .replace('{{module}}', previewModule?.name ?? '')
                          .replace('{{role}}', equipRoleLabel)
                  }
                  onClick={toggleEquip}
                >
                  {isEquippedOnSlot ? t('ws_modules_unequip') : t('ws_modules_equip')}
                </button>
              ) : null}
            </div>
            {previewModule != null ? (
              <p className="modules-picker__hero-stat">
                {formatWorkshopChassisModuleHeroStat(
                  slot,
                  previewModule,
                  moduleRarity,
                  heroStatContext,
                )}
              </p>
            ) : null}
          </div>
        </div>

        <label className="modules-picker__field">
          <span className="modules-picker__field-label">{t('ws_modules_picker_rarity')}</span>
          <select
            className="modules-picker__select glow-input"
            value={moduleRarity}
            aria-label={t('ws_modules_picker_rarity_aria')}
            onChange={(e) => {
              onRarityChange(e.target.value as WorkshopChassisModuleMergeTier)
            }}
          >
            {WORKSHOP_CHASSIS_MODULE_MERGE_TIERS.map((rarity) => (
              <option key={rarity} value={rarity}>
                {mergeTierSelectLabel(t, rarity)}
              </option>
            ))}
          </select>
        </label>

        <section className="modules-picker__section" aria-labelledby={`${titleId}-effects`}>
          <div className="modules-picker__section-head">
            <h3 id={`${titleId}-effects`} className="modules-picker__section-title">
              {t('ws_modules_picker_effects')}
            </h3>
            <label className="modules-picker__options">
              <span className="visually-hidden">{t('ws_modules_picker_options_aria')}</span>
              <select
                className="modules-picker__select modules-picker__select--options glow-input"
                value={optionsEffectId}
                aria-label={t('ws_modules_picker_options_aria')}
                disabled={availableOptionRows.length === 0}
                onChange={(e) => setOptionsEffectId(e.target.value)}
              >
                <option value="">{t('ws_modules_picker_options')}</option>
                {availableOptionRows.map((row) => {
                  const id = submoduleEffectId(row.label)
                  return (
                    <option key={id} value={id}>
                      {submoduleEffectDisplayName(row.label)}
                    </option>
                  )
                })}
              </select>
            </label>
          </div>

          {optionsEffectId !== '' && optionsRow != null ? (
            <div className="modules-picker__options-panel">
              <label className="modules-picker__field modules-picker__field--inline">
                <span className="modules-picker__field-label">
                  {t('ws_modules_picker_sub_effect_rarity')}
                </span>
                <select
                  className="modules-picker__select glow-input"
                  value={optionsRarity}
                  onChange={(e) => setOptionsRarity(e.target.value as WorkshopSubmoduleRarity)}
                >
                  {WORKSHOP_SUBMODULE_RARITIES.map((rarity) => {
                    const cell = optionsRow.cells[rarity]
                    if (cell == null) return null
                    return (
                      <option key={rarity} value={rarity}>
                        {t(SUB_RARITY_LABEL[rarity])} (
                        {submoduleCellDisplayForPicker(
                          cell,
                          optionsRow.label,
                          optionsEffectId,
                          slot,
                          pickerRole,
                          assistSubmoduleBonusContext,
                        )})
                      </option>
                    )
                  })}
                </select>
              </label>
              <button
                type="button"
                className="glow-btn modules-picker__options-apply"
                onClick={assignOptionsEffect}
              >
                {t('ws_modules_picker_apply_effect')}
              </button>
            </div>
          ) : null}

          <ul className="modules-picker__effect-slots">
            {Array.from({ length: WORKSHOP_SUBMODULE_SLOT_COUNT }, (_, index) => {
              const unlockAt = WORKSHOP_SUBMODULE_SLOT_UNLOCK_LEVEL[index] ?? 1
              const rarityMax = workshopChassisModuleMaxLevel(moduleRarity)
              const blockedByRarity = unlockAt > rarityMax
              const rawLevel = clampWorkshopAssistModuleLevel(moduleLevel)
              const levelUnlocked = workshopSubmoduleSlotUnlocked(
                index,
                rawLevel,
                moduleRarity,
              )
              const pick = submoduleOrderedSlots?.[index] ?? null
              const entry =
                pick != null
                  ? submodulePickerEntry(
                      slot,
                      pick,
                      pickerRole === 'assist' ? assistSubmoduleBonusContext : undefined,
                    )
                  : null
              const hasEntry = entry != null && entry.rarity != null
              return (
                <li
                  key={index}
                  className={[
                    'modules-picker__effect-slot',
                    !levelUnlocked ? 'modules-picker__effect-slot--locked' : '',
                    hasEntry && !levelUnlocked
                      ? 'modules-picker__effect-slot--level-locked'
                      : '',
                    blockedByRarity ? 'modules-picker__effect-slot--rarity-cap' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {hasEntry ? (
                    <>
                      <span
                        className={[
                          'modules-picker__effect-tier',
                          WORKSHOP_SUBMODULE_RARITY_CLASS[entry.rarity],
                        ].join(' ')}
                      >
                        {t(SUB_RARITY_LABEL[entry.rarity])}
                      </span>
                      <span className="modules-picker__effect-text">{entry.pickerText}</span>
                      {!levelUnlocked ? (
                        <span className="modules-picker__effect-locked">
                          {t('ws_modules_submodule_unlocks_at')} {unlockAt}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        className="modules-picker__effect-clear"
                        aria-label={t('ws_modules_picker_clear_effect')}
                        onClick={() => {
                          const row = section.rows.find(
                            (r) => submoduleEffectId(r.label) === entry.effectId,
                          )
                          const cell = row?.cells[entry.rarity] ?? null
                          onSelectEffect(entry.effectId, entry.rarity, cell, pickerRole)
                        }}
                      >
                        ×
                      </button>
                    </>
                  ) : levelUnlocked ? (
                    <span className="modules-picker__effect-empty">—</span>
                  ) : blockedByRarity ? (
                    <span className="modules-picker__effect-locked">
                      {t('ws_modules_submodule_locked_rarity_max')
                        .replace('{{level}}', String(unlockAt))
                        .replace('{{max}}', String(rarityMax))}
                    </span>
                  ) : (
                    <span className="modules-picker__effect-locked">
                      {t('ws_modules_submodule_unlocks_at')} {unlockAt}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        {previewModule != null ? (
          <section className="modules-picker__section" aria-labelledby={`${titleId}-unique`}>
            <h3
              id={`${titleId}-unique`}
              className="modules-picker__section-title modules-picker__section-title--center"
            >
              {t('ws_modules_picker_unique_effect')}
            </h3>
            <p className="modules-picker__unique">
              <ModuleAbilityUniqueText
                text={formatWorkshopChassisModuleAbility(previewModule, uniqueEffectTier)}
                highlightTokens={[
                  formatWorkshopChassisModuleValue(
                    previewModule.kind,
                    previewModule.values[uniqueEffectTier],
                  ),
                ]}
              />
            </p>
            {pickerRole === 'assist' && uniqueEffectTier !== moduleEffectTier ? (
              <p className="modules-picker__hero-equipped">
                {t('ws_modules_picker_assist_unique_tier')
                  .replace('{{unique}}', t(EFFECT_TIER_LABEL[uniqueEffectTier]))
                  .replace('{{module}}', t(MERGE_TIER_LABEL[moduleRarity]))}
              </p>
            ) : null}
          </section>
        ) : null}

        {embedded ? null : (
          <div className="modules-picker__footer">
            <button type="button" className="glow-btn glow-btn--block" onClick={onClose}>
              {t('ws_modules_picker_done')}
            </button>
          </div>
        )}
      </div>
  )

  if (embedded) {
    return (
      <section className="modules-inventory-detail" aria-label={t('ws_modules_inventory_detail_aria')}>
        {panel}
      </section>
    )
  }

  return createPortal(
    <div
      className="modules-picker__backdrop"
      role="presentation"
      onClick={onClose}
    >
      {panel}
    </div>,
    document.body,
  )
}
