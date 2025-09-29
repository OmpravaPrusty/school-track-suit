import React from 'react';
import { cn } from '@/lib/utils';

type AttendanceStatus = 'present' | 'absent' | 'not_applicable';

interface ThreeStateToggleProps {
  value: AttendanceStatus | null; // Can still receive null for initial state
  onChange: (value: AttendanceStatus) => void;
  disabled?: boolean;
}

const ThreeStateToggle = ({ value, onChange, disabled }: ThreeStateToggleProps) => {
  const options = [
    { label: 'A', value: 'absent' as AttendanceStatus, color: 'bg-red-500 text-white', selectedColor: 'bg-red-600 text-white' },
    { label: 'NM', value: 'not_applicable' as AttendanceStatus, color: 'bg-gray-400 text-white', selectedColor: 'bg-gray-500 text-white' },
    { label: 'P', value: 'present' as AttendanceStatus, color: 'bg-green-500 text-white', selectedColor: 'bg-green-600 text-white' },
  ];

  // Handle click to cycle through states: P -> A -> N/A -> P
  const handleClick = (currentValue: AttendanceStatus | null) => {
    if (disabled) return;
    if (currentValue === 'present') {
      onChange('absent');
    } else if (currentValue === 'absent') {
      onChange('not_applicable');
    } else { // null or not_applicable
      onChange('present');
    }
  };

  // The component now expects a click on the whole container to cycle.
  // The previous design with 3 buttons was better for direct selection. Let's revert to that.
  return (
    <div
      className={cn(
        'flex w-24 h-8 rounded-md overflow-hidden shadow-sm border border-gray-200',
        disabled ? 'cursor-not-allowed opacity-50' : ''
      )}
    >
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onChange(option.value)}
          className={cn(
            'flex-1 text-xs font-bold transition-colors duration-200 ease-in-out flex items-center justify-center',
            value === option.value
              ? option.selectedColor
              : 'bg-white text-gray-700 hover:bg-gray-100'
          )}
          title={option.label}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};


export default ThreeStateToggle;
