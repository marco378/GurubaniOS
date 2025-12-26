'use client';

import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import { DEFAULT_SHABAD_LINES, ShabadLine } from '@/data/shabadLines';

interface ShabadContentPanelProps {
  shabadId: string | null;
  initialLineIndex?: number;
  onLineChange?: (lineIndex: number) => void;
  onDisplayToggle?: (isDisplaying: boolean) => void;
  className?: string;
}

const ShabadContentPanel = ({
  shabadId,
  initialLineIndex = 0,
  onLineChange,
  onDisplayToggle,
  className = '',
}: ShabadContentPanelProps) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(initialLineIndex);
  // Sync currentLineIndex with parent when shabadId or initialLineIndex changes
  useEffect(() => {
    setCurrentLineIndex(initialLineIndex);
  }, [shabadId, initialLineIndex]);
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editedTranslation, setEditedTranslation] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [shabadLines, setShabadLines] = useState<ShabadLine[]>(DEFAULT_SHABAD_LINES);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean Gurmukhi text by removing orphaned combining marks
  const cleanGurmukhi = (text: string): string => {
    const gurmukhuiVowels = new Set([
      '\u0A81', // Adak Bindi
      '\u0A82', // Bindi
      '\u0A83', // Visarga
      '\u0A3C', // Nukta
      '\u0A41', // Vowel Sign U
      '\u0A42', // Vowel Sign UU
      '\u0A47', // Vowel Sign EE
      '\u0A48', // Vowel Sign AI
      '\u0A4B', // Vowel Sign OO
      '\u0A4C', // Vowel Sign AU
      '\u0A3E', // Vowel Sign AA
      '\u0A3F', // Vowel Sign I
    ]);

    const gurmukhuiBaseChars = new Set([
      '\u0A15', '\u0A16', '\u0A17', '\u0A18', '\u0A19', // Ka-Nya
      '\u0A1A', '\u0A1B', '\u0A1C', '\u0A1D', '\u0A1E', // Cha-Na
      '\u0A1F', '\u0A20', '\u0A21', '\u0A22', '\u0A23', // Tta-Na
      '\u0A24', '\u0A25', '\u0A26', '\u0A27', '\u0A28', // Ta-Na
      '\u0A2A', '\u0A2B', '\u0A2C', '\u0A2D', '\u0A2E', // Pa-Ma
      '\u0A2F', '\u0A30', '\u0A32', '\u0A33',           // Ya-Lla
      '\u0A35', '\u0A36', '\u0A37', '\u0A38', '\u0A39', // Va-Ha
      '\u0A59', '\u0A5A', '\u0A5B', '\u0A5C', '\u0A5E', // Additional consonants
    ]);

    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const code = char.charCodeAt(0);
      
      // If it's a vowel/combining mark
      if (gurmukhuiVowels.has(char)) {
        // Only add if previous character is a base consonant
        if (i > 0 && gurmukhuiBaseChars.has(text[i - 1])) {
          result += char;
        }
        // Otherwise skip it (orphaned vowel)
      } else {
        // Keep all non-vowel characters
        result += char;
      }
    }
    
    return result;
  };

  // Load translations from localStorage on mount
  useEffect(() => {
    const savedTranslations = localStorage.getItem('japji-translations');
    if (savedTranslations) {
      try {
        const parsed = JSON.parse(savedTranslations);
        setShabadLines(parsed);
      } catch (error) {
        console.error('Failed to load saved translations:', error);
      }
    }
  }, []);

  // Sync display state to localStorage for projector
  useEffect(() => {
    if (isDisplaying && shabadId) {
      const displayState = {
        mode: 'shabad',
        currentLineIndex: currentLineIndex,
        lines: shabadLines.map(line => ({
          id: line.id,
          text: cleanGurmukhi(line.gurmukhi),
          translation: line.translation,
        })),
      };
      localStorage.setItem('gurbani-display-state', JSON.stringify(displayState));
    } else {
      // Clear display state when not displaying
      localStorage.removeItem('gurbani-display-state');
    }
  }, [isDisplaying, currentLineIndex, shabadLines, shabadId]);

  // Listen for projector navigation (storage event or polling)
  useEffect(() => {
    if (!isDisplaying) return;
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gurbani-display-state' && e.newValue) {
        try {
          const state = JSON.parse(e.newValue);
          if (typeof state.currentLineIndex === 'number' && state.currentLineIndex !== currentLineIndex) {
            setCurrentLineIndex(state.currentLineIndex);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Polling fallback (for same-tab navigation)
    const pollInterval = setInterval(() => {
      try {
        const saved = localStorage.getItem('gurbani-display-state');
        if (saved) {
          const state = JSON.parse(saved);
          if (typeof state.currentLineIndex === 'number' && state.currentLineIndex !== currentLineIndex) {
            setCurrentLineIndex(state.currentLineIndex);
          }
        }
      } catch {}
    }, 500);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [isDisplaying, currentLineIndex]);

  const handleLineClick = (index: number) => {
    if (isEditMode) {
      // In edit mode, clicking a line enters edit state
      const line = shabadLines[index];
      setEditingLineId(line.id);
      setEditedTranslation(line.translation);
    }
    setCurrentLineIndex(index);
    onLineChange?.(index);
  };

  const handlePrevious = () => {
    if (currentLineIndex > 0) {
      const newIndex = currentLineIndex - 1;
      setCurrentLineIndex(newIndex);
      onLineChange?.(newIndex);
    }
  };

  const handleNext = () => {
    if (currentLineIndex < shabadLines.length - 1) {
      const newIndex = currentLineIndex + 1;
      setCurrentLineIndex(newIndex);
      onLineChange?.(newIndex);
    }
  };

  const handleDisplayToggle = () => {
    const newState = !isDisplaying;
    setIsDisplaying(newState);
    onDisplayToggle?.(newState);
    
    if (newState) {
      // Open projector display in a new window
      const projectorWindow = window.open(
        '/projector-display',
        'GurbaniProjector',
        'width=1920,height=1080,left=0,top=0'
      );
      if (!projectorWindow) {
        alert('Popup blocked! Please enable popups for this site to open the projector display.');
      }
    }
  };

  const handleClearDisplay = () => {
    setIsDisplaying(false);
    onDisplayToggle?.(false);
  };

  const handleEditTranslation = (lineId: string, currentTranslation: string) => {
    setEditingLineId(lineId);
    setEditedTranslation(currentTranslation);
  };

  const handleSaveTranslation = () => {
    if (!editingLineId) return;

    const updatedLines = shabadLines.map((line) =>
      line.id === editingLineId
        ? { ...line, translation: editedTranslation }
        : line
    );

    setShabadLines(updatedLines);
    setEditingLineId(null);
    setEditedTranslation('');
    setHasUnsavedChanges(true);
  };

  const handleCancelEdit = () => {
    setEditingLineId(null);
    setEditedTranslation('');
  };

  const handleSaveAllChanges = () => {
    localStorage.setItem('japji-translations', JSON.stringify(shabadLines));
    setHasUnsavedChanges(false);
    alert('Translations saved successfully!');
  };

  const handleExportTranslations = () => {
    const dataStr = JSON.stringify(shabadLines, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `japji-translations-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportTranslations = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);
        
        // Validate the imported data structure
        if (!Array.isArray(imported)) {
          alert('Invalid file format. Expected an array of translation objects.');
          return;
        }

        // Validate each line has required fields
        const isValid = imported.every(
          (line) =>
            line.id &&
            line.gurmukhi &&
            line.translation !== undefined
        );

        if (!isValid) {
          alert('Invalid file format. Each line must have id, gurmukhi, and translation fields.');
          return;
        }

        setShabadLines(imported);
        setHasUnsavedChanges(true);
        alert(`Successfully imported ${imported.length} translations!`);
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import translations. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input value to allow re-importing the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetTranslations = () => {
    if (confirm('Are you sure you want to reset all translations to default? This cannot be undone.')) {
      setShabadLines(DEFAULT_SHABAD_LINES);
      localStorage.removeItem('japji-translations');
      setHasUnsavedChanges(false);
      alert('Translations reset to default successfully!');
    }
  };

  if (!shabadId) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-8 bg-surface rounded-lg border border-border ${className}`}>
        <Icon name="BookOpenIcon" size={64} className="text-text-secondary mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Shabad Selected</h3>
        <p className="text-sm text-text-secondary text-center max-w-md">
          Search and select a shabad from the left panel to begin presentation management
        </p>
      </div>
    );
  }

  const previousLine = currentLineIndex > 0 ? shabadLines[currentLineIndex - 1] : null;
  const currentLine = shabadLines[currentLineIndex];
  const nextLine = currentLineIndex < shabadLines.length - 1 ? shabadLines[currentLineIndex + 1] : null;

  return (
    <div className={`flex flex-col h-full space-y-2 ${className}`}>
      {/* Translation Management Controls */}
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg
              transition-smooth font-medium text-sm
              active:scale-[0.98]
              ${
                isEditMode
                  ? 'bg-primary text-primary-foreground shadow-elevated'
                  : 'bg-muted text-text-secondary hover:text-foreground hover:bg-muted'
              }
            `}
          >
            <Icon name={isEditMode ? 'PencilSquareIcon' : 'PencilIcon'} size={20} />
            <span>{isEditMode ? 'Editing Mode' : 'Edit Translations'}</span>
          </button>

          {hasUnsavedChanges && (
            <button
              onClick={handleSaveAllChanges}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-success text-success-foreground hover:bg-success/90 transition-smooth active:scale-[0.98] font-medium text-sm shadow-elevated"
            >
              <Icon name="CheckCircleIcon" size={20} />
              <span>Save Changes</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportTranslations}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted text-text-secondary hover:text-foreground hover:bg-primary hover:text-primary-foreground transition-smooth active:scale-[0.98] font-medium text-sm"
          >
            <Icon name="ArrowUpTrayIcon" size={20} />
            <span>Import JSON</span>
          </button>
          <button
            onClick={handleExportTranslations}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted text-text-secondary hover:text-foreground hover:bg-primary hover:text-primary-foreground transition-smooth active:scale-[0.98] font-medium text-sm"
          >
            <Icon name="ArrowDownTrayIcon" size={20} />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleResetTranslations}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted text-text-secondary hover:text-foreground hover:bg-destructive hover:text-destructive-foreground transition-smooth active:scale-[0.98] font-medium text-sm"
          >
            <Icon name="ArrowPathIcon" size={20} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Display Controls */}
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={handleDisplayToggle}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg
              transition-smooth font-medium text-sm
              active:scale-[0.98]
              ${
                isDisplaying
                  ? 'bg-success text-success-foreground shadow-elevated'
                  : 'bg-muted text-text-secondary hover:text-foreground hover:bg-primary hover:text-primary-foreground'
              }
            `}
          >
            <Icon name={isDisplaying ? 'EyeIcon' : 'EyeSlashIcon'} size={20} />
            <span>{isDisplaying ? 'Displaying' : 'Display Off'}</span>
          </button>
          <button
            onClick={handleClearDisplay}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted text-text-secondary hover:text-foreground hover:bg-destructive hover:text-destructive-foreground transition-smooth active:scale-[0.98] font-medium text-sm"
          >
            <Icon name="XCircleIcon" size={20} />
            <span>Clear Display</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-text-secondary text-sm">
            Line {currentLineIndex + 1} of {shabadLines.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentLineIndex === 0}
              className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-smooth disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              aria-label="Previous line"
            >
              <Icon name="ChevronUpIcon" size={20} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentLineIndex === shabadLines.length - 1}
              className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-smooth disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              aria-label="Next line"
            >
              <Icon name="ChevronDownIcon" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Context Preview */}
      <div className="max-h-64 overflow-y-auto space-y-3 p-4 bg-surface rounded-lg border border-border flex-shrink-0">
        <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
          <Icon name="EyeIcon" size={16} />
          Display Preview
        </h3>
        
        {/* Previous Line */}
        {previousLine && (
          <div className="opacity-40 transition-smooth">
            <p className="text-sm text-text-secondary line-clamp-1 font-gurmukhi">
              {cleanGurmukhi(previousLine.gurmukhi)}
            </p>
          </div>
        )}

        {/* Current Line */}
        <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-lg transition-smooth">
          <p className="text-lg font-medium text-foreground mb-2 font-gurmukhi">
            {cleanGurmukhi(currentLine.gurmukhi)}
          </p>
          <p className="text-sm text-text-secondary">{currentLine.translation}</p>
          {currentLine.translationSource && (
            <p className="text-xs text-text-secondary mt-2 opacity-75">
              Translation: {currentLine.translationSource}
            </p>
          )}
        </div>

        {/* Next Line */}
        {nextLine && (
          <div className="opacity-60 transition-smooth">
            <p className="text-sm text-text-secondary line-clamp-1 font-gurmukhi">
              {cleanGurmukhi(nextLine.gurmukhi)}
            </p>
          </div>
        )}
      </div>

      {/* Complete Shabad Lines with Edit Capability */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-surface rounded-lg border border-border">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2 sticky top-0 bg-surface pb-3 z-10">
          <Icon name="ListBulletIcon" size={18} />
          All Lines {isEditMode && <span className="text-xs text-primary">(Click to edit)</span>}
        </h3>
        {shabadLines.map((line, index) => (
          <div
            key={line.id}
            className={`
              w-full p-4 rounded-lg transition-smooth
              ${
                index === currentLineIndex
                  ? 'bg-primary/10 border-2 border-primary' :'bg-background border border-border'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs opacity-60 mt-1 flex-shrink-0 w-6">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-base font-gurmukhi text-foreground leading-relaxed">
                  {cleanGurmukhi(line.gurmukhi)}
                </p>
                
                {editingLineId === line.id ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      value={editedTranslation}
                      onChange={(e) => setEditedTranslation(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveTranslation}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success text-success-foreground hover:bg-success/90 transition-smooth text-xs font-medium"
                      >
                        <Icon name="CheckIcon" size={16} />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-text-secondary hover:bg-destructive hover:text-destructive-foreground transition-smooth text-xs font-medium"
                      >
                        <Icon name="XMarkIcon" size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-text-secondary flex-1 leading-relaxed">
                      {line.translation}
                    </p>
                    {isEditMode && (
                      <button
                        onClick={() => handleEditTranslation(line.id, line.translation)}
                        className="p-1 rounded hover:bg-primary hover:text-primary-foreground transition-smooth flex-shrink-0"
                        aria-label="Edit translation"
                      >
                        <Icon name="PencilIcon" size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="flex items-center justify-center gap-4 p-3 bg-muted/50 rounded-lg text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-surface rounded border border-border">↑</kbd>
          Previous
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-surface rounded border border-border">↓</kbd>
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

export default ShabadContentPanel;