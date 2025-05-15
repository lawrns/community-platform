export async function generateStaticParams() {
  // For a static export, we need to provide a list of all possible [id] values
  // Include a comprehensive list of tool IDs that might be accessed
  return [
    // Community tools
    { id: 'community-guidelines' },
    { id: 'code-of-conduct' },
    { id: 'faq' },
    { id: 'resources' },
    { id: 'getting-started' },
    { id: 'moderation' },
    { id: 'api-docs' },
    { id: 'templates' },
    { id: 'feedback' },

    // Content creation tools
    { id: 'editor' },
    { id: 'markdown-guide' },
    { id: 'image-uploader' },
    { id: 'formatting' },

    // Administrative tools
    { id: 'admin' },
    { id: 'moderation-queue' },
    { id: 'reports' },
    { id: 'analytics' },

    // User tools
    { id: 'profile-settings' },
    { id: 'notifications' },
    { id: 'bookmarks' },
    { id: 'saved' },

    // Special cases
    { id: 'all' },
    { id: 'featured' },
    { id: 'new' },
    { id: 'placeholder' }
  ]
}
