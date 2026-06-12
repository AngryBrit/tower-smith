import { useCallback, useEffect, useRef, useState } from 'react'
import { deferInEffect } from '../deferInEffect'
import type { CompareDialogInit } from '../lab/labToolsTypes'
import { computeBuildCompareSummary, type BuildCompareSummary } from '../buildCompareSummary'
import type { I18nFormatters, StringId } from '../i18n/dictionary'
import { compareLabLevelOverrides, type LabCompareResult } from '../labCompare'
import { readTowerThemesSnapshot } from '../towerDataThemes'
import { readGuardianChipState } from '../guardianChipStorage'
import { serializeTowerUnifiedCsv } from '../towerUnifiedCsv'
import { defaultWorkshopPersisted, type WorkshopPersistedV1 } from '../labPresetsStorage'
import { parseLabLevelsPayload, type ParseLabLevelsError } from '../parseLabLevelsPayload'
import type { ResearchData } from '../types/research'
import { getLevelBounds } from '../types/research'
import {
  compareWorkshopPersisted,
  workshopDiffCount,
  type WorkshopCompareRow,
} from '../workshopCompare'

type TFn = (id: StringId) => string

function parseErrorMessage(t: TFn, err: ParseLabLevelsError): string {
  switch (err) {
    case 'empty':
      return t('sr_compare_parse_empty')
    case 'invalid_csv':
      return t('sr_compare_parse_invalid_csv')
    case 'share_decode_failed':
      return t('sr_compare_parse_share_fail')
    case 'invalid_payload':
      return t('sr_compare_parse_invalid_payload')
    default:
      return t('sr_compare_parse_invalid_payload')
  }
}

function levelCell(
  data: ResearchData,
  si: number,
  ii: number,
  n: number,
  t: TFn,
): string {
  const item = data.sections[si]?.items[ii]
  if (!item) return String(n)
  const max = getLevelBounds(item).max
  if (max > 0 && n >= max) return t('researchCard_max')
  return String(n)
}

