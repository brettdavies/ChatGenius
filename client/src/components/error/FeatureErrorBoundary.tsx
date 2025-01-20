import { ErrorBoundary } from './ErrorBoundary';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface FeatureErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  featureName: string;
}

function FeatureErrorFallback({ error, errorInfo, featureName }: FeatureErrorFallbackProps) {
  const isDevelopment = import.meta.env.MODE === 'development';

  return (
    <div className="rounded-lg bg-red-50 dark:bg-red-900/50 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            {featureName} is currently unavailable
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{error.message}</p>
          </div>

          {isDevelopment && (
            <>
              {error.stack && (
                <div className="mt-4 p-4 bg-gray-800 rounded overflow-auto">
                  <pre className="text-xs text-gray-200 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </div>
              )}
              
              {errorInfo && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                    Component Stack
                  </h3>
                  <div className="p-4 bg-gray-800 rounded overflow-auto">
                    <pre className="text-xs text-gray-200 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  children: React.ReactNode;
  featureName: string;
}

export function FeatureErrorBoundary({ children, featureName }: Props) {
  return (
    <ErrorBoundary
      fallback={({ error, errorInfo }) => (
        <FeatureErrorFallback error={error} errorInfo={errorInfo} featureName={featureName} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
} 