'use client'

import { Component } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

class PWAErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to service worker for offline analysis
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'LOG_ERROR',
        error: {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-theme-background flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full mb-6">
              <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-theme-text mb-4">
              Something went wrong
            </h1>
            
            <p className="text-theme-text-secondary mb-8 leading-relaxed">
              The application encountered an unexpected error. This has been logged for analysis.
            </p>
            
            <div className="space-y-4">
              <Button onClick={this.handleReload} className="w-full">
                Reload Application
              </Button>
              
              <Button 
                variant="outline" 
                onClick={this.handleReset} 
                className="w-full"
              >
                Try Again
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-theme-text-secondary mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-theme-secondary/50 rounded p-4 text-xs text-theme-text-secondary font-mono overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PWAErrorBoundary;