function workshopFieldLabel(field: WorkshopCompareRow['field'], t: TFn): string {
  switch (field) {
    case 'damageLevel':
      return t('ws_stat_damage')
    case 'attackSpeedLevel':
      return t('ws_stat_attackSpeed')
    case 'critChanceLevel':
      return t('ws_stat_critChance')
    case 'critFactorLevel':
      return t('ws_stat_critFactor')
    case 'attackRangeLevel':
      return t('ws_stat_attackRange')
    case 'damagePerMeterLevel':
      return t('ws_stat_damagePerMeter')
    case 'multishotChanceLevel':
      return t('ws_stat_multishotChance')
    case 'multishotTargetsLevel':
      return t('ws_stat_multishotTargets')
    case 'rapidFireChanceLevel':
      return t('ws_stat_rapidFireChance')
    case 'rapidFireDurationLevel':
      return t('ws_stat_rapidFireDuration')
    case 'bounceShotChanceLevel':
      return t('ws_stat_bounceChance')
    case 'bounceShotTargetsLevel':
      return t('ws_stat_bounceTargets')
    case 'bounceShotRangeLevel':
      return t('ws_stat_bounceShotRange')
    case 'superCritChanceLevel':
      return t('ws_stat_superCritChance')
    case 'superCritMultLevel':
      return t('ws_stat_superCritMult')
    case 'rendArmorChanceLevel':
      return t('ws_stat_rendArmorChance')
    case 'rendArmorMultLevel':
      return t('ws_stat_rendArmorMult')
    case 'healthLevel':
      return t('ws_stat_defHealth')
    case 'healthRegenLevel':
      return t('ws_stat_defHealthRegen')
    case 'defensePercentLevel':
      return t('ws_stat_defDefensePct')
    case 'defenseAbsoluteLevel':
      return t('ws_stat_defDefenseAbs')
    case 'thornDamageLevel':
      return t('ws_stat_defThornDamage')
    case 'lifestealLevel':
      return t('ws_stat_defLifesteal')
    case 'knockbackChanceLevel':
      return t('ws_stat_defKnockbackChance')
    case 'knockbackForceLevel':
      return t('ws_stat_defKnockbackForce')
    case 'orbSpeedLevel':
      return t('ws_stat_defOrbSpeed')
    case 'orbsLevel':
      return t('ws_stat_defOrbs')
    case 'shockwaveSizeLevel':
      return t('ws_stat_defShockwaveSize')
    case 'shockwaveFrequencyLevel':
      return t('ws_stat_defShockwaveFreq')
    case 'landMineChanceLevel':
      return t('ws_stat_defLandMineChance')
    case 'landMineDamageLevel':
      return t('ws_stat_defLandMineDamage')
    case 'landMineRadiusLevel':
      return t('ws_stat_defLandMineRadius')
    case 'deathDefyLevel':
      return t('ws_stat_defDeathDefy')
    case 'wallHealthLevel':
      return t('ws_stat_defWallHealth')
    case 'wallRebuildLevel':
      return t('ws_stat_defWallRebuild')
    case 'cashBonusLevel':
      return t('ws_stat_utilCashBonus')
    case 'cashPerWaveLevel':
      return t('ws_stat_utilCashPerWave')
    case 'coinsKillBonusLevel':
      return t('ws_stat_utilCoinsKillBonus')
    case 'coinsWaveLevel':
      return t('ws_stat_utilCoinsWave')
    case 'freeAttackUpgradeLevel':
      return t('ws_stat_utilFreeAttackUpgrade')
    case 'freeDefenseUpgradeLevel':
      return t('ws_stat_utilFreeDefenseUpgrade')
    case 'freeUtilityUpgradeLevel':
      return t('ws_stat_utilFreeUtilityUpgrade')
    case 'interestPerWaveLevel':
      return t('ws_stat_utilInterestPerWave')
    case 'recoveryAmountLevel':
      return t('ws_stat_utilRecoveryAmount')
    case 'maxRecoveryLevel':
      return t('ws_stat_utilMaxRecovery')
    case 'packageChanceLevel':
      return t('ws_stat_utilPackageChance')
    case 'enemyAttackLevelSkipLevel':
      return t('ws_stat_utilEnemyAttackLevelSkip')
    case 'enemyHealthLevelSkipLevel':
      return t('ws_stat_utilEnemyHealthLevelSkip')
    case 'enhanceDamageLevel':
      return t('ws_stat_enhanceDamage')
    case 'enhanceRendArmorLevel':
      return t('ws_stat_enhanceRendArmor')
    case 'enhanceCritFactorLevel':
      return t('ws_stat_enhanceCritFactor')
    case 'enhanceDamagePerMeterLevel':
      return t('ws_stat_enhanceDamagePerMeter')
    case 'enhanceSuperCritMultLevel':
      return t('ws_stat_enhanceSuperCritMult')
    case 'enhanceAttackSpeedLevel':
      return t('ws_stat_enhanceAttackSpeed')
    case 'enhanceHealthLevel':
      return t('ws_stat_enhanceHealth')
    case 'enhanceHealthRegenLevel':
      return t('ws_stat_enhanceHealthRegen')
    case 'enhanceDefenseAbsoluteLevel':
      return t('ws_stat_enhanceDefenseAbsolute')
    case 'enhanceLandMineDamageLevel':
      return t('ws_stat_enhanceLandMineDamage')
    case 'enhanceWallHealthLevel':
      return t('ws_stat_enhanceWallHealth')
    case 'enhanceOrbSizeLevel':
      return t('ws_stat_enhanceOrbSize')
    case 'enhanceCashBonusLevel':
      return t('ws_stat_enhanceCashBonus')
    case 'enhanceCoinBonusLevel':
      return t('ws_stat_enhanceCoinBonus')
    case 'enhanceCellsKillBonusLevel':
      return t('ws_stat_enhanceCellsKillBonus')
    case 'enhanceFreeUpgradesLevel':
      return t('ws_stat_enhanceFreeUpgrades')
    case 'enhanceRecoveryPackageLevel':
      return t('ws_stat_enhanceRecoveryPackage')
    case 'enhanceEnemyLevelSkipLevel':
      return t('ws_stat_enhanceEnemyLevelSkip')
    case 'hideMaxed':
      return t('sr_ws_field_hide_maxed')
    case 'mainTab':
      return t('sr_ws_field_main_tab')
    case 'category':
      return t('sr_ws_field_category')
    case 'multiplier':
      return t('sr_ws_field_multiplier')
    default:
      return field
  }
}

type CompareOutcome = {
  lab: LabCompareResult
  workshopRows: WorkshopCompareRow[]
  summary: BuildCompareSummary
}

