import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, message: err?.message || 'Unknown error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-center p-8">
          <div className="text-4xl mb-3">⚠️</div>
          <div className="text-lg font-black text-dart-dark mb-1">Something went wrong</div>
          <div className="text-sm text-gray-500 mb-4 max-w-xs">{this.state.message}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-dart-red text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
