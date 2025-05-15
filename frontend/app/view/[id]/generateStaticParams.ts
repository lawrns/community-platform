export async function generateStaticParams() {
  // For a static export, we need to provide a list of all possible [id] values
  // Include a comprehensive list of content IDs that might be viewed
  return [
    // Content categories
    { id: 'post' },
    { id: 'event' },
    { id: 'resource' },
    { id: 'announcement' },
    { id: 'guide' },
    { id: 'tutorial' },
    { id: 'faq' },
    
    // Sample content IDs
    { id: 'post-1' },
    { id: 'post-2' },
    { id: 'post-3' },
    { id: 'post-4' },
    { id: 'post-5' },
    { id: 'event-1' },
    { id: 'event-2' },
    { id: 'event-3' },
    { id: 'resource-1' },
    { id: 'resource-2' },
    { id: 'resource-3' },
    { id: 'announcement-1' },
    { id: 'announcement-2' },
    
    // Featured content
    { id: 'welcome' },
    { id: 'getting-started' },
    { id: 'community-guidelines' },
    { id: 'code-of-conduct' },
    
    // Special IDs
    { id: 'latest' },
    { id: 'featured' },
    { id: 'trending' },
    { id: 'placeholder' }
  ]
}
