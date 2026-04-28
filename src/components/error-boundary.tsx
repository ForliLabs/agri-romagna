"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  moduleName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.moduleName ? `:${this.props.moduleName}` : ""}]`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <div className="mb-2 text-2xl">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800">
            {this.props.moduleName
              ? `Errore nel modulo: ${this.props.moduleName}`
              : "Si è verificato un errore"}
          </h3>
          <p className="mt-2 text-sm text-red-600">
            {this.state.error?.message ?? "Errore sconosciuto"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Riprova
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Toast notification component for API errors
 */
export function ApiErrorToast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 shadow-lg">
      <span className="text-red-500">✕</span>
      <p className="text-sm text-gray-700">{message}</p>
      <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
        ✕
      </button>
    </div>
  );
}
