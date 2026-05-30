import { Component, type ErrorInfo, type ReactNode } from 'react'
import type { MainPanel } from '../mainPanelStorage'
import { PanelErrorFallback } from './PanelErrorFallback'

type PanelErrorBoundaryProps = {
  panelId: MainPanel
  panelLabel: string
  onReload: () => void
  children: ReactNode
}

type PanelErrorBoundaryState = {
  error: Error | null
  componentStack: string | null
}

export class PanelErrorBoundary extends Component<
  PanelErrorBoundaryProps,
  PanelErrorBoundaryState
> {
  state: PanelErrorBoundaryState = {
    error: null,
    componentStack: null,
  }

  static getDerivedStateFromError(error: Error): Partial<PanelErrorBoundaryState> {
    return { error, componentStack: null }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ error, componentStack: info.componentStack ?? null })
    console.error(`[TowerSmith panel:${this.props.panelId}]`, error, info)
  }

  render(): ReactNode {
    const { error, componentStack } = this.state
    if (error) {
      return (
        <PanelErrorFallback
          panelId={this.props.panelId}
          panelLabel={this.props.panelLabel}
          error={error}
          componentStack={componentStack}
          onReload={this.props.onReload}
        />
      )
    }
    return this.props.children
  }
}
