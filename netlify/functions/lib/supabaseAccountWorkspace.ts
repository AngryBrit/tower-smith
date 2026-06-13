import type { AccountWorkspaceBackupV1 } from '../../../src/accountWorkspace/types'
import {
  parseAccountWorkspaceBackup,
  validateAccountWorkspaceBackupBytes,
} from '../../../src/accountWorkspace/validate'
import { getSupabaseAdmin, towerPayloadsBucket } from './supabaseAdmin'

function accountWorkspaceStoragePath(userId: string): string {
  return `private/${userId}/workspace.json`
}

export async function readAccountWorkspaceBackup(
  userId: string,
): Promise<AccountWorkspaceBackupV1 | null> {
  const sb = getSupabaseAdmin()
  const path = accountWorkspaceStoragePath(userId)
  const { data, error } = await sb.storage.from(towerPayloadsBucket()).download(path)
  if (error || !data) return null

  let raw: unknown
  try {
    raw = JSON.parse(await data.text()) as unknown
  } catch {
    return null
  }

  return parseAccountWorkspaceBackup(raw)
}

export async function writeAccountWorkspaceBackup(
  userId: string,
  backup: AccountWorkspaceBackupV1,
): Promise<void> {
  const body = JSON.stringify(backup)
  const sizeError = validateAccountWorkspaceBackupBytes(body.length)
  if (sizeError) {
    throw new Error(sizeError)
  }

  const sb = getSupabaseAdmin()
  const path = accountWorkspaceStoragePath(userId)
  const { error } = await sb.storage.from(towerPayloadsBucket()).upload(path, body, {
    contentType: 'application/json',
    upsert: true,
  })
  if (error) {
    throw new Error(error.message)
  }
}
