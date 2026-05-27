import {
  TOWER_GALLERY_MAX_AUTHOR_LEN,
  TOWER_GALLERY_MAX_GUILD_LEN,
} from '../towerGallery/types'
import { getSupabaseBrowserClient } from '../supabase/client'

export const PROFILE_AVATAR_BUCKET = 'avatars'
export const PROFILE_DISPLAY_NAME_MAX = TOWER_GALLERY_MAX_AUTHOR_LEN
export const PROFILE_GUILD_MAX = TOWER_GALLERY_MAX_GUILD_LEN
export const PROFILE_AVATAR_MAX_BYTES = 512 * 1024
export const PROFILE_AVATAR_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export type UserProfile = {
  displayName: string | null
  guild: string | null
  avatarUrl: string | null
}

export type ProfileError =
  | 'not_configured'
  | 'invalid_display_name'
  | 'invalid_guild'
  | 'display_name_taken'
  | 'invalid_avatar_type'
  | 'avatar_too_large'
  | 'network'
  | 'unknown'

type ProfileRow = {
  display_name: string | null
  guild: string | null
  avatar_url: string | null
  updated_at?: string | null
}

function avatarUrlForDisplay(url: string | null | undefined, updatedAt?: string | null): string | null {
  const trimmed = url?.trim()
  if (!trimmed) return null
  if (!updatedAt) return trimmed
  const sep = trimmed.includes('?') ? '&' : '?'
  return `${trimmed}${sep}v=${encodeURIComponent(updatedAt)}`
}

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    displayName: row.display_name?.trim() || null,
    guild: row.guild?.trim() || null,
    avatarUrl: avatarUrlForDisplay(row.avatar_url, row.updated_at),
  }
}

function mimeToExtension(mime: string): string | null {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    default:
      return null
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const sb = getSupabaseBrowserClient()
  if (!sb) return null

  const { data, error } = await sb
    .from('profiles')
    .select('display_name, guild, avatar_url, updated_at')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  return rowToProfile(data as ProfileRow)
}

function ilikeExactPattern(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}

export async function updateUserDisplayName(
  userId: string,
  displayName: string,
): Promise<{ ok: true } | { ok: false; error: ProfileError }> {
  const sb = getSupabaseBrowserClient()
  if (!sb) return { ok: false, error: 'not_configured' }

  const trimmed = displayName.trim()
  if (trimmed.length < 1 || trimmed.length > PROFILE_DISPLAY_NAME_MAX) {
    return { ok: false, error: 'invalid_display_name' }
  }

  const { data: takenByOther, error: lookupError } = await sb
    .from('profiles')
    .select('id')
    .ilike('display_name', ilikeExactPattern(trimmed))
    .neq('id', userId)
    .limit(1)

  if (lookupError) return { ok: false, error: 'network' }
  if (takenByOther && takenByOther.length > 0) {
    return { ok: false, error: 'display_name_taken' }
  }

  const { error } = await sb
    .from('profiles')
    .update({
      display_name: trimmed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'display_name_taken' }
    }
    return { ok: false, error: 'network' }
  }
  return { ok: true }
}

export async function updateUserGuild(
  userId: string,
  guild: string,
): Promise<{ ok: true } | { ok: false; error: ProfileError }> {
  const sb = getSupabaseBrowserClient()
  if (!sb) return { ok: false, error: 'not_configured' }

  const trimmed = guild.trim()
  if (trimmed.length > PROFILE_GUILD_MAX) {
    return { ok: false, error: 'invalid_guild' }
  }

  const { error } = await sb
    .from('profiles')
    .update({
      guild: trimmed.length > 0 ? trimmed : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) return { ok: false, error: 'network' }
  return { ok: true }
}

export async function uploadUserAvatar(
  userId: string,
  file: File,
): Promise<{ ok: true; avatarUrl: string } | { ok: false; error: ProfileError }> {
  const sb = getSupabaseBrowserClient()
  if (!sb) return { ok: false, error: 'not_configured' }

  if (!(PROFILE_AVATAR_MIME_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, error: 'invalid_avatar_type' }
  }
  if (file.size > PROFILE_AVATAR_MAX_BYTES) {
    return { ok: false, error: 'avatar_too_large' }
  }

  const ext = mimeToExtension(file.type)
  if (!ext) return { ok: false, error: 'invalid_avatar_type' }

  const storagePath = `${userId}/avatar.${ext}`
  const { error: uploadError } = await sb.storage
    .from(PROFILE_AVATAR_BUCKET)
    .upload(storagePath, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: '3600',
    })

  if (uploadError) return { ok: false, error: 'network' }

  const { data: publicUrlData } = sb.storage
    .from(PROFILE_AVATAR_BUCKET)
    .getPublicUrl(storagePath)
  const avatarUrl = publicUrlData.publicUrl

  const { error: profileError } = await sb
    .from('profiles')
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (profileError) return { ok: false, error: 'network' }
  return { ok: true, avatarUrl }
}

export async function removeUserAvatar(
  userId: string,
): Promise<{ ok: true } | { ok: false; error: ProfileError }> {
  const sb = getSupabaseBrowserClient()
  if (!sb) return { ok: false, error: 'not_configured' }

  const { data: files, error: listError } = await sb.storage
    .from(PROFILE_AVATAR_BUCKET)
    .list(userId)

  if (listError) return { ok: false, error: 'network' }

  if (files && files.length > 0) {
    const paths = files.map((file) => `${userId}/${file.name}`)
    const { error: removeError } = await sb.storage
      .from(PROFILE_AVATAR_BUCKET)
      .remove(paths)
    if (removeError) return { ok: false, error: 'network' }
  }

  const { error: profileError } = await sb
    .from('profiles')
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (profileError) return { ok: false, error: 'network' }
  return { ok: true }
}
