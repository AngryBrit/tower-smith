/**
 * Dump every PlayerData field from a gzip playerInfo.dat save to JSON (+ text summary).
 *
 * Usage:
 *   node scripts/dump-player-save-fields.mjs [input.dat] [output.json]
 *
 * Defaults:
 *   input:  h:/The Tower/SaveGames/playerInfo.dat
 *   output: docs/player-save-field-dump.json
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { gunzipSync } from 'node:zlib'
import {
  ArraySinglePrimitiveRecord,
  ArraySingleObjectRecord,
  ArraySingleStringRecord,
  BinaryArrayRecord,
  BinaryObjectStringRecord,
  ClassRecord,
  MemberReferenceRecord,
  NrbfDecoder,
} from '../src/playerSave/nrbf.ts'

const DEFAULT_INPUT = 'h:/The Tower/SaveGames/playerInfo.dat'
const DEFAULT_OUTPUT = 'docs/player-save-field-dump.json'
const MAX_DEPTH = 8
const MAX_ARRAY_PREVIEW = 32

function resolve(decoder, value) {
  if (value instanceof MemberReferenceRecord) return decoder.getRecord(value.idRef)
  return value
}

function serializeValue(decoder, value, depth) {
  if (value === undefined || value === null) return null
  if (typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') return Number.isFinite(value) ? value : String(value)
  if (typeof value === 'bigint') return Number(value)

  if (value instanceof BinaryObjectStringRecord) return value.value

  if (depth >= MAX_DEPTH) {
    return { _truncated: true, _type: value.constructor?.name ?? typeof value }
  }

  if (value instanceof ArraySinglePrimitiveRecord) {
    const arr = value.getArray().map((x) =>
      typeof x === 'bigint' ? Number(x) : x === true || x === false ? x : Number(x),
    )
    const nonzero = arr.filter((n) => n !== 0 && n !== false).length
    const out = {
      _type: 'ArraySinglePrimitive',
      length: arr.length,
      nonzeroCount: nonzero,
      values: arr,
    }
    if (arr.length > MAX_ARRAY_PREVIEW) {
      out.previewHead = arr.slice(0, MAX_ARRAY_PREVIEW)
      out.previewTail = arr.slice(-8)
    }
    return out
  }

  if (value instanceof ArraySingleStringRecord) {
    const arr = value.getArray().map((x) => String(x))
    return { _type: 'ArraySingleString', length: arr.length, values: arr }
  }

  if (value instanceof ArraySingleObjectRecord) {
    const arr = value.getArray().map((el, i) => ({
      index: i,
      ...serializeValue(decoder, resolve(decoder, el), depth + 1),
    }))
    return { _type: 'ArraySingleObject', length: arr.length, items: arr }
  }

  if (value instanceof BinaryArrayRecord) {
    const items = value.elementValues.map((el, i) => ({
      index: i,
      value: serializeValue(decoder, resolve(decoder, el), depth + 1),
    }))
    return { _type: 'BinaryArray', length: items.length, items }
  }

  if (value instanceof ClassRecord) {
    const obj = { _type: 'Class', className: value.typeName }
    for (const name of value.memberNames) {
      obj[name] = serializeValue(decoder, resolve(decoder, value.getValue(name)), depth + 1)
    }
    return obj
  }

  return { _type: value.constructor?.name ?? 'unknown', _raw: String(value) }
}

function buildTextSummary(dump) {
  const lines = [
    `Save file: ${dump.sourceFile}`,
    `Decoded at: ${dump.decodedAt}`,
    `PlayerData class: ${dump.playerDataClass}`,
    `Field count: ${dump.fieldCount}`,
    '',
    '--- Field index ---',
  ]
  for (const [name, meta] of Object.entries(dump.fields)) {
    lines.push(`${name}: ${meta.summary}`)
  }
  return lines.join('\n')
}

function fieldSummary(value) {
  if (value === null) return 'null'
  if (typeof value === 'string') return `string "${value.length > 60 ? value.slice(0, 60) + '…' : value}"`
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value._type === 'ArraySinglePrimitive') {
    return `int[] len=${value.length} nonzero=${value.nonzeroCount}`
  }
  if (value._type === 'ArraySingleString') return `string[] len=${value.length}`
  if (value._type === 'BinaryArray') return `object[] len=${value.length}`
  if (value._type === 'ArraySingleObject') return `object[] len=${value.length}`
  if (value._type === 'Class') return `class ${value.className}`
  return value._type ?? 'unknown'
}

function main() {
  const inputPath = process.argv[2] ?? DEFAULT_INPUT
  const outputPath = process.argv[3] ?? DEFAULT_OUTPUT

  const raw = readFileSync(inputPath)
  const bytes = gunzipSync(raw)
  const decoder = new NrbfDecoder(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  )
  decoder.decode()

  let player = null
  for (const rec of decoder.getAllRecords().values()) {
    if (rec instanceof ClassRecord && rec.typeName.includes('PlayerData')) {
      player = rec
      break
    }
  }
  if (!player) {
    console.error('PlayerData not found in save')
    process.exit(1)
  }

  const fields = {}
  for (const name of player.memberNames) {
    fields[name] = serializeValue(decoder, resolve(decoder, player.getValue(name)), 0)
  }

  const fieldSummaries = {}
  for (const [name, value] of Object.entries(fields)) {
    fieldSummaries[name] = { summary: fieldSummary(value) }
  }

  const dump = {
    sourceFile: inputPath,
    decodedAt: new Date().toISOString(),
    playerDataClass: player.typeName,
    fieldCount: player.memberNames.length,
    memberNames: [...player.memberNames],
    fields,
  }

  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, JSON.stringify(dump, null, 2), 'utf-8')

  const txtPath = outputPath.replace(/\.json$/i, '.txt')
  const summaryLines = buildTextSummary({
    ...dump,
    fields: fieldSummaries,
  })
  writeFileSync(txtPath, summaryLines + '\n\nFull data: ' + outputPath + '\n', 'utf-8')

  console.log(`Wrote ${player.memberNames.length} fields to:`)
  console.log(`  ${outputPath}`)
  console.log(`  ${txtPath}`)
}

main()
