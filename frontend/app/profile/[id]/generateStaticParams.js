// This function tells Next.js which dynamic routes to pre-render for static export
export async function generateStaticParams() {
  // For a static export, we need to provide a list of all possible [id] values
  // Include a comprehensive list of user IDs that might be accessed
  return [
    // User roles and sample users
    { id: 'admin' },
    { id: 'moderator' },
    { id: 'user' },
    { id: 'contributor' },
    { id: 'member' },

    // Sample user IDs
    { id: 'user123' },
    { id: 'user-1' },
    { id: 'user-2' },
    { id: 'user-3' },
    { id: 'user-4' },
    { id: 'user-5' },
    { id: 'user-6' },
    { id: 'user-7' },
    { id: 'user-8' },
    { id: 'user-9' },
    { id: 'user-10' },

    // Common usernames
    { id: 'john' },
    { id: 'jane' },
    { id: 'alex' },
    { id: 'sarah' },
    { id: 'mike' },
    { id: 'emma' },

    // Special cases
    { id: 'me' },
    { id: 'current' },
    { id: 'placeholder' }
  ]
}
