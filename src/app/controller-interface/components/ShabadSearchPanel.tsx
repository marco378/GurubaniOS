'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface SearchResult {
  id: string;
  firstLine: string;
  ang: number;
  source: string;
  author: string;
  raag: string;
}

interface ShabadSearchPanelProps {
  onShabadSelect: (shabadId: string) => void;
  className?: string;
}

const ShabadSearchPanel = ({ onShabadSelect, className = '' }: ShabadSearchPanelProps) => {
  const [searchType, setSearchType] = useState<'ang' | 'text'>('text');
  const [angNumber, setAngNumber] = useState('');
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const mockResults: SearchResult[] = [
    {
      id: 'shabad-1',
      firstLine: 'ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ',
      ang: 1,
      source: 'Sri Guru Granth Sahib Ji',
      author: 'Guru Nanak Dev Ji',
      raag: 'No Raag',
    },
    {
      id: 'shabad-2',
      firstLine: 'ਸੋ ਦਰੁ ਰਾਗੁ ਆਸਾ ਮਹਲਾ ੧',
      ang: 8,
      source: 'Sri Guru Granth Sahib Ji',
      author: 'Guru Nanak Dev Ji',
      raag: 'Aasa',
    },
    {
      id: 'shabad-3',
      firstLine: 'ਸੋ ਪੁਰਖੁ ਨਿਰੰਜਨੁ ਹਰਿ ਪੁਰਖੁ ਨਿਰੰਜਨੁ',
      ang: 10,
      source: 'Sri Guru Granth Sahib Ji',
      author: 'Guru Nanak Dev Ji',
      raag: 'Aasa',
    },
    {
      id: 'shabad-4',
      firstLine: 'ਆਸਾ ਮਹਲਾ ੧ ॥ ਸੋ ਦਰੁ ਤੇਰਾ ਕੇਹਾ ਸੋ ਘਰੁ',
      ang: 12,
      source: 'Sri Guru Granth Sahib Ji',
      author: 'Guru Nanak Dev Ji',
      raag: 'Aasa',
    },
    {
      id: 'shabad-5',
      firstLine: 'ਜਪੁ ਜੀ ਸਾਹਿਬ ਪਉੜੀ ੧',
      ang: 2,
      source: 'Sri Guru Granth Sahib Ji',
      author: 'Guru Nanak Dev Ji',
      raag: 'No Raag',
    },
  ];

  // Normalize Gurmukhi text for better matching
  const normalizeGurmukhi = (text: string): string => {
    return text
      .normalize('NFC') // Normalize Unicode to composed form
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  const handleSearch = () => {
    setIsSearching(true);
    
    setTimeout(() => {
      if (searchType === 'ang' && angNumber) {
        const filtered = mockResults.filter(result => 
          result.ang.toString().includes(angNumber)
        );
        setResults(filtered);
      } else if (searchType === 'text' && searchText) {
        // Normalize both search text and result text for accurate Gurmukhi matching
        const normalizedSearch = normalizeGurmukhi(searchText);
        
        const filtered = mockResults.filter(result => {
          const normalizedResult = normalizeGurmukhi(result.firstLine);
          
          // Check if any word in the search query matches
          const searchWords = normalizedSearch.split(/\s+/);
          return searchWords.some(word => 
            word.length > 0 && normalizedResult.includes(word)
          );
        });
        
        setResults(filtered);
      } else {
        setResults([]);
      }
      setIsSearching(false);
    }, 500);
  };

  const handleResultClick = (shabadId: string) => {
    setSelectedId(shabadId);
    onShabadSelect(shabadId);
  };

  const handleClearSearch = () => {
    setAngNumber('');
    setSearchText('');
    setResults([]);
    setSelectedId(null);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Search Type Toggle */}
      <div className="flex items-center gap-2 p-1 bg-background rounded-lg border border-border mb-4">
        <button
          onClick={() => setSearchType('text')}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md
            transition-smooth font-medium text-sm
            ${
              searchType === 'text' ?'bg-primary text-primary-foreground shadow-elevated' :'text-text-secondary hover:text-foreground hover:bg-muted'
            }
          `}
        >
          <Icon name="MagnifyingGlassIcon" size={18} />
          <span>Text Search</span>
        </button>
        <button
          onClick={() => setSearchType('ang')}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md
            transition-smooth font-medium text-sm
            ${
              searchType === 'ang' ?'bg-primary text-primary-foreground shadow-elevated' :'text-text-secondary hover:text-foreground hover:bg-muted'
            }
          `}
        >
          <Icon name="BookOpenIcon" size={18} />
          <span>Ang Number</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="space-y-3 mb-4">
        {searchType === 'ang' ? (
          <div>
            <label htmlFor="ang-input" className="block text-sm font-medium text-text-secondary mb-2">
              Enter Ang Number
            </label>
            <input
              id="ang-input"
              type="number"
              value={angNumber}
              onChange={(e) => setAngNumber(e.target.value)}
              placeholder="e.g., 1, 8, 10..."
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="text-input" className="block text-sm font-medium text-text-secondary mb-2">
              Search Gurmukhi Text
            </label>
            <input
              id="text-input"
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Enter Gurmukhi text..."
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleSearch}
            disabled={isSearching || (!angNumber && !searchText)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:shadow-elevated transition-smooth disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] font-medium"
          >
            {isSearching ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Icon name="MagnifyingGlassIcon" size={20} />
                <span>Search</span>
              </>
            )}
          </button>
          {(angNumber || searchText || results.length > 0) && (
            <button
              onClick={handleClearSearch}
              className="px-4 py-3 bg-muted text-text-secondary hover:text-foreground rounded-lg hover:bg-muted/80 transition-smooth active:scale-[0.98]"
              aria-label="Clear search"
            >
              <Icon name="XMarkIcon" size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {results.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-text-secondary">
                {results.length} {results.length === 1 ? 'Result' : 'Results'} Found
              </h3>
            </div>
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result.id)}
                className={`
                  w-full text-left p-4 rounded-lg border transition-smooth
                  ${
                    selectedId === result.id
                      ? 'bg-primary/10 border-primary shadow-elevated'
                      : 'bg-surface border-border hover:bg-muted hover:border-muted'
                  }
                `}
              >
                <div className="space-y-2">
                  <p className="text-base font-medium text-foreground line-clamp-2">
                    {result.firstLine}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Icon name="BookOpenIcon" size={14} />
                      Ang {result.ang}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="MusicalNoteIcon" size={14} />
                      {result.raag}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">{result.author}</p>
                </div>
              </button>
            ))}
          </>
        ) : (angNumber || searchText) && !isSearching ? (
          <div className="flex flex-col items-center justify-center p-8 bg-surface rounded-lg border border-border">
            <Icon name="MagnifyingGlassIcon" size={48} className="text-text-secondary mb-3" />
            <p className="text-text-secondary text-sm">No results found</p>
            <p className="text-text-secondary text-xs mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="p-6 bg-muted/30 rounded-lg border border-border">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Icon name="LightBulbIcon" size={16} />
              Search Instructions
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li className="flex items-start gap-2">
                <Icon name="CheckCircleIcon" size={14} className="mt-0.5 flex-shrink-0" />
                <span>Use Ang Number search for specific page lookup</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircleIcon" size={14} className="mt-0.5 flex-shrink-0" />
                <span>Use Text Search to find shabads by Gurmukhi words</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircleIcon" size={14} className="mt-0.5 flex-shrink-0" />
                <span>Click on any result to load the complete shabad</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShabadSearchPanel;