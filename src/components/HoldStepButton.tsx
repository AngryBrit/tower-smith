import type { ReactNode } from 'react'
import { useHoldStepper } from '../hooks/useHoldStepper'
import { useI18n } from '../i18n'

export type HoldStepButtonProps = {
  className?: string
  ariaLabel: string
  /** Tooltip; defaults from holdVariant when omitted. */
  holdTitle?: string
  holdVariant?: 'min' | 'max'
  disabled?: boolean
  onStep: () => void
  onHold: () => void
  children: ReactNode
}

export function HoldStepButton({
  className,
  ariaLabel,
  holdTitle,
  holdVariant,
  disabled = false,
  onStep,
  onHold,
  children,
}: HoldStepButtonProps) {
  const { t } = useI18n()
  const hold = useHoldStepper({
    enabled: !disabled,
    onStep,
    onHold,
  })
  const title =
    holdTitle ??
    (holdVariant === 'min'
      ? t('researchCard_decrease_hold_title')
      : holdVariant === 'max'
        ? t('researchCard_increase_hold_title')
        : undefined)

  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      title={!disabled ? title : undefined}
      disabled={disabled}
      onPointerDown={hold.onPointerDown}
      onPointerUp={hold.onPointerUp}
      onPointerLeave={hold.onPointerLeave}
      onPointerCancel={hold.onPointerCancel}
      onClick={hold.onClick}
    >
      {children}
    </button>
  )
}
