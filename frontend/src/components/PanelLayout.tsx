import { ReactNode } from 'react';
import { useNavStore } from '../stores/navStore';

interface PanelLayoutProps {
  navigation: ReactNode;
  main: ReactNode;
  detail?: ReactNode;
  className?: string;
}

export const PanelLayout = ({
  navigation,
  main,
  detail,
  className = '',
}: PanelLayoutProps) => {
  const { detailPanelOpen } = useNavStore();

  return (
    <div className={`flex h-screen w-full overflow-hidden ${className}`}>
      {/* Navigation Panel - 10-25% width */}
      <div className="flex-shrink-0 w-[10%] min-w-[200px] max-w-[25%] h-full overflow-y-auto border-r border-gray-200 dark:border-gray-700">
        {navigation}
      </div>

      {/* Main Panel - Flexible width */}
      <div className="flex-grow h-full overflow-y-auto">
        {main}
      </div>

      {/* Detail Panel - Slides in/out, fixed width */}
      <div
        className={`flex-shrink-0 w-[400px] h-full overflow-y-auto border-l border-gray-200 dark:border-gray-700 transition-transform duration-300 ${
          detailPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {detail}
      </div>
    </div>
  );
}; 