import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import {
  GUARDIAN_CHIPS,
  GUARDIAN_CHIP_SLOT_COUNT,
  type GuardianChipId,
} from '../data/guardianChips'
import { GAME_THEMES, themesForCategory } from '../data/gameThemes'
import {
  GUARDIAN_CHIP_ALLY_TRACK_IDS,
  GUARDIAN_CHIP_ATTACK_TRACK_IDS,
  GUARDIAN_CHIP_BOUNTY_TRACK_IDS,
  GUARDIAN_CHIP_FETCH_TRACK_IDS,
  GUARDIAN_CHIP_SCOUT_TRACK_IDS,
  GUARDIAN_CHIP_SUMMON_TRACK_IDS,
  clampGuardianChipAllyLevel,
  clampGuardianChipAttackLevel,
  clampGuardianChipBountyLevel,
  clampGuardianChipFetchLevel,
  clampGuardianChipScoutLevel,
  clampGuardianChipSummonLevel,
  formatGuardianChipAllyValue,
  formatGuardianChipAttackValue,
  formatGuardianChipBountyValue,
  formatGuardianChipFetchValue,
  formatGuardianChipScoutValue,
  formatGuardianChipSummonValue,
  guardianChipAllyTotalCostAtLevel,
  guardianChipAllyTrack,
  guardianChipAttackTotalCostAtLevel,
  guardianChipAttackTrack,
  guardianChipBountyTotalCostAtLevel,
  guardianChipBountyTrack,
  guardianChipFetchTotalCostAtLevel,
  guardianChipFetchTrack,
  guardianChipScoutTotalCostAtLevel,
  guardianChipScoutTrack,
  guardianChipSummonTotalCostAtLevel,
  guardianChipSummonTrack,
  type GuardianChipAllyTrackId,
  type GuardianChipAttackTrackId,
  type GuardianChipBountyTrackId,
  type GuardianChipFetchTrackId,
  type GuardianChipScoutTrackId,
  type GuardianChipSummonTrackId,
} from '../data/guardianChipGodTables'
import { guardianChipSlotUnlockCostForUi } from '../data/guardianSlotGodTables'
import {
  bumpGuardianAllyUpgradeLevel,
  bumpGuardianAttackUpgradeLevel,
  bumpGuardianBountyUpgradeLevel,
  bumpGuardianFetchUpgradeLevel,
  bumpGuardianScoutUpgradeLevel,
  bumpGuardianSummonUpgradeLevel,
  equipGuardianChip,
  isGuardianChipSlotLocked,
  respecGuardianChips,
  setGuardianAllyUpgradeLevel,
  setGuardianAttackUpgradeLevel,
  setGuardianBountyUpgradeLevel,
  setGuardianFetchUpgradeLevel,
  setGuardianScoutUpgradeLevel,
  setGuardianSummonUpgradeLevel,
  unequipGuardianChipSlot,
  unlockGuardianChipSlot,
  useGuardianChipState,
} from '../guardianChipStorage'
import { EQUIPPED_CHECKMARK_SRC } from '../equippedCheckmark'
import { BitsGlyph } from './BitsGlyph'
import { GuardianChipUpgradePanel } from './GuardianChipUpgradePanel'
import { useWorkspaceUndo } from '../lab/workspaceUndoContext'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'
import { isThemeOwned, useThemeOwned } from '../themeOwnedStorage'
import { useThemeSelection } from '../themeSelectionStorage'
import { GuardianChipIcon } from './GuardianChipIcon'

type GuardiansPageProps = {
  embeddedInPanel?: boolean
  toolbarMount?: HTMLDivElement | null
}

/** Game slot index → screen position (slot1 TL, slot2 TR, slot3 BL, slot4 BR). */
const SLOT_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const

function guardiansOverlayPortal(node: ReactNode) {
  return createPortal(node, document.body)
}

