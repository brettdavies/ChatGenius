import { ErrorBoundary } from './components/error/ErrorBoundary';
import { FeatureErrorBoundary } from './components/error/FeatureErrorBoundary';
import MainLayout from './components/layout/MainLayout';
import Channel from './components/channel/Channel';

export default function App() {
  return (
    <ErrorBoundary>
      <MainLayout>
        <div className="h-full flex">
          <FeatureErrorBoundary featureName="Channel List">
            <div className="w-64 flex-shrink-0">
              {/* Channel list component */}
            </div>
          </FeatureErrorBoundary>

          <div className="flex-1 flex flex-col">
            <FeatureErrorBoundary featureName="Chat">
              <Channel />
            </FeatureErrorBoundary>
          </div>

          <FeatureErrorBoundary featureName="User List">
            <div className="w-64 flex-shrink-0">
              {/* User list component */}
            </div>
          </FeatureErrorBoundary>
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
} 