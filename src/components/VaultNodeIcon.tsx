import { useState } from 'react'
import { vaultIconSrc } from '../data/vaultNodeIcons'

type VaultNodeIconProps = {
  iconId: string
  /** Shown when the icon asset is missing (e.g. the node's value label). */
  fallback?: string
  className?: string
}

/**
 * Renders the node's icon from `public/vault/`. Falls back to short text when the
 * asset has not been added yet, so the tree is fully usable before icons land.
 */
export function VaultNodeIcon({ iconId, fallback, className }: VaultNodeIconProps) {
  // Track the icon that failed to load; resets automatically when iconId changes.
  const [erroredIcon, setErroredIcon] = useState<string | null>(null)

  if (erroredIcon === iconId) {
    return (
      <span className={`vault-node__icon-fallback${className ? ` ${className}` : ''}`} aria-hidden>
        {fallback || '?'}
      </span>
    )
  }

  return (
    <img
      src={vaultIconSrc(iconId)}
      alt=""
      aria-hidden
      draggable={false}
      className={className}
      onError={() => setErroredIcon(iconId)}
    />
  )
}
