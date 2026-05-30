;(function () {
  var STORAGE_KEY = 'tower-export-color-scheme-v1'
  var THEME_COLOR = { dark: '#0b1220', light: '#e2e8f0', 'high-contrast': '#ffffff' }

  function readPreference() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY)
      if (raw === 'system') return 'dark'
      if (raw === 'dark' || raw === 'light' || raw === 'high-contrast') return raw
    } catch (e) {
      /* private mode */
    }
    return 'dark'
  }

  var scheme = readPreference()
  document.documentElement.dataset.colorScheme = scheme
  document.documentElement.style.colorScheme =
    scheme === 'dark' ? 'dark' : 'light'
  var meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLOR[scheme] || THEME_COLOR.dark)
})()
