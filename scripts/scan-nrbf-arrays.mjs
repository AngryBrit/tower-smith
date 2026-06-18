import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

const path = process.argv[2] ?? 'h:/The Tower/SaveGames/playerInfo.dat'
const bytes = gunzipSync(readFileSync(path))
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
let off = 0
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

if (rb() !== 0) throw new Error('bad header')
ri()
ri()
ri()
ri()

const arrays = []
while (off < bytes.length - 1) {
  const pos = off
  const rt = rb()
  if (rt === 11) break
  if (rt === 15) {
    const id = ri()
    const len = ri()
    const prim = rb()
    if (prim === 8) {
      const vals = []
      for (let i = 0; i < len; i++) vals.push(ri())
      arrays.push({ pos, id, len, head: vals.slice(0, 8) })
    } else {
      off += len * 8
    }
    continue
  }
  if (rt === 12) {
    ri()
    const n = r7()
    off += n
    continue
  }
  if (rt === 6) {
    ri()
    const n = r7()
    off += n
    continue
  }
  if (rt === 9) continue
  if (rt === 10) continue
  if (rt === 13) {
    ri()
    continue
  }
  if (rt === 14) {
    const n = rb()
    off += n
    continue
  }
  if (rt === 1) {
    ri()
    ri()
    continue
  }
  if (rt === 4 || rt === 5) {
    ri()
    const nameLen = r7()
    off += nameLen
    const mc = ri()
    for (let i = 0; i < mc; i++) r7()
    for (let i = 0; i < mc; i++) rb()
    for (let i = 0; i < mc; i++) {
      const bt = rb()
      if (bt === 0) rb()
      else if (bt === 1 || bt === 2 || bt === 3 || bt === 4) {
        const n = r7()
        off += n
      }
    }
    for (let i = 0; i < mc; i++) {
      const bt = bytes[off - (mc - i) * 1]
    }
    continue
  }
  break
}

const interesting = arrays.filter((a) =>
  [250, 217, 31, 20, 18, 16, 13].includes(a.len),
)
console.log('total int32 arrays', arrays.length)
for (const a of interesting) {
  console.log(`len=${a.len} id=${a.id} pos=0x${a.pos.toString(16)} head=${a.head.join(',')}`)
}
