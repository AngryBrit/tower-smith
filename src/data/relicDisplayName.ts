/** Title-case relic display names (capitalize the first letter of each word). */
export function capitalizeRelicDisplayName(name: string): string {
  return name.split(' ').map(capitalizeRelicWord).join(' ')
}

function capitalizeRelicWord(word: string): string {
  if (/^\d+(?:st|nd|rd|th)$/i.test(word)) return word.toLowerCase()
  if (/^T:[IVXLC]+$/i.test(word)) return word.toUpperCase()
  if (/^[A-Z]{2,}$/.test(word) && !/[a-z]/.test(word)) return word

  return word.replace(
    /^([^A-Za-z]*)([A-Za-z])([A-Za-z']*)(.*)$/,
    (_, pre, first, mid, post) => pre + first.toUpperCase() + mid.toLowerCase() + post,
  )
}
