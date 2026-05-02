import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected application error'
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Something Broke
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              The app hit an unexpected error.
            </h1>
            <p className="mt-3 text-sm text-slate-600">{this.state.errorMessage}</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
                onClick={() => window.location.reload()}
              >
                Reload App
              </button>
              <Link
                to="/"
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
