export default function Search() {
  return (
    <div className="container mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">Search</h1>
      
      <div className="max-w-3xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for posts, resources, or members..."
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button className="absolute right-3 top-3 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <button className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">All</button>
          <button className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">Posts</button>
          <button className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">Resources</button>
          <button className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">Members</button>
          <button className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">Events</button>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Popular Searches</h2>
        
        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">Getting Started with Next.js</h3>
              <span className="text-sm text-muted-foreground">Post</span>
            </div>
            <p className="text-muted-foreground mb-2">
              A comprehensive guide to getting started with Next.js for beginners. Learn about pages, routing, and data fetching.
            </p>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">Next.js</span>
                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">React</span>
                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">Tutorial</span>
              </div>
              <span className="text-xs text-muted-foreground">3 days ago</span>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">Community Meetup - June 2023</h3>
              <span className="text-sm text-muted-foreground">Event</span>
            </div>
            <p className="text-muted-foreground mb-2">
              Join us for our monthly virtual meetup where we'll discuss the latest trends in web development.
            </p>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">Meetup</span>
                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">Virtual</span>
              </div>
              <span className="text-xs text-muted-foreground">June 15, 2023</span>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">Tailwind CSS Best Practices</h3>
              <span className="text-sm text-muted-foreground">Resource</span>
            </div>
            <p className="text-muted-foreground mb-2">
              A collection of best practices and tips for using Tailwind CSS effectively in your projects.
            </p>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">Tailwind</span>
                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">CSS</span>
                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">Best Practices</span>
              </div>
              <span className="text-xs text-muted-foreground">1 week ago</span>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">Jane Smith</h3>
              <span className="text-sm text-muted-foreground">Member</span>
            </div>
            <p className="text-muted-foreground mb-2">
              Frontend Developer specializing in React and TypeScript. Active community contributor.
            </p>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">React</span>
                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">TypeScript</span>
              </div>
              <span className="text-xs text-muted-foreground">Member since 2022</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
            Load More Results
          </button>
        </div>
      </div>
    </div>
  )
}
