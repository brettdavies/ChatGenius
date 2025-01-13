import React, { useRef, useEffect } from 'react';
import { useNavStore } from '@/stores';

interface PanelLayoutProps {
  navigation: React.ReactNode;
  main: React.ReactNode;
  detail?: React.ReactNode;
  className?: string;
}

export const PanelLayout: React.FC<PanelLayoutProps> = ({
  navigation,
  main,
  detail,
  className = ''
}) => {
  const isDetailPanelOpen = useNavStore(state => state.detailPanelOpen);
  const navPanelRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const navPanel = navPanelRef.current;
    const resizer = resizerRef.current;
    if (!navPanel || !resizer) return;

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    const startResizing = (e: MouseEvent) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = navPanel.offsetWidth;
      document.body.style.cursor = 'ew-resize';
    };

    const stopResizing = () => {
      isResizing = false;
      document.body.style.cursor = '';
    };

    const resize = (e: MouseEvent) => {
      if (!isResizing) return;

      const width = startWidth + (e.clientX - startX);
      if (width >= 220 && width <= 480) {
        navPanel.style.width = `${width}px`;
      }
    };

    resizer.addEventListener('mousedown', startResizing);
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);

    return () => {
      resizer.removeEventListener('mousedown', startResizing);
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, []);

  return (
    <div className={`flex h-screen bg-gray-900 ${className}`}>
      {/* Navigation Panel */}
      <div ref={navPanelRef} className="w-[220px] min-w-[220px] max-w-[480px] bg-gray-900 border-r border-gray-800">
        {navigation}
      </div>

      {/* Resizer */}
      <div
        ref={resizerRef}
        className="w-1 bg-gray-800 hover:bg-blue-500 cursor-ew-resize transition-colors"
      />

      {/* Main Panel */}
      <div className="flex-1 flex bg-gray-900 overflow-hidden">
        {main}
        
        {/* Detail Panel */}
        {isDetailPanelOpen && detail && (
          <div className="w-96 border-l border-gray-800 bg-gray-900">
            {detail}
          </div>
        )}
      </div>
    </div>
  );
}; 