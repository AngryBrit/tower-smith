/** Normalize lab calculator scrape text (narrow spaces, etc.). */
export function normalizeLabDisplayText(raw) {
  return String(raw ?? '')
    .replace(/[\u00a0\u2009\u202f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Parse lab calculator duration strings to seconds (365-day years). */
export function parseLabDurationSeconds(raw) {
  const s = normalizeLabDisplayText(raw)
  if (!s) throw new Error('empty duration')

  let years = 0
  let days = 0
  let hours = 0
  let minutes = 0
  let seconds = 0

  for (const m of s.matchAll(/(\d+)\s*(years?|days?|d|h|m|s)\b/gi)) {
    const n = Number(m[1])
    const u = m[2].toLowerCase()
    if (u.startsWith('year')) years += n
    else if (u.startsWith('day') || u === 'd') days += n
    else if (u === 'h') hours += n
    else if (u === 'm') minutes += n
    else if (u === 's') seconds += n
  }

  if (years + days + hours + minutes + seconds === 0) {
    throw new Error(`Unparsed duration: "${raw}"`)
  }

  return years * 365 * 86400 + days * 86400 + hours * 3600 + minutes * 60 + seconds
}

export function labTimeField(raw) {
  const display = normalizeLabDisplayText(raw)
  return { display, seconds: parseLabDurationSeconds(display) }
}
