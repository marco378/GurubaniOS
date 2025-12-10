'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Line {
  id: string;
  text: string;
  translation?: string;
}

interface ContentNavigationControlsProps {
  lines: Line[];
  currentLineIndex?: number;
  onLineChange?: (index: number) => void;
  onDisplayToggle?: (isDisplaying: boolean) => void;
  className?: string;
}

const ContentNavigationControls = ({
  lines = [],
  currentLineIndex = 0,
  onLineChange,
  onDisplayToggle,
  className = '',
}: ContentNavigationControlsProps) => {
  const [activeIndex, setActiveIndex] = useState(currentLineIndex);
  const [isDisplaying, setIsDisplaying] = useState(false);

  useEffect(() => {
    setActiveIndex(currentLineIndex);
  }, [currentLineIndex]);

  const handlePrevious = () => {
    if (activeIndex > 0) {
      const newIndex = activeIndex - 1;
      setActiveIndex(newIndex);
      onLineChange?.(newIndex);
    }
  };

  const handleNext = () => {
    if (activeIndex < lines.length - 1) {
      const newIndex = activeIndex + 1;
      setActiveIndex(newIndex);
      onLineChange?.(newIndex);
    }
  };

  const handleLineClick = (index: number) => {
    setActiveIndex(index);
    onLineChange?.(index);
  };

  const handleDisplayToggle = () => {
    const newState = !isDisplaying;
    setIsDisplaying(newState);
    onDisplayToggle?.(newState);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleDisplayToggle();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeIndex, isDisplaying, lines.length]);

  if (lines.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 bg-surface rounded-lg border border-border ${className}`}>
        <p className="text-text-secondary text-sm">No content available</p>
      </div>
    );
  }

  const previousLine = activeIndex > 0 ? lines[activeIndex - 1] : null;
  const currentLine = lines[activeIndex];
  const nextLine = activeIndex < lines.length - 1 ? lines[activeIndex + 1] : null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Display Controls */}
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={handleDisplayToggle}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              transition-smooth font-medium text-sm
              active:scale-[0.98]
              ${
                isDisplaying
                  ? 'bg-success text-success-foreground shadow-elevated'
                  : 'bg-muted text-text-secondary hover:text-foreground'
              }
            `}
            aria-label={isDisplaying ? 'Hide display' : 'Show display'}
          >
            <Icon name={isDisplaying ? 'EyeIcon' : 'EyeSlashIcon'} size={20} />
            <span>{isDisplaying ? 'Displaying' : 'Display Off'}</span>
          </button>
          <span className="text-text-secondary text-sm">
            Line {activeIndex + 1} of {lines.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={activeIndex === 0}
            className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-smooth disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            aria-label="Previous line"
          >
            <Icon name="ChevronUpIcon" size={20} />
          </button>
          <button
            onClick={handleNext}
            disabled={activeIndex === lines.length - 1}
            className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-smooth disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            aria-label="Next line"
          >
            <Icon name="ChevronDownIcon" size={20} />
          </button>
        </div>
      </div>

      {/* Context Preview */}
      <div className="space-y-2 p-4 bg-surface rounded-lg border border-border">
        {/* Previous Line */}
        {previousLine && (
          <div className="opacity-40 transition-smooth">
            <p className="text-sm text-text-secondary line-clamp-1">{previousLine.text}</p>
          </div>
        )}

        {/* Current Line */}
        <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-lg transition-smooth">
          <p className="text-base font-medium text-foreground mb-1">{currentLine.text}</p>
          {currentLine.translation && (
            <p className="text-sm text-text-secondary">{currentLine.translation}</p>
          )}
        </div>

        {/* Next Line */}
        {nextLine && (
          <div className="opacity-60 transition-smooth">
            <p className="text-sm text-text-secondary line-clamp-1">{nextLine.text}</p>
          </div>
        )}
      </div>

      {/* Line List */}
      <div className="max-h-96 overflow-y-auto space-y-1 p-4 bg-surface rounded-lg border border-border">
        {lines.map((line, index) => (
          <button
            key={line.id}
            onClick={() => handleLineClick(index)}
            className={`
              w-full text-left p-3 rounded-lg transition-smooth
              ${
                index === activeIndex
                  ? 'bg-primary text-primary-foreground shadow-elevated'
                  : 'hover:bg-muted text-text-secondary hover:text-foreground'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs opacity-60 mt-0.5">{index + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-2">{line.text}</p>
                {line.translation && (
                  <p className="text-xs opacity-75 mt-1 line-clamp-1">{line.translation}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="flex items-center justify-center gap-4 p-3 bg-muted/50 rounded-lg text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-surface rounded border border-border">↑/←</kbd>
          Previous
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-surface rounded border border-border">↓/→</kbd>
          Next
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-surface rounded border border-border">Space</kbd>
          Toggle Display
        </span>
      </div>
    </div>
  );
};

export default ContentNavigationControls;