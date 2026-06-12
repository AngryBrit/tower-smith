import { BitsGlyph } from './BitsGlyph'
import { HoldStepButton } from './HoldStepButton'
import { GuardianChipIcon } from './GuardianChipIcon'
import type { GuardianChipId } from '../data/guardianChips'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'

export type GuardianChipUpgradeTrackConfig<TTrack extends string> = {
  trackIds: readonly TTrack[]
  trackLabels: Record<TTrack, StringId>
  upgrades: Record<TTrack, number>
  maxLevel: (track: TTrack) => number
  formatValue: (track: TTrack, level: number) => string
  marginalCost: (track: TTrack, fromLevel: number) => number | undefined
  clampLevel: (track: TTrack, level: number) => number
  onBump: (track: TTrack, direction: -1 | 1) => void
  onSetLevel: (track: TTrack, level: number) => void
}

type GuardianChipUpgradePanelProps<TTrack extends string> = {
  chipId: GuardianChipId
  titleId: StringId
  equipped: boolean
  tracks: GuardianChipUpgradeTrackConfig<TTrack>
  onToggleEquip: () => void
}

export function GuardianChipUpgradePanel<TTrack extends string>({
  chipId,
  titleId,
  equipped,
  tracks,
  onToggleEquip,
}: GuardianChipUpgradePanelProps<TTrack>) {
  const { t } = useI18n()
  const title = t(titleId)

  return (
    <section
      className="guardians-page__upgrade"
      aria-label={t('guardians_chip_upgrade_aria')}
    >
      <ul className="guardians-page__upgrade-grid workshop__grid workshop__grid--ultimate">
        <li className="workshop__uw-stack">
          <div className="workshop__uw-card">
            <div className="workshop__uw-head">
              <span className="workshop__uw-title">{title}</span>
              <button
                type="button"
                className={
                  equipped
                    ? 'workshop__uw-active-toggle workshop__uw-active-toggle--on'
                    : 'workshop__uw-active-toggle'
                }
                aria-pressed={equipped}
                aria-label={
                  equipped
                    ? t('guardians_chip_equipped_aria').replace('{{chip}}', title)
                    : t('guardians_chip_equip_aria').replace('{{chip}}', title)
                }
                onClick={onToggleEquip}
              >
                {equipped ? t('guardians_chip_unequip') : t('guardians_chip_equip')}
              </button>
            </div>
            <div className="workshop__uw-body">
              <div className="workshop__uw-icon-wrap">
                <GuardianChipIcon chipId={chipId} className="workshop__uw-icon-svg" />
              </div>
              <div className="workshop__uw-stats" role="group">
                {tracks.trackIds.map((track) => {
                  const level = tracks.upgrades[track]
                  const max = tracks.maxLevel(track)
                  const maxed = level >= max
                  const label = t(tracks.trackLabels[track])
                  const nextCost = tracks.marginalCost(track, level)

                  return (
                    <div
                      key={track}
                      className={
                        maxed ? 'workshop__uw-col workshop__uw-col--max' : 'workshop__uw-col'
                      }
                    >
                      <div className="workshop__uw-col-top">
                        <span className="workshop__uw-stat-label">{label}</span>
                        <span className="workshop__uw-stat-value">
                          {tracks.formatValue(track, level)}
                        </span>
                      </div>
                      <div className="workshop__uw-col-foot">
                        <HoldStepButton
                          className="workshop__uw-level-step"
                          ariaLabel={`${label} — ${t('ws_defense_level_down_aria')}`}
                          holdVariant="min"
                          disabled={level <= 1}
                          onStep={() => tracks.onBump(track, -1)}
                          onHold={() => tracks.onSetLevel(track, 1)}
                        >
                          −
                        </HoldStepButton>
                        <div
                          className={
                            maxed
                              ? 'workshop__uw-col-cost workshop__card-cost--max'
                              : 'workshop__uw-col-cost'
                          }
                          title={
                            maxed
                              ? t('ws_max')
                              : t('guardians_chip_upgrade_cost_title')
                          }
                        >
                          {maxed ? (
                            <>
                              <span>{t('ws_max')}</span>
                              <BitsGlyph className="workshop__uw-bits" />
                            </>
                          ) : (
                            <>
                              <span>{String(nextCost ?? 0)}</span>
                              <BitsGlyph className="workshop__uw-bits" />
                            </>
                          )}
                        </div>
                        <HoldStepButton
                          className="workshop__uw-level-step"
                          ariaLabel={`${label} — ${t('ws_defense_level_up_aria')}`}
                          holdVariant="max"
                          disabled={maxed}
                          onStep={() => tracks.onBump(track, 1)}
                          onHold={() =>
                            tracks.onSetLevel(track, tracks.clampLevel(track, max))
                          }
                        >
                          +
                        </HoldStepButton>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </li>
      </ul>
    </section>
  )
}
