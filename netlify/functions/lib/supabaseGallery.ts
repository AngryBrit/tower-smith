import type { LabsShareFile } from '../../../src/labsShareCodec'
import {
  decodeGalleryListCursor,
  encodeGalleryListCursor,
} from '../../../src/towerGallery/listCursor'
import type { GalleryListSort } from '../../../src/towerGallery/types'
import type {
  TowerGalleryIndexEntry,
  TowerGalleryRecord,
} from '../../../src/towerGallery/types'
import { isGalleryBuildCategory } from '../../../src/towerGallery/buildCategories'
import {
  ensureProfileForUser,
  getSupabaseAdmin,
  towerPayloadsBucket,
} from './supabaseAdmin'
import type { User } from '@supabase/supabase-js'
import type { GalleryBuildVisibility } from '../../../src/towerGallery/types'

export type GalleryListPage = {
  entries: TowerGalleryIndexEntry[]
  nextCursor: string | null
}

type BuildRow = {
  id: string
  user_id?: string
  title: string
  guild?: string | null
  visibility?: GalleryBuildVisibility
  category: string | null
  created_at: string
  upvote_count?: number
  storage_path: string
  profiles:
    | { display_name: string | null; avatar_url: string | null }
    | { display_name: string | null; avatar_url: string | null }[]
    | null
}

const BUILD_AUTHOR_PROFILE =
  'profiles!builds_user_id_fkey(display_name, avatar_url)'
const BUILD_AUTHOR_PROFILE_INNER =
  'profiles!builds_user_id_fkey!inner(display_name, avatar_url)'

const BUILD_LIST_SELECT_VOTES =
  `id, user_id, title, guild, visibility, category, created_at, upvote_count, storage_path, ${BUILD_AUTHOR_PROFILE_INNER}`
const BUILD_LIST_SELECT_LEGACY =
  `id, user_id, title, guild, visibility, category, created_at, storage_path, ${BUILD_AUTHOR_PROFILE_INNER}`

/** Cached after first list query — avoids repeated failed selects pre-migration. */
let votesSchemaAvailable: boolean | null = null

function isMissingVotesSchema(message: string): boolean {
  const lower = message.toLowerCase()
  return lower.includes('upvote_count') || lower.includes('build_votes')
}

type ProfileJoin = { display_name: string | null; avatar_url: string | null }

function profileFromRow(row: BuildRow): ProfileJoin | null {
  const p = row.profiles
  if (!p) return null
  return Array.isArray(p) ? (p[0] ?? null) : p
}

function authorFromRow(row: BuildRow): string | undefined {
  const name = profileFromRow(row)?.display_name?.trim()
  return name || undefined
}

function authorAvatarFromRow(row: BuildRow): string | undefined {
  const url = profileFromRow(row)?.avatar_url?.trim()
  return url || undefined
}

function categoryFromRow(row: BuildRow): TowerGalleryIndexEntry['category'] {
  const category = row.category?.trim()
  return category && isGalleryBuildCategory(category) ? category : undefined
}

function rowToEntry(
  row: BuildRow,
  viewerVoted?: boolean,
  viewerOwns?: boolean,
): TowerGalleryIndexEntry {
  const author = authorFromRow(row)
  const authorAvatarUrl = authorAvatarFromRow(row)
  const category = categoryFromRow(row)
  const upvoteCount =
    typeof row.upvote_count === 'number' && row.upvote_count >= 0
      ? row.upvote_count
      : 0
  return {
    id: row.id,
    title: row.title,
    ...(row.guild?.trim() ? { guild: row.guild.trim() } : {}),
    visibility: row.visibility === 'unlisted' ? 'unlisted' : 'public',
    createdAt: row.created_at,
    upvoteCount,
    ...(category ? { category } : {}),
    ...(author ? { author } : {}),
    ...(authorAvatarUrl ? { authorAvatarUrl } : {}),
    ...(viewerVoted === true ? { viewerVoted: true } : {}),
    ...(viewerOwns === true ? { viewerOwns: true } : {}),
  }
}

async function viewerVotedBuildIds(
  buildIds: string[],
  viewerUserId: string,
): Promise<Set<string>> {
  if (buildIds.length === 0) return new Set()
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('build_votes')
    .select('build_id')
    .eq('user_id', viewerUserId)
    .in('build_id', buildIds)
  if (error) {
    if (isMissingVotesSchema(error.message)) {
      votesSchemaAvailable = false
      return new Set()
    }
    throw new Error(error.message)
  }
  return new Set(
    (data ?? [])
      .map((row) => (row as { build_id?: string }).build_id)
      .filter((id): id is string => typeof id === 'string'),
  )
}

function applyViewerVotes(
  rows: BuildRow[],
  votedIds: Set<string>,
  viewerUserId: string,
): TowerGalleryIndexEntry[] {
  return rows.map((row) =>
    rowToEntry(
      row,
      votedIds.has(row.id) ? true : undefined,
      row.user_id === viewerUserId ? true : undefined,
    ),
  )
}

function parseListSort(raw: string | null): GalleryListSort {
  return raw === 'top' ? 'top' : 'newest'
}

function listSelectColumns(includeVotes: boolean): string {
  return includeVotes ? BUILD_LIST_SELECT_VOTES : BUILD_LIST_SELECT_LEGACY
}

function escapeIlikePattern(raw: string): string {
  return raw.replace(/[%_\\]/g, '\\$&')
}

/** Match builds whose title, guild, or author display name contains `query` (case-insensitive). */
async function applyBuildSearchFilter<T extends { or: (filters: string) => T; ilike: (column: string, pattern: string) => T }>(
  sb: ReturnType<typeof getSupabaseAdmin>,
  request: T,
  query: string,
): Promise<T> {
  const pattern = `%${escapeIlikePattern(query)}%`
  const { data: profiles, error: profileError } = await sb
    .from('profiles')
    .select('id')
    .ilike('display_name', pattern)
    .limit(100)

  if (profileError) {
    console.warn('[gallery] profile search failed:', profileError.message)
    return request.or(`title.ilike.${pattern},guild.ilike.${pattern}`)
  }

  const authorIds = (profiles ?? []).map((row) => row.id).filter(Boolean)
  if (authorIds.length > 0) {
    return request.or(
      `title.ilike.${pattern},guild.ilike.${pattern},user_id.in.(${authorIds.join(',')})`,
    )
  }
  return request.or(`title.ilike.${pattern},guild.ilike.${pattern}`)
}

async function fetchBuildListPage(
  limit: number,
  cursor: string | null,
  query: string | null,
  category: string | null,
  sortRaw: string | null,
  viewerUserId: string | null,
  mineOnly: boolean,
  includeVotes: boolean,
): Promise<{ rows: BuildRow[]; effectiveSort: GalleryListSort }> {
  const sb = getSupabaseAdmin()
  const requestedSort = parseListSort(sortRaw)
  const effectiveSort =
    includeVotes && requestedSort === 'top' ? 'top' : 'newest'
  const keyset = decodeGalleryListCursor(cursor, effectiveSort)
  const q = query?.trim() ?? ''

  let request = sb
    .from('builds')
    .select(listSelectColumns(includeVotes))
    .is('deleted_at', null)
    .limit(limit)

  if (viewerUserId) {
    request = request.or(`visibility.eq.public,user_id.eq.${viewerUserId}`)
  } else {
    request = request.eq('visibility', 'public')
  }

  if (effectiveSort === 'top') {
    request = request
      .order('upvote_count', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
  } else {
    request = request
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
  }

  if (category && isGalleryBuildCategory(category)) {
    request = request.eq('category', category)
  }

  if (q.length > 0) {
    request = await applyBuildSearchFilter(sb, request, q)
  }

  if (keyset) {
    if (keyset.sort === 'top' && effectiveSort === 'top') {
      request = request.or(
        `upvote_count.lt.${keyset.upvoteCount},and(upvote_count.eq.${keyset.upvoteCount},created_at.lt.${keyset.createdAt}),and(upvote_count.eq.${keyset.upvoteCount},created_at.eq.${keyset.createdAt},id.lt.${keyset.id})`,
      )
    } else if (keyset.sort === 'newest') {
      request = request.or(
        `created_at.lt.${keyset.createdAt},and(created_at.eq.${keyset.createdAt},id.lt.${keyset.id})`,
      )
    }
  }

  const { data, error } = await request
  if (error) {
    throw new Error(error.message)
  }

  return { rows: (data ?? []) as BuildRow[], effectiveSort }
}

export async function listGalleryEntriesPaginated(
  limit: number,
  cursor: string | null,
  query: string | null,
  category: string | null,
  sortRaw: string | null,
  viewerUserId: string | null,
  mineOnly = false,
): Promise<GalleryListPage> {
  const includeVotes = votesSchemaAvailable !== false
  let rows: BuildRow[]
  let effectiveSort: GalleryListSort

  try {
    const page = await fetchBuildListPage(
      limit,
      cursor,
      query,
      category,
      sortRaw,
      viewerUserId,
      mineOnly,
      includeVotes,
    )
    rows = page.rows
    effectiveSort = page.effectiveSort
    if (includeVotes) {
      votesSchemaAvailable = true
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (includeVotes && isMissingVotesSchema(message)) {
      votesSchemaAvailable = false
      console.warn(
        '[gallery] build votes schema missing — listing without upvote_count. Run supabase/schema.sql on the project.',
      )
      const page = await fetchBuildListPage(
        limit,
        cursor,
        query,
        category,
        'newest',
        viewerUserId,
        mineOnly,
        false,
      )
      rows = page.rows
      effectiveSort = page.effectiveSort
    } else {
      throw err
    }
  }
  let entries: TowerGalleryIndexEntry[]
  if (viewerUserId && votesSchemaAvailable !== false) {
    const votedIds = await viewerVotedBuildIds(
      rows.map((r) => r.id),
      viewerUserId,
    )
    entries = applyViewerVotes(rows, votedIds, viewerUserId)
  } else {
    entries = rows.map((row) =>
      rowToEntry(
        row,
        undefined,
        mineOnly || (viewerUserId && row.user_id === viewerUserId)
          ? true
          : undefined,
      ),
    )
  }

  const last = rows[rows.length - 1]
  const nextCursor: string | null =
    rows.length === limit && last
      ? encodeGalleryListCursor(
          effectiveSort === 'top'
            ? {
                sort: 'top',
                upvoteCount: last.upvote_count ?? 0,
                createdAt: last.created_at,
                id: last.id,
              }
            : {
                sort: 'newest',
                createdAt: last.created_at,
                id: last.id,
              },
        )
      : null

  return { entries, nextCursor }
}

export type ToggleBuildVoteResult =
  | { ok: true; upvoteCount: number; viewerVoted: boolean }
  | { ok: false; error: 'not_found' | 'cannot_vote_own' | 'votes_unavailable' }

export async function toggleBuildVote(
  buildId: string,
  user: User,
): Promise<ToggleBuildVoteResult> {
  if (votesSchemaAvailable === false) {
    return { ok: false, error: 'votes_unavailable' }
  }
  await ensureProfileForUser(user)
  const sb = getSupabaseAdmin()

  const { data: build, error: buildError } = await sb
    .from('builds')
    .select('id, user_id, upvote_count')
    .eq('id', buildId)
    .is('deleted_at', null)
    .maybeSingle()

  if (buildError) {
    if (isMissingVotesSchema(buildError.message)) {
      votesSchemaAvailable = false
      return { ok: false, error: 'votes_unavailable' }
    }
    throw new Error(buildError.message)
  }
  if (!build) {
    return { ok: false, error: 'not_found' }
  }
  if (build.user_id === user.id) {
    return { ok: false, error: 'cannot_vote_own' }
  }

  const { data: existing, error: voteLookupError } = await sb
    .from('build_votes')
    .select('build_id')
    .eq('build_id', buildId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (voteLookupError) {
    throw new Error(voteLookupError.message)
  }

  if (existing) {
    const { error: deleteError } = await sb
      .from('build_votes')
      .delete()
      .eq('build_id', buildId)
      .eq('user_id', user.id)
    if (deleteError) {
      throw new Error(deleteError.message)
    }
  } else {
    const { error: insertError } = await sb.from('build_votes').insert({
      build_id: buildId,
      user_id: user.id,
    })
    if (insertError) {
      if (isMissingVotesSchema(insertError.message)) {
        votesSchemaAvailable = false
        return { ok: false, error: 'votes_unavailable' }
      }
      throw new Error(insertError.message)
    }
  }

  const { data: refreshed, error: refreshError } = await sb
    .from('builds')
    .select('upvote_count')
    .eq('id', buildId)
    .maybeSingle()

  if (refreshError) {
    throw new Error(refreshError.message)
  }

  const upvoteCount =
    typeof refreshed?.upvote_count === 'number' && refreshed.upvote_count >= 0
      ? refreshed.upvote_count
      : 0

  votesSchemaAvailable = true
  return {
    ok: true,
    upvoteCount,
    viewerVoted: !existing,
  }
}

export async function readTowerRecord(
  id: string,
): Promise<TowerGalleryRecord | null> {
  const sb = getSupabaseAdmin()
  const includeVotes = votesSchemaAvailable !== false
  const select = includeVotes
    ? `id, title, guild, category, created_at, upvote_count, storage_path, ${BUILD_AUTHOR_PROFILE}`
    : `id, title, guild, category, created_at, storage_path, ${BUILD_AUTHOR_PROFILE}`

  let result = await sb
    .from('builds')
    .select(select)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()

  if (result.error && includeVotes && isMissingVotesSchema(result.error.message)) {
    votesSchemaAvailable = false
    result = await sb
      .from('builds')
      .select(
        `id, title, guild, category, created_at, storage_path, ${BUILD_AUTHOR_PROFILE}`,
      )
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle()
  }

  if (result.error || !result.data) return null
  const row = result.data as BuildRow

  const { data: file, error: dlError } = await sb.storage
    .from(towerPayloadsBucket())
    .download(row.storage_path)

  if (dlError || !file) return null

  let payload: LabsShareFile
  try {
    payload = JSON.parse(await file.text()) as LabsShareFile
  } catch {
    return null
  }

  const entry = rowToEntry(row)
  return { ...entry, payload }
}

export async function writeTowerRecord(
  record: TowerGalleryRecord,
  user: User,
  opts?: { visibility?: GalleryBuildVisibility },
): Promise<void> {
  await ensureProfileForUser(user)
  const sb = getSupabaseAdmin()
  const storagePath = `${record.id}.json`

  const body = JSON.stringify(record.payload)
  const { error: uploadError } = await sb.storage
    .from(towerPayloadsBucket())
    .upload(storagePath, body, {
      contentType: 'application/json',
      upsert: true,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { error: insertError } = await sb.from('builds').insert({
    id: record.id,
    user_id: user.id,
    title: record.title,
    guild: record.guild ?? null,
    visibility: opts?.visibility === 'unlisted' ? 'unlisted' : 'public',
    category: record.category ?? null,
    storage_path: storagePath,
    created_at: record.createdAt,
  })

  if (insertError) {
    await sb.storage.from(towerPayloadsBucket()).remove([storagePath])
    throw new Error(insertError.message)
  }
}

export async function deleteTowerFromGallery(
  id: string,
  opts?: { ownedByUserId?: string },
): Promise<boolean> {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('builds')
    .select('storage_path, user_id')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()

  if (error || !data) return false
  if (opts?.ownedByUserId && data.user_id !== opts.ownedByUserId) return false

  const { error: softDeleteError } = await sb
    .from('builds')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
  return !softDeleteError
}

export async function updateTowerVisibility(
  id: string,
  user: User,
  visibility: GalleryBuildVisibility,
): Promise<TowerGalleryIndexEntry | null> {
  const sb = getSupabaseAdmin()
  const normalizedVisibility = visibility === 'unlisted' ? 'unlisted' : 'public'
  const { data, error } = await sb
    .from('builds')
    .update({ visibility: normalizedVisibility })
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .select(`id, user_id, title, guild, visibility, category, created_at, upvote_count, ${BUILD_AUTHOR_PROFILE}`)
    .maybeSingle()
  if (error || !data) return null
  return rowToEntry(data as BuildRow, undefined, true)
}

export async function updateTowerCategory(
  id: string,
  user: User,
  category: string,
): Promise<TowerGalleryIndexEntry | null> {
  if (!isGalleryBuildCategory(category)) return null
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('builds')
    .update({ category })
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .select(`id, user_id, title, guild, visibility, category, created_at, upvote_count, ${BUILD_AUTHOR_PROFILE}`)
    .maybeSingle()
  if (error || !data) return null
  return rowToEntry(data as BuildRow, undefined, true)
}

export async function regenerateTowerLink(
  id: string,
  user: User,
): Promise<TowerGalleryIndexEntry | null> {
  const sb = getSupabaseAdmin()
  const { data: existing, error: readError } = await sb
    .from('builds')
    .select(`id, user_id, title, guild, visibility, category, created_at, upvote_count, storage_path, ${BUILD_AUTHOR_PROFILE}`)
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()
  if (readError || !existing) return null
  const row = existing as BuildRow
  const newId = crypto.randomUUID()
  const newStoragePath = `${newId}.json`

  const { data: payloadFile, error: dlError } = await sb.storage
    .from(towerPayloadsBucket())
    .download(row.storage_path)
  if (dlError || !payloadFile) return null
  const payloadText = await payloadFile.text()

  const { error: uploadError } = await sb.storage
    .from(towerPayloadsBucket())
    .upload(newStoragePath, payloadText, {
      contentType: 'application/json',
      upsert: false,
    })
  if (uploadError) return null

  const createdAt = new Date().toISOString()
  const { data: inserted, error: insertError } = await sb
    .from('builds')
    .insert({
      id: newId,
      user_id: user.id,
      title: row.title,
      guild: row.guild,
      visibility: row.visibility === 'unlisted' ? 'unlisted' : 'public',
      category: row.category,
      storage_path: newStoragePath,
      created_at: createdAt,
    })
    .select(`id, user_id, title, guild, visibility, category, created_at, upvote_count, ${BUILD_AUTHOR_PROFILE}`)
    .maybeSingle()
  if (insertError || !inserted) {
    await sb.storage.from(towerPayloadsBucket()).remove([newStoragePath])
    return null
  }

  const { error: oldDeleteError } = await sb
    .from('builds')
    .update({ deleted_at: createdAt })
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
  if (oldDeleteError) return null

  return rowToEntry(inserted as BuildRow, undefined, true)
}
