import { ReactNode } from 'react';
import { useNavStore } from '../stores';

interface PanelLayoutProps {
  navigation: ReactNode;
  main: ReactNode;
  detail?: ReactNode;
  className?: string;
}

export function PanelLayout({ 
  navigation, 
  main, 
  detail,
  className = '' 
}: PanelLayoutProps) {
  const { detailPanelOpen } = useNavStore();

  return (
    <div className={`flex h-screen w-full overflow-hidden ${className}`}>
      {/* Navigation Panel */}
      <div className="flex-shrink-0 w-[220px] min-w-[220px] max-w-[480px] overflow-y-auto border-r border-gray-200 dark:border-gray-800">
        {navigation}
      </div>

      {/* Main Panel */}
      <div className="flex-grow min-w-[480px] overflow-y-auto">
        {main}
      </div>

      {/* Detail Panel - Slides in/out */}
      <div 
        className={`
          flex-shrink-0 w-[400px] overflow-y-auto border-l border-gray-200 dark:border-gray-800
          transition-transform duration-300 ease-in-out
          ${detailPanelOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {detail}
      </div>
    </div>
  );
} 