'use client';

import { useEffect } from 'react';
import { HashtagIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface RockerSwitchProps {
  value: 'public' | 'private';
  onChange: (value: 'public' | 'private') => void;
  disabled?: boolean;
}

export default function RockerSwitch({ value, onChange, disabled = false }: RockerSwitchProps) {
  console.log('[RockerSwitch] Rendering with props:', {
    value,
    valueType: typeof value,
    disabled,
    stack: new Error().stack
  });

  useEffect(() => {
    console.log('[RockerSwitch] Value changed:', {
      value,
      valueType: typeof value,
      valueToString: value.toString(),
      valueJSON: JSON.stringify(value),
      stack: new Error().stack
    });
  }, [value]);

  const handlePublicClick = () => {
    console.log('[RockerSwitch] Public button clicked:', {
      currentValue: value,
      disabled,
      stack: new Error().stack
    });
    if (!disabled) {
      console.log('[RockerSwitch] Triggering onChange with "public"');
      onChange('public');
    }
  };

  const handlePrivateClick = () => {
    console.log('[RockerSwitch] Private button clicked:', {
      currentValue: value,
      disabled,
      stack: new Error().stack
    });
    if (!disabled) {
      console.log('[RockerSwitch] Triggering onChange with "private"');
      onChange('private');
    }
  };

  return (
    <div className="relative flex h-[32px] w-full rounded-md bg-[#1a1d21] p-[2px]">
      {/* Sliding background */}
      <div
        className={`absolute top-[2px] h-[28px] w-[calc(50%-2px)] rounded bg-[#222529] transition-all duration-200 ease-in-out ${
          value === 'public' ? 'left-[2px]' : 'left-[calc(50%)]'
        }`}
      />
      
      {/* Public option */}
      <button
        type="button"
        onClick={handlePublicClick}
        className={`relative flex flex-1 items-center justify-center gap-2 rounded-sm transition-colors ${
          value === 'public'
            ? 'text-white'
            : 'text-gray-500 hover:text-gray-400'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        disabled={disabled}
      >
        <HashtagIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Public</span>
      </button>

      {/* Private option */}
      <button
        type="button"
        onClick={handlePrivateClick}
        className={`relative flex flex-1 items-center justify-center gap-2 rounded-sm transition-colors ${
          value === 'private'
            ? 'text-white'
            : 'text-gray-500 hover:text-gray-400'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        disabled={disabled}
      >
        <LockClosedIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Private</span>
      </button>
    </div>
  );
} 