import SearchResults from '@/components/search/SearchResults';

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Search</h1>
      <SearchResults />
    </div>
  );
}