function GuardiansToolbar({ onRespec }: { onRespec: () => void }) {
  const { t } = useI18n()
  return (
    <div className="select-research__toolbar">
      <div className="select-research__toolbar-quick select-research__toolbar-quick--guardians-only">
        <button
          type="button"
          className="glow-btn glow-btn--danger glow-btn--block"
          onClick={onRespec}
          aria-label={t('guardians_respec_aria')}
        >
          {t('guardians_respec')}
        </button>
      </div>
    </div>
  )
}

export function GuardiansPage({
  embeddedInPanel = false,
  toolbarMount = null,
}: GuardiansPageProps) {
  const { t } = useI18n()
  const { pushUndoSnapshot } = useWorkspaceUndo()
  const [chipState, updateChipState] = useGuardianChipState()
  const [selection, selectTheme] = useThemeSelection()
  const [ownedIds] = useThemeOwned()
  const [guardianPickerOpen, setGuardianPickerOpen] = useState(false)
  const [respecConfirmOpen, setRespecConfirmOpen] = useState(false)
  const [selectedChipId, setSelectedChipId] = useState<GuardianChipId | null>('attack')
  const pickerTitleId = useId().replace(/:/g, '')
  const loadoutRef = useRef<HTMLDivElement>(null)
  const guardianCardRef = useRef<HTMLDivElement>(null)

  const selectedGuardian = useMemo(
    () => GAME_THEMES.find((theme) => theme.id === selection.guardian) ?? null,
    [selection.guardian],
  )

  const guardianThemes = useMemo(() => themesForCategory('guardian'), [])

  const visibleChips = useMemo(
    () => GUARDIAN_CHIPS.filter((chip) => chipState.unlockedChipIds.includes(chip.id)),
    [chipState.unlockedChipIds],
  )

  const equippedSet = useMemo(
    () => new Set(chipState.slots.filter((id): id is GuardianChipId => id != null)),
    [chipState.slots],
  )

  const isSlotLocked = useCallback(
    (slotIndex: number) => isGuardianChipSlotLocked(chipState, slotIndex),
    [chipState],
  )

  const handleSlotUnlock = useCallback(
    (slotIndex: number) => {
      pushUndoSnapshot()
      updateChipState((prev) => unlockGuardianChipSlot(prev, slotIndex))
    },
    [pushUndoSnapshot, updateChipState],
  )

  const handleInventoryChipSelect = useCallback((chipId: GuardianChipId) => {
    setSelectedChipId(chipId)
  }, [])

  const handleToggleChipEquip = useCallback(
    (chipId: GuardianChipId) => {
      pushUndoSnapshot()
      updateChipState((prev) => {
        if (prev.slots.includes(chipId)) {
          const slotIndex = prev.slots.indexOf(chipId)
          return unequipGuardianChipSlot(prev, slotIndex)
        }
        return equipGuardianChip(prev, chipId)
      })
    },
    [pushUndoSnapshot, updateChipState],
  )

  const handleAttackUpgradeBump = useCallback(
    (track: GuardianChipAttackTrackId, direction: -1 | 1) => {
      pushUndoSnapshot()
      updateChipState((prev) => bumpGuardianAttackUpgradeLevel(prev, track, direction))
    },
    [pushUndoSnapshot, updateChipState],
  )

  const handleAttackUpgradeSetLevel = useCallback(
    (track: GuardianChipAttackTrackId, level: number) => {
      pushUndoSnapshot()
      updateChipState((prev) => setGuardianAttackUpgradeLevel(prev, track, level))
    },
    [pushUndoSnapshot, updateChipState],
  )

  const handleAllyUpgradeBump = useCallback(
    (track: GuardianChipAllyTrackId, direction: -1 | 1) => {
      pushUndoSnapshot()
      updateChipState((prev) => bumpGuardianAllyUpgradeLevel(prev, track, direction))
    },
    [pushUndoSnapshot, updateChipState],
  )

  const handleAllyUpgradeSetLevel = useCallback(
    (track: GuardianChipAllyTrackId, level: number) => {
      pushUndoSnapshot()
      updateChipState((prev) => setGuardianAllyUpgradeLevel(prev, track, level))
    },
    [pushUndoSnapshot, updateChipState],
  )

  const handleBountyUpgradeBump = useCallback(
    (track: GuardianChipBountyTrackId, direction: -1 | 1) => {
      pushUndoSnapshot()
      updateChipState((prev) => bumpGuardianBountyUpgradeLevel(prev, track, direction))
    },
    [pushUndoSnapshot, updateChipState],
  )

  const handleBountyUpgradeSetLevel = useCallback(
    (track: GuardianChipBountyTrackId, level: number) => {
      pushUndoSnapshot()
      updateChipState((prev) => setGuardianBountyUpgradeLevel(prev, track, level))
    },
    [pushUndoSnapshot, updateChipState],
  )

  const handleFetchUpgradeBump = useCallback(
    (track: GuardianChipFetchTrackId, direction: -1 | 1) => {
      pushUndoSnapshot()
      updateChipState((prev) => bumpGuardianFetchUpgradeLevel(prev, track, direction))
    },
    [pushUndoSnapshot, updateChipState],
  )

  const handleFetchUpgradeSetLevel = useCallback(
    (track: GuardianChipFetchTrackId, level: number) => {
      pushUndoSnapshot()
      updateChipState((prev) => setGuardianFetchUpgradeLevel(prev, track, level))
    },
    [pushUndoSnapshot, updateChipState],
  )

  const handleSummonUpgradeBump = useCallback(
    (track: GuardianChipSummonTrackId, direction: -1 | 1) => {
      pushUndoSnapshot()
      updateChipState((prev) => bumpGuardianSummonUpgradeLevel(prev, track, direction))
    },
    [pushUndoSnapshot, updateChipState],
  )

  const handleSummonUpgradeSetLevel = useCallback(
    (track: GuardianChipSummonTrackId, level: number) => {
      pushUndoSnapshot()
      updateChipState((prev) => setGuardianSummonUpgradeLevel(prev, track, level))
    },
    [pushUndoSnapshot, updateChipState],
  )

  const handleScoutUpgradeBump = useCallback(
    (track: GuardianChipScoutTrackId, direction: -1 | 1) => {
      pushUndoSnapshot()
      updateChipState((prev) => bumpGuardianScoutUpgradeLevel(prev, track, direction))
    },
    [pushUndoSnapshot, updateChipState],
  )

  const handleScoutUpgradeSetLevel = useCallback(
    (track: GuardianChipScoutTrackId, level: number) => {
      pushUndoSnapshot()
      updateChipState((prev) => setGuardianScoutUpgradeLevel(prev, track, level))
    },
    [pushUndoSnapshot, updateChipState],
  )

  const handleSlotClick = useCallback(
    (slotIndex: number) => {
      if (isSlotLocked(slotIndex)) return
      const chipId = chipState.slots[slotIndex]
      if (chipId) setSelectedChipId(chipId)
    },
    [chipState.slots, isSlotLocked],
  )

  const openRespecConfirm = useCallback(() => {
    setRespecConfirmOpen(true)
  }, [])

  const performRespec = useCallback(() => {
    setRespecConfirmOpen(false)
    pushUndoSnapshot()
    updateChipState((prev) => respecGuardianChips(prev))
  }, [pushUndoSnapshot, updateChipState])

  useEffect(() => {
    if (!respecConfirmOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setRespecConfirmOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [respecConfirmOpen])

  const toolbar = <GuardiansToolbar onRespec={openRespecConfirm} />

  const guardianImage = selectedGuardian?.image
  const guardianName = selectedGuardian ? t(selectedGuardian.nameId) : t('guardians_no_guardian')

  useLayoutEffect(() => {
    const loadout = loadoutRef.current
    const card = guardianCardRef.current
    if (!loadout || !card) return

    const updateConnectorLengths = () => {
      const leftSlot = loadout.querySelector<HTMLElement>('.guardians-page__slot--top-left')
      const rightSlot = loadout.querySelector<HTMLElement>('.guardians-page__slot--top-right')
      if (!leftSlot || !rightSlot) return

      const cardRect = card.getBoundingClientRect()
      const leftRect = leftSlot.getBoundingClientRect()
      const rightRect = rightSlot.getBoundingClientRect()
      const leftWidth = Math.max(0, cardRect.left - leftRect.right)
      const rightWidth = Math.max(0, rightRect.left - cardRect.right)

      loadout.style.setProperty('--guardians-connector-left', `${leftWidth}px`)
      loadout.style.setProperty('--guardians-connector-right', `${rightWidth}px`)
    }

    updateConnectorLengths()
    const observer = new ResizeObserver(updateConnectorLengths)
    observer.observe(loadout)
    observer.observe(card)
    return () => observer.disconnect()
  }, [guardianName, chipState.slots])

  return (
    <div className="guardians-page">
      {toolbarMount ? createPortal(toolbar, toolbarMount) : toolbar}

      <section
        className="guardians-page__profile"
        aria-label={t('guardians_profile_aria')}
      >
        <div className="guardians-page__loadout" ref={loadoutRef}>
          {SLOT_POSITIONS.map((position, slotIndex) => {
            if (slotIndex >= GUARDIAN_CHIP_SLOT_COUNT) return null
            const locked = isSlotLocked(slotIndex)
            const unlockCost = guardianChipSlotUnlockCostForUi(slotIndex)
            const purchasable = locked && typeof unlockCost === 'number' && unlockCost > 0
            const chipId = chipState.slots[slotIndex]
            return (
              <button
                key={position}
                type="button"
                className={`guardians-page__chip-tile guardians-page__slot guardians-page__slot--${position}${
                  locked ? ' guardians-page__slot--locked' : ''
                }${purchasable ? ' guardians-page__slot--unlockable' : ''}${
                  chipId ? ' guardians-page__slot--filled' : ''
                }${!locked && !chipId ? ' guardians-page__slot--empty' : ''}`}
                onClick={() =>
                  purchasable ? handleSlotUnlock(slotIndex) : handleSlotClick(slotIndex)
                }
                disabled={locked && !purchasable}
                aria-label={
                  purchasable
                    ? t('guardians_slot_unlock_aria').replace('{{cost}}', String(unlockCost))
                    : locked
                      ? t('guardians_slot_locked_aria')
                      : chipId
                        ? t('guardians_chip_select_aria').replace(
                            '{{chip}}',
                            t(`guardian_chip_${chipId}` as StringId),
                          )
                        : t('guardians_slot_empty_aria')
                }
              >
                <span className="guardians-page__slot-connector" aria-hidden />
                {purchasable ? (
                  <span className="guardians-page__slot-unlock-cost">
                    <span>{String(unlockCost)}</span>
                    <BitsGlyph className="guardians-page__slot-unlock-bits" />
                  </span>
                ) : locked ? (
                  <GuardianChipIcon
                    chipId="locked"
                    className="guardians-page__chip-icon guardians-page__chip-icon--locked"
                  />
                ) : chipId ? (
                  <>
                    <GuardianChipIcon chipId={chipId} className="guardians-page__chip-icon" />
                    <span className="guardians-page__chip-label">
                      {t(`guardian_chip_${chipId}` as StringId)}
                    </span>
                  </>
                ) : (
                  <span className="guardians-page__chip-label guardians-page__chip-label--empty">
                    {t('guardians_slot_empty_label')}
                  </span>
                )}
              </button>
            )
          })}

          <div className="guardians-page__guardian-card" ref={guardianCardRef}>
            <div className="guardians-page__guardian-card-head">
              <h2 className="guardians-page__guardian-name">{guardianName}</h2>
              <button
                type="button"
                className="guardians-page__guardian-edit"
                onClick={() => setGuardianPickerOpen(true)}
                aria-label={t('guardians_edit_guardian_aria')}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1 1 0 0 0 0-1.41l-2.5-2.5a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.99-1.67z"
                  />
                </svg>
              </button>
            </div>
            <div className="guardians-page__guardian-art">
              {guardianImage ? (
                <img src={guardianImage} alt="" className="guardians-page__guardian-image" />
              ) : (
                <span className="guardians-page__guardian-empty">{t('guardians_no_guardian')}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <header className="guardians-page__inventory-head">
        <h3 className="guardians-page__inventory-title">{t('guardians_inventory_title')}</h3>
      </header>

      <section
        className="guardians-page__inventory"
        aria-label={t('guardians_inventory_aria')}
      >
        <ul className="guardians-page__chip-grid">
          {visibleChips.map((chip) => {
            const equipped = equippedSet.has(chip.id)
            return (
              <li key={chip.id}>
                <button
                  type="button"
                  className={`guardians-page__chip-tile guardians-page__chip${
                    equipped ? ' guardians-page__chip--equipped' : ''
                  }${selectedChipId === chip.id ? ' guardians-page__chip--selected' : ''}`}
                  onClick={() => handleInventoryChipSelect(chip.id)}
                  aria-pressed={selectedChipId === chip.id}
                  aria-label={t('guardians_chip_select_aria').replace('{{chip}}', t(chip.nameId))}
                >
                  <GuardianChipIcon chipId={chip.id} className="guardians-page__chip-icon" />
                  <span className="guardians-page__chip-label">{t(chip.nameId)}</span>
                  {equipped ? (
                    <img
                      className="equipped-checkmark"
                      src={EQUIPPED_CHECKMARK_SRC}
                      alt=""
                      aria-hidden
                    />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {selectedChipId === 'attack' ? (
        <GuardianChipUpgradePanel
          chipId="attack"
          titleId="guardian_chip_attack"
          equipped={equippedSet.has('attack')}
          onToggleEquip={() => handleToggleChipEquip('attack')}
          tracks={{
            trackIds: GUARDIAN_CHIP_ATTACK_TRACK_IDS,
            trackLabels: {
              percent: 'guardians_attack_track_percent',
              cooldown: 'guardians_attack_track_cooldown',
              targets: 'guardians_attack_track_targets',
            },
            upgrades: chipState.upgrades.attack,
            maxLevel: (track) => guardianChipAttackTrack(track).maxLevel,
            formatValue: formatGuardianChipAttackValue,
            totalCostAtLevel: guardianChipAttackTotalCostAtLevel,
            clampLevel: clampGuardianChipAttackLevel,
            onBump: handleAttackUpgradeBump,
            onSetLevel: handleAttackUpgradeSetLevel,
          }}
        />
      ) : selectedChipId === 'ally' ? (
        <GuardianChipUpgradePanel
          chipId="ally"
          titleId="guardian_chip_ally"
          equipped={equippedSet.has('ally')}
          onToggleEquip={() => handleToggleChipEquip('ally')}
          tracks={{
            trackIds: GUARDIAN_CHIP_ALLY_TRACK_IDS,
            trackLabels: {
              recovery: 'guardians_ally_track_recovery',
              maxRecovery: 'guardians_ally_track_max_recovery',
              cooldown: 'guardians_ally_track_cooldown',
            },
            upgrades: chipState.upgrades.ally,
            maxLevel: (track) => guardianChipAllyTrack(track).maxLevel,
            formatValue: formatGuardianChipAllyValue,
            totalCostAtLevel: guardianChipAllyTotalCostAtLevel,
            clampLevel: clampGuardianChipAllyLevel,
            onBump: handleAllyUpgradeBump,
            onSetLevel: handleAllyUpgradeSetLevel,
          }}
        />
      ) : selectedChipId === 'bounty' ? (
        <GuardianChipUpgradePanel
          chipId="bounty"
          titleId="guardian_chip_bounty"
          equipped={equippedSet.has('bounty')}
          onToggleEquip={() => handleToggleChipEquip('bounty')}
          tracks={{
            trackIds: GUARDIAN_CHIP_BOUNTY_TRACK_IDS,
            trackLabels: {
              multiplier: 'guardians_bounty_track_multiplier',
              cooldown: 'guardians_bounty_track_cooldown',
              targets: 'guardians_bounty_track_targets',
            },
            upgrades: chipState.upgrades.bounty,
            maxLevel: (track) => guardianChipBountyTrack(track).maxLevel,
            formatValue: formatGuardianChipBountyValue,
            totalCostAtLevel: guardianChipBountyTotalCostAtLevel,
            clampLevel: clampGuardianChipBountyLevel,
            onBump: handleBountyUpgradeBump,
            onSetLevel: handleBountyUpgradeSetLevel,
          }}
        />
      ) : selectedChipId === 'fetch' ? (
        <GuardianChipUpgradePanel
          chipId="fetch"
          titleId="guardian_chip_fetch"
          equipped={equippedSet.has('fetch')}
          onToggleEquip={() => handleToggleChipEquip('fetch')}
          tracks={{
            trackIds: GUARDIAN_CHIP_FETCH_TRACK_IDS,
            trackLabels: {
              cooldown: 'guardians_fetch_track_cooldown',
              findChance: 'guardians_fetch_track_find_chance',
              doubleFindChance: 'guardians_fetch_track_double_find_chance',
            },
            upgrades: chipState.upgrades.fetch,
            maxLevel: (track) => guardianChipFetchTrack(track).maxLevel,
            formatValue: formatGuardianChipFetchValue,
            totalCostAtLevel: guardianChipFetchTotalCostAtLevel,
            clampLevel: clampGuardianChipFetchLevel,
            onBump: handleFetchUpgradeBump,
            onSetLevel: handleFetchUpgradeSetLevel,
          }}
        />
      ) : selectedChipId === 'summon' ? (
        <GuardianChipUpgradePanel
          chipId="summon"
          titleId="guardian_chip_summon"
          equipped={equippedSet.has('summon')}
          onToggleEquip={() => handleToggleChipEquip('summon')}
          tracks={{
            trackIds: GUARDIAN_CHIP_SUMMON_TRACK_IDS,
            trackLabels: {
              cooldown: 'guardians_summon_track_cooldown',
              duration: 'guardians_summon_track_duration',
              cashBonus: 'guardians_summon_track_cash_bonus',
            },
            upgrades: chipState.upgrades.summon,
            maxLevel: (track) => guardianChipSummonTrack(track).maxLevel,
            formatValue: formatGuardianChipSummonValue,
            totalCostAtLevel: guardianChipSummonTotalCostAtLevel,
            clampLevel: clampGuardianChipSummonLevel,
            onBump: handleSummonUpgradeBump,
            onSetLevel: handleSummonUpgradeSetLevel,
          }}
        />
      ) : selectedChipId === 'scout' ? (
        <GuardianChipUpgradePanel
          chipId="scout"
          titleId="guardian_chip_scout"
          equipped={equippedSet.has('scout')}
          onToggleEquip={() => handleToggleChipEquip('scout')}
          tracks={{
            trackIds: GUARDIAN_CHIP_SCOUT_TRACK_IDS,
            trackLabels: {
              cooldown: 'guardians_scout_track_cooldown',
              rangeBonus: 'guardians_scout_track_range_bonus',
              duration: 'guardians_scout_track_duration',
            },
            upgrades: chipState.upgrades.scout,
            maxLevel: (track) => guardianChipScoutTrack(track).maxLevel,
            formatValue: formatGuardianChipScoutValue,
            totalCostAtLevel: guardianChipScoutTotalCostAtLevel,
            clampLevel: clampGuardianChipScoutLevel,
            onBump: handleScoutUpgradeBump,
            onSetLevel: handleScoutUpgradeSetLevel,
          }}
        />
      ) : selectedChipId ? (
        <section className="guardians-page__upgrade guardians-page__upgrade--placeholder">
          <header className="guardians-page__upgrade-head">
            <div className="guardians-page__upgrade-title-row">
              <GuardianChipIcon chipId={selectedChipId} className="guardians-page__upgrade-icon" />
              <h3 className="guardians-page__upgrade-title">
                {t(`guardian_chip_${selectedChipId}` as StringId)}
              </h3>
            </div>
            <button
              type="button"
              className={
                equippedSet.has(selectedChipId)
                  ? 'guardians-page__upgrade-equip guardians-page__upgrade-equip--on glow-btn'
                  : 'guardians-page__upgrade-equip glow-btn'
              }
              aria-pressed={equippedSet.has(selectedChipId)}
              onClick={() => handleToggleChipEquip(selectedChipId)}
            >
              {equippedSet.has(selectedChipId)
                ? t('guardians_chip_unequip')
                : t('guardians_chip_equip')}
            </button>
          </header>
          <p className="guardians-page__upgrade-placeholder">
            {t('guardians_chip_upgrades_unavailable').replace(
              '{{chip}}',
              t(`guardian_chip_${selectedChipId}` as StringId),
            )}
          </p>
        </section>
      ) : null}

      {guardianPickerOpen
        ? guardiansOverlayPortal(
            <div
              className="guardians-page__picker-backdrop"
              role="presentation"
              onClick={() => setGuardianPickerOpen(false)}
            >
              <div
                className="guardians-page__picker"
                role="dialog"
                aria-modal="true"
                aria-labelledby={pickerTitleId}
                onClick={(e) => e.stopPropagation()}
              >
                <header className="guardians-page__picker-head">
                  <h2 id={pickerTitleId} className="guardians-page__picker-title">
                    {t('guardians_picker_title')}
                  </h2>
                  <button
                    type="button"
                    className="guardians-page__picker-close"
                    onClick={() => setGuardianPickerOpen(false)}
                    aria-label={t('guardians_picker_close_aria')}
                  >
                    ×
                  </button>
                </header>
                <ul className="guardians-page__picker-grid">
                  {guardianThemes.map((theme) => {
                      const owned = isThemeOwned(theme, ownedIds)
                      const selected = selection.guardian === theme.id
                      return (
                        <li key={theme.id}>
                          <button
                            type="button"
                            className={`guardians-page__picker-card${
                              selected ? ' guardians-page__picker-card--selected' : ''
                            }${!owned ? ' guardians-page__picker-card--locked' : ''}`}
                            disabled={!owned}
                            onClick={() => {
                              pushUndoSnapshot()
                              selectTheme('guardian', theme.id)
                              setGuardianPickerOpen(false)
                            }}
                            aria-pressed={selected}
                          >
                            {theme.image ? (
                              <img src={theme.image} alt="" />
                            ) : null}
                            <span>{t(theme.nameId)}</span>
                          </button>
                        </li>
                      )
                    })}
                </ul>
              </div>
            </div>,
          )
        : null}

      {respecConfirmOpen
        ? guardiansOverlayPortal(
            <div
              className="select-research__reset-confirm-backdrop"
              role="presentation"
              onClick={() => setRespecConfirmOpen(false)}
            >
              <div
                className="select-research__reset-confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="guardians-respec-title"
                aria-describedby="guardians-respec-desc"
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  id="guardians-respec-title"
                  className="select-research__reset-confirm-title"
                >
                  {t('guardians_respec_confirm_title')}
                </h2>
                <p id="guardians-respec-desc" className="select-research__reset-confirm-desc">
                  {t('guardians_respec_confirm_body')}
                </p>
                <div className="select-research__reset-confirm-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => setRespecConfirmOpen(false)}
                  >
                    {t('sr_cancel')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--danger glow-btn--block"
                    onClick={performRespec}
                  >
                    {t('guardians_respec_confirm')}
                  </button>
                </div>
              </div>
            </div>,
          )
        : null}

      {!embeddedInPanel ? <div className="guardians-page__footer-spacer" /> : null}
    </div>
  )
}
