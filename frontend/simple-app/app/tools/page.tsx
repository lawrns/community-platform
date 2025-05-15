export default function Tools() {
  return (
    <div className="container mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">Tools</h1>
      <p className="text-muted-foreground mb-8 max-w-3xl">
        Access a variety of tools and resources to enhance your community experience. These tools are designed to help you connect, collaborate, and contribute effectively.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold mb-3">Community Guidelines</h2>
          <p className="text-muted-foreground mb-4">
            Learn about our community standards and expectations for all members.
          </p>
          <a href="#" className="text-primary hover:underline">View Guidelines →</a>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold mb-3">Code of Conduct</h2>
          <p className="text-muted-foreground mb-4">
            Understand the behavior and ethics expected from all community members.
          </p>
          <a href="#" className="text-primary hover:underline">Read Code of Conduct →</a>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold mb-3">FAQ</h2>
          <p className="text-muted-foreground mb-4">
            Find answers to commonly asked questions about the platform and community.
          </p>
          <a href="#" className="text-primary hover:underline">Browse FAQ →</a>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold mb-3">Resources</h2>
          <p className="text-muted-foreground mb-4">
            Access helpful resources, guides, and materials shared by the community.
          </p>
          <a href="#" className="text-primary hover:underline">Explore Resources →</a>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold mb-3">Getting Started</h2>
          <p className="text-muted-foreground mb-4">
            New to the platform? Learn how to make the most of your experience.
          </p>
          <a href="#" className="text-primary hover:underline">Start Here →</a>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold mb-3">Moderation</h2>
          <p className="text-muted-foreground mb-4">
            Learn about our moderation policies and how to report content.
          </p>
          <a href="#" className="text-primary hover:underline">View Moderation Guidelines →</a>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold mb-3">API Documentation</h2>
          <p className="text-muted-foreground mb-4">
            Technical documentation for developers integrating with our platform.
          </p>
          <a href="#" className="text-primary hover:underline">View API Docs →</a>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold mb-3">Templates</h2>
          <p className="text-muted-foreground mb-4">
            Access templates for creating various types of content on the platform.
          </p>
          <a href="#" className="text-primary hover:underline">Browse Templates →</a>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold mb-3">Feedback</h2>
          <p className="text-muted-foreground mb-4">
            Share your thoughts and suggestions to help improve the platform.
          </p>
          <a href="#" className="text-primary hover:underline">Provide Feedback →</a>
        </div>
      </div>
    </div>
  )
}
