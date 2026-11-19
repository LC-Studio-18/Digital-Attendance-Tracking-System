import { Component, useState } from 'react';
import DashboardRetry from './components/DashboardRetry';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: 'Failed to load dashboard.' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Failed to load dashboard.',
    };
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: 'Failed to load dashboard.' });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <DashboardRetry
          message={this.state.errorMessage}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [retryCount, setRetryCount] = useState(0);

  return (
    <ErrorBoundary onRetry={() => setRetryCount((prev) => prev + 1)}>
      <div key={retryCount}>
        {/* Group's dashboard content goes here when merged */}
      </div>
    </ErrorBoundary>
  );
}