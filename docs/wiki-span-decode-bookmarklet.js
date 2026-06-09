/**
 * Bookmarklet: select a wiki stat node in DevTools, or click a value on the page,
 * then run this from the bookmarks bar to copy the decoded visible text.
 *
 * Minified one-liner (create a bookmark with this as the URL):
 *
 * javascript:(()=>{const s=[...document.querySelectorAll('span[style]')].filter(e=>!/font-size\s*:\s*0/i.test(e.getAttribute('style')||'')).map(e=>e.textContent).join('');navigator.clipboard.writeText(s).then(()=>alert('Copied: '+s),()=>prompt('Copy decoded value:',s));})();
 */

javascript: (() => {
  const spans = [...document.querySelectorAll('span[style]')].filter((el) => {
    const style = el.getAttribute('style') ?? ''
    return !/font-size\s*:\s*0/i.test(style)
  })
  const decoded = spans.map((el) => el.textContent ?? '').join('')
  navigator.clipboard.writeText(decoded).then(
    () => alert(`Copied: ${decoded}`),
    () => prompt('Copy decoded value:', decoded),
  )
})()
