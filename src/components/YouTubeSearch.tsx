// components/YouTubeSearch.tsx
import { useState, useEffect } from 'react';
import { searchYouTubeVideos, classifyVideo } from '@/lib/api';
import { YouTubeSearchResult, DialectClassification } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Clock, Eye, Globe } from 'lucide-react';

interface YouTubeSearchProps {
  onSelectVideo: (url: string, title: string) => void;
  isProcessing: boolean;
}

export default function YouTubeSearch({ onSelectVideo, isProcessing }: YouTubeSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] = useState<DialectClassification | null>(null);
  const [classificationError, setClassificationError] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setError(null);

      try {
        const response = await searchYouTubeVideos(query, 10);
        setResults(response.results);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Error al buscar videos');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectVideo = (result: YouTubeSearchResult) => {
    setSelectedVideoId(result.video_id);
    setClassification(null);
    setClassificationError(null);
    onSelectVideo(result.url, result.title);
  };

  const handleClassifyVideo = async (videoId: string) => {
    setIsClassifying(true);
    setClassificationError(null);

    try {
      const result = await classifyVideo(videoId);
      setClassification(result);
    } catch (err: any) {
      setClassificationError(
        err.response?.data?.detail || 'Error al clasificar el video'
      );
      setClassification(null);
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-lg border border-gray-500 shadow-md p-6">
        <Label htmlFor="search-query" className="block text-sm font-medium mb-2">
          Buscar videos de YouTube
        </Label>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            id="search-query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar videos en español..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isProcessing}
          />
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Busca videos de YouTube en español (máx. 1 hora)
        </p>

        {/* Loading state */}
        {isSearching && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Buscando videos...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && !isSearching && (
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {results.map((result) => (
              <div
                key={result.video_id}
                onClick={() => handleSelectVideo(result)}
                className={`
                  flex gap-4 p-3 rounded-lg border cursor-pointer transition-all
                  ${selectedVideoId === result.video_id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
                  ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {/* Thumbnail */}
                <img
                  src={result.thumbnail}
                  alt={result.title}
                  className="w-40 h-24 object-cover rounded-md flex-shrink-0"
                />

                {/* Video info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">
                    {result.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {result.channel_title}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{result.duration_formatted}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{result.view_count_formatted} vistas</span>
                    </div>
                  </div>
                </div>

                {/* Selected indicator */}
                {selectedVideoId === result.video_id && (
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {query.trim() && results.length === 0 && !isSearching && !error && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            No se encontraron videos
          </div>
        )}
      </div>
    </div>
  );
}
