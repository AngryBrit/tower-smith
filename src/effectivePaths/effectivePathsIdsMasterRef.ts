export const EFFECTIVE_PATHS_IDS_MASTER_REF_MAX_LEN = 500

export function normalizeEffectivePathsIdsMasterRef(value: string): string {
  return value.trim().slice(0, EFFECTIVE_PATHS_IDS_MASTER_REF_MAX_LEN)
}
