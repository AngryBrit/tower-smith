import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

const lines = readFileSync('h:/The Tower/Dump/Assembly-CSharp/AutoplayerProfile.cs', 'utf8').split(/\r?\n/)
const ap = new Map()
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/researchLevel(\d+)/)
  if (!m) continue
  for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
    const r = lines[j].match(/Range\(0f,\s*(\d+(?:\.\d+)?)f\)/)
    if (r) {
      ap.set(Number(m[1]), Number(r[1]))
      break
    }
  }
}

const { decodePlayerInfoBytes } = await import('../src/playerSave/decodePlayerInfo.ts')
const raw = readFileSync('h:/The Tower/SaveGames/playerInfo.dat')
const lv = decodePlayerInfoBytes(gunzipSync(raw)).researchLevel

for (let id = 0; id < 250; id++) {
  if (lv[id] === 7 || lv[id] === 8) console.log('lv7/8', id, 'lv', lv[id], 'ap', ap.get(id))
}
for (let id = 0; id < 250; id++) {
  if (lv[id] === 42) console.log('lv42', id, 'ap', ap.get(id))
}
