/**
 * Local maintainer check — validates Picker API key + project env (never commit output).
 * Usage: node scripts/check-google-picker-key.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function readEnv(name) {
  const envPath = resolve(process.cwd(), '.env')
  const text = readFileSync(envPath, 'utf8')
  const match = text.match(new RegExp(`^${name}=(.*)$`, 'm'))
  if (!match) return null
  return match[1].trim().replace(/^['"]|['"]$/g, '')
}

const apiKey = readEnv('VITE_GOOGLE_PICKER_API_KEY')
const projectNumber = readEnv('VITE_GOOGLE_CLOUD_PROJECT_NUMBER')
const clientId = readEnv('VITE_GOOGLE_SHEETS_OAUTH_CLIENT_ID')

if (!apiKey) {
  console.error('Missing VITE_GOOGLE_PICKER_API_KEY in .env')
  process.exit(1)
}

const clientPrefix = clientId?.split('-')[0] ?? ''
console.log('Env checks:')
console.log(`  API key length: ${apiKey.length} (expect ~39)`)
console.log(`  API key prefix: ${apiKey.startsWith('AIza') ? 'AIza…' : 'UNEXPECTED'}`)
console.log(`  Project number: ${projectNumber ?? '(missing)'}`)
console.log(`  OAuth client prefix: ${clientPrefix}`)
console.log(
  `  Project number matches OAuth prefix: ${projectNumber === clientPrefix ? 'yes' : 'NO — verify numeric project number in Cloud Console'}`,
)

const tests = [
  ['Google Picker API discovery', `https://www.googleapis.com/discovery/v1/apis/picker/v1/rest?key=${apiKey}`],
  ['Google Drive API discovery', `https://www.googleapis.com/discovery/v1/apis/drive/v3/rest?key=${apiKey}`],
]

for (const [label, url] of tests) {
  const res = await fetch(url)
  const body = await res.json().catch(() => ({}))
  const err = body?.error
  if (res.ok) {
    console.log(`  ${label}: OK`)
  } else {
    console.log(`  ${label}: FAIL (${res.status}) ${err?.message ?? err?.status ?? 'unknown'}`)
    if (err?.details) {
      for (const d of err.details) {
        if (d['@type']?.includes('ErrorInfo')) {
          console.log(`    reason: ${d.reason ?? ''} domain: ${d.domain ?? ''}`)
        }
      }
    }
  }
}

console.log('\nReferrer simulation (Drive API — key must allow Drive + Picker APIs):')
const driveUrl = `https://www.googleapis.com/discovery/v1/apis/drive/v3/rest?key=${apiKey}`
for (const referer of [
  'http://localhost:8888/',
  'http://localhost:5173/',
  'https://www.towersmith.com/',
]) {
  const res = await fetch(driveUrl, { headers: { Referer: referer } })
  const body = await res.json().catch(() => ({}))
  const err = body?.error
  console.log(
    `  ${referer} → ${res.ok ? 'OK' : `FAIL (${res.status}) ${err?.message ?? ''}`}`,
  )
  if (!res.ok && err?.message?.includes('drive method')) {
    console.log('    ^ API key is referrer-OK but API restrictions block Google Drive API.')
    console.log('      Add Google Drive API to the key (same project → APIs & Services → Credentials).')
  }
}
