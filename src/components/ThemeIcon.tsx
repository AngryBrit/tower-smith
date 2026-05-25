import { useId } from 'react'
import type { ThemeIconKey } from '../data/gameThemes'

type ThemeIconProps = {
  icon: ThemeIconKey
  className?: string
}

/** Neon-style glyph per theme id (no game asset files required). */
export function ThemeIcon({ icon, className }: ThemeIconProps) {
  const uid = useId().replace(/:/g, '')
  const cls = className ? `theme-icon ${className}` : 'theme-icon'
  const common = { className: cls, viewBox: '0 0 64 64', role: 'img', 'aria-hidden': true }

  switch (icon) {
    case 'default':
      return (
        <svg {...common}>
          <polygon
            points="32,10 52,22 52,42 32,54 12,42 12,22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        </svg>
      )
    case 'plasma-ball': {
      const gradId = `plasma-${uid}`
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="18" fill={`url(#${gradId})`} />
          <path
            d="M22 28c4-6 10-8 10-8s2 8 8 10M42 36c-4 6-10 8-10 8s-2-8-8-10"
            fill="none"
            stroke="#e879f9"
            strokeWidth="2"
          />
          <defs>
            <radialGradient id={gradId}>
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="55%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </radialGradient>
          </defs>
        </svg>
      )
    }
    case 'north-spirit':
      return (
        <svg {...common}>
          <ellipse cx="32" cy="34" rx="20" ry="14" fill="currentColor" opacity="0.35" />
          <path
            d="M18 38c6-14 14-20 14-20s4 12 14 14c-8 2-12 10-12 10s-4-2-8-4z"
            fill="currentColor"
          />
        </svg>
      )
    case 'alien':
      return (
        <svg {...common}>
          <ellipse cx="32" cy="36" rx="14" ry="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <ellipse cx="26" cy="32" rx="3" ry="4" fill="currentColor" />
          <ellipse cx="38" cy="32" rx="3" ry="4" fill="currentColor" />
          <path d="M20 18 L26 24 M44 18 L38 24" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'water-droplet':
      return (
        <svg {...common}>
          <path
            d="M32 12c10 14 18 22 18 30a18 18 0 1 1-36 0c0-8 8-16 18-30z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        </svg>
      )
    case 'cherry-blossom':
      return (
        <svg {...common}>
          {[0, 72, 144, 216].map((rot) => (
            <ellipse
              key={rot}
              cx="32"
              cy="22"
              rx="8"
              ry="12"
              fill="currentColor"
              opacity="0.85"
              transform={`rotate(${rot} 32 32)`}
            />
          ))}
          <circle cx="32" cy="32" r="5" fill="#fda4af" />
        </svg>
      )
    case 'shuriken':
      return (
        <svg {...common}>
          <polygon
            points="32,8 40,28 56,32 40,36 32,56 24,36 8,32 24,28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        </svg>
      )
    case 'donut':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" strokeWidth="8" />
          <circle cx="24" cy="26" r="2" fill="#f472b6" />
          <circle cx="38" cy="24" r="2" fill="#34d399" />
          <circle cx="36" cy="38" r="2" fill="#fbbf24" />
        </svg>
      )
    case 'yin-yang':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path d="M32 12a20 20 0 0 1 0 40 10 10 0 0 0 0-20 10 10 0 0 1 0-20z" fill="currentColor" />
          <circle cx="32" cy="22" r="3" fill="var(--sr-bg, #0b1220)" />
          <circle cx="32" cy="42" r="3" fill="currentColor" />
        </svg>
      )
    case 'smile':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="24" cy="28" r="2.5" fill="currentColor" />
          <circle cx="40" cy="28" r="2.5" fill="currentColor" />
          <path d="M22 38 Q32 48 42 38" fill="none" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      )
    case 'butterfly':
      return (
        <svg {...common}>
          <ellipse cx="22" cy="28" rx="12" ry="16" fill="currentColor" opacity="0.7" />
          <ellipse cx="42" cy="28" rx="12" ry="16" fill="currentColor" opacity="0.7" />
          <rect x="30" y="18" width="4" height="28" rx="2" fill="currentColor" />
        </svg>
      )
    case 'sheep':
      return (
        <svg {...common}>
          <circle cx="28" cy="30" r="10" fill="currentColor" opacity="0.9" />
          <circle cx="38" cy="28" r="9" fill="currentColor" opacity="0.85" />
          <circle cx="34" cy="36" r="8" fill="currentColor" opacity="0.8" />
          <ellipse cx="46" cy="38" rx="6" ry="4" fill="currentColor" />
        </svg>
      )
    case 'fried-egg':
      return (
        <svg {...common}>
          <ellipse cx="32" cy="38" rx="22" ry="14" fill="currentColor" opacity="0.5" />
          <circle cx="32" cy="30" r="10" fill="#fbbf24" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'turtle':
      return (
        <svg {...common}>
          <ellipse cx="32" cy="34" rx="18" ry="12" fill="currentColor" opacity="0.6" />
          <circle cx="48" cy="34" r="6" fill="currentColor" />
        </svg>
      )
    case 'cheese':
      return (
        <svg {...common}>
          <path
            d="M14 44 L32 14 L50 44 Z"
            fill="currentColor"
            opacity="0.75"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="28" cy="34" r="3" fill="var(--sr-bg, #0b1220)" />
          <circle cx="38" cy="38" r="2.5" fill="var(--sr-bg, #0b1220)" />
        </svg>
      )
    case 'skull':
      return (
        <svg {...common}>
          <circle cx="32" cy="28" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <rect x="22" y="40" width="20" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="26" cy="26" r="3" fill="currentColor" />
          <circle cx="38" cy="26" r="3" fill="currentColor" />
        </svg>
      )
    case 'creepy-clown':
      return (
        <svg {...common}>
          <circle cx="32" cy="30" r="14" fill="none" stroke="#f87171" strokeWidth="2.5" />
          <path d="M24 38 Q32 46 40 38" stroke="#f87171" strokeWidth="2" fill="none" />
          <circle cx="26" cy="28" r="2" fill="#f87171" />
          <circle cx="38" cy="28" r="2" fill="#f87171" />
        </svg>
      )
    case 'tech-tree':
      return (
        <svg {...common}>
          <rect x="28" y="40" width="8" height="14" fill="currentColor" />
          <circle cx="32" cy="28" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="32" cy="28" r="4" fill="currentColor" />
        </svg>
      )
    case 'cactus':
      return (
        <svg {...common}>
          <rect x="28" y="22" width="8" height="28" rx="3" fill="#34d399" />
          <rect x="18" y="30" width="8" height="14" rx="3" fill="#34d399" />
          <rect x="38" y="26" width="8" height="16" rx="3" fill="#34d399" />
        </svg>
      )
    case 'rhino':
      return (
        <svg {...common}>
          <ellipse cx="30" cy="34" rx="16" ry="12" fill="currentColor" opacity="0.7" />
          <path d="M44 30 L54 26 L52 36 Z" fill="currentColor" />
        </svg>
      )
    case 'atomic':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="6" fill="currentColor" />
          <ellipse cx="32" cy="32" rx="22" ry="8" fill="none" stroke="currentColor" strokeWidth="2" />
          <ellipse
            cx="32"
            cy="32"
            rx="22"
            ry="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            transform="rotate(60 32 32)"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="22"
            ry="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            transform="rotate(120 32 32)"
          />
        </svg>
      )
    case 'eclipse':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="20" fill="currentColor" opacity="0.25" />
          <circle cx="38" cy="28" r="18" fill="var(--sr-bg, #0b1220)" />
        </svg>
      )
    case 'aurora':
      return (
        <svg {...common}>
          <path
            d="M8 40 Q20 20 32 36 T56 28"
            fill="none"
            stroke="#34d399"
            strokeWidth="3"
          />
          <path d="M10 44 Q24 26 34 40 T58 34" fill="none" stroke="#22d3ee" strokeWidth="2" />
        </svg>
      )
    case 'sakura':
      return <ThemeIcon icon="cherry-blossom" className={className} />
    case 'retrowave':
      return (
        <svg {...common}>
          <path d="M8 48 L56 48" stroke="#f472b6" strokeWidth="2" />
          <path d="M12 48 L32 20 L52 48" fill="none" stroke="#a78bfa" strokeWidth="2" />
          <circle cx="48" cy="16" r="6" fill="#fbbf24" />
        </svg>
      )
    case 'matrix':
      return (
        <svg {...common}>
          {[14, 26, 38, 50].map((x) => (
            <text key={x} x={x} y="44" fill="#4ade80" fontSize="14" fontFamily="monospace">
              01
            </text>
          ))}
        </svg>
      )
    case 'volcano':
      return (
        <svg {...common}>
          <path d="M16 48 L32 16 L48 48 Z" fill="#f97316" opacity="0.8" />
          <ellipse cx="32" cy="20" rx="6" ry="8" fill="#fde047" opacity="0.9" />
        </svg>
      )
    case 'interstellar':
      return (
        <svg {...common}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle
              key={i}
              cx={12 + i * 9}
              cy={16 + (i % 3) * 12}
              r="1.5"
              fill="currentColor"
              opacity={0.4 + (i % 3) * 0.2}
            />
          ))}
        </svg>
      )
    case 'ocean-night':
      return (
        <svg {...common}>
          <rect x="0" y="36" width="64" height="28" fill="#1d4ed8" opacity="0.5" />
          <path d="M0 36 Q16 28 32 36 T64 32 L64 64 L0 64 Z" fill="#22d3ee" opacity="0.35" />
        </svg>
      )
    case 'haunted-house':
      return (
        <svg {...common}>
          <path d="M20 48 L20 28 L32 18 L44 28 L44 48 Z" fill="none" stroke="#a78bfa" strokeWidth="2" />
          <rect x="28" y="34" width="8" height="14" fill="#a78bfa" opacity="0.5" />
        </svg>
      )
    case 'new-years':
      return (
        <svg {...common}>
          <text x="14" y="40" fill="currentColor" fontSize="18" fontWeight="700">
            26
          </text>
        </svg>
      )
    case 'arcade':
      return (
        <svg {...common}>
          <rect x="14" y="18" width="36" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="24" cy="42" r="4" fill="#f472b6" />
          <circle cx="40" cy="42" r="4" fill="#22d3ee" />
        </svg>
      )
    case 'snowstorm':
      return (
        <svg {...common}>
          {[
            [20, 22],
            [32, 30],
            [44, 18],
            [28, 40],
            [40, 44],
          ].map(([cx, cy]) => (
            <text key={`${cx}-${cy}`} x={cx} y={cy} fill="currentColor" fontSize="12">
              ❄
            </text>
          ))}
        </svg>
      )
    case 'music-note':
      return (
        <svg {...common}>
          <ellipse cx="24" cy="44" rx="8" ry="6" fill="currentColor" />
          <rect x="30" y="16" width="4" height="30" fill="currentColor" />
          <path d="M34 16 Q48 12 48 26 L34 26" fill="currentColor" />
        </svg>
      )
    case 'music-calm':
      return (
        <svg {...common}>
          <path d="M12 40 Q20 28 28 40 T44 32" fill="none" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      )
    case 'music-intense':
      return (
        <svg {...common}>
          <rect x="14" y="28" width="6" height="20" fill="currentColor" />
          <rect x="24" y="18" width="6" height="30" fill="currentColor" />
          <rect x="34" y="24" width="6" height="24" fill="currentColor" />
          <rect x="44" y="14" width="6" height="34" fill="currentColor" />
        </svg>
      )
    case 'menu-dark-being':
      return (
        <svg {...common}>
          <ellipse cx="32" cy="22" rx="10" ry="12" fill="currentColor" opacity="0.35" />
          <path
            d="M20 44c4-12 8-16 12-16s8 4 12 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <circle cx="28" cy="20" r="2" fill="#a78bfa" />
          <circle cx="36" cy="20" r="2" fill="#a78bfa" />
        </svg>
      )
    case 'menu-mech':
      return (
        <svg {...common}>
          <rect x="18" y="22" width="28" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="26" cy="32" r="4" fill="#22d3ee" />
          <circle cx="38" cy="32" r="4" fill="#22d3ee" />
        </svg>
      )
    case 'menu-party':
      return (
        <svg {...common}>
          <path d="M20 44 L24 24 L32 36 L40 20 L44 44 Z" fill="#f472b6" opacity="0.85" />
        </svg>
      )
    case 'menu-pixel':
      return (
        <svg {...common}>
          <rect x="18" y="18" width="8" height="8" fill="#4ade80" />
          <rect x="28" y="18" width="8" height="8" fill="#4ade80" />
          <rect x="38" y="18" width="8" height="8" fill="#4ade80" />
          <rect x="22" y="28" width="20" height="16" fill="#22d3ee" />
        </svg>
      )
    case 'menu-horror':
      return <ThemeIcon icon="haunted-house" className={className} />
    case 'menu-cosmos':
      return <ThemeIcon icon="interstellar" className={className} />
    case 'menu-supernova':
      return <ThemeIcon icon="plasma-ball" className={className} />
    case 'menu-crown':
      return (
        <svg {...common}>
          <path
            d="M16 40 L20 24 L28 32 L32 18 L36 32 L44 24 L48 40 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <rect x="16" y="40" width="32" height="6" rx="1" fill="currentColor" opacity="0.85" />
        </svg>
      )
    case 'menu-claw':
      return (
        <svg {...common}>
          <rect x="14" y="20" width="36" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M28 20 L28 12 M36 20 L36 10 M44 20 L44 12" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'menu-magician':
      return (
        <svg {...common}>
          <ellipse cx="32" cy="22" rx="14" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="22" y="22" width="20" height="8" rx="1" fill="currentColor" opacity="0.85" />
          <path d="M46 44 L52 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="54" cy="16" r="3" fill="currentColor" opacity="0.9" />
        </svg>
      )
    case 'guardian':
      return (
        <svg {...common}>
          <circle cx="32" cy="24" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path
            d="M18 46c3-10 7-14 14-14s11 4 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path
            d="M24 18 L28 12 M40 18 L36 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      )
    case 'mush-mush':
      return (
        <svg {...common}>
          <ellipse cx="26" cy="36" rx="10" ry="6" fill="#a16207" opacity="0.7" />
          <ellipse cx="38" cy="32" rx="12" ry="8" fill="#84cc16" opacity="0.85" />
          <ellipse cx="32" cy="28" rx="8" ry="10" fill="#65a30d" />
        </svg>
      )
    case 'cat':
      return (
        <svg {...common}>
          <path
            d="M22 22 L18 14 M42 22 L46 14 M28 38 Q32 44 36 38"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="32" cy="30" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      )
    case 'panda':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="14" fill="currentColor" opacity="0.85" />
          <circle cx="26" cy="28" r="4" fill="#0f172a" />
          <circle cx="38" cy="28" r="4" fill="#0f172a" />
          <ellipse cx="32" cy="38" rx="5" ry="3" fill="#0f172a" />
        </svg>
      )
    case 'dragon':
      return (
        <svg {...common}>
          <path
            d="M16 40 Q24 20 32 28 T48 24 L44 36 Q32 42 24 40 Z"
            fill="currentColor"
            opacity="0.75"
          />
          <circle cx="44" cy="22" r="3" fill="#f87171" />
        </svg>
      )
    case 'cyber':
      return (
        <svg {...common}>
          <rect x="18" y="22" width="28" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M22 32 L30 32 M34 28 L42 28" stroke="#22d3ee" strokeWidth="2" />
          <circle cx="26" cy="28" r="3" fill="#22d3ee" />
          <circle cx="38" cy="36" r="3" fill="#22d3ee" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <polygon
            points="32,10 52,22 52,42 32,54 12,42 12,22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        </svg>
      )
  }
}
