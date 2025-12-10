'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface CustomSlide {
  id: string;
  title: string;
  body: string;
  useGurmukhiFont: boolean;
}

interface CustomSlideEditorProps {
  onSlideCreate?: (slide: CustomSlide) => void;
  onDisplayToggle?: (isDisplaying: boolean) => void;
  className?: string;
}

const CustomSlideEditor = ({
  onSlideCreate,
  onDisplayToggle,
  className = '',
}: CustomSlideEditorProps) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [useGurmukhiFont, setUseGurmukhiFont] = useState(false);
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [savedSlides, setSavedSlides] = useState<CustomSlide[]>([]);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);

  const handleCreateSlide = () => {
    if (!title.trim() && !body.trim()) return;

    const newSlide: CustomSlide = {
      id: `slide-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      useGurmukhiFont,
    };

    setSavedSlides([...savedSlides, newSlide]);
    onSlideCreate?.(newSlide);
    
    // Clear form
    setTitle('');
    setBody('');
  };

  const handleLoadSlide = (slide: CustomSlide) => {
    setTitle(slide.title);
    setBody(slide.body);
    setUseGurmukhiFont(slide.useGurmukhiFont);
    setSelectedSlideId(slide.id);
  };

  const handleDeleteSlide = (slideId: string) => {
    setSavedSlides(savedSlides.filter(slide => slide.id !== slideId));
    if (selectedSlideId === slideId) {
      setSelectedSlideId(null);
      setTitle('');
      setBody('');
    }
  };

  const handleDisplayToggle = () => {
    const newState = !isDisplaying;
    setIsDisplaying(newState);
    onDisplayToggle?.(newState);
  };

  const handleClearDisplay = () => {
    setIsDisplaying(false);
    onDisplayToggle?.(false);
  };

  const handleClearForm = () => {
    setTitle('');
    setBody('');
    setSelectedSlideId(null);
  };

  return (
    <div className={`flex flex-col h-full space-y-4 ${className}`}>
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
      </div>

      {/* Slide Editor */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-surface rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Icon name="PresentationChartBarIcon" size={18} />
            Custom Slide Editor
          </h3>
          {(title || body) && (
            <button
              onClick={handleClearForm}
              className="text-xs text-text-secondary hover:text-foreground transition-smooth"
            >
              Clear Form
            </button>
          )}
        </div>

        {/* Title Input */}
        <div>
          <label htmlFor="slide-title" className="block text-sm font-medium text-text-secondary mb-2">
            Slide Title
          </label>
          <input
            id="slide-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter slide title..."
            className={`w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-ring transition-smooth ${useGurmukhiFont ? 'font-gurmukhi' : ''}`}
          />
        </div>

        {/* Body Input */}
        <div>
          <label htmlFor="slide-body" className="block text-sm font-medium text-text-secondary mb-2">
            Slide Content
          </label>
          <textarea
            id="slide-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter slide content..."
            rows={8}
            className={`w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-ring transition-smooth resize-none ${useGurmukhiFont ? 'font-gurmukhi' : ''}`}
          />
        </div>

        {/* Gurmukhi Font Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Icon name="LanguageIcon" size={20} className="text-text-secondary" />
            <div>
              <p className="text-sm font-medium text-foreground">Use Gurmukhi Font</p>
              <p className="text-xs text-text-secondary">Enable for Punjabi text rendering</p>
            </div>
          </div>
          <button
            onClick={() => setUseGurmukhiFont(!useGurmukhiFont)}
            className={`
              relative w-12 h-6 rounded-full transition-smooth
              ${useGurmukhiFont ? 'bg-primary' : 'bg-muted'}
            `}
            aria-label="Toggle Gurmukhi font"
          >
            <span
              className={`
                absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-smooth
                ${useGurmukhiFont ? 'translate-x-6' : 'translate-x-0'}
              `}
            />
          </button>
        </div>

        {/* Preview */}
        <div className="p-4 bg-background rounded-lg border border-border">
          <h4 className="text-xs font-medium text-text-secondary mb-3 flex items-center gap-2">
            <Icon name="EyeIcon" size={14} />
            Preview
          </h4>
          <div className="space-y-3">
            {title && (
              <h3 className={`text-xl font-semibold text-foreground ${useGurmukhiFont ? 'font-gurmukhi' : ''}`}>
                {title}
              </h3>
            )}
            {body && (
              <p className={`text-sm text-text-secondary whitespace-pre-wrap ${useGurmukhiFont ? 'font-gurmukhi' : ''}`}>
                {body}
              </p>
            )}
            {!title && !body && (
              <p className="text-xs text-text-secondary italic">Preview will appear here...</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateSlide}
            disabled={!title.trim() && !body.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:shadow-elevated transition-smooth disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] font-medium"
          >
            <Icon name="PlusCircleIcon" size={20} />
            <span>Save Slide</span>
          </button>
        </div>
      </div>

      {/* Saved Slides */}
      {savedSlides.length > 0 && (
        <div className="space-y-2 p-4 bg-surface rounded-lg border border-border max-h-64 overflow-y-auto">
          <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2 sticky top-0 bg-surface pb-2">
            <Icon name="FolderIcon" size={16} />
            Saved Slides ({savedSlides.length})
          </h3>
          {savedSlides.map((slide) => (
            <div
              key={slide.id}
              className={`
                p-3 rounded-lg border transition-smooth
                ${
                  selectedSlideId === slide.id
                    ? 'bg-primary/10 border-primary' :'bg-background border-border hover:bg-muted'
                }
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => handleLoadSlide(slide)}
                  className="flex-1 text-left"
                >
                  <p className={`text-sm font-medium text-foreground mb-1 ${slide.useGurmukhiFont ? 'font-gurmukhi' : ''}`}>
                    {slide.title || 'Untitled Slide'}
                  </p>
                  <p className={`text-xs text-text-secondary line-clamp-2 ${slide.useGurmukhiFont ? 'font-gurmukhi' : ''}`}>
                    {slide.body}
                  </p>
                </button>
                <button
                  onClick={() => handleDeleteSlide(slide.id)}
                  className="p-1.5 rounded hover:bg-destructive hover:text-destructive-foreground transition-smooth"
                  aria-label="Delete slide"
                >
                  <Icon name="TrashIcon" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSlideEditor;