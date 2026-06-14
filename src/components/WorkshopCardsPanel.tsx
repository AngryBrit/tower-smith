import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { deferInEffect } from '../deferInEffect'
import {
  clampWorkshopCardActivePresetIndex,
  clampWorkshopGameCardStars,
  WORKSHOP_GAME_CARD_COUNT,
  WORKSHOP_GAME_CARD_ORDER,
  workshopCardMirrorsPatch,
  workshopEffectiveEquippedLoadout,
  workshopGameCardArtVariant,
  workshopGameCardGlow,
  workshopGameCardDescription,
  formatWorkshopGameCardStarEffectWithMastery,
  workshopGameCardGlyph,
  workshopGameCardImage,
  workshopGameCardMaxStars,
  workshopGameCardRarity,
  workshopGameCardTitleId,
  workshopGameCardWiki,
  type WorkshopGameCardId,
} from '../data/workshopGameCards'
import {
  clampWorkshopCardEquipSlots,
  WORKSHOP_CARD_MAX_SLOTS_HARMONY,
  WORKSHOP_CARD_PRESET_COUNT,
} from '../data/workshopGameCardWiki'
import {
  workshopCardMasteryMultiplier,
  workshopCardMasteryUnlockedSet,
} from '../data/workshopCardMastery'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import { useI18n } from '../i18n'
import { HoldStepButton } from './HoldStepButton'
import { WorkshopPresetToolbar } from './WorkshopPresetToolbar'
import type { StringId } from '../i18n/dictionary'
import type { ResearchData } from '../types/research'

type WorkshopCardsPanelProps = {
  workshopPersisted: WorkshopPersistedV1
  onWorkshopPersistedChange: (next: WorkshopPersistedV1) => void
  researchData: ResearchData | null
  labLevelOverrides: Record<string, number>
}

const CARD_PRESET_KEYS = [
  'ws_cards_preset_1',
  'ws_cards_preset_2',
  'ws_cards_preset_3',
  'ws_cards_preset_4',
  'ws_cards_preset_5',
] as const satisfies readonly StringId[]

type CardArtVariant =
  | 'damage'
  | 'attackSpeed'
  | 'berserker'
  | 'cannon'
  | 'relics'
  | 'perk'
  | 'taken'

const CARD_EQUIPPED_CHECKMARK_SRC = '/icons/Checkmark_glow.webp'
const ACTIVE_ROW_DRAG_THRESHOLD_PX = 6

type ActiveRowDragState = {
  pointerId: number
  startX: number
  startScrollLeft: number
  dragging: boolean
}

function CardsActiveScroller({
  cardCount,
  scrollKey,
  children,
}: {
  cardCount: number
  scrollKey: number
  children: ReactNode
}) {
  const scrollRef = useRef<HTMLUListElement>(null)
  const dragRef = useRef<ActiveRowDragState | null>(null)
  const [canScrollHorizontally, setCanScrollHorizontally] = useState(false)
  const [rowDragging, setRowDragging] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollHorizontally(maxScroll > 1)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      ro.disconnect()
    }
  }, [cardCount, updateScrollState])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = 0
    updateScrollState()
  }, [scrollKey, updateScrollState])

  const onActiveRowPointerDown = useCallback(
    (e: React.PointerEvent<HTMLUListElement>) => {
      if (e.button !== 0 || !canScrollHorizontally) return
      const el = scrollRef.current
      if (!el) return
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startScrollLeft: el.scrollLeft,
        dragging: false,
      }
    },
    [canScrollHorizontally],
  )

  const onActiveRowPointerMove = useCallback(
    (e: React.PointerEvent<HTMLUListElement>) => {
      const state = dragRef.current
      if (!state || state.pointerId !== e.pointerId) return
      const el = scrollRef.current
      if (!el) return

      const dx = e.clientX - state.startX
      if (!state.dragging) {
        if (Math.abs(dx) < ACTIVE_ROW_DRAG_THRESHOLD_PX) return
        state.dragging = true
        setRowDragging(true)
        el.setPointerCapture(e.pointerId)
      }

      e.preventDefault()
      el.scrollLeft = state.startScrollLeft - dx
      updateScrollState()
    },
    [updateScrollState],
  )

  const endActiveRowPointer = useCallback(
    (e: React.PointerEvent<HTMLUListElement>) => {
      const state = dragRef.current
      if (!state || state.pointerId !== e.pointerId) return
      const el = scrollRef.current
      const wasDragging = state.dragging
      dragRef.current = null
      setRowDragging(false)
      if (el?.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId)
      }
      if (wasDragging) {
        const blockClick = (ev: Event) => {
          ev.preventDefault()
          ev.stopPropagation()
        }
        el?.addEventListener('click', blockClick, { capture: true, once: true })
      }
    },
    [],
  )

  return (
    <div className="cards-active-scroller">
      <ul
        ref={scrollRef}
        className={[
          'cards-active-row',
          canScrollHorizontally ? 'cards-active-row--scrollable' : '',
          rowDragging ? 'cards-active-row--dragging' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onPointerDown={onActiveRowPointerDown}
        onPointerMove={onActiveRowPointerMove}
        onPointerUp={endActiveRowPointer}
        onPointerCancel={endActiveRowPointer}
      >
        {children}
      </ul>
    </div>
  )
}

function CardStars({ stars, maxStars }: { stars: number; maxStars: number }) {
  return (
    <div className="cards-tile__stars" aria-hidden>
      {Array.from({ length: maxStars }, (_, i) => (
        <span
          key={i}
          className={i < stars ? 'cards-tile__star cards-tile__star--on' : 'cards-tile__star'}
        />
      ))}
    </div>
  )
}

function CardsTileStepper({
  value,
  min,
  max,
  inputAria,
  onBump,
  onCommit,
}: {
  value: number
  min: number
  max: number
  inputAria: StringId
  onBump: (dir: -1 | 1) => void
  onCommit: (parsed: number) => void
}) {
  const { t } = useI18n()
  const maxLabel = t('ws_max')
  const formatDraft = useCallback(
    (v: number) => (max > 0 && v >= max ? maxLabel : String(v)),
    [max, maxLabel],
  )
  const [draft, setDraft] = useState(() => formatDraft(value))

  useEffect(() => {
    deferInEffect(() => setDraft(formatDraft(value)))
  }, [formatDraft, value])

  const commit = () => {
    const raw = draft.trim().replace(/,/g, '')
    if (raw === '') {
      setDraft(formatDraft(value))
      return
    }
    if (
      /^max$/i.test(raw) ||
      raw.localeCompare(maxLabel, undefined, { sensitivity: 'accent' }) === 0
    ) {
      onCommit(max)
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setDraft(formatDraft(value))
      return
    }
    onCommit(Math.max(min, Math.min(max, Math.trunc(n))))
  }

  return (
    <div className="cards-tile__stepper">
      <HoldStepButton
        className="cards-tile__step"
        ariaLabel={t('ws_sim_stars_down_aria')}
        holdVariant="min"
        disabled={value <= min}
        onStep={() => onBump(-1)}
        onHold={() => onCommit(min)}
      >
        −
      </HoldStepButton>
      <input
        className="cards-tile__input"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={t(inputAria)}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
            ;(e.target as HTMLInputElement).blur()
          }
        }}
      />
      <HoldStepButton
        className="cards-tile__step"
        ariaLabel={t('ws_sim_stars_up_aria')}
        holdVariant="max"
        disabled={value >= max}
        onStep={() => onBump(1)}
        onHold={() => onCommit(max)}
      >
        +
      </HoldStepButton>
    </div>
  )
}

function CardsStarTile({
  cardId,
  titleId,
  artVariant,
  glow,
  glyph,
  stars,
  maxStars,
  valueHint = '',
  equipped = false,
  showEquippedCheckmark = false,
  masteryUnlocked = false,
  statsLocked = false,
  statOverlay = true,
  onToggleEquip,
  onBump,
  onCommit,
}: {
  cardId: WorkshopGameCardId
  titleId: StringId
  artVariant: CardArtVariant
  glow: ReturnType<typeof workshopGameCardGlow>
  glyph: string
  stars: number
  maxStars: number
  valueHint?: string
  equipped?: boolean
  showEquippedCheckmark?: boolean
  masteryUnlocked?: boolean
  statsLocked?: boolean
  statOverlay?: boolean
  onToggleEquip?: () => void
  onBump: (dir: -1 | 1) => void
  onCommit: (parsed: number) => void
}) {
  const { t } = useI18n()
  const atMax = stars >= maxStars
  const starsGold = stars >= 5
  const rarity = workshopGameCardRarity(cardId)
  const wiki = workshopGameCardWiki(cardId)
  const desc = workshopGameCardDescription(cardId)
  const title = wiki.milestone ? `${desc}\n\n${t('ws_cards_milestone')}: ${wiki.milestone}` : desc
  const imageSrc = workshopGameCardImage(cardId)

  const tileClass = [
    'cards-tile',
    `cards-tile--${artVariant}`,
    `cards-tile--glow-${glow}`,
    `cards-tile--${rarity}`,
    equipped ? 'cards-tile--equipped' : '',
    starsGold ? 'cards-tile--stars-gold' : '',
    atMax ? 'cards-tile--max' : '',
    masteryUnlocked ? 'cards-tile--mastery' : '',
    statsLocked ? 'cards-tile--stats-locked' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <li
      className={tileClass}
      title={title}
      onClick={onToggleEquip}
      onKeyDown={(e) => {
        if (onToggleEquip && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onToggleEquip()
        }
      }}
      role={onToggleEquip ? 'button' : undefined}
      tabIndex={onToggleEquip ? 0 : undefined}
    >
      <div className="cards-tile__head">
        <span className="cards-tile__name">{t(titleId)}</span>
      </div>
      <div
        className={imageSrc ? 'cards-tile__art cards-tile__art--img' : 'cards-tile__art'}
        aria-hidden
      >
        {imageSrc ? (
          <img
            className="cards-tile__img"
            src={imageSrc}
            alt=""
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
        ) : (
          <span className="cards-tile__glyph">{glyph}</span>
        )}
        {valueHint && statOverlay ? (
          <p className="cards-tile__stat cards-tile__stat--overlay">{valueHint}</p>
        ) : null}
      </div>
      <CardStars stars={stars} maxStars={maxStars} />
      {statsLocked ? null : (
        <div
          className="cards-tile__controls"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <CardsTileStepper
            value={stars}
            min={0}
            max={maxStars}
            inputAria="ws_sim_stars_input_aria"
            onBump={onBump}
            onCommit={onCommit}
          />
        </div>
      )}
      {valueHint && !statOverlay ? <p className="cards-tile__stat">{valueHint}</p> : null}
      {showEquippedCheckmark ? (
        <img
          className="cards-tile__equipped-mark"
          src={CARD_EQUIPPED_CHECKMARK_SRC}
          alt=""
          aria-hidden
        />
      ) : null}
    </li>
  )
}

