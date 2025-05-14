# Supabase Integration

This document describes how to use Supabase as the authentication and database provider for the Community.io platform.

## Overview

The Community.io platform now supports Supabase as a backend provider for:

1. User authentication
2. Database operations
3. Storage (for user uploads)
4. Realtime features

The integration is designed to be optional and can coexist with the traditional PostgreSQL setup, allowing for a gradual migration path.

## Configuration

### Environment Variables

To enable Supabase integration, add the following variables to your `.env` file:

```
# Supabase
SUPABASE_URL=https://your-project-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

When these variables are present, the system will automatically use Supabase for authentication and database operations.

### Database Setup

You'll need to create the following tables in your Supabase project to match the Community.io schema:

- `users`
- `topics`
- `tags`
- `content`
- `tools`
- `tool_reviews`
- `badges`
- `user_badges`
- `reputation_history`

You can run the migration scripts in the `/migrations` directory against your Supabase database to set up the schema.

## Authentication

The Supabase integration supports:

- Email/password registration and login
- Email verification
- Password reset
- OAuth providers (via Supabase Auth)
- JWT authentication

### Authentication Flow

1. **Registration**: Users register through the Community.io API, which creates both a Supabase Auth user and an entry in our `users` table.
2. **Email Verification**: Handled by Supabase Auth.
3. **Login**: Users can login with email/password or OAuth providers configured in Supabase.
4. **Authentication**: Both Supabase JWTs and our custom JWTs are accepted for API requests.

## Database Access

All repository classes now support Supabase as a data source. The switch between PostgreSQL and Supabase is automatic based on the presence of Supabase credentials in the environment.

### Data Access Examples

```typescript
// Repository methods automatically use Supabase when configured
const user = await userRepository.findByEmail('user@example.com');

// For more control, you can use the Supabase client directly
import { supabase } from '../config/supabase';

const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', 'user@example.com')
  .single();
```

## Storage

The platform can use Supabase Storage for user uploads:

```typescript
// Upload a file
const { data, error } = await supabase
  .storage
  .from('uploads')
  .upload('avatars/user-123.png', fileData);

// Generate public URL
const { data: urlData } = supabase
  .storage
  .from('uploads')
  .getPublicUrl('avatars/user-123.png');

const publicUrl = urlData.publicUrl;
```

## Realtime Features

Supabase provides realtime capabilities that can be used for:

- Live updates on content changes
- Notifications
- User presence

```typescript
// Subscribe to changes in the content table
const subscription = supabase
  .channel('content-changes')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'content' 
    },
    (payload) => {
      console.log('Content changed:', payload);
    }
  )
  .subscribe();
```

## Testing

Run the Supabase integration tests to verify your setup:

```bash
npm test -- src/tests/supabase/supabaseIntegration.test.ts
```

## Troubleshooting

### Connection Issues

If you're having trouble connecting to Supabase:

1. Verify your credentials in the `.env` file
2. Check network connectivity
3. Ensure your Supabase project is active

### Authentication Problems

If users can't authenticate:

1. Check if the user exists in Supabase Auth dashboard
2. Verify the user has confirmed their email (if required)
3. Check if the user exists in the Community.io `users` table

### Data Errors

If you're experiencing issues with data operations:

1. Verify your database schema matches the expected structure
2. Check Row Level Security (RLS) policies in Supabase
3. Ensure the service role key has appropriate permissions

## Migrating Existing Data

To migrate your existing PostgreSQL data to Supabase:

1. Export your data using `pg_dump`
2. Convert the SQL file if needed (Supabase uses some PostgreSQL extensions)
3. Import the data into your Supabase project

For user accounts, you'll need to recreate them in Supabase Auth, as password hashes are not compatible.

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)