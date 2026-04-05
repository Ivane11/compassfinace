import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in independent module:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Pour les composants scalables, on rend `null` silencieusement ou le fallback
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}
