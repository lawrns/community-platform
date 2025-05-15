export default function Profile() {
  return (
    <div className="container mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-card rounded-lg border border-border p-6 sticky top-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold mb-4">
                JD
              </div>
              <h2 className="text-xl font-bold">John Doe</h2>
              <p className="text-muted-foreground mb-4">@johndoe</p>
              
              <div className="w-full border-t border-border my-4"></div>
              
              <div className="w-full">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Posts</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Comments</span>
                  <span className="font-medium">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="font-medium">Jan 2023</span>
                </div>
              </div>
              
              <div className="w-full border-t border-border my-4"></div>
              
              <button className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-card rounded-lg border border-border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-muted-foreground">
              Frontend developer passionate about creating user-friendly interfaces. I enjoy contributing to open-source projects and sharing knowledge with the community. When I'm not coding, you can find me hiking or reading sci-fi novels.
            </p>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">JavaScript</span>
                <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">React</span>
                <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">TypeScript</span>
                <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">Next.js</span>
                <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">Tailwind CSS</span>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            
            <div className="space-y-6">
              <div className="border-b border-border pb-6">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">Created a new post</h3>
                  <span className="text-sm text-muted-foreground">2 days ago</span>
                </div>
                <p className="text-muted-foreground mb-2">How to optimize React components for better performance</p>
                <div className="flex gap-2">
                  <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">React</span>
                  <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">Performance</span>
                </div>
              </div>
              
              <div className="border-b border-border pb-6">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">Commented on a post</h3>
                  <span className="text-sm text-muted-foreground">1 week ago</span>
                </div>
                <p className="text-muted-foreground">
                  "Great article! I've been using this approach in my projects and it works really well."
                </p>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">Shared a resource</h3>
                  <span className="text-sm text-muted-foreground">2 weeks ago</span>
                </div>
                <p className="text-muted-foreground mb-2">Useful TypeScript tips for everyday coding</p>
                <div className="flex gap-2">
                  <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">TypeScript</span>
                  <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">Tips</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
                View All Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
