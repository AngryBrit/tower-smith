import { Component, Fragment, type ErrorInfo, type ReactNode } from 'react'
import type { MainPanel } from '../mainPanelStorage'
import { PanelErrorFallback } from './PanelErrorFallback'

type PanelErrorBoundaryProps = {
  panelId: MainPanel
  panelLabel: string
  resetKey: number
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

  componentDidUpdate(prevProps: PanelErrorBoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null, componentStack: null })
    }
  }

  private handleReload = (): void => {
    this.props.onReload()
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
          onReload={this.handleReload}
        />
      )
    }
    return <Fragment key={this.props.resetKey}>{this.props.children}</Fragment>
  }
}
