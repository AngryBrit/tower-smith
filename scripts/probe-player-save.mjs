import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { createRequire } from 'node:module'

// Vitest/tsconfig won't run TS directly; compile-free probe via dynamic import in vite
const path = new URL('../src/playerSave/nrbf.ts', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')

async function main() {
  const { NrbfDecoder, ClassRecord, ArraySinglePrimitiveRecord, MemberReferenceRecord } =
    await import('../src/playerSave/nrbf.ts')
  const raw = readFileSync('h:/The Tower/playerInfo.dat')
  const bytes = gunzipSync(raw)
  const decoder = new NrbfDecoder(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
  const root = decoder.decode()
  console.log('root type', root.constructor.name)
  if (!(root instanceof ClassRecord)) {
    console.log('unexpected root', root)
    return
  }
  console.log('root class', root.typeName)
  const names = root.memberNames.slice(0, 30)
  console.log('first members', names)
  for (const key of [
    'researchLevel',
    'upgradeWorkshopLevel',
    'upgradeWorkshopDefenseLevel',
    'upgradeWorkshopUtilityLevel',
    'enhancementLevel',
    'enhancementDefenseLevel',
    'enhancementUtilityLevel',
    'cardLevel',
  ]) {
    let v = root.getValue(key)
    if (v instanceof MemberReferenceRecord) v = decoder.getRecord(v.idRef)
    if (v instanceof ArraySinglePrimitiveRecord) {
      const arr = v.getArray().map((x) => (typeof x === 'bigint' ? Number(x) : x))
      console.log(key, 'len', arr.length, 'head', arr.slice(0, 8))
    } else {
      console.log(key, typeof v, v?.constructor?.name)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
