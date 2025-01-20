import React from 'react';
import { ErrorFallback } from './ErrorFallback';

interface DebugInfo {
  componentStack: string;
  props: Record<string, unknown>;
  state: Record<string, unknown>;
  networkRequests: {
    pending: number;
    failed: Response[];
  };
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    errorInfo?: React.ErrorInfo;
    debugInfo?: DebugInfo;
  }>;
}

interface State {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  debugInfo: DebugInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    error: null,
    errorInfo: null,
    debugInfo: null
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Capture debug information
    const debugInfo: DebugInfo = {
      componentStack: errorInfo.componentStack || '',
      props: Object.fromEntries(
        Object.entries(this.props).filter(([key]) => key !== 'children')
      ),
      state: Object.fromEntries(
        Object.entries(this.state).filter(([_, value]) => value !== null)
      ),
      networkRequests: {
        pending: window.performance
          .getEntriesByType('resource')
          .filter(entry => entry instanceof PerformanceResourceTiming && !entry.responseEnd).length,
        failed: []
      }
    };

    // Log error to console with debug info
    console.error('Uncaught error:', {
      error,
      debugInfo,
      timestamp: new Date().toISOString(),
      url: window.location.pathname
    });
    
    this.setState({
      error,
      errorInfo,
      debugInfo
    });
  }

  render() {
    if (this.state.error) {
      const Fallback = this.props.fallback || ErrorFallback;
      return (
        <Fallback
          error={this.state.error}
          errorInfo={this.state.errorInfo || undefined}
          debugInfo={this.state.debugInfo || undefined}
        />
      );
    }

    return this.props.children;
  }
} 