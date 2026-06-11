import { useSimulatedProgress } from '../hooks/useSimulatedProgress'

export type EffectivePathsWorkbooksLoadingProgressProps = {
  label: string
  active: boolean
  /** When set, drives the bar directly (e.g. workbook load steps). */
  percent?: number
  /** Advance the bar while active when no real progress is available. */
  simulate?: boolean
}

export function EffectivePathsWorkbooksLoadingProgress({
  label,
  active,
  percent,
  simulate = false,
}: EffectivePathsWorkbooksLoadingProgressProps) {
  const simulatedPercent = useSimulatedProgress(active && simulate)
  const resolvedPercent = simulate ? simulatedPercent : (percent ?? 0)

  if (!active) return null

  const clamped = Math.max(0, Math.min(100, Math.round(resolvedPercent)))

  return (
    <div
      className="select-research__lab-data-import-progress effective-paths-export-dialog__load-progress"
      role="status"
      aria-live="polite"
    >
      <p className="select-research__lab-data-import-progress-label">{label}</p>
      <div
        className="select-research__lab-data-import-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={label}
      >
        <div
          className="select-research__lab-data-import-progress-fill"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
