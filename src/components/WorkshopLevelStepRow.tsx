import type { ReactNode } from 'react'
import { HoldStepButton } from './HoldStepButton'

export function WorkshopLevelStepRow({
  level,
  min = 0,
  max,
  downAriaLabel,
  upAriaLabel,
  downDisabled,
  upDisabled,
  onBump,
  onSetLevel,
  children,
}: {
  level: number
  min?: number
  max: number
  downAriaLabel: string
  upAriaLabel: string
  downDisabled?: boolean
  upDisabled?: boolean
  onBump: (direction: -1 | 1) => void
  onSetLevel: (level: number) => void
  children: ReactNode
}) {
  const canDec = downDisabled ?? level <= min
  const canInc = upDisabled ?? level >= max

  return (
    <>
      <HoldStepButton
        className="workshop__level-step"
        ariaLabel={downAriaLabel}
        holdVariant="min"
        disabled={canDec}
        onStep={() => onBump(-1)}
        onHold={() => onSetLevel(min)}
      >
        −
      </HoldStepButton>
      {children}
      <HoldStepButton
        className="workshop__level-step"
        ariaLabel={upAriaLabel}
        holdVariant="max"
        disabled={canInc}
        onStep={() => onBump(1)}
        onHold={() => onSetLevel(max)}
      >
        +
      </HoldStepButton>
    </>
  )
}
