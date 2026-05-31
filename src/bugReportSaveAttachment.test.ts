import { describe, expect, it } from 'vitest'
import { PLAYER_INFO_MAX_BYTES } from './playerSave/playerInfoLimits'
import {
  analyzeBugReportSaveFile,
  formatSaveBytes,
  isGzipBytes,
} from './bugReportSaveAttachment'

describe('bugReportSaveAttachment', () => {
  it('detects gzip magic bytes', () => {
    expect(isGzipBytes(new Uint8Array([0x1f, 0x8b, 0x08]))).toBe(true)
    expect(isGzipBytes(new Uint8Array([0x00, 0x01]))).toBe(false)
  })

  it('formats byte sizes', () => {
    expect(formatSaveBytes(500)).toBe('500 B')
    expect(formatSaveBytes(2048)).toBe('2.0 KB')
  })

  it('analyzes a small file with sha256', async () => {
    const file = new File([new Uint8Array([0x1f, 0x8b, 0x00])], 'playerInfo.dat', {
      type: 'application/octet-stream',
    })
    const result = await analyzeBugReportSaveFile(file)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.attachment.fileName).toBe('playerInfo.dat')
    expect(result.attachment.gzip).toBe(true)
    expect(result.attachment.sha256Hex).toHaveLength(64)
  })

  it('rejects empty files', async () => {
    const file = new File([], 'playerInfo.dat')
    const result = await analyzeBugReportSaveFile(file)
    expect(result).toEqual({ ok: false, error: 'empty' })
  })

  it('rejects files over 200 KB', async () => {
    const file = new File([new Uint8Array(PLAYER_INFO_MAX_BYTES + 1)], 'playerInfo.dat')
    const result = await analyzeBugReportSaveFile(file)
    expect(result).toEqual({ ok: false, error: 'too_large' })
  })
})
