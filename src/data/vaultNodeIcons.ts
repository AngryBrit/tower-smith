/**
 * Vault node icon resolution. Icons live under `public/vault/` and default to
 * `<iconId>.png`. Drop files there (named per the node `iconId`) and they appear
 * automatically; until then `VaultNodeIcon` shows a text fallback.
 *
 * Use `VAULT_ICON_OVERRIDES` only when a file name differs from `<iconId>.png`
 * (for example a `.webp` asset).
 */
const base = import.meta.env.BASE_URL

/** iconId -> filename under public/vault/ (when it differs from `<iconId>.png`). */
export const VAULT_ICON_OVERRIDES: Readonly<Record<string, string>> = {}

export function vaultIconSrc(iconId: string): string {
  const file = VAULT_ICON_OVERRIDES[iconId] ?? `${iconId}.png`
  return `${base}vault/${file}`
}
