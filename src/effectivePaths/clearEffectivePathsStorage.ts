import { clearCachedGoogleSheetsAccessToken } from './googleSheetsOAuth'
import { clearGoogleSheetsOAuthState } from './googleSheetsOAuthState'
import { clearAllEffectivePathsLinkedSpreadsheetCache } from './effectivePathsLinkedSpreadsheetCache'
import { clearPendingEffectivePathsExports } from './effectivePathsPendingExportStorage'
import { clearAllEffectivePathsSpreadsheetRefs } from './effectivePathsStorage'

/** Wipe all Effective Paths data persisted in this browser. */
export function clearAllEffectivePathsStorage(): void {
  clearAllEffectivePathsSpreadsheetRefs()
  clearAllEffectivePathsLinkedSpreadsheetCache()
  clearPendingEffectivePathsExports()
  clearCachedGoogleSheetsAccessToken()
  clearGoogleSheetsOAuthState()
}
