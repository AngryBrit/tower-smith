import { useEffect, useState } from 'react'

export function useSimulatedProgress(active: boolean): number {
  const [percent, setPercent] = useState(10)

  useEffect(() => {
    if (!active) return

    const startId = window.requestAnimationFrame(() => {
      setPercent(14)
    })
    const id = window.setInterval(() => {
      setPercent((current) => {
        if (current >= 92) return current
        const step = Math.max(1, Math.round((92 - current) * 0.12))
        return Math.min(92, current + step)
      })
    }, 350)

    return () => {
      window.cancelAnimationFrame(startId)
      window.clearInterval(id)
    }
  }, [active])

  return active ? percent : 10
}
