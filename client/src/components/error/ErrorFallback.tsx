import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DebugInfo {
  componentStack: string;
  props: Record<string, unknown>;
  state: Record<string, unknown>;
  networkRequests: {
    pending: number;
    failed: Response[];
  };
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  debugInfo?: DebugInfo;
}

export function ErrorFallback({ error, errorInfo, debugInfo }: ErrorFallbackProps) {
  const isDevelopment = import.meta.env.MODE === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-center text-red-500 dark:text-red-400 mb-4">
            <ExclamationTriangleIcon className="h-12 w-12" />
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Something went wrong
          </h2>
          
          <div className="bg-red-50 dark:bg-red-900/50 rounded-md p-4 mb-6">
            <p className="text-sm text-red-800 dark:text-red-200 break-words">
              {error.message}
            </p>

            {isDevelopment && (
              <div className="mt-4 space-y-4">
                {error.stack && (
                  <div className="p-4 bg-gray-800 rounded overflow-auto">
                    <h3 className="text-sm font-medium text-gray-200 mb-2">Stack Trace</h3>
                    <pre className="text-xs text-gray-200 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>
                )}
                
                {errorInfo && (
                  <div className="p-4 bg-gray-800 rounded overflow-auto">
                    <h3 className="text-sm font-medium text-gray-200 mb-2">Component Stack</h3>
                    <pre className="text-xs text-gray-200 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}

                {debugInfo && (
                  <>
                    <div className="p-4 bg-gray-800 rounded overflow-auto">
                      <h3 className="text-sm font-medium text-gray-200 mb-2">Component State</h3>
                      <pre className="text-xs text-gray-200 whitespace-pre-wrap">
                        {JSON.stringify(debugInfo.state, null, 2)}
                      </pre>
                    </div>

                    <div className="p-4 bg-gray-800 rounded overflow-auto">
                      <h3 className="text-sm font-medium text-gray-200 mb-2">Component Props</h3>
                      <pre className="text-xs text-gray-200 whitespace-pre-wrap">
                        {JSON.stringify(debugInfo.props, null, 2)}
                      </pre>
                    </div>

                    <div className="p-4 bg-gray-800 rounded overflow-auto">
                      <h3 className="text-sm font-medium text-gray-200 mb-2">Network Status</h3>
                      <div className="text-xs text-gray-200">
                        <p>Pending Requests: {debugInfo.networkRequests.pending}</p>
                        <p>Failed Requests: {debugInfo.networkRequests.failed.length}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
            >
              Try again
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
            >
              Go to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 