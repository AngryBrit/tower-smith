/**
 * Regenerate player save field dumps from playerInfo.dat.
 *
 * Writes (under gitignored `docs/`):
 *   docs/player-save-field-dump.json  — full PlayerData decode
 *   docs/player-save-field-dump.txt   — field index summary
 *
 * Usage (from repo root):
 *   npx tsx scripts/regenerate-player-save-dump.mjs
 *   npx tsx scripts/regenerate-player-save-dump.mjs "path/to/playerInfo.dat"
 *   npx tsx scripts/regenerate-player-save-dump.mjs "path/to/playerInfo.dat" "docs/player-save-field-dump.json"
 *
 * Default input:  h:/The Tower/SaveGames/playerInfo.dat (override on your machine)
 * Default output: docs/player-save-field-dump.json
 */

import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const dumper = join(repoRoot, 'scripts/dump-player-save-fields.mjs')

const defaultInput = 'h:/The Tower/SaveGames/playerInfo.dat'
const defaultOutput = join(repoRoot, 'docs/player-save-field-dump.json')

const inputPath = process.argv[2] ?? defaultInput
const outputPath = resolve(process.argv[3] ?? defaultOutput)

const cmd =
  process.platform === 'win32'
    ? `npx tsx "${dumper}" "${inputPath}" "${outputPath}"`
    : `npx tsx ${JSON.stringify(dumper)} ${JSON.stringify(inputPath)} ${JSON.stringify(outputPath)}`

const result = spawnSync(cmd, {
  cwd: repoRoot,
  stdio: 'inherit',
  shell: true,
})

process.exit(result.status ?? 1)
