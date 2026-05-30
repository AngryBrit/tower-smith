import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

export function labOverlayPortal(node: ReactNode) {
  return createPortal(node, document.body)
}
