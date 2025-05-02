import React, { useState } from 'react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

interface SearchResultsProps {
  query?: string;
  results?: SearchResult[];
  isLoading?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  query = '',
  results = [],
  isLoading = false,
}) => {
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const handleResultClick = (id: string) => {
    setSelectedResult(id === selectedResult ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Searching...</p>
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No results found for "{query}"</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {query && (
        <p className="text-sm text-gray-500 mb-4 px-4">
          Showing {results.length} results for "{query}"
        </p>
      )}
      
      <div className="divide-y divide-gray-200">
        {results.map((result) => (
          <div 
            key={result.id}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleResultClick(result.id)}
          >
            <div className="flex items-start gap-4">
              {result.imageUrl && (
                <img 
                  src={result.imageUrl} 
                  alt={result.title}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <h3 className="font-medium text-gray-900">{result.title}</h3>
                <p className="text-gray-600 mt-1">{result.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Placeholder for empty state */}
      {!query && (
        <div className="p-6 text-center">
          <p className="text-gray-500">Enter a search term to see results</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;