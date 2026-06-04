import { useEffect, useId, useState } from 'react'
import { HoldStepButton } from './HoldStepButton'
import {
  benefitLineWithNextUpgrade,
  isCardMasteryResearchItem,
  marginalCostForNextUpgrade,
  researchTimeForNextUpgrade,
  type ResearchItem,
} from '../types/research'
import { useI18n } from '../i18n'
import { CoinGlyph } from './CoinGlyph'
import { PowerStoneGlyph } from './PowerStoneGlyph'

interface ResearchCardProps {
  /** Parallel to manifest filename stem; used for Spanish name overlay. */
  sectionSlug: string
  itemIndex: number
  /** Stable id for deep links (`#id` / `?lab=id`). Omitted when not provided. */
  domId?: string
  item: ResearchItem
  hidden: boolean
  effectiveLevel: number
  maxLevelCap: number
  /** Total Labs Coin Discount % (simulated Labs Coin Discount lab). */
  labsCoinDiscountPercent: number
  /** Labs Speed multiplier from simulated Labs Speed level (applied to research times). */
  labsSpeedMultiplier: number
  onLevelDelta: (delta: number) => void
  onLevelSet: (level: number) => void
}

export function ResearchCard({
  sectionSlug,
  itemIndex,
  domId,
  item,
  hidden,
  effectiveLevel,
  maxLevelCap,
  labsCoinDiscountPercent,
  labsSpeedMultiplier,
  onLevelDelta,
  onLevelSet,
}: ResearchCardProps) {
  const { t, fmt, researchLabel, researchBenefitLine } = useI18n()
  const displayName = researchLabel(sectionSlug, itemIndex, item.name, 'item')
  const cardTitleId = useId()
  const [levelFocused, setLevelFocused] = useState(false)
  const [levelDraft, setLevelDraft] = useState(String(effectiveLevel))

  useEffect(() => {
    if (!levelFocused) {
      // Keep numeric draft in sync with simulator props when the field is not being edited.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional prop→draft sync
      setLevelDraft(String(effectiveLevel))
    }
  }, [effectiveLevel, levelFocused])

  const researching = item.state === 'researching'
  const showMaxStyle = maxLevelCap > 0 && effectiveLevel >= maxLevelCap
  const canDec = effectiveLevel > 0
  const canInc = maxLevelCap > 0 && effectiveLevel < maxLevelCap

  const nextCost = marginalCostForNextUpgrade(
    item,
    effectiveLevel,
    maxLevelCap,
    labsCoinDiscountPercent,
  )
  const costIsMax = nextCost === 'Max'
  const costUnknown = nextCost === '—'

  const benefitDisplay = benefitLineWithNextUpgrade(
    item,
    effectiveLevel,
    maxLevelCap,
  )
  const timeDisplay = researchTimeForNextUpgrade(
    item,
    effectiveLevel,
    maxLevelCap,
    labsSpeedMultiplier,
  )

  function commitLevelDraft(raw: string) {
    const trimmed = raw.trim()
    if (trimmed === '') {
      setLevelDraft(String(effectiveLevel))
      return
    }
    const n = Number.parseInt(trimmed, 10)
    if (!Number.isFinite(n)) {
      setLevelDraft(String(effectiveLevel))
      return
    }
    onLevelSet(n)
  }

  const stoneCost = isCardMasteryResearchItem(item)

  return (
    <article
      id={domId}
      className={[
        'research-card',
        showMaxStyle ? 'research-card--max' : 'research-card--active',
        researching ? 'research-card--researching' : '',
        hidden ? 'research-card--hidden' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid="research-card"
    >
      <div className="research-card__main">
        <div className="research-card__title" id={cardTitleId}>
          {displayName}
        </div>
        <div className="research-card__levelRow">
          <HoldStepButton
            className="research-card__step"
            ariaLabel={t('researchCard_decrease_aria')}
            holdVariant="min"
            disabled={!canDec}
            onStep={() => onLevelDelta(-1)}
            onHold={() => onLevelSet(0)}
          >
            −
          </HoldStepButton>
          <input
            type="number"
            className="research-card__level research-card__levelInput"
            aria-label={fmt.levelAriaLabel(displayName)}
            title={maxLevelCap > 0 ? fmt.levelRangeTitle(maxLevelCap) : undefined}
            min={0}
            max={maxLevelCap > 0 ? maxLevelCap : undefined}
            step={1}
            value={levelFocused ? levelDraft : String(effectiveLevel)}
            onFocus={() => {
              setLevelFocused(true)
              setLevelDraft(String(effectiveLevel))
            }}
            onChange={(e) => setLevelDraft(e.target.value)}
            onBlur={() => {
              setLevelFocused(false)
              commitLevelDraft(levelDraft)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur()
              }
            }}
          />
          <HoldStepButton
            className="research-card__step"
            ariaLabel={t('researchCard_increase_aria')}
            holdVariant="max"
            disabled={!canInc}
            onStep={() => onLevelDelta(1)}
            onHold={() => onLevelSet(maxLevelCap)}
          >
            +
          </HoldStepButton>
        </div>
        <div className="research-card__benefit">
          {researchBenefitLine(benefitDisplay)}
        </div>
      </div>
      {researching ? (
        <div className="research-card__overlay" aria-live="polite">
          {t('researchCard_researching')}
        </div>
      ) : null}
      <div
        className={[
          'research-card__footer',
          showMaxStyle ? 'research-card__footer--max' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="group"
        aria-labelledby={cardTitleId}
        aria-live="polite"
        aria-atomic="true"
      >
        {!showMaxStyle ? (
          <span
            className={
              researching
                ? 'research-card__time research-card__time--active'
                : 'research-card__time'
            }
          >
            {timeDisplay}
          </span>
        ) : null}
        <div className="research-card__costCol">
          {costIsMax ? (
            <span className="research-card__cost research-card__cost--text">
              {t('researchCard_max')}
            </span>
          ) : costUnknown ? (
            <span
              className="research-card__cost research-card__cost--unknown"
              title={t('researchCard_cost_unknown_title')}
            >
              —
            </span>
          ) : (
            <span
              className="research-card__cost"
              title={stoneCost ? t('researchCard_cost_stones_title') : t('researchCard_cost_coins_title')}
            >
              {nextCost}
              {stoneCost ? (
                <PowerStoneGlyph className="research-card__costIcon" />
              ) : (
                <CoinGlyph className="research-card__costIcon" />
              )}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
