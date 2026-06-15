import { useEffect, type ReactNode } from 'react'

type LegalPageFrameProps = {
  title: string
  children: ReactNode
}

export function LegalPageFrame({ title, children }: LegalPageFrameProps) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} · TowerSmith`
    return () => {
      document.title = previous
    }
  }, [title])

  return (
    <div className="legal-page">
      <p className="legal-page__back">
        <a href="/">← TowerSmith</a>
      </p>
      {children}
    </div>
  )
}
