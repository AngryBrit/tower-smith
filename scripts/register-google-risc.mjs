import { readFileSync } from 'node:fs'
import { SignJWT, importPKCS8 } from 'jose'

const RISC_EVENT_TYPES = [
  'https://schemas.openid.net/secevent/risc/event-type/sessions-revoked',
  'https://schemas.openid.net/secevent/oauth/event-type/tokens-revoked',
  'https://schemas.openid.net/secevent/oauth/event-type/token-revoked',
  'https://schemas.openid.net/secevent/risc/event-type/account-disabled',
  'https://schemas.openid.net/secevent/risc/event-type/account-enabled',
  'https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required',
  'https://schemas.openid.net/secevent/risc/event-type/verification',
]

const RISC_STREAM_UPDATE = 'https://risc.googleapis.com/v1beta/stream:update'
const RISC_STREAM_VERIFY = 'https://risc.googleapis.com/v1beta/stream:verify'
const RISC_AUDIENCE =
  'https://risc.googleapis.com/google.identity.risc.v1beta.RiscManagementService'

function usage() {
  console.error(`Usage: node scripts/register-google-risc.mjs [service-account.json] [--verify]

Arguments:
  service-account.json  Optional path to RISC Configuration Admin key (else use env var)

Environment:
  GOOGLE_RISC_SERVICE_ACCOUNT_PATH  Same as the optional argument
  GOOGLE_RISC_RECEIVER_URL          HTTPS receiver (default: https://towersmith.com/api/risc/events)

PowerShell (env var lasts for this session only):
  $env:GOOGLE_RISC_SERVICE_ACCOUNT_PATH = "C:\\path\\to\\key.json"
  npm run register-google-risc

Prerequisites (Google Cloud Console):
  1. Enable "RISC API" for the TowerSmith GCP project
  2. Create a service account with role "RISC Configuration Admin"
  3. Download a JSON key for that service account
  4. Deploy risc-events with GOOGLE_RISC_OAUTH_CLIENT_IDS set on Netlify
`)
  process.exit(1)
}

function serviceAccountPathFromArgv() {
  const positional = process.argv.slice(2).find((arg) => !arg.startsWith('--'))
  return positional?.trim() || process.env.GOOGLE_RISC_SERVICE_ACCOUNT_PATH?.trim() || ''
}

function loadServiceAccount() {
  const path = serviceAccountPathFromArgv()
  if (!path) {
    console.error('Missing service account path (argument or GOOGLE_RISC_SERVICE_ACCOUNT_PATH)')
    usage()
  }
  const json = JSON.parse(readFileSync(path, 'utf8'))
  if (!json.client_email || !json.private_key || !json.private_key_id) {
    throw new Error('invalid_service_account_json')
  }
  return {
    client_email: json.client_email,
    private_key: json.private_key,
    private_key_id: json.private_key_id,
  }
}

async function makeBearerToken(account) {
  const privateKey = await importPKCS8(account.private_key, 'RS256')

  return new SignJWT({})
    .setProtectedHeader({ alg: 'RS256', kid: account.private_key_id })
    .setIssuer(account.client_email)
    .setSubject(account.client_email)
    .setAudience(RISC_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey)
}

async function registerStream(authToken, receiverUrl) {
  const response = await fetch(RISC_STREAM_UPDATE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      delivery: {
        delivery_method: 'https://schemas.openid.net/secevent/risc/delivery-method/push',
        url: receiverUrl,
      },
      events_requested: [...RISC_EVENT_TYPES],
    }),
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`stream:update failed (${response.status}): ${text}`)
  }
  console.log('RISC stream registered:', text || '(empty body)')
}

async function verifyStream(authToken, state) {
  const response = await fetch(RISC_STREAM_VERIFY, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state }),
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`stream:verify failed (${response.status}): ${text}`)
  }
  console.log('Verification token requested. Check Netlify function logs for google_risc_event.')
  console.log(response.status, text || '(empty body)')
}

async function main() {
  const verifyOnly = process.argv.includes('--verify')
  const receiverUrl =
    process.env.GOOGLE_RISC_RECEIVER_URL?.trim() ||
    'https://towersmith.com/api/risc/events'

  const account = loadServiceAccount()
  const authToken = await makeBearerToken(account)

  if (!verifyOnly) {
    await registerStream(authToken, receiverUrl)
  }

  await verifyStream(authToken, `towersmith-risc-verify-${Date.now()}`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
