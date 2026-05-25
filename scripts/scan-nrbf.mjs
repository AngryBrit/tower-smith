import { readFileSync, existsSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

const SAMPLE = 'c:/Users/venar/Downloads/playerInfo.dat'
if (!existsSync(SAMPLE)) process.exit(0)
const bytes = new Uint8Array(gunzipSync(readFileSync(SAMPLE)))
let off = 0
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
const rb = () => dv.getUint8(off++)
const ri = () => {
  const v = dv.getInt32(off, true)
  off += 4
  return v
}
const r7 = () => {
  let value = 0
  let shift = 0
  for (;;) {
    const b = rb()
    value |= (b & 0x7f) << shift
    if ((b & 0x80) === 0) return value
    shift += 7
  }
}
const rs = () => {
  const len = r7()
  off += len
  return len
}

rb() // header 0
ri()
ri()
ri()
ri()

const counts = {}
const arrays = []
let playerDataAt = -1

while (off < bytes.length - 1) {
  const pos = off
  const rt = rb()
  if (rt === 11) break
  counts[rt] = (counts[rt] || 0) + 1
  try {
    if (rt === 12) {
      ri()
      rs()
    } else if (rt === 6) {
      ri()
      rs()
    } else if (rt === 15) {
      const id = ri()
      const len = ri()
      rb()
      arrays.push({ pos, id, len, kind: 'ASP' })
      off += len * 8 // guess double size wrong
      break
    } else if (rt === 4 || rt === 5) {
      const oid = ri()
      const nameLen = r7()
      const nameBytes = bytes.subarray(off, off + nameLen)
      const name = new TextDecoder().decode(nameBytes)
      off += nameLen
      const mc = ri()
      for (let i = 0; i < mc; i++) rs()
      for (let i = 0; i < mc; i++) rb()
      for (let i = 0; i < mc; i++) {
        const bt = bytes[off - mc + i]
      }
      // skip type info properly
      off = pos + 1
      // re-parse class header only
      off = pos + 1
      ri()
      const nlen = r7()
      off -= nlen
      off = pos
      break
    }
  } catch {
    break
  }
}
console.log('stopped', off.toString(16), counts)
