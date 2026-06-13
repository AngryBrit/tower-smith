import type { AccountWorkspaceBackupV1 } from '../../../src/accountWorkspace/types'
import { ACCOUNT_WORKSPACE_MAX_BYTES } from '../../../src/accountWorkspace/types'
import {
  parseAccountWorkspaceBackup,
  validateAccountWorkspaceBackupBytes,
} from '../../../src/accountWorkspace/validate'
import { getSupabaseAdmin, towerPayloadsBucket } from './supabaseAdmin'

const TOWER_PAYLOADS_FILE_SIZE_LIMIT = ACCOUNT_WORKSPACE_MAX_BYTES

function accountWorkspaceStoragePath(userId: string): string {
  return `private/${userId}/workspace.json`
}

function isMissingBucketError(message: string): boolean {
  const lower = message.toLowerCase()
  return lower.includes('bucket not found') || lower.includes('not found')
}

function isPayloadTooLargeError(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('maximum allowed size') ||
    lower.includes('payload too large') ||
    lower.includes('too large') ||
    lower.includes('entity too large')
  )
}

export function mapAccountWorkspaceStorageError(message: string): string {
  if (isPayloadTooLargeError(message)) return 'too_large'
  if (isMissingBucketError(message)) return 'storage_unavailable'
  return 'storage_unavailable'
}

let bucketEnsured = false

export async function ensureTowerPayloadsBucket(): Promise<void> {
  if (bucketEnsured) return
  const sb = getSupabaseAdmin()
  const bucketId = towerPayloadsBucket()
  const { data: buckets, error: listError } = await sb.storage.listBuckets()
  if (listError) {
    throw new Error(listError.message)
  }
  if (buckets?.some((row) => row.id === bucketId || row.name === bucketId)) {
    bucketEnsured = true
    return
  }
  const { error: createError } = await sb.storage.createBucket(bucketId, {
    public: false,
    fileSizeLimit: TOWER_PAYLOADS_FILE_SIZE_LIMIT,
    allowedMimeTypes: ['application/json'],
  })
  if (createError && !createError.message.toLowerCase().includes('already exists')) {
    throw new Error(createError.message)
  }
  bucketEnsured = true
}

export async function readAccountWorkspaceBackup(
  userId: string,
): Promise<AccountWorkspaceBackupV1 | null> {
  await ensureTowerPayloadsBucket()
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

  await ensureTowerPayloadsBucket()
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
