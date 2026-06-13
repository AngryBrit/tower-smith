export const ACCOUNT_WORKSPACE_LOCAL_UPDATED_AT_KEY =
  'tower-export-account-workspace-updated-at-v1'

export function readLocalAccountWorkspaceUpdatedAt(): string | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_WORKSPACE_LOCAL_UPDATED_AT_KEY)?.trim()
    return raw && raw.length > 0 ? raw : null
  } catch {
    return null
  }
}

export function writeLocalAccountWorkspaceUpdatedAt(updatedAt: string): void {
  try {
    localStorage.setItem(ACCOUNT_WORKSPACE_LOCAL_UPDATED_AT_KEY, updatedAt)
  } catch {
    /* quota / private mode */
  }
}

export function touchLocalAccountWorkspaceUpdatedAt(now: string = new Date().toISOString()): void {
  writeLocalAccountWorkspaceUpdatedAt(now)
}