export function LabCompareDialog({
  data,
  open,
  onClose,
  currentOverrides,
  currentWorkshop,
  currentGameResearchLevel,
  initialCompare = null,
  t,
  fmt,
}: {
  data: ResearchData
  open: boolean
  onClose: () => void
  currentOverrides: Record<string, number>
  currentWorkshop: WorkshopPersistedV1
  currentGameResearchLevel?: number[]
  initialCompare?: CompareDialogInit | null
  t: TFn
  fmt: I18nFormatters
}) {
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')
  const [sideLabelA, setSideLabelA] = useState<string | null>(null)
  const [sideLabelB, setSideLabelB] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [errorA, setErrorA] = useState<string | null>(null)
  const [errorB, setErrorB] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<CompareOutcome | null>(null)
  const initAppliedRef = useRef(false)
  const pendingAutoRunRef = useRef(false)

  const currentCsv = useCallback(
    () =>
      serializeTowerUnifiedCsv(
        currentOverrides,
        currentWorkshop,
        undefined,
        readTowerThemesSnapshot(),
        readGuardianChipState(),
        currentGameResearchLevel,
      ),
    [currentGameResearchLevel, currentOverrides, currentWorkshop],
  )

  const fillCurrentCsv = useCallback(
    (side: 'a' | 'b') => {
      const csv = currentCsv()
      if (side === 'a') {
        setTextA(csv)
        setErrorA(null)
      } else {
        setTextB(csv)
        setErrorB(null)
      }
      setOutcome(null)
    },
    [currentCsv],
  )

  const runCompare = useCallback(async () => {
    setOutcome(null)
    setErrorA(null)
    setErrorB(null)
    setBusy(true)
    try {
      const [pa, pb] = await Promise.all([
        parseLabLevelsPayload(textA, data),
        parseLabLevelsPayload(textB, data),
      ])
      if (!pa.ok) {
        setErrorA(parseErrorMessage(t, pa.error))
        return
      }
      if (!pb.ok) {
        setErrorB(parseErrorMessage(t, pb.error))
        return
      }
      const lab = compareLabLevelOverrides(data, pa.overrides, pb.overrides)
      const wsA = pa.workshop ?? defaultWorkshopPersisted()
      const wsB = pb.workshop ?? defaultWorkshopPersisted()
      const workshopRows = compareWorkshopPersisted(wsA, wsB)
      const summary = computeBuildCompareSummary(
        data,
        pa.overrides,
        wsA,
        pb.overrides,
        wsB,
        pa.themes,
        pb.themes,
      )
      setOutcome({ lab, workshopRows, summary })
    } finally {
      setBusy(false)
    }
  }, [data, textA, textB, t])

  useEffect(() => {
    if (!open) {
      initAppliedRef.current = false
      pendingAutoRunRef.current = false
      return
    }
    if (initAppliedRef.current || !initialCompare) return
    initAppliedRef.current = true
    const compare = initialCompare
    const fillCurrentA = compare.fillCurrentA ? currentCsv() : null
    deferInEffect(() => {
      setErrorA(null)
      setErrorB(null)
      setOutcome(null)
      setSideLabelA(compare.labelA ?? null)
      setSideLabelB(compare.labelB ?? null)
      if (fillCurrentA != null) setTextA(fillCurrentA)
      setTextB(compare.textB)
      pendingAutoRunRef.current = compare.autoRun === true
    })
  }, [open, initialCompare, currentCsv])

  useEffect(() => {
    if (!open || !pendingAutoRunRef.current || busy) return
    if (!textB.trim()) return
    if (initialCompare?.fillCurrentA && !textA.trim()) return
    pendingAutoRunRef.current = false
    deferInEffect(() => {
      void runCompare()
    })
  }, [open, textA, textB, busy, initialCompare, runCompare])

  const clearAll = useCallback(() => {
    setTextA('')
    setTextB('')
    setSideLabelA(null)
    setSideLabelB(null)
    setErrorA(null)
    setErrorB(null)
    setOutcome(null)
  }, [])

  if (!open) return null

  const result = outcome?.lab
  const workshopRows = outcome?.workshopRows
  const summary = outcome?.summary
  const wsDiffering = workshopRows ? workshopDiffCount(workshopRows) : 0
  const buildALabel = sideLabelA ?? t('sr_compare_build_a')
  const buildBLabel = sideLabelB ?? t('sr_compare_build_b')

  return (
    <div
      className="select-research__lab-data-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        id="lab-compare-dialog"
        className="select-research__compare-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lab-compare-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="lab-compare-title" className="select-research__lab-data-title">
          {t('sr_compare_title')}
        </h2>
        <p className="select-research__lab-data-intro">{t('sr_compare_intro')}</p>

        <div className="select-research__compare-grid">
          <div className="select-research__compare-col">
            <p className="select-research__compare-col-label">{buildALabel}</p>
            <textarea
              className="select-research__compare-textarea glow-input"
              value={textA}
              onChange={(e) => {
                setTextA(e.target.value)
                setErrorA(null)
                setOutcome(null)
              }}
              spellCheck={false}
              autoComplete="off"
              aria-invalid={errorA != null}
              aria-describedby={errorA ? 'lab-compare-err-a' : undefined}
              placeholder={t('sr_compare_placeholder')}
              rows={6}
            />
            {errorA ? (
              <p id="lab-compare-err-a" className="select-research__compare-field-error" role="alert">
                {errorA}
              </p>
            ) : null}
            <button
              type="button"
              className="glow-btn glow-btn--block select-research__compare-insert"
              onClick={() => fillCurrentCsv('a')}
            >
              {t('sr_compare_use_current')}
            </button>
          </div>
          <div className="select-research__compare-col">
            <p className="select-research__compare-col-label">{buildBLabel}</p>
            <textarea
              className="select-research__compare-textarea glow-input"
              value={textB}
              onChange={(e) => {
                setTextB(e.target.value)
                setErrorB(null)
                setOutcome(null)
              }}
              spellCheck={false}
              autoComplete="off"
              aria-invalid={errorB != null}
              aria-describedby={errorB ? 'lab-compare-err-b' : undefined}
              placeholder={t('sr_compare_placeholder')}
              rows={6}
            />
            {errorB ? (
              <p id="lab-compare-err-b" className="select-research__compare-field-error" role="alert">
                {errorB}
              </p>
            ) : null}
            <button
              type="button"
              className="glow-btn glow-btn--block select-research__compare-insert"
              onClick={() => fillCurrentCsv('b')}
            >
              {t('sr_compare_use_current')}
            </button>
          </div>
        </div>

        <div className="select-research__compare-actions">
          <button
            type="button"
            className="glow-btn glow-btn--block"
            disabled={busy}
            onClick={() => void runCompare()}
          >
            {busy ? t('sr_compare_busy') : t('sr_compare_run')}
          </button>
          <button type="button" className="glow-btn glow-btn--block" onClick={clearAll}>
            {t('sr_compare_clear')}
          </button>
        </div>

        {result && workshopRows && summary ? (
          <div className="select-research__compare-result" role="region" aria-live="polite">
            <h3 className="select-research__compare-diff-head">{t('sr_compare_highlights_title')}</h3>
            <dl className="select-research__compare-summary">
              <div className="select-research__compare-summary-row">
                <dt>{t('sr_compare_displayed_damage_a')}</dt>
                <dd>{summary.displayedDamageALabel}</dd>
              </div>
              <div className="select-research__compare-summary-row">
                <dt>{t('sr_compare_displayed_damage_b')}</dt>
                <dd>{summary.displayedDamageBLabel}</dd>
              </div>
              <div className="select-research__compare-summary-row">
                <dt>{t('sr_compare_displayed_damage_delta')}</dt>
                <dd>{summary.displayedDamageDeltaLabel}</dd>
              </div>
              <div className="select-research__compare-summary-row">
                <dt>{t('sr_compare_spent_a')}</dt>
                <dd>{result.spentALabel}</dd>
              </div>
              <div className="select-research__compare-summary-row">
                <dt>{t('sr_compare_spent_b')}</dt>
                <dd>{result.spentBLabel}</dd>
              </div>
              <div className="select-research__compare-summary-row">
                <dt>{t('sr_compare_coin_delta')}</dt>
                <dd>{result.coinDeltaLabel}</dd>
              </div>
              <div className="select-research__compare-summary-row">
                <dt>{t('sr_compare_ws_spent_a')}</dt>
                <dd>{summary.workshopSpentALabel}</dd>
              </div>
              <div className="select-research__compare-summary-row">
                <dt>{t('sr_compare_ws_spent_b')}</dt>
                <dd>{summary.workshopSpentBLabel}</dd>
              </div>
              <div className="select-research__compare-summary-row">
                <dt>{t('sr_compare_ws_coin_delta')}</dt>
                <dd>{summary.workshopCoinDeltaLabel}</dd>
              </div>
            </dl>
            {summary.topLabDiffs.length > 0 ? (
              <>
                <p className="select-research__compare-diff-head select-research__compare-diff-head--spaced">
                  {t('sr_compare_top_lab_diffs')}
                </p>
                <div className="select-research__compare-table-wrap">
                  <table className="select-research__compare-table">
                    <thead>
                      <tr>
                        <th scope="col">{t('sr_compare_table_lab')}</th>
                        <th scope="col">{buildALabel}</th>
                        <th scope="col">{buildBLabel}</th>
                        <th scope="col">{t('sr_compare_table_delta')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.topLabDiffs.map((row) => {
                        const d = row.levelB - row.levelA
                        const dStr = d > 0 ? `+${d}` : String(d)
                        return (
                          <tr key={`top-${row.sectionIndex}-${row.itemIndex}`}>
                            <td>{row.name}</td>
                            <td>{levelCell(data, row.sectionIndex, row.itemIndex, row.levelA, t)}</td>
                            <td>{levelCell(data, row.sectionIndex, row.itemIndex, row.levelB, t)}</td>
                            <td>{dStr}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
            {summary.relicsOnlyA.length > 0 || summary.relicsOnlyB.length > 0 ? (
              <>
                <p className="select-research__compare-diff-head select-research__compare-diff-head--spaced">
                  {t('sr_compare_relic_diff_title')}
                </p>
                {summary.relicsOnlyA.length > 0 ? (
                  <p className="select-research__compare-ws-summary">
                    {fmt.compareRelicsOnlySide(buildALabel, summary.relicsOnlyA.length)}
                  </p>
                ) : null}
                {summary.relicsOnlyB.length > 0 ? (
                  <p className="select-research__compare-ws-summary">
                    {fmt.compareRelicsOnlySide(buildBLabel, summary.relicsOnlyB.length)}
                  </p>
                ) : null}
              </>
            ) : null}
            {summary.themesOnlyA.length > 0 || summary.themesOnlyB.length > 0 ? (
              <>
                <p className="select-research__compare-diff-head select-research__compare-diff-head--spaced">
                  {t('sr_compare_theme_diff_title')}
                </p>
                {summary.themesOnlyA.length > 0 ? (
                  <p className="select-research__compare-ws-summary">
                    {fmt.compareThemesOnlySide(buildALabel, summary.themesOnlyA.length)}
                  </p>
                ) : null}
                {summary.themesOnlyB.length > 0 ? (
                  <p className="select-research__compare-ws-summary">
                    {fmt.compareThemesOnlySide(buildBLabel, summary.themesOnlyB.length)}
                  </p>
                ) : null}
              </>
            ) : null}
            <p className="select-research__compare-diff-head select-research__compare-diff-head--spaced">
              {fmt.compareDifferingLabsCount(result.differingCount)}
            </p>
            {result.differingCount > 0 ? (
              <div className="select-research__compare-table-wrap">
                <table className="select-research__compare-table">
                  <thead>
                    <tr>
                      <th scope="col">{t('sr_compare_table_section')}</th>
                      <th scope="col">{t('sr_compare_table_lab')}</th>
                      <th scope="col">{t('sr_compare_table_lv_a')}</th>
                      <th scope="col">{t('sr_compare_table_lv_b')}</th>
                      <th scope="col">{t('sr_compare_table_delta')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.diffRows.map((row) => {
                      const d = row.levelB - row.levelA
                      const dStr = d > 0 ? `+${d}` : String(d)
                      return (
                        <tr key={`${row.sectionIndex}-${row.itemIndex}`}>
                          <td>{row.sectionTitle}</td>
                          <td>{row.name}</td>
                          <td>{levelCell(data, row.sectionIndex, row.itemIndex, row.levelA, t)}</td>
                          <td>{levelCell(data, row.sectionIndex, row.itemIndex, row.levelB, t)}</td>
                          <td>{dStr}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
            <p className="select-research__compare-diff-head select-research__compare-diff-head--spaced">
              {t('sr_compare_ws_title')}
            </p>
            <p className="select-research__compare-ws-summary">
              {wsDiffering === 0
                ? t('sr_compare_ws_identical')
                : fmt.compareDifferingWorkshopFields(wsDiffering)}
            </p>
            {wsDiffering > 0 ? (
              <div className="select-research__compare-table-wrap">
                <table className="select-research__compare-table">
                  <thead>
                    <tr>
                      <th scope="col">{t('sr_compare_ws_col_field')}</th>
                      <th scope="col">{t('sr_compare_table_lv_a')}</th>
                      <th scope="col">{t('sr_compare_table_lv_b')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workshopRows
                      .filter((r) => r.differs)
                      .map((row) => (
                        <tr key={row.field}>
                          <td>{workshopFieldLabel(row.field, t)}</td>
                          <td>{row.valueA}</td>
                          <td>{row.valueB}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            <p className="select-research__compare-footnote">{t('sr_compare_footnote')}</p>
          </div>
        ) : null}

        <button type="button" className="glow-btn glow-btn--block select-research__lab-data-close" onClick={onClose}>
          {t('sr_close')}
        </button>
      </div>
    </div>
  )
}
