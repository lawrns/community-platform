'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { isBrowser } from '@/lib/environment';
import ClientSideOnly from '@/components/ClientSideOnly';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  ChevronDown,
  ArrowUp,
  Calendar,
  Tag,
  Clock,
  MessageSquare,
  ThumbsUp,
  User,
  Sparkles,
  FileText,
  HelpCircle,
  Wrench
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface SearchResultProps {
  id: string;
  title: string;
  excerpt: string;
  type: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_id: string;
  upvotes: number;
  comments_count: number;
  tags: string[];
  relevance_score?: number;
}

interface SearchResultsProps {
  initialQuery?: string;
}

export default function SearchResults({ initialQuery = '' }: SearchResultsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams?.get('q') || initialQuery;
  const type = searchParams?.get('type') || '';
  const tag = searchParams?.get('tag') || '';
  const dateRange = searchParams?.get('date_range') || '';
  const sort = searchParams?.get('sort') || 'relevance';

  const [results, setResults] = useState<SearchResultProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchType, setSearchType] = useState<'vector' | 'lexical' | 'hybrid'>('hybrid');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(tag ? [tag] : []);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState(query || '');
  const LIMIT = 10;

  // Fetch search results when query or filters change
  useEffect(() => {
    if (!query) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Construct search parameters
        const searchParams = {
          query,
          page: 1,
          limit: LIMIT,
          type: type || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          sort: sort as 'relevance' | 'date' | 'popularity',
          date_range: dateRange || undefined
        };

        // Execute search
        const response = await api.search.search(searchParams);

        if (response.results) {
          setResults(response.results);
          setTotalResults(response.total);
          setPage(1);
          setHasMore(response.results.length < response.total);
          setSearchType(response.search_type);

          // Extract unique tags from results for filtering
          const allTags = response.results
            .flatMap(result => result.tags || [])
            .filter((tag, index, self) => self.indexOf(tag) === index);
          setTags(allTags);
        }
      } catch (err: any) {
        console.error('Error searching:', err);
        setError(err.message || 'Failed to search. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, type, selectedTags, sort, dateRange]);

  // Load more results
  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);

      // Construct search parameters for next page
      const searchParams = {
        query,
        page: page + 1,
        limit: LIMIT,
        type: type || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        sort: sort as 'relevance' | 'date' | 'popularity',
        date_range: dateRange || undefined
      };

      // Execute search
      const response = await api.search.search(searchParams);

      if (response.results) {
        setResults(prev => [...prev, ...response.results]);
        setPage(prev => prev + 1);
        setHasMore(response.results.length < (response.total - results.length));
      }
    } catch (err: any) {
      console.error('Error loading more results:', err);
      setError(err.message || 'Failed to load more results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get search suggestions as user types
  useEffect(() => {
    if (!inputValue || inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        // Only get suggestions if we're not already showing results for this query
        if (inputValue !== query) {
          const response = await api.search.getSuggestions(inputValue);
          if (response.suggestions) {
            setSuggestions(response.suggestions);
          }
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [inputValue, query]);

  // Update URL when filters change
  const updateFilters = (
    newType?: string,
    newTags?: string[],
    newSort?: string,
    newDateRange?: string
  ) => {
    const params = new URLSearchParams();

    if (query) params.set('q', query);
    if (newType) params.set('type', newType);
    if (newTags && newTags.length > 0) params.set('tag', newTags[0]); // For simplicity, just use first tag
    if (newSort) params.set('sort', newSort);
    if (newDateRange) params.set('date_range', newDateRange);

    router.push(`/search?${params.toString()}`);
  };

  // Submit search form
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!inputValue.trim()) return;

    const params = new URLSearchParams();
    params.set('q', inputValue);

    // Keep existing filters
    if (type) params.set('type', type);
    if (selectedTags.length > 0) params.set('tag', selectedTags[0]);
    if (sort) params.set('sort', sort);
    if (dateRange) params.set('date_range', dateRange);

    router.push(`/search?${params.toString()}`);
    setSuggestions([]);
  };

  // Get content type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'question':
        return <HelpCircle className="h-4 w-4" />;
      case 'tool':
        return <Wrench className="h-4 w-4" />;
      case 'tutorial':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Empty state message
  const getEmptyMessage = () => {
    if (!query) {
      return 'Enter a search term to find content';
    }

    if (selectedTags.length > 0 || type) {
      return 'No results found with the current filters. Try removing some filters.';
    }

    return 'No results found for your search. Try different keywords.';
  };

  return (
    <div className="w-full">
      {/* Search Form */}
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search for topics, tools, or questions..."
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="absolute right-3 top-3">
            <Search className="h-5 w-5 text-gray-400" />
          </button>

          {/* Search suggestions */}
          {suggestions.length > 0 && !isLoading && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    setInputValue(suggestion);
                    setSuggestions([]);

                    const params = new URLSearchParams();
                    params.set('q', suggestion);
                    router.push(`/search?${params.toString()}`);
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      {query && !isLoading && !error && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {totalResults} result{totalResults !== 1 && 's'} for "{query}"
            </h2>
            <p className="text-sm text-muted-foreground">
              Using {searchType === 'vector' ? 'semantic' : searchType === 'lexical' ? 'keyword' : 'hybrid'} search
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 border rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Content Type</label>
            <Select
              value={type || "all"}
              onValueChange={(value) => updateFilters(value === "all" ? "" : value, selectedTags, sort, dateRange)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="question">Questions</SelectItem>
                <SelectItem value="tutorial">Tutorials</SelectItem>
                <SelectItem value="tool">Tools</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sort By</label>
            <Select
              value={sort}
              onValueChange={(value) => updateFilters(type, selectedTags, value, dateRange)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Relevance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="date">Newest First</SelectItem>
                <SelectItem value="popularity">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <Select
              value={dateRange}
              onValueChange={(value) => updateFilters(type, selectedTags, sort, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This week</SelectItem>
                <SelectItem value="this_month">This month</SelectItem>
                <SelectItem value="this_year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tag filtering would go here, but using a simple approach for now */}
          {tags.length > 0 && (
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const newTags = selectedTags.includes(tag)
                        ? selectedTags.filter(t => t !== tag)
                        : [...selectedTags, tag];
                      setSelectedTags(newTags);
                      updateFilters(type, newTags, sort, dateRange);
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && page === 1 && (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, index) => (
            <Card key={index}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-3 w-1/4" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 text-center border rounded-lg bg-red-50 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button variant="outline" onClick={() => isBrowser() && window.location.reload()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && results.length === 0 && (
        <div className="p-12 text-center border rounded-lg">
          <Sparkles className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">No results found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {getEmptyMessage()}
          </p>
          {(selectedTags.length > 0 || type) && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTags([]);
                updateFilters('', [], sort, dateRange);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && results.length > 0 && (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      result.type === 'question' ? 'destructive' :
                      result.type === 'tutorial' ? 'outline' : 'default'
                    }>
                      <span className="flex items-center gap-1">
                        {getTypeIcon(result.type)}
                        {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                      </span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {format(new Date(result.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {result.relevance_score && (
                    <span className="text-xs text-muted-foreground">
                      Match: {Math.round(result.relevance_score * 100)}%
                    </span>
                  )}
                </div>
                <CardTitle className="mt-1 text-lg">
                  <Link href={`/view/${result.id}`} className="hover:text-primary hover:underline">
                    {result.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-sm text-muted-foreground">
                  {result.excerpt}
                </p>
                {result.tags && result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {result.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    <Link href={`/profile/${result.author_id}`} className="hover:underline">
                      {result.author_name}
                    </Link>
                  </span>
                  <span className="flex items-center">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {result.upvotes}
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {result.comments_count}
                  </span>
                </div>
                <Link href={`/view/${result.id}`} className="text-xs font-medium text-primary hover:underline">
                  Read More
                </Link>
              </CardFooter>
            </Card>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Loading...
                  </>
                ) : (
                  'Load More Results'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}