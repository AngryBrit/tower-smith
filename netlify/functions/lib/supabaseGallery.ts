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

export type GalleryListPage = {
  entries: TowerGalleryIndexEntry[]
  nextCursor: string | null
}

type BuildRow = {
  id: string
  title: string
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
  `id, title, category, created_at, upvote_count, storage_path, ${BUILD_AUTHOR_PROFILE_INNER}`
const BUILD_LIST_SELECT_LEGACY =
  `id, title, category, created_at, storage_path, ${BUILD_AUTHOR_PROFILE_INNER}`

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
    createdAt: row.created_at,
    upvoteCount,
    ...(category ? { category } : {}),
    ...(author ? { author } : {}),
    ...(authorAvatarUrl ? { authorAvatarUrl } : {}),
    ...(viewerVoted === true ? { viewerVoted: true } : {}),
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
): TowerGalleryIndexEntry[] {
  return rows.map((row) =>
    rowToEntry(row, votedIds.has(row.id) ? true : undefined),
  )
}

function parseListSort(raw: string | null): GalleryListSort {
  return raw === 'top' ? 'top' : 'newest'
}

function listSelectColumns(includeVotes: boolean): string {
  return includeVotes ? BUILD_LIST_SELECT_VOTES : BUILD_LIST_SELECT_LEGACY
}

async function fetchBuildListPage(
  limit: number,
  cursor: string | null,
  query: string | null,
  category: string | null,
  sortRaw: string | null,
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
    const escaped = q.replace(/[%_\\]/g, '\\$&')
    request = request.ilike('title', `%${escaped}%`)
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
        '[gallery] build votes migration not applied — listing without upvote_count. Run supabase/migrations/20260526500000_build_votes.sql',
      )
      const page = await fetchBuildListPage(
        limit,
        cursor,
        query,
        category,
        'newest',
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
    entries = applyViewerVotes(rows, votedIds)
  } else {
    entries = rows.map((row) => rowToEntry(row))
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
    ? `id, title, category, created_at, upvote_count, storage_path, ${BUILD_AUTHOR_PROFILE}`
    : `id, title, category, created_at, storage_path, ${BUILD_AUTHOR_PROFILE}`

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
        `id, title, category, created_at, storage_path, ${BUILD_AUTHOR_PROFILE}`,
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
    category: record.category ?? null,
    storage_path: storagePath,
    created_at: record.createdAt,
  })

  if (insertError) {
    await sb.storage.from(towerPayloadsBucket()).remove([storagePath])
    throw new Error(insertError.message)
  }
}

export async function deleteTowerFromGallery(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('builds')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return false

  await sb.storage.from(towerPayloadsBucket()).remove([data.storage_path])

  const { error: deleteError } = await sb.from('builds').delete().eq('id', id)
  return !deleteError
}