export function WorkshopCardsPanel({
  workshopPersisted,
  onWorkshopPersistedChange,
  researchData,
  labLevelOverrides,
}: WorkshopCardsPanelProps) {
  const { t } = useI18n()
  const presetIndex = clampWorkshopCardActivePresetIndex(
    workshopPersisted.cardActivePresetIndex,
  )

  const masteryUnlocked = useMemo(
    () => workshopCardMasteryUnlockedSet(researchData, labLevelOverrides),
    [researchData, labLevelOverrides],
  )

  const masteryMultiplierByCard = useMemo(() => {
    const map = new Map<WorkshopGameCardId, number>()
    for (const id of WORKSHOP_GAME_CARD_ORDER) {
      map.set(id, workshopCardMasteryMultiplier(id, researchData, labLevelOverrides))
    }
    return map
  }, [researchData, labLevelOverrides])

  const patch = useCallback(
    (partial: Partial<WorkshopPersistedV1>) => {
      onWorkshopPersistedChange({
        ...workshopPersisted,
        ...workshopCardMirrorsPatch(workshopPersisted, partial),
      })
    },
    [onWorkshopPersistedChange, workshopPersisted],
  )

  const selectPreset = useCallback(
    (i: number) => {
      patch({ cardActivePresetIndex: clampWorkshopCardActivePresetIndex(i) })
    },
    [patch],
  )

  const setPresetLabel = useCallback(
    (index: number, label: string) => {
      const cardPresetLabels = [...workshopPersisted.cardPresetLabels]
      cardPresetLabels[index] = label
      patch({ cardPresetLabels })
    },
    [patch, workshopPersisted.cardPresetLabels],
  )

  const setCardStar = useCallback(
    (id: WorkshopGameCardId, stars: number) => {
      const nextStars = clampWorkshopGameCardStars(stars, id)
      const cardStars = {
        ...workshopPersisted.cardStars,
        [id]: nextStars,
      }
      const partial: Partial<WorkshopPersistedV1> = { cardStars }
      if (nextStars <= 0) {
        partial.cardPresetLoadouts = workshopPersisted.cardPresetLoadouts.map((row) =>
          row.filter((c) => c !== id),
        )
      }
      patch(partial)
    },
    [patch, workshopPersisted.cardPresetLoadouts, workshopPersisted.cardStars],
  )

  const bumpCardStar = useCallback(
    (id: WorkshopGameCardId, dir: -1 | 1) => {
      setCardStar(id, workshopPersisted.cardStars[id] + dir)
    },
    [setCardStar, workshopPersisted.cardStars],
  )

  const presetLoadout = useMemo(
    () => workshopPersisted.cardPresetLoadouts[presetIndex] ?? [],
    [presetIndex, workshopPersisted.cardPresetLoadouts],
  )

  const effectiveEquipped = useMemo(
    () => workshopEffectiveEquippedLoadout(workshopPersisted),
    [workshopPersisted],
  )

  const equippedSet = useMemo(() => new Set(presetLoadout), [presetLoadout])

  const setPresetLoadout = useCallback(
    (next: WorkshopGameCardId[]) => {
      const loadouts = workshopPersisted.cardPresetLoadouts.map((row, i) =>
        i === presetIndex ? next : row,
      )
      while (loadouts.length < WORKSHOP_CARD_PRESET_COUNT) {
        loadouts.push([])
      }
      patch({ cardPresetLoadouts: loadouts })
    },
    [patch, presetIndex, workshopPersisted.cardPresetLoadouts],
  )

  const toggleEquip = useCallback(
    (id: WorkshopGameCardId) => {
      const stars = workshopPersisted.cardStars[id]
      if (stars <= 0) return
      if (equippedSet.has(id)) {
        setPresetLoadout(presetLoadout.filter((c) => c !== id))
        return
      }
      if (presetLoadout.length >= workshopPersisted.cardEquipSlots) return
      setPresetLoadout([...presetLoadout, id])
    },
    [
      equippedSet,
      presetLoadout,
      setPresetLoadout,
      workshopPersisted.cardEquipSlots,
      workshopPersisted.cardStars,
    ],
  )

  const renderCardTile = (
    id: WorkshopGameCardId,
    opts: { inventory?: boolean; active?: boolean },
  ) => {
    const stars = workshopPersisted.cardStars[id]
    return (
      <CardsStarTile
        key={id}
        cardId={id}
        titleId={workshopGameCardTitleId(id)}
        artVariant={workshopGameCardArtVariant(id)}
        glow={workshopGameCardGlow(id)}
        glyph={workshopGameCardGlyph(id)}
        stars={stars}
        maxStars={workshopGameCardMaxStars(id)}
        valueHint={formatWorkshopGameCardStarEffectWithMastery(
          id,
          stars,
          masteryMultiplierByCard.get(id) ?? 1,
        )}
        equipped={equippedSet.has(id)}
        showEquippedCheckmark={opts.inventory === true && equippedSet.has(id)}
        masteryUnlocked={masteryUnlocked.has(id)}
        statsLocked={opts.active === true}
        onToggleEquip={
          opts.inventory || opts.active ? () => toggleEquip(id) : undefined
        }
        onBump={(dir) => bumpCardStar(id, dir)}
        onCommit={(n) => setCardStar(id, n)}
      />
    )
  }

  return (
    <div className="cards-layout">
      <WorkshopPresetToolbar
        ariaLabel="ws_cards_presets_aria"
        renameHint="ws_cards_presets_rename_hint"
        fallbackKeys={CARD_PRESET_KEYS}
        labels={workshopPersisted.cardPresetLabels}
        activeIndex={presetIndex}
        onSelect={selectPreset}
        onLabelChange={setPresetLabel}
      />

      <section className="cards-zone" aria-labelledby="cards-zone-active-title">
        <header className="cards-zone__head">
          <h3 id="cards-zone-active-title" className="cards-zone__title">
            {t('ws_cards_active')}
          </h3>
          <p className="cards-zone__count cards-zone__count--slots" aria-live="polite">
            <span className="cards-zone__count-equipped">{effectiveEquipped.length}</span>
            <span className="cards-zone__count-sep" aria-hidden>
              /
            </span>
            <input
              className="cards-zone__count-input"
              type="number"
              min={1}
              max={WORKSHOP_CARD_MAX_SLOTS_HARMONY}
              value={workshopPersisted.cardEquipSlots}
              aria-label={t('ws_cards_slots_aria')}
              onChange={(e) =>
                patch({
                  cardEquipSlots: clampWorkshopCardEquipSlots(Number(e.target.value)),
                })
              }
            />
          </p>
        </header>
        <CardsActiveScroller cardCount={effectiveEquipped.length} scrollKey={presetIndex}>
          {effectiveEquipped.map((id) => renderCardTile(id, { active: true }))}
        </CardsActiveScroller>
      </section>

      <section className="cards-zone" aria-labelledby="cards-zone-inventory-title">
        <header className="cards-zone__head">
          <h3 id="cards-zone-inventory-title" className="cards-zone__title">
            {t('ws_cards_inventory')}
          </h3>
          <p className="cards-zone__count" aria-live="polite">
            {WORKSHOP_GAME_CARD_COUNT}/{WORKSHOP_GAME_CARD_COUNT}
          </p>
        </header>
        <ul className="cards-inventory-grid">
          {WORKSHOP_GAME_CARD_ORDER.map((id) => renderCardTile(id, { inventory: true }))}
        </ul>
      </section>
    </div>
  )
}
