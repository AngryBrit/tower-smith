import { describe, expect, it } from 'vitest'
import { TOWER_UNIFIED_CSV_MAGIC } from './towerUnifiedCsv'
import {
  analyzeBugReportCsvFile,
  BUG_REPORT_MAX_CSV_BYTES,
} from './bugReportCsvAttachment'

describe('bugReportCsvAttachment', () => {
  it('accepts a valid tower CSV with sha256', async () => {
    const body = `${TOWER_UNIFIED_CSV_MAGIC}\ntype,key,value\nlab,0-0,1\n`
    const file = new File([body], 'tower-export.csv', { type: 'text/csv' })
    const result = await analyzeBugReportCsvFile(file)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.attachment.fileName).toBe('tower-export.csv')
    expect(result.attachment.towerCsv).toBe(true)
    expect(result.attachment.sha256Hex).toHaveLength(64)
  })

  it('rejects empty files', async () => {
    const file = new File([], 'tower-export.csv')
    const result = await analyzeBugReportCsvFile(file)
    expect(result).toEqual({ ok: false, error: 'empty' })
  })

  it('rejects non-tower CSV magic', async () => {
    const file = new File(['name,level\nfoo,1\n'], 'notes.csv', { type: 'text/csv' })
    const result = await analyzeBugReportCsvFile(file)
    expect(result).toEqual({ ok: false, error: 'invalid_magic' })
  })

  it('rejects files over 2 MB', async () => {
    const file = new File([new Uint8Array(BUG_REPORT_MAX_CSV_BYTES + 1)], 'big.csv')
    const result = await analyzeBugReportCsvFile(file)
    expect(result).toEqual({ ok: false, error: 'too_large' })
  })
})
