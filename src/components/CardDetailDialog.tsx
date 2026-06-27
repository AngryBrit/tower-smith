import { useEffect, useId, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import {
  workshopGameCardArtVariant,
  workshopGameCardGlow,
  workshopGameCardGlyph,
  workshopGameCardImage,
  workshopGameCardMaxStars,
  workshopGameCardRarity,
  workshopGameCardTitleId,
  workshopGameCardDescriptionLineForDetail,
  type WorkshopGameCardId,
} from '../data/workshopGameCards'
import {
  formatCardMasteryTierLabelDetailForCard,
  formatWorkshopGameCardStarLevelEffectForDetail,
  workshopCardMasteryDetailAbilityLabel,
  workshopCardMasteryDetailAbilityDescId,
  workshopCardMasteryDetailMasteryDescId,
  workshopCardMasteryDetailMasteryDescStyle,
  workshopCardMasteryDetailResearchDescId,
  workshopCardMasteryDetailTitleId,
  workshopCardMasteryLevel,
  workshopCardMasteryMultiplier,
  workshopCardMasteryResearchRef,
  workshopCardMasteryTierLabel,
  workshopCardMasteryUnlockPreviewLabel,
  workshopCardMasteryUnlocked,
} from '../data/workshopCardMastery'
import { type ResearchData } from '../types/research'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import { workshopDisplayedCriticalFactorValue } from '../data/workshopCriticalFactor'
import { workshopCardDetailLabEnhancements, cardsResearchLabLevel } from '../data/workshopCardDetailLabEnhancements'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'
import { PowerStoneGlyph } from './PowerStoneGlyph'

type CardDetailDialogProps = {
  cardId: WorkshopGameCardId
  stars: number
  researchData: ResearchData | null
  labLevelOverrides: Record<string, number>
  workshopPersisted: WorkshopPersistedV1
  gameResearchLevel?: readonly number[] | null
  previewTileSize?: { width: number; height: number } | null
  equipped: boolean
  equipDisabled: boolean
  onToggleEquip: () => void
  onClose: () => void
  onUnlockMastery: () => void
}

export function CardDetailDialog({
  cardId,
  stars,
  researchData,
  labLevelOverrides,
  workshopPersisted,
  gameResearchLevel,
  previewTileSize,
  equipped,
  equipDisabled,
  onToggleEquip,
  onClose,
  onUnlockMastery,
}: CardDetailDialogProps) {
  const { t } = useI18n()
  const titleId = useId()
  const rarity = workshopGameCardRarity(cardId)
  const maxStars = workshopGameCardMaxStars(cardId)
  const atMax = stars >= maxStars
  const starsGold = stars >= 5
  const masteryUnlocked = workshopCardMasteryUnlocked(cardId, researchData, labLevelOverrides)
  const masteryLevel = workshopCardMasteryLevel(cardId, researchData, labLevelOverrides)
  const masteryMultiplier = workshopCardMasteryMultiplier(
    cardId,
    researchData,
    labLevelOverrides,
  )
  const masteryRef = workshopCardMasteryResearchRef(cardId, researchData)
  const masteryItem = masteryRef?.item ?? null
  const stoneCost =
    masteryItem &&
    typeof masteryItem.stoneUnlockCost === 'number' &&
    Number.isFinite(masteryItem.stoneUnlockCost)
      ? Math.round(masteryItem.stoneUnlockCost)
      : null
  const canUnlock =
    !masteryUnlocked &&
    masteryRef != null &&
    stoneCost != null &&
    researchData != null

  const artVariant = workshopGameCardArtVariant(cardId)
  const glow = workshopGameCardGlow(cardId)
  const glyph = workshopGameCardGlyph(cardId)
  const imageSrc = workshopGameCardImage(cardId)
  const cardTitleId = workshopGameCardTitleId(cardId)
  const descriptionLine = workshopGameCardDescriptionLineForDetail(
    cardId,
    Math.max(stars, 1),
    masteryMultiplier,
    cardId === 'superTower'
      ? {
          superTowerBonusLabLevel: cardsResearchLabLevel(
            researchData,
            labLevelOverrides,
            'Super Tower Bonus',
          ),
        }
      : cardId === 'ultimateCrit'
        ? {
            ultimateCritTowerFactor: workshopDisplayedCriticalFactorValue(
              workshopPersisted,
              researchData,
              labLevelOverrides,
              gameResearchLevel,
            ),
          }
        : undefined,
  )
  const masteryTitleId = workshopCardMasteryDetailTitleId(cardId)
  const masteryStatLabel = t(masteryTitleId)
  const masteryStatLabelLower = masteryStatLabel.toLocaleLowerCase()
  const masteryAbilityLabel = workshopCardMasteryDetailAbilityLabel(cardId, masteryStatLabel)
  const masteryDescId = workshopCardMasteryDetailMasteryDescId(cardId)
  const masteryDescLine = masteryDescId
    ? t(masteryDescId)
    : workshopCardMasteryDetailMasteryDescStyle(cardId) === 'stat_multiplier'
      ? t('ws_cards_detail_mastery_desc_stat_multiplier').replace(
          '{{mastery}}',
          masteryAbilityLabel,
        )
      : t('ws_cards_detail_mastery_desc')
          .replace('{{stat}}', masteryStatLabel)
          .replace('{{mastery}}', masteryStatLabel)
  const masteryAbilityDescId = workshopCardMasteryDetailAbilityDescId(cardId)
  const masteryAbilityDescLine = masteryAbilityDescId
    ? t(masteryAbilityDescId)
    : t('ws_cards_detail_mastery_ability_desc').replace('{{stat}}', masteryStatLabel)
  const masteryResearchDescId = workshopCardMasteryDetailResearchDescId(cardId)
  const masteryResearchDescLine = masteryResearchDescId
    ? t(masteryResearchDescId)
    : t('ws_cards_detail_mastery_research_desc').replace('{{stat}}', masteryStatLabelLower)
  const masteryAbilityValue = formatCardMasteryTierLabelDetailForCard(
    cardId,
    workshopCardMasteryTierLabel(cardId, researchData, masteryLevel) ??
      workshopCardMasteryUnlockPreviewLabel(cardId, researchData) ??
      '—',
  )
  const masteryResearchName =
    masteryRef && researchData
      ? (researchData.sections[masteryRef.sectionIndex]?.items[masteryRef.itemIndex]?.name ?? '')
      : ''
  const labEnhancements = workshopCardDetailLabEnhancements(
    cardId,
    researchData,
    labLevelOverrides,
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const unlockLabel = masteryResearchName
    ? t('ws_cards_detail_unlock_mastery').replace('{{mastery}}', masteryResearchName)
    : t('ws_cards_detail_unlock_mastery_generic')

  return createPortal(
    <div
      className="modules-picker__backdrop cards-detail__backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="modules-picker__dialog modules-picker__dialog--detail cards-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        style={
          previewTileSize
            ? ({
                '--cards-detail-preview-width': `${previewTileSize.width}px`,
                '--cards-detail-preview-height': `${previewTileSize.height}px`,
              } as CSSProperties)
            : undefined
        }
      >
        <button
          type="button"
          className="modules-picker__close"
          onClick={onClose}
          aria-label={t('ws_cards_detail_close_aria')}
        >
          ×
        </button>

        <p
          id={titleId}
          className={`modules-picker__hero-rarity modules-picker__section-title--center modules-rarity--${rarity}`}
        >
          {t(`ws_cards_rarity_${rarity}` as StringId)}
        </p>

        <div className="cards-detail__hero">
          <div className="cards-detail__preview-col">
            <div className="cards-detail__preview">
            <div
              className={[
                'cards-tile',
                `cards-tile--${artVariant}`,
                `cards-tile--glow-${glow}`,
                `cards-tile--${rarity}`,
                starsGold ? 'cards-tile--stars-gold' : '',
                atMax ? 'cards-tile--max' : '',
                masteryUnlocked ? 'cards-tile--mastery' : '',
                'cards-tile--stats-locked',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="cards-tile__body">
                <div className="cards-tile__head">
                  <span className="cards-tile__name">{t(cardTitleId)}</span>
                </div>
                <div
                  className={
                    imageSrc ? 'cards-tile__art cards-tile__art--img' : 'cards-tile__art'
                  }
                  aria-hidden
                >
                  {imageSrc ? (
                    <img className="cards-tile__img" src={imageSrc} alt="" draggable={false} />
                  ) : (
                    <span className="cards-tile__glyph">{glyph}</span>
                  )}
                </div>
                <div className="cards-tile__stars" aria-hidden>
                  {Array.from({ length: maxStars }, (_, i) => (
                    <span
                      key={i}
                      className={
                        i < stars ? 'cards-tile__star cards-tile__star--on' : 'cards-tile__star'
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
            </div>
            <button
              type="button"
              className={
                equipped
                  ? 'glow-btn glow-btn--block cards-detail__equip cards-detail__equip--on'
                  : 'glow-btn glow-btn--block cards-detail__equip'
              }
              aria-pressed={equipped}
              disabled={equipDisabled}
              aria-label={(equipped
                ? t('ws_cards_detail_unequip_aria')
                : t('ws_cards_detail_equip_aria')
              ).replace('{{card}}', t(cardTitleId))}
              onClick={onToggleEquip}
            >
              {equipped ? t('ws_cards_detail_unequip') : t('ws_cards_detail_equip')}
            </button>
            {atMax ? (
              <p className="cards-detail__max-label">{t('ws_cards_detail_max_level')}</p>
            ) : null}
          </div>

          <div className="cards-detail__stats">
            <p className="modules-picker__hero-stat cards-detail__summary">{descriptionLine}</p>
            <ol className="cards-detail__levels">
              {Array.from({ length: maxStars }, (_, i) => {
                const level = i + 1
                const active = level === stars
                return (
                  <li
                    key={level}
                    className={
                      active ? 'cards-detail__level cards-detail__level--active' : 'cards-detail__level'
                    }
                  >
                    <span className="cards-detail__level-label">
                      {t('ws_cards_detail_level').replace('{{level}}', String(level))}
                    </span>
                    <span className="cards-detail__level-value">
                      {formatWorkshopGameCardStarLevelEffectForDetail(cardId, level)}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>

        <section
          className="modules-picker__section cards-detail__mastery"
          aria-label={t('ws_cards_detail_mastery_aria')}
        >
          <h3 className="modules-picker__section-title modules-picker__section-title--center cards-detail__mastery-title">
            {masteryUnlocked
              ? t('ws_cards_detail_mastery_unlocked')
              : t('ws_cards_detail_mastery_available')}
          </h3>
          <p className="cards-detail__mastery-desc">{masteryDescLine}</p>
          <div className="cards-detail__mastery-row">
            <div className="cards-detail__mastery-main">
              <span className="cards-detail__mastery-label">
                <span className="cards-detail__mastery-label-heading">
                  {t('ws_cards_detail_mastery_ability_prefix')}
                </span>{' '}
                <span className="cards-detail__mastery-label-name">{masteryAbilityLabel}</span>
              </span>
              <span className="cards-detail__mastery-ability-desc">{masteryAbilityDescLine}</span>
            </div>
            <span className="cards-detail__mastery-value">{masteryAbilityValue}</span>
          </div>
          <h4 className="cards-detail__mastery-subtitle">{t('ws_cards_detail_mastery_research')}</h4>
          <p className="cards-detail__mastery-research-desc">{masteryResearchDescLine}</p>
          {canUnlock ? (
            <button
              type="button"
              className="glow-btn glow-btn--block cards-detail__unlock"
              onClick={onUnlockMastery}
            >
              <span className="cards-detail__unlock-label">{unlockLabel}</span>
              <span className="cards-detail__unlock-cost">
                {stoneCost}
                <PowerStoneGlyph className="cards-detail__unlock-stone" />
              </span>
            </button>
          ) : null}
        </section>

        {labEnhancements.length > 0 ? (
          <section
            className="modules-picker__section cards-detail__lab-enhancements"
            aria-label={t('ws_cards_detail_lab_enhancements_aria')}
          >
            <h3 className="modules-picker__section-title modules-picker__section-title--center cards-detail__lab-enhancements-title">
              {t('ws_cards_detail_lab_enhancements_title')}
            </h3>
            {labEnhancements.map((row) => (
              <div key={row.titleId} className="cards-detail__lab-enhancement-row">
                <div className="cards-detail__lab-enhancement-main">
                  <span className="cards-detail__lab-enhancement-title">{t(row.titleId)}</span>
                  <span className="cards-detail__lab-enhancement-desc">{t(row.descId)}</span>
                </div>
                <span className="cards-detail__lab-enhancement-value">{row.value}</span>
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
