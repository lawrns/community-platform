// This function tells Next.js which dynamic routes to pre-render for static export
export async function generateStaticParams() {
  // For a static export, we need to provide a list of all possible [id] values
  // Include a comprehensive list of IDs that might be used in your application
  return [
    // Content types
    { id: 'profile' },
    { id: 'post' },
    { id: 'event' },
    { id: 'resource' },
    { id: 'announcement' },
    { id: 'guide' },
    { id: 'tutorial' },
    { id: 'faq' },

    // Sample IDs for each content type
    { id: 'post-1' },
    { id: 'post-2' },
    { id: 'post-3' },
    { id: 'event-1' },
    { id: 'event-2' },
    { id: 'resource-1' },
    { id: 'resource-2' },
    { id: 'announcement-1' },
    { id: 'announcement-2' },

    // Placeholder for client-side routing
    { id: 'placeholder' },
    { id: 'new' }
  ]
}
