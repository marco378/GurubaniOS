'use client';

import { useState, useEffect } from 'react';

interface Line {
  id: string;
  text: string;
  translation?: string;
}

interface DisplayState {
  mode: 'shabad' | 'custom' | 'blank';
  currentLineIndex: number;
  lines: Line[];
  customSlide?: {
    title: string;
    body: string;
    useGurmukhi: boolean;
  };
}

interface DisplayContentProps {
  className?: string;
}

const DisplayContent = ({ className = '' }: DisplayContentProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [displayState, setDisplayState] = useState<DisplayState>({
    mode: 'blank',
    currentLineIndex: 0,
    lines: [],
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // Load initial display state from localStorage
    const loadDisplayState = () => {
      try {
        const savedState = localStorage.getItem('gurbani-display-state');
        if (savedState) {
          const state = JSON.parse(savedState);
          setDisplayState(state);
        }
      } catch (error) {
        console.error('Error loading display state:', error);
      }
    };

    // Listen for storage changes (when controller updates it)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gurbani-display-state' && e.newValue) {
        try {
          const state = JSON.parse(e.newValue);
          setDisplayState(state);
        } catch (error) {
          console.error('Error parsing display state:', error);
        }
      }
    };

    // Load initial state
    loadDisplayState();

    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Also poll localStorage in case both windows are open in same browser
    const pollInterval = setInterval(loadDisplayState, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <div className={`min-h-screen bg-black flex items-center justify-center ${className}`}>
        <div className="text-white/20 text-2xl">Loading Display...</div>
      </div>
    );
  }

  // Blank/Waiting State
  if (displayState.mode === 'blank' || displayState.lines.length === 0) {
    return (
      <div className={`min-h-screen bg-black flex items-center justify-center ${className}`}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-white/10 border-t-white/30 rounded-full animate-spin" />
          <p className="text-white/30 text-xl">Waiting for content...</p>
        </div>
      </div>
    );
  }

  // Custom Slide Mode
  if (displayState.mode === 'custom' && displayState.customSlide) {
    return (
      <div className={`min-h-screen bg-black flex items-center justify-center p-12 ${className}`}>
        <div className="max-w-5xl w-full text-center space-y-8">
          <h1
            className={`text-6xl font-bold text-white mb-8 ${
              displayState.customSlide.useGurmukhi ? 'font-gurmukhi' : ''
            }`}
          >
            {displayState.customSlide.title}
          </h1>
          <div
            className={`text-3xl text-white/90 leading-relaxed whitespace-pre-wrap ${
              displayState.customSlide.useGurmukhi ? 'font-gurmukhi' : ''
            }`}
          >
            {displayState.customSlide.body}
          </div>
        </div>
      </div>
    );
  }

  // Shabad Mode
  const currentLine = displayState.lines[displayState.currentLineIndex];
  const previousLine =
    displayState.currentLineIndex > 0
      ? displayState.lines[displayState.currentLineIndex - 1]
      : null;
  const nextLine =
    displayState.currentLineIndex < displayState.lines.length - 1
      ? displayState.lines[displayState.currentLineIndex + 1]
      : null;

  return (
    <div className={`min-h-screen bg-black flex items-center justify-center p-8 ${className}`}>
      <div className="max-w-6xl w-full space-y-6">
        {/* Previous Line - Dimmed */}
        {previousLine && (
          <div className="text-center opacity-30 transition-all duration-300">
            <p className="text-3xl text-white font-gurmukhi">{previousLine.text}</p>
            {previousLine.translation && (
              <p className="text-xl text-white/80 mt-2">{previousLine.translation}</p>
            )}
          </div>
        )}

        {/* Current Line - Highlighted */}
        <div className="text-center py-8 px-6 bg-white/5 rounded-2xl border-2 border-white/20 shadow-2xl transition-all duration-300">
          <p className="text-6xl text-white font-gurmukhi leading-relaxed mb-6">
            {currentLine.text}
          </p>
          {currentLine.translation && (
            <p className="text-3xl text-white/90 leading-relaxed">{currentLine.translation}</p>
          )}
        </div>

        {/* Next Line - Dimmed */}
        {nextLine && (
          <div className="text-center opacity-30 transition-all duration-300">
            <p className="text-3xl text-white font-gurmukhi">{nextLine.text}</p>
            {nextLine.translation && (
              <p className="text-xl text-white/80 mt-2">{nextLine.translation}</p>
            )}
          </div>
        )}

        {/* Line Counter */}
        <div className="text-center mt-8">
          <p className="text-white/40 text-lg">
            Line {displayState.currentLineIndex + 1} of {displayState.lines.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisplayContent;