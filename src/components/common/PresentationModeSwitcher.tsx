'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

type PresentationMode = 'shabad' | 'custom';

interface PresentationModeSwitcherProps {
  defaultMode?: PresentationMode;
  onModeChange?: (mode: PresentationMode) => void;
  className?: string;
}

const PresentationModeSwitcher = ({
  defaultMode = 'shabad',
  onModeChange,
  className = '',
}: PresentationModeSwitcherProps) => {
  const [activeMode, setActiveMode] = useState<PresentationMode>(defaultMode);

  const handleModeChange = (mode: PresentationMode) => {
    setActiveMode(mode);
    onModeChange?.(mode);
  };

  const modes = [
    {
      id: 'shabad' as PresentationMode,
      label: 'Gurbani Shabad',
      icon: 'BookOpenIcon',
      description: 'Present sacred Gurbani text',
    },
    {
      id: 'custom' as PresentationMode,
      label: 'Custom Slides',
      icon: 'PresentationChartBarIcon',
      description: 'Create and manage custom slides',
    },
  ];

  return (
    <div className={`flex items-center gap-2 p-1 bg-background rounded-lg border border-border ${className}`}>
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => handleModeChange(mode.id)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-md
            transition-smooth font-medium text-sm
            ${
              activeMode === mode.id
                ? 'bg-primary text-primary-foreground shadow-elevated scale-100'
                : 'text-text-secondary hover:text-foreground hover:bg-muted active:scale-[0.98]'
            }
          `}
          aria-pressed={activeMode === mode.id}
          aria-label={mode.description}
        >
          <Icon name={mode.icon as any} size={20} />
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  );
};

export default PresentationModeSwitcher;