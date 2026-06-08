/** CRC-32 (IEEE / PKZIP) for ZIP local headers. */
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc = crc32Table[(crc ^ data[i]!) & 0xff]! ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const crc32Table = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c >>> 0
  }
  return table
})()

export type ZipEntry = {
  name: string
  data: Uint8Array
}

/** Build a ZIP archive (STORE / no compression) for small browser-side attachments. */
export function createZipBlob(entries: ZipEntry[]): Blob {
  const encoder = new TextEncoder()
  const parts: Uint8Array[] = []
  const centralDirectory: Uint8Array[] = []
  let offset = 0

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name)
    const entryCrc = crc32(entry.data)
    const size = entry.data.length

    const localHeader = new Uint8Array(30 + nameBytes.length)
    const localView = new DataView(localHeader.buffer)
    localView.setUint32(0, 0x04034b50, true)
    localView.setUint16(4, 20, true)
    localView.setUint16(6, 0, true)
    localView.setUint16(8, 0, true)
    localView.setUint16(10, 0, true)
    localView.setUint16(12, 0, true)
    localView.setUint32(14, entryCrc, true)
    localView.setUint32(18, size, true)
    localView.setUint32(22, size, true)
    localView.setUint16(26, nameBytes.length, true)
    localView.setUint16(28, 0, true)
    localHeader.set(nameBytes, 30)

    parts.push(localHeader, entry.data)

    const cdHeader = new Uint8Array(46 + nameBytes.length)
    const cdView = new DataView(cdHeader.buffer)
    cdView.setUint32(0, 0x02014b50, true)
    cdView.setUint16(4, 20, true)
    cdView.setUint16(6, 20, true)
    cdView.setUint16(8, 0, true)
    cdView.setUint16(10, 0, true)
    cdView.setUint16(12, 0, true)
    cdView.setUint16(14, 0, true)
    cdView.setUint32(16, entryCrc, true)
    cdView.setUint32(20, size, true)
    cdView.setUint32(24, size, true)
    cdView.setUint16(28, nameBytes.length, true)
    cdView.setUint16(30, 0, true)
    cdView.setUint16(32, 0, true)
    cdView.setUint16(34, 0, true)
    cdView.setUint16(36, 0, true)
    cdView.setUint32(38, 0, true)
    cdView.setUint32(42, offset, true)
    cdHeader.set(nameBytes, 46)

    centralDirectory.push(cdHeader)
    offset += localHeader.length + entry.data.length
  }

  const cdSize = centralDirectory.reduce((sum, part) => sum + part.length, 0)
  const eocd = new Uint8Array(22)
  const eocdView = new DataView(eocd.buffer)
  eocdView.setUint32(0, 0x06054b50, true)
  eocdView.setUint16(4, 0, true)
  eocdView.setUint16(6, 0, true)
  eocdView.setUint16(8, entries.length, true)
  eocdView.setUint16(10, entries.length, true)
  eocdView.setUint32(12, cdSize, true)
  eocdView.setUint32(16, offset, true)
  eocdView.setUint16(20, 0, true)

  // STORE chunks are always `new Uint8Array(...)`; narrow for strict BlobPart DOM typings.
  const blobParts = [...parts, ...centralDirectory, eocd] as BlobPart[]
  return new Blob(blobParts, { type: 'application/zip' })
}

export function playerInfoSaveEntryName(datFileName: string): string {
  return datFileName.trim() || 'playerInfo.dat'
}

export function playerInfoSaveZipName(datFileName: string): string {
  const base = playerInfoSaveEntryName(datFileName)
  if (/\.dat$/i.test(base)) return base.replace(/\.dat$/i, '.zip')
  return `${base}.zip`
}

export function isPlayerInfoSaveFile(file: File): boolean {
  return /\.dat$/i.test(file.name)
}

export async function zipPlayerInfoSaveFile(file: File): Promise<File> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const entryName = playerInfoSaveEntryName(file.name)
  const zipBlob = createZipBlob([{ name: entryName, data: bytes }])
  return new File([zipBlob], playerInfoSaveZipName(file.name), { type: 'application/zip' })
}

/** Zip playerInfo.dat saves; leave CSV and other attachments unchanged. */
export async function prepareBugReportFilesForTransfer(files: File[]): Promise<File[]> {
  const prepared: File[] = []
  for (const file of files) {
    prepared.push(isPlayerInfoSaveFile(file) ? await zipPlayerInfoSaveFile(file) : file)
  }
  return prepared
}
