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

function compactBmcButton(host: HTMLElement): void {
  const anchor = host.querySelector<HTMLElement>('.bmc-btn')
  if (!anchor) return

  anchor.style.setProperty('min-width', '0', 'important')
  anchor.style.setProperty('width', 'auto', 'important')
  anchor.style.setProperty('height', '32px', 'important')
  anchor.style.setProperty('padding', '0 8px 0 6px', 'important')
  anchor.style.setProperty('font-size', '12px', 'important')
  anchor.style.setProperty('line-height', '32px', 'important')
  anchor.style.setProperty('border-radius', '6px', 'important')

  const svg = anchor.querySelector<SVGElement>('svg')
  if (svg) {
    svg.style.setProperty('height', '16px', 'important')
    svg.style.setProperty('width', '16px', 'important')
    svg.style.setProperty('transform', 'none', 'important')
  }

  const text = anchor.querySelector<HTMLElement>('.bmc-btn-text')
  if (text) {
    text.style.setProperty('width', 'auto', 'important')
    text.style.setProperty('margin-left', '5px', 'important')
  }
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
  compactBmcButton(host)
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
        compactBmcButton(hostRef.current)
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
