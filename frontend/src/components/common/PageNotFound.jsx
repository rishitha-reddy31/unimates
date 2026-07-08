import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const PageNotFound = () => {
    return (
        <>
            <Helmet>
                <title>Page Not Found - Unimates</title>
            </Helmet>
            
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="max-w-lg w-full text-center">
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center h-32 w-32 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-6">
                            <span className="text-6xl font-bold text-blue-600 dark:text-blue-400">404</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Page Not Found
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            The page you're looking for doesn't exist or has been moved.
                        </p>
                        <div className="space-x-4">
                            <Link
                                to="/"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <svg
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                                Go Home
                            </Link>
                            <button
                                onClick={() => window.history.back()}
                                className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                <svg
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PageNotFound;