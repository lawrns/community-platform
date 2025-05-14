# Database Guide

This guide provides information about the database structure, migrations, seeding, and common operations.

## Overview

Community.io uses PostgreSQL with the pgvector extension for storing vector embeddings and efficient similarity search capabilities. The database schema is defined in migrations, allowing for versioned database changes.

## Schema Structure

The main entities in our database are:

- **Users**: Platform members with authentication and profile data
- **Content**: Questions, answers, posts, and other user-generated content
- **Topics**: Hierarchical categories for organizing content
- **Tags**: Free-form labels that can be applied to content
- **Tools**: AI tools listed in the directory, with reviews and ratings

See the complete [Schema Documentation](./SCHEMA.md) for detailed information.

## Setting Up the Database

### Prerequisites

1. PostgreSQL 14 or later
2. pgvector extension installed

### Initial Setup

Run the database setup script:

```bash
npm run db:setup
```

This script will:
1. Create the database if it doesn't exist
2. Install the pgvector extension if needed
3. Run migrations to create the schema
4. Seed the database with initial data

### Manual Setup

If you prefer to set up the database manually:

1. Create a PostgreSQL database:
   ```bash
   createdb communityio
   ```

2. Install the pgvector extension:
   ```bash
   psql -d communityio -c "CREATE EXTENSION IF NOT EXISTS vector;"
   ```

3. Run migrations:
   ```bash
   npm run migrate:up
   ```

4. Seed the database:
   ```bash
   npm run seed
   ```

## Migrations

Database changes are managed through migrations using node-pg-migrate:

- **Create a migration**: `npm run migrate:create migration_name`
- **Apply migrations**: `npm run migrate:up`
- **Rollback migrations**: `npm run migrate:down`
- **Redo last migration**: `npm run migrate:redo`

### Migration Structure

Each migration file has two exports:
- `up`: Function to apply the migration
- `down`: Function to rollback the migration

Example:

```javascript
exports.up = (pgm) => {
  pgm.createTable('example', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('example');
};
```

## Seeding Data

The seed script (`scripts/seed.ts`) populates the database with initial data for development and testing:

```bash
npm run seed
```

This includes:
- Sample users with various roles
- Hierarchical topics
- Common tags
- Example content (questions, answers, posts)
- AI tools and reviews
- Badges and other supporting data

## Working with the Database

### Repositories

The application uses repository classes to encapsulate database operations:

- `UserRepository`: Operations on users
- `ContentRepository`: Operations on content (questions, answers, posts)
- `ToolRepository`: Operations on AI tools
- `TagRepository`: Operations on tags
- `TopicRepository`: Operations on topics

Example usage:

```typescript
import { userRepository } from '../models/repositories';

// Find a user by ID
const user = await userRepository.findById(1);

// Create a new user
const newUser = await userRepository.create({
  email: 'user@example.com',
  username: 'username',
  name: 'User Name',
  // other fields...
});
```

### Database Functions

The database includes several PostgreSQL functions for complex operations:

- `update_timestamp`: Triggers automatic updates of `updated_at` timestamps
- `update_counter`: Increments counter columns (upvotes, views, etc.)
- `update_user_reputation`: Updates user reputation and records history
- `handle_content_vote`: Handles voting on content with reputation changes
- `accept_answer`: Marks an answer as accepted with reputation changes
- `user_has_privilege`: Checks if a user has a specific privilege based on reputation

### Vector Search

For semantic search, the schema includes vector columns:
- `content.body_vector`: Vector embeddings of content text
- `tools.description_vector`: Vector embeddings of tool descriptions

These columns are used with the pgvector extension for efficient similarity searches.

## Database Testing

Run database tests with:

```bash
npm run test:db
```

These tests verify:
- Schema structure
- Database function behavior
- Data access through repositories
- Vector search capabilities

## Generating Schema Documentation

Generate updated schema documentation with:

```bash
npm run schema:diagram
```

This creates:
- SQL schema dump
- Entity-relationship diagram
- Documentation of constraints and indexes

## Resetting the Database

To completely reset the database (useful for development):

```bash
npm run db:reset
```

This rolls back all migrations, reapplies them, and seeds the database with fresh data.

## Common Issues

### pgvector Installation

If you encounter issues with the pgvector extension:

1. Make sure PostgreSQL development packages are installed
2. Follow the installation guide at https://github.com/pgvector/pgvector#installation
3. For MacOS with Homebrew: `brew install pgvector`

### Migration Errors

If migrations fail:

1. Check the error message for details
2. Ensure your PostgreSQL user has the necessary permissions
3. Try rolling back and reapplying the latest migration with `npm run migrate:redo`