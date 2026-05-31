/** Typical The Tower playerInfo.dat saves are under 100 KB. */
export const PLAYER_INFO_MAX_BYTES = 200 * 1024

export type PlayerInfoSizeError = 'empty' | 'too_large'

/** Returns a size error code, or null if the byte length is acceptable. */
export function validatePlayerInfoSize(byteLength: number): PlayerInfoSizeError | null {
  if (byteLength === 0) return 'empty'
  if (byteLength > PLAYER_INFO_MAX_BYTES) return 'too_large'
  return null
}
