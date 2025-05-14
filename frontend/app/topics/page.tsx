export default function TopicsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Topics</h1>
      <p className="text-gray-500 mb-8">
        Browse AI topics with hierarchical taxonomy and find content relevant to your interests.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-gray-500">Topic directory will appear here.</p>
        </div>
      </div>
    </div>
  );
}