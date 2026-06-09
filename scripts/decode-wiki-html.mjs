/**
 * Decode wiki values hidden behind per-character spans (font-size: inherit vs 0px).
 *
 * Plain copy/paste loses span structure — paste outerHTML from DevTools instead.
 *
 * Usage (from repo root):
 *   npx tsx scripts/decode-wiki-html.mjs path/to/pasted.html
 *   npx tsx scripts/decode-wiki-html.mjs path/to/pasted.html path/to/decoded.txt
 *
 * In DevTools: right-click the value node → Copy → Copy outerHTML, save to a .html or .txt file.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import {
  extractVisibleSpanTextFromDocument,
  extractWikiTableRows,
  looksLikeSpanFontObfuscation,
} from '../src/extractVisibleSpanText.ts'

const inputPath = path.resolve(process.argv[2] ?? '')
const outputPath = path.resolve(
  process.argv[3] ?? (inputPath ? `${inputPath}.decoded.txt` : ''),
)

if (!inputPath || !existsSync(inputPath)) {
  console.error('Usage: npx tsx scripts/decode-wiki-html.mjs <input.html> [output.txt]')
  process.exit(1)
}

const raw = readFileSync(inputPath, 'utf8')

if (!looksLikeSpanFontObfuscation(raw)) {
  console.warn(
    'Warning: input does not look like span font-size obfuscation (no <span> + font-size: 0).',
  )
  console.warn('If you pasted plain text from the clipboard, copy outerHTML from DevTools instead.')
}

const doc = new JSDOM(raw).window.document
const rows = extractWikiTableRows(raw, doc)

let output = ''
if (rows.length > 0) {
  output = rows.map((row) => row.join('\t')).join('\n')
  console.log(`Decoded table: ${rows.length} rows × ${rows[0]?.length ?? 0} columns`)
  if (rows.length <= 3) {
    for (const row of rows) console.log(row.join('\t'))
  } else {
    for (const row of rows.slice(0, 2)) console.log(row.join('\t'))
    console.log('…')
    console.log(rows[rows.length - 1].join('\t'))
  }
} else {
  output = extractVisibleSpanTextFromDocument(doc)
  console.log(`Decoded: ${JSON.stringify(output)}`)
}

writeFileSync(outputPath, `${output}\n`, 'utf8')
console.log(`Wrote: ${outputPath}`)
