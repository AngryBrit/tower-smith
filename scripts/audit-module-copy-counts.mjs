/**
 * Audit module copy counts vs naive infoIndex grouping.
 * Usage: npx tsx scripts/audit-module-copy-counts.mjs [playerInfo.dat]
 */
import { readFileSync } from 'node:fs'
import { decodePlayerInfoFile } from '../src/playerSave/decodePlayerInfo.ts'
import { moduleCopyCountMismatches } from '../src/playerSave/moduleCopyCountsAudit.ts'

const path = process.argv[2] ?? 'h:/The Tower/SaveGames/playerInfo.dat'
const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(path)))
const mismatches = moduleCopyCountMismatches(save)

console.log('save:', path)
console.log('mismatches (naive infoIndex vs strict):', mismatches.length)
for (const row of mismatches) {
  console.log(
    `  ${row.slot}/${row.moduleId}: naive ${row.naiveCount} -> strict ${row.strictCount} (filtered ${row.filtered})`,
  )
}
