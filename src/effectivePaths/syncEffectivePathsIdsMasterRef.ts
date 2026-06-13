import { updateUserEffectivePathsIdsMasterRef } from '../profile/profileApi'
import {
  migrateLegacySpreadsheetRef,
  readStoredSpreadsheetRef,
  writeStoredSpreadsheetRef,
} from './effectivePathsStorage'
import { normalizeEffectivePathsIdsMasterRef } from './effectivePathsIdsMasterRef'

const PROFILE_SAVE_DEBOUNCE_MS = 500

const profileSaveTimers = new Map<string, ReturnType<typeof setTimeout>>()

/** Signed-in profile is source of truth when set; otherwise upload local storage. */
export async function syncEffectivePathsIdsMasterRefOnLogin(
  userId: string,
  profileRef: string | null | undefined,
): Promise<boolean> {
  migrateLegacySpreadsheetRef(userId)

  const fromProfile = normalizeEffectivePathsIdsMasterRef(profileRef ?? '')
  const local = readStoredSpreadsheetRef(userId)?.trim() ?? ''

  if (fromProfile) {
    if (local !== fromProfile) {
      writeStoredSpreadsheetRef(fromProfile, userId)
      return true
    }
    return false
  }

  if (!local) return false

  await updateUserEffectivePathsIdsMasterRef(userId, local)
  return true
}

/** One-time migration from legacy workspace backup blobs still stored in Supabase Storage. */
export async function migrateIdsMasterRefFromWorkspaceBackup(
  userId: string,
  workspaceBackupRef?: string | null,
): Promise<boolean> {
  migrateLegacySpreadsheetRef(userId)
  if (readStoredSpreadsheetRef(userId)?.trim()) return false

  const fromBackup = normalizeEffectivePathsIdsMasterRef(workspaceBackupRef ?? '')
  if (!fromBackup) return false

  writeStoredSpreadsheetRef(fromBackup, userId)
  await updateUserEffectivePathsIdsMasterRef(userId, fromBackup)
  return true
}

export function schedulePersistEffectivePathsIdsMasterRefToProfile(
  userId: string,
  value: string,
): void {
  const existing = profileSaveTimers.get(userId)
  if (existing) clearTimeout(existing)

  profileSaveTimers.set(
    userId,
    setTimeout(() => {
      profileSaveTimers.delete(userId)
      void updateUserEffectivePathsIdsMasterRef(userId, value)
    }, PROFILE_SAVE_DEBOUNCE_MS),
  )
}

/** Write IDS Master ref to local storage and Supabase profile (when signed in). */
export async function persistEffectivePathsIdsMasterRef(
  userId: string | null | undefined,
  value: string,
): Promise<
  | { ok: true }
  | { ok: false; error: 'not_configured' | 'invalid_effective_paths_ids_master_ref' | 'network' }
> {
  writeStoredSpreadsheetRef(value, userId)
  const id = userId?.trim()
  if (!id) return { ok: true }
  return updateUserEffectivePathsIdsMasterRef(id, value)
}
