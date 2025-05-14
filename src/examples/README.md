# Supabase Integration Examples

This directory contains examples demonstrating how to use Supabase in the Community.io platform.

## Available Examples

- [supabase-example.ts](./supabase-example.ts): Comprehensive examples of Supabase integration including:
  - User authentication and management
  - CRUD operations using utility functions
  - Real-time subscriptions
  - Storage operations

## Usage

These examples are meant to be referenced as you build features using Supabase in the application. They include best practices and patterns for common operations.

### Running the Examples

To run the examples directly (for testing purposes), you can use:

```bash
# Run all examples
npx ts-node src/examples/supabase-example.ts

# Run a specific example (in your own code)
import { dataManagementExample } from './examples/supabase-example';
await dataManagementExample();
```

## Key Files

The Supabase integration is set up across several files:

1. [src/config/supabase.ts](../config/supabase.ts) - Main Supabase client configuration
2. [src/config/environment.ts](../config/environment.ts) - Environment variable configuration including Supabase credentials
3. [src/utils/supabaseUtils.ts](../utils/supabaseUtils.ts) - Utility functions for database operations
4. [src/config/database.ts](../config/database.ts) - Database configuration with Supabase support

## Environment Setup

To use Supabase, make sure your `.env` file includes:

```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Recommended Practices

- Use the utility functions in `supabaseUtils.ts` for standard database operations
- Use the Supabase client directly for auth, storage, and real-time features
- For complex queries or multi-table operations, consider using the raw query functions

## Security Considerations

- Never expose the service role key in client-side code
- Use Row-Level Security (RLS) policies in Supabase to restrict data access
- Consider using the auth middleware for API routes that require authentication