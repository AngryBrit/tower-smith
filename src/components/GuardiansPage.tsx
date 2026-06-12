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
  GUARDIAN_CHIP_LOCKED_SLOT_INDEX,
  GUARDIAN_CHIP_SLOT_COUNT,
  type GuardianChipId,
} from '../data/guardianChips'
import { GAME_THEMES, themesForCategory } from '../data/gameThemes'
import {
  equipGuardianChip,
  respecGuardianChips,
  unequipGuardianChipSlot,
  useGuardianChipState,
} from '../guardianChipStorage'
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
          className="glow-btn glow-btn--block"
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
    (slotIndex: number) =>
      slotIndex === GUARDIAN_CHIP_LOCKED_SLOT_INDEX && !chipState.fourthSlotUnlocked,
    [chipState.fourthSlotUnlocked],
  )

  const handleInventoryChipClick = useCallback(
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

  const handleSlotClick = useCallback(
    (slotIndex: number) => {
      if (isSlotLocked(slotIndex)) return
      const chipId = chipState.slots[slotIndex]
      if (!chipId) return
      pushUndoSnapshot()
      updateChipState((prev) => unequipGuardianChipSlot(prev, slotIndex))
    },
    [chipState.slots, isSlotLocked, pushUndoSnapshot, updateChipState],
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
            const chipId = chipState.slots[slotIndex]
            return (
              <button
                key={position}
                type="button"
                className={`guardians-page__chip-tile guardians-page__slot guardians-page__slot--${position}${
                  locked ? ' guardians-page__slot--locked' : ''
                }${chipId ? ' guardians-page__slot--filled' : ''}${
                  !locked && !chipId ? ' guardians-page__slot--empty' : ''
                }`}
                onClick={() => handleSlotClick(slotIndex)}
                disabled={locked || !chipId}
                aria-label={
                  locked
                    ? t('guardians_slot_locked_aria')
                    : chipId
                      ? t('guardians_slot_unequip_aria').replace(
                          '{{chip}}',
                          t(`guardian_chip_${chipId}` as StringId),
                        )
                      : t('guardians_slot_empty_aria')
                }
              >
                <span className="guardians-page__slot-connector" aria-hidden />
                {locked ? (
                  <GuardianChipIcon chipId="locked" className="guardians-page__chip-icon" />
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
                <GuardianChipIcon chipId="ally" className="guardians-page__guardian-fallback" />
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
                  }`}
                  onClick={() => handleInventoryChipClick(chip.id)}
                  aria-pressed={equipped}
                  aria-label={
                    equipped
                      ? t('guardians_chip_equipped_aria').replace('{{chip}}', t(chip.nameId))
                      : t('guardians_chip_equip_aria').replace('{{chip}}', t(chip.nameId))
                  }
                >
                  <GuardianChipIcon chipId={chip.id} className="guardians-page__chip-icon" />
                  <span className="guardians-page__chip-label">{t(chip.nameId)}</span>
                  {equipped ? (
                    <span className="guardians-page__chip-check" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

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
              className="guardians-page__picker-backdrop"
              role="presentation"
              onClick={() => setRespecConfirmOpen(false)}
            >
              <div
                className="guardians-page__confirm"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="guardians-respec-title"
                aria-describedby="guardians-respec-desc"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 id="guardians-respec-title" className="guardians-page__confirm-title">
                  {t('guardians_respec_confirm_title')}
                </h2>
                <p id="guardians-respec-desc" className="guardians-page__confirm-body">
                  {t('guardians_respec_confirm_body')}
                </p>
                <div className="guardians-page__confirm-actions">
                  <button
                    type="button"
                    className="glow-btn"
                    onClick={() => setRespecConfirmOpen(false)}
                  >
                    {t('guardians_respec_cancel')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--danger"
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
