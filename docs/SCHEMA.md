# Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        id serial PK
        email varchar(255) UK
        username varchar(50) UK
        name varchar(255)
        avatar_url text
        bio text
        reputation integer
        email_verified boolean
        auth_provider varchar(20)
        auth_provider_id varchar(255)
        password_hash varchar(255)
        created_at timestamp
        updated_at timestamp
    }
    
    TOPICS {
        id serial PK
        name varchar(100)
        slug varchar(100) UK
        description text
        parent_id integer FK
        created_at timestamp
        updated_at timestamp
    }
    
    TAGS {
        id serial PK
        name varchar(50)
        slug varchar(50) UK
        description text
        created_at timestamp
        updated_at timestamp
    }
    
    CONTENT {
        id serial PK
        type varchar(20)
        title varchar(255)
        body text
        body_html text
        body_vector vector(1536)
        author_id integer FK
        parent_id integer FK
        is_accepted boolean
        upvotes integer
        downvotes integer
        views integer
        status varchar(20)
        created_at timestamp
        updated_at timestamp
    }
    
    CONTENT_VERSIONS {
        id serial PK
        content_id integer FK
        version integer
        title varchar(255)
        body text
        body_html text
        editor_id integer FK
        edit_comment text
        created_at timestamp
    }
    
    CONTENT_TAGS {
        content_id integer PK,FK
        tag_id integer PK,FK
        created_at timestamp
    }
    
    CONTENT_TOPICS {
        content_id integer PK,FK
        topic_id integer PK,FK
        created_at timestamp
    }
    
    TOOLS {
        id serial PK
        name varchar(100)
        slug varchar(100) UK
        description text
        description_vector vector(1536)
        website_url text
        logo_url text
        pricing_info jsonb
        features jsonb
        is_verified boolean
        vendor_id integer FK
        upvotes integer
        status varchar(20)
        created_at timestamp
        updated_at timestamp
    }
    
    TOOL_TAGS {
        tool_id integer PK,FK
        tag_id integer PK,FK
        created_at timestamp
    }
    
    TOOL_REVIEWS {
        id serial PK
        tool_id integer FK
        user_id integer FK
        rating integer
        title varchar(255)
        content text
        upvotes integer
        status varchar(20)
        created_at timestamp
        updated_at timestamp
    }
    
    BADGES {
        id serial PK
        name varchar(50)
        description text
        icon_url text
        level varchar(20)
        created_at timestamp
    }
    
    USER_BADGES {
        user_id integer PK,FK
        badge_id integer PK,FK
        awarded_at timestamp
    }
    
    NOTIFICATIONS {
        id serial PK
        user_id integer FK
        type varchar(50)
        content jsonb
        is_read boolean
        created_at timestamp
    }
    
    USER_SETTINGS {
        user_id integer PK,FK
        notification_preferences jsonb
        ui_preferences jsonb
        created_at timestamp
        updated_at timestamp
    }
    
    USER_VOTES {
        user_id integer FK
        content_id integer FK
        tool_id integer FK
        review_id integer FK
        vote_type smallint
        created_at timestamp
        updated_at timestamp
    }
    
    REPUTATION_HISTORY {
        id serial PK
        user_id integer FK
        change integer
        reason varchar(50)
        content_id integer FK
        created_at timestamp
    }
    
    USERS ||--o{ CONTENT : "authors"
    USERS ||--o{ CONTENT_VERSIONS : "edits"
    USERS ||--o{ TOOL_REVIEWS : "writes"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--|| USER_SETTINGS : "has"
    USERS ||--o{ USER_BADGES : "earns"
    USERS ||--o{ USER_VOTES : "casts"
    USERS ||--o{ REPUTATION_HISTORY : "has"
    USERS ||--o{ TOOLS : "verifies"
    
    TOPICS ||--o{ TOPICS : "parent-child"
    TOPICS ||--o{ CONTENT_TOPICS : "categorizes"
    
    TAGS ||--o{ CONTENT_TAGS : "tags"
    TAGS ||--o{ TOOL_TAGS : "tags"
    
    CONTENT ||--o{ CONTENT : "parent-child"
    CONTENT ||--o{ CONTENT_VERSIONS : "has versions"
    CONTENT ||--o{ CONTENT_TAGS : "has tags"
    CONTENT ||--o{ CONTENT_TOPICS : "has topics"
    
    TOOLS ||--o{ TOOL_TAGS : "has tags"
    TOOLS ||--o{ TOOL_REVIEWS : "has reviews"
    
    BADGES ||--o{ USER_BADGES : "awarded to"
```

## Table Descriptions

### Users
Stores user accounts and profile information.

### Topics
Hierarchical categories for organizing content. Topics can have parent-child relationships.

### Tags
Free-form tags that can be applied to content and tools.

### Content
The main content entity, which includes questions, answers, posts, tutorials, and comments.

### Content_Versions
Tracks version history for content, allowing users to see previous revisions.

### Content_Tags
Junction table linking content to tags.

### Content_Topics
Junction table linking content to topics.

### Tools
AI tools listed in the directory.

### Tool_Tags
Junction table linking tools to tags.

### Tool_Reviews
User reviews of tools.

### Badges
Achievement badges that can be earned by users.

### User_Badges
Junction table tracking which badges have been awarded to which users.

### Notifications
User notifications for various events.

### User_Settings
User preferences for notifications and UI.

### User_Votes
Tracks user votes on content, tools, and reviews.

### Reputation_History
Records changes to user reputation and the reasons for those changes.

## Indexing Strategy

The following indexes are created to optimize query performance:

- Vector indexes on `content.body_vector` and `tools.description_vector` for efficient similarity searches
- Indexes on foreign keys for efficient joins
- Composite indexes on frequently queried columns
- Partial indexes for filtering by status

## Data Types

- `vector(1536)`: Custom data type for pgvector extension, used for semantic search
- `jsonb`: JSON data with binary storage, used for structured data that doesn't need its own table
- Other standard PostgreSQL data types

## Data Validation

Data validation is handled at multiple levels:

1. **Database constraints**: Primary keys, foreign keys, check constraints
2. **Application validation**: Using Zod schemas before data reaches the database
3. **Triggers**: For complex validations and maintaining data integrity

## Data Migration Strategy

For schema changes, we use node-pg-migrate to create migrations that:

1. Are reversible (have both up and down methods)
2. Include data transformations when necessary
3. Add appropriate indexes and constraints