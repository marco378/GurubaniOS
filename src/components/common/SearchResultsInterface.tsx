'use client';

import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';

interface SearchResult {
  id: string;
  title: string;
  preview: string;
  ang?: number;
  author?: string;
  raag?: string;
}

interface SearchResultsInterfaceProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

const SearchResultsInterface = ({
  onResultSelect,
  placeholder = 'Search Gurbani...',
  className = '',
}: SearchResultsInterfaceProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'ਜਪੁ ਜੀ ਸਾਹਿਬ',
      preview: 'ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ...',
      ang: 1,
      author: 'Guru Nanak Dev Ji',
      raag: 'No Raag',
    },
    {
      id: '2',
      title: 'ਸੋ ਦਰੁ',
      preview: 'ਸੋ ਦਰੁ ਰਾਗੁ ਆਸਾ ਮਹਲਾ ੧...',
      ang: 8,
      author: 'Guru Nanak Dev Ji',
      raag: 'Aasa',
    },
    {
      id: '3',
      title: 'ਸੋ ਪੁਰਖੁ',
      preview: 'ਸੋ ਪੁਰਖੁ ਨਿਰੰਜਨੁ ਹਰਿ ਪੁਰਖੁ ਨਿਰੰਜਨੁ...',
      ang: 10,
      author: 'Guru Nanak Dev Ji',
      raag: 'Aasa',
    },
  ];

  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      const filtered = mockResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.preview.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsSearching(false);
      setSelectedIndex(-1);
    }, 300);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, performSearch]);

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result);
    setExpandedId(expandedId === result.id ? null : result.id);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
          <Icon name="MagnifyingGlassIcon" size={20} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          aria-label="Search input"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground transition-smooth"
            aria-label="Clear search"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        )}
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-2">
          {isSearching ? (
            <div className="flex items-center justify-center p-8 bg-surface rounded-lg border border-border">
              <div className="flex items-center gap-3 text-text-secondary">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`
                    bg-surface border border-border rounded-lg overflow-hidden
                    transition-smooth
                    ${selectedIndex === index ? 'ring-2 ring-ring' : ''}
                  `}
                >
                  <button
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left p-4 hover:bg-muted transition-smooth"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground mb-1">{result.title}</h3>
                        <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                          {result.preview}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-text-secondary">
                          {result.ang && (
                            <span className="flex items-center gap-1">
                              <Icon name="BookOpenIcon" size={14} />
                              Ang {result.ang}
                            </span>
                          )}
                          {result.raag && (
                            <span className="flex items-center gap-1">
                              <Icon name="MusicalNoteIcon" size={14} />
                              {result.raag}
                            </span>
                          )}
                        </div>
                      </div>
                      <Icon
                        name={expandedId === result.id ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                        size={20}
                        className="text-text-secondary flex-shrink-0"
                      />
                    </div>
                  </button>

                  {expandedId === result.id && (
                    <div className="px-4 pb-4 border-t border-border bg-muted/30 transition-smooth">
                      <div className="pt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="UserIcon" size={16} className="text-text-secondary" />
                          <span className="text-text-secondary">Author:</span>
                          <span className="text-foreground">{result.author}</span>
                        </div>
                        <button
                          onClick={() => onResultSelect?.(result)}
                          className="w-full mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-elevated transition-smooth active:scale-[0.98] font-medium text-sm"
                        >
                          Load Content
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-surface rounded-lg border border-border">
              <Icon name="MagnifyingGlassIcon" size={48} className="text-text-secondary mb-3" />
              <p className="text-text-secondary text-sm">No results found</p>
              <p className="text-text-secondary text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      {!searchQuery && (
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Icon name="LightBulbIcon" size={16} />
            Search Tips
          </h4>
          <ul className="space-y-1 text-xs text-text-secondary">
            <li>• Search by first letter or word of shabad</li>
            <li>• Use Ang number for specific page</li>
            <li>• Search by Raag or Author name</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchResultsInterface;