import { GUARDIAN_CHIP_IMAGES } from '../data/guardianChipImages'
import type { GuardianChipId } from '../data/guardianChips'

type GuardianChipIconProps = {
  chipId: GuardianChipId | 'locked'
  className?: string
}

const lockSvgCommon = {
  viewBox: '0 0 64 64',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true as const,
}

export function GuardianChipIcon({ chipId, className }: GuardianChipIconProps) {
  if (chipId === 'locked') {
    return (
      <svg {...lockSvgCommon} className={className}>
        <rect
          x="22"
          y="30"
          width="20"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth={2.5}
        />
        <path
          d="M26 30v-4a6 6 0 0 1 12 0v4"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <circle cx="32" cy="38" r="2" fill="currentColor" />
      </svg>
    )
  }

  const src = GUARDIAN_CHIP_IMAGES[chipId]
  return <img src={src} alt="" className={className} aria-hidden draggable={false} />
}
