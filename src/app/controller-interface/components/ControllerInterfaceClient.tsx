'use client';

import { useState, useEffect } from 'react';
import PresentationModeSwitcher from '@/components/common/PresentationModeSwitcher';
import ShabadSearchPanel from './ShabadSearchPanel';
import ShabadContentPanel from './ShabadContentPanel';
import CustomSlideEditor from './CustomSlideEditor';
import { DEFAULT_SHABAD_LINES } from '@/data/shabadLines';

type PresentationMode = 'shabad' | 'custom';

const ControllerInterfaceClient = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [presentationMode, setPresentationMode] = useState<PresentationMode>('shabad');
  const [selectedShabadId, setSelectedShabadId] = useState<string | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'content'>('search');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex items-center gap-3 text-text-secondary">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading Controller Interface...</span>
        </div>
      </div>
    );
  }

  const handleModeChange = (mode: PresentationMode) => {
    setPresentationMode(mode);
    setSelectedShabadId(null);
    setCurrentLineIndex(0);
    setIsDisplaying(false);
  };

  const handleShabadSelect = (shabadId: string) => {
    setSelectedShabadId(shabadId);
    setCurrentLineIndex(0);
    setActiveTab('content');
  };

  const handleLineChange = (lineIndex: number) => {
    setCurrentLineIndex(lineIndex);
  };

  const handleDisplayToggle = (displaying: boolean) => {
    setIsDisplaying(displaying);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1920px] mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">
              Controller Interface
            </h1>
            <p className="text-sm text-text-secondary">
              Manage Gurbani presentations for religious services
            </p>
          </div>
          <PresentationModeSwitcher
            defaultMode={presentationMode}
            onModeChange={handleModeChange}
          />
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isDisplaying ? 'bg-success animate-pulse' : 'bg-muted'
                }`}
              />
              <span className="text-sm text-text-secondary">
                {isDisplaying ? 'Display Active' : 'Display Inactive'}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm text-text-secondary">
              Mode: {presentationMode === 'shabad' ? 'Gurbani Shabad' : 'Custom Slides'}
            </span>
          </div>
          <div className="text-xs text-text-secondary">
            Sync Status: Connected
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden flex items-center gap-2 p-1 bg-surface rounded-lg border border-border">
          <button
            onClick={() => setActiveTab('search')}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md
              transition-smooth font-medium text-sm
              ${
                activeTab === 'search' ?'bg-primary text-primary-foreground shadow-elevated' :'text-text-secondary hover:text-foreground hover:bg-muted'
              }
            `}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md
              transition-smooth font-medium text-sm
              ${
                activeTab === 'content' ?'bg-primary text-primary-foreground shadow-elevated' :'text-text-secondary hover:text-foreground hover:bg-muted'
              }
            `}
          >
            Content
          </button>
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Search/Input */}
          <div className={`${activeTab === 'search' ? 'block' : 'hidden'} lg:block`}>
            <div className="h-[calc(100vh-80px)] bg-surface rounded-lg border border-border p-6">
              {presentationMode === 'shabad' ? (
                <ShabadSearchPanel 
                  onShabadSelect={handleShabadSelect}
                  shabadLines={DEFAULT_SHABAD_LINES}
                />
              ) : (
                <CustomSlideEditor
                  onDisplayToggle={handleDisplayToggle}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Content Management */}
          <div className={`${activeTab === 'content' ? 'block' : 'hidden'} lg:block`}>
            <div className="h-[calc(100vh-80px)] bg-surface rounded-lg border border-border p-6">
              {presentationMode === 'shabad' ? (
                <ShabadContentPanel
                  shabadId={selectedShabadId}
                  onLineChange={handleLineChange}
                  onDisplayToggle={handleDisplayToggle}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-8 h-8 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Custom Slide Mode
                  </h3>
                  <p className="text-sm text-text-secondary max-w-md">
                    Create and manage custom presentation slides with title and body content. Toggle Gurmukhi font rendering as needed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControllerInterfaceClient;