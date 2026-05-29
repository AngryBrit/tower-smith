import { useEffect, useRef } from 'react'
import { useI18n } from '../i18n'

const BMC_SCRIPT_SRC = 'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js'

const BMC_CONFIG = {
  text: 'Buy me a coffee',
  slug: 'angrybrit',
  color: '#FFDD00',
  emoji: '',
  font: 'Cookie',
  fontColor: '#000000',
  outlineColor: '#000000',
  coffeeColor: '#ffffff',
} as const

declare global {
  interface Window {
    bmcBtnWidget?: (
      text: string,
      slug: string,
      color: string,
      emoji: string,
      font?: string,
      fontColor?: string,
      outlineColor?: string,
      coffeeColor?: string,
    ) => string
  }
}

let bmcScriptLoad: Promise<void> | null = null

function loadBmcScript(): Promise<void> {
  if (window.bmcBtnWidget) return Promise.resolve()
  if (bmcScriptLoad) return bmcScriptLoad

  bmcScriptLoad = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${BMC_SCRIPT_SRC}"]`,
    )
    if (existing) {
      if (window.bmcBtnWidget) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('BMC script failed')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = BMC_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('BMC script failed'))
    document.head.appendChild(script)
  })

  return bmcScriptLoad
}

function renderBmcButton(host: HTMLElement): void {
  const widget = window.bmcBtnWidget
  if (!widget) return

  host.innerHTML = widget(
    BMC_CONFIG.text,
    BMC_CONFIG.slug,
    BMC_CONFIG.color,
    BMC_CONFIG.emoji,
    BMC_CONFIG.font,
    BMC_CONFIG.fontColor,
    BMC_CONFIG.outlineColor,
    BMC_CONFIG.coffeeColor,
  )

  // Drop BMC's bundled sizing rules; footer styles live in App.css.
  host.querySelector('style')?.remove()
}

type BuyMeACoffeeButtonProps = {
  className?: string
}

/** Official Buy Me a Coffee embed (https://buymeacoffee.com/angrybrit). */
export function BuyMeACoffeeButton({ className }: BuyMeACoffeeButtonProps) {
  const { t } = useI18n()
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let cancelled = false

    void loadBmcScript()
      .then(() => {
        if (cancelled || !hostRef.current) return
        renderBmcButton(hostRef.current)
      })
      .catch(() => {
        if (cancelled || !hostRef.current) return
        hostRef.current.innerHTML = `<a class="bmc-btn" href="https://buymeacoffee.com/${BMC_CONFIG.slug}" target="_blank" rel="noopener noreferrer">${BMC_CONFIG.text}</a>`
      })

    return () => {
      cancelled = true
      host.replaceChildren()
    }
  }, [])

  return (
    <div
      ref={hostRef}
      className={className}
      aria-label={t('sr_sponsor_title')}
    />
  )
}
