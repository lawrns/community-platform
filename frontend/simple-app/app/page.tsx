export default function Home() {
  return (
    <div className="container mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Community Platform</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A space for community members to connect, share resources, and collaborate.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all">
          <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
          <p className="text-muted-foreground mb-6">View your personalized dashboard with recent activity and updates.</p>
          <a href="/dashboard" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Go to Dashboard
          </a>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all">
          <h2 className="text-2xl font-semibold mb-4">Profile</h2>
          <p className="text-muted-foreground mb-6">Manage your profile information and settings.</p>
          <a href="/profile" className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
            View Profile
          </a>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all">
          <h2 className="text-2xl font-semibold mb-4">Tools</h2>
          <p className="text-muted-foreground mb-6">Access community tools and resources.</p>
          <a href="/tools" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Browse Tools
          </a>
        </div>
      </div>
      
      <div className="mt-16 p-6 bg-muted rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <p className="mb-4">
          Welcome to our community platform! Here are some tips to help you get started:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Complete your profile to connect with other community members</li>
          <li>Explore the dashboard to see recent activity and updates</li>
          <li>Check out the tools section for helpful resources</li>
          <li>Join discussions and share your knowledge with the community</li>
        </ul>
      </div>
    </div>
  )
}
