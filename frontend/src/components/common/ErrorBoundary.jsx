import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
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
            errorInfo: errorInfo
        });
        
        // Log error to service
        if (process.env.NODE_ENV === 'production') {
            // Send to error tracking service
            console.error('Error caught by boundary:', error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
                            <ExclamationTriangleIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
                        </div>
                        
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {this.props.title || 'Something went wrong'}
                        </h1>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                            {this.props.message || 'We\'re sorry, but an unexpected error occurred. Please try again later.'}
                        </p>
                        
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left overflow-auto max-w-2xl">
                                <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                                        {this.state.errorInfo.componentStack}
                                    </p>
                                )}
                            </div>
                        )}
                        
                        <div className="flex items-center justify-center space-x-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <ArrowPathIcon className="h-5 w-5 mr-2" />
                                Refresh Page
                            </button>
                            
                            <button
                                onClick={() => window.location.href = '/'}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;