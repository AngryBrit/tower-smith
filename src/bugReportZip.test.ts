import { describe, expect, it } from 'vitest'
import {
  createZipBlob,
  isPlayerInfoSaveFile,
  playerInfoSaveZipName,
  zipPlayerInfoSaveFile,
} from './bugReportZip'

describe('bugReportZip', () => {
  it('names zip files from dat saves', () => {
    expect(playerInfoSaveZipName('playerInfo.dat')).toBe('playerInfo.zip')
    expect(playerInfoSaveZipName('Fudgyrella.dat')).toBe('Fudgyrella.zip')
  })

  it('detects player save files by extension', () => {
    expect(isPlayerInfoSaveFile(new File([], 'playerInfo.dat'))).toBe(true)
    expect(isPlayerInfoSaveFile(new File([], 'tower.csv'))).toBe(false)
  })

  it('creates a zip containing the original save bytes', async () => {
    const payload = new Uint8Array([0x1f, 0x8b, 0x08, 0x00])
    const file = new File([payload], 'playerInfo.dat', { type: 'application/octet-stream' })
    const zipFile = await zipPlayerInfoSaveFile(file)
    expect(zipFile.name).toBe('playerInfo.zip')
    expect(zipFile.type).toBe('application/zip')

    const zipBytes = new Uint8Array(await zipFile.arrayBuffer())
    expect(zipBytes[0]).toBe(0x50)
    expect(zipBytes[1]).toBe(0x4b)
    for (let i = 0; i < payload.length; i++) {
      expect(zipBytes).toContain(payload[i]!)
    }
  })

  it('builds a valid zip archive for multiple entries', async () => {
    const blob = createZipBlob([
      { name: 'a.txt', data: new Uint8Array([1, 2, 3]) },
      { name: 'b.txt', data: new Uint8Array([4, 5]) },
    ])
    const bytes = new Uint8Array(await blob.arrayBuffer())
    expect(bytes[0]).toBe(0x50)
    expect(bytes[1]).toBe(0x4b)
    expect(bytes[bytes.length - 22]).toBe(0x50)
    expect(bytes[bytes.length - 21]).toBe(0x4b)
    expect(bytes[bytes.length - 20]).toBe(0x05)
    expect(bytes[bytes.length - 19]).toBe(0x06)
  })
})
