export default function Dashboard() {
  return (
    <div className="container mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome to your dashboard. Here you can see an overview of your activity and recent updates.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <h3 className="text-sm text-muted-foreground mb-1">Posts</h3>
          <div className="text-2xl font-bold">12</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <h3 className="text-sm text-muted-foreground mb-1">Comments</h3>
          <div className="text-2xl font-bold">48</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <h3 className="text-sm text-muted-foreground mb-1">Likes</h3>
          <div className="text-2xl font-bold">156</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <h3 className="text-sm text-muted-foreground mb-1">Reputation</h3>
          <div className="text-2xl font-bold">723</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">P</div>
              <div>
                <h4 className="text-sm font-medium">You created a new post</h4>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">C</div>
              <div>
                <h4 className="text-sm font-medium">You commented on a post</h4>
                <p className="text-xs text-muted-foreground">Yesterday</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">L</div>
              <div>
                <h4 className="text-sm font-medium">You liked a post</h4>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <a href="#" className="text-sm text-primary hover:underline">View all activity</a>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Community Updates</h2>
          <p className="text-muted-foreground mb-4">Stay up to date with the latest community news and events.</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">N</div>
              <div>
                <h4 className="text-sm font-medium">New community guidelines</h4>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">E</div>
              <div>
                <h4 className="text-sm font-medium">Upcoming virtual meetup</h4>
                <p className="text-xs text-muted-foreground">Next week</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <a href="#" className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
              Explore
            </a>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Tools</h2>
          <p className="text-muted-foreground mb-4">Access community tools and resources.</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">T</div>
              <div>
                <h4 className="text-sm font-medium">Code of Conduct</h4>
                <p className="text-xs text-muted-foreground">Community guidelines</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">R</div>
              <div>
                <h4 className="text-sm font-medium">Resources</h4>
                <p className="text-xs text-muted-foreground">Helpful links and documents</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <a href="/tools" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Browse Tools
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
