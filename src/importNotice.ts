export type ImportNoticeVariant = 'success' | 'error' | 'info'

export type ImportNotice = {
  message: string
  variant: ImportNoticeVariant
}

export function importNotice(
  message: string,
  variant: ImportNoticeVariant,
): ImportNotice {
  return { message, variant }
}

export function normalizeImportNotice(
  value: ImportNotice | string | null,
): ImportNotice | null {
  if (value === null) return null
  if (typeof value === 'string') return { message: value, variant: 'info' }
  return value
}

export function importNoticeMessage(
  value: ImportNotice | string | null,
): string | null {
  if (value === null) return null
  return typeof value === 'string' ? value : value.message
}
