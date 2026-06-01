import { describe, expect, it } from 'vitest'
import { TOWER_UNIFIED_CSV_MAGIC } from './towerUnifiedCsv'
import { analyzeBugReportAttachment } from './bugReportAttachFiles'
import { PLAYER_INFO_MAX_BYTES } from './playerSave/playerInfoLimits'

describe('analyzeBugReportAttachment', () => {
  it('detects tower CSV by magic line', async () => {
    const body = `${TOWER_UNIFIED_CSV_MAGIC}\ntype,key,value\n`
    const file = new File([body], 'tower-export.csv', { type: 'text/csv' })
    const result = await analyzeBugReportAttachment(file)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.kind).toBe('csv')
  })

  it('detects player save for binary dat', async () => {
    const file = new File([new Uint8Array([0x1f, 0x8b, 0x00])], 'playerInfo.dat', {
      type: 'application/octet-stream',
    })
    const result = await analyzeBugReportAttachment(file)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.kind).toBe('save')
    expect(result.attachment.gzip).toBe(true)
  })

  it('rejects unrecognized files', async () => {
    const file = new File(['not a save'], 'notes.txt', { type: 'text/plain' })
    const result = await analyzeBugReportAttachment(file)
    expect(result).toEqual({ ok: false, error: 'unrecognized' })
  })

  it('rejects gzip without .dat extension', async () => {
    const file = new File([new Uint8Array([0x1f, 0x8b, 0x00])], 'backup.bin')
    const result = await analyzeBugReportAttachment(file)
    expect(result).toEqual({ ok: false, error: 'unrecognized' })
  })

  it('rejects oversize save', async () => {
    const file = new File([new Uint8Array(PLAYER_INFO_MAX_BYTES + 1)], 'playerInfo.dat')
    const result = await analyzeBugReportAttachment(file)
    expect(result).toEqual({ ok: false, error: 'save_too_large' })
  })
})
