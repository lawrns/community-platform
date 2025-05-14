# API Documentation

## Overview

The community.io API follows RESTful principles and provides endpoints for all core platform functionality. This document outlines the available endpoints, request/response formats, and authentication requirements.

## Base URL

```
https://api.community.io/v1
```

## Authentication

Most API endpoints require authentication. The API uses JWT (JSON Web Tokens) for authentication.

### Authentication Headers

```
Authorization: Bearer <jwt_token>
```

### Obtaining a Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Rate Limiting

API requests are rate-limited to ensure fair usage. The current limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1620000000
```

## API Endpoints

### User Management

#### Get Current User

```http
GET /users/me
Authorization: Bearer <jwt_token>
```

Response:

```json
{
  "id": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "reputation": 1250,
  "created_at": "2025-01-15T12:00:00Z",
  "profile": {
    "bio": "AI enthusiast and developer",
    "avatar_url": "https://example.com/avatar.jpg",
    "location": "San Francisco, CA"
  }
}
```

#### Update User Profile

```http
PATCH /users/me
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "John Smith",
  "profile": {
    "bio": "Updated bio information"
  }
}
```

Response:

```json
{
  "id": "user123",
  "name": "John Smith",
  "profile": {
    "bio": "Updated bio information",
    "avatar_url": "https://example.com/avatar.jpg",
    "location": "San Francisco, CA"
  }
}
```

#### Get User by ID

```http
GET /users/{userId}
```

Response: Same format as Get Current User

### Content Management

#### Create Content

```http
POST /content/{type}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Getting Started with Vector Databases",
  "body": "# Introduction\n\nVector databases are...",
  "tags": ["vector-db", "tutorial", "beginners"],
  "publish": true
}
```

Response:

```json
{
  "id": "post123",
  "type": "post",
  "title": "Getting Started with Vector Databases",
  "body": "# Introduction\n\nVector databases are...",
  "tags": ["vector-db", "tutorial", "beginners"],
  "author": {
    "id": "user123",
    "name": "John Doe"
  },
  "created_at": "2025-05-13T15:30:00Z",
  "updated_at": "2025-05-13T15:30:00Z",
  "status": "published",
  "version": 1
}
```

#### Get Content by ID

```http
GET /content/{type}/{contentId}
```

Response: Same format as Create Content response

#### Update Content

```http
PUT /content/{type}/{contentId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "body": "Updated content body",
  "tags": ["vector-db", "tutorial", "beginners", "advanced"]
}
```

Response: Updated content object

#### Delete Content

```http
DELETE /content/{type}/{contentId}
Authorization: Bearer <jwt_token>
```

Response:

```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```

### Search

#### Search Content

```http
GET /search?q=vector+databases&type=post&tags=tutorial
```

Parameters:
- `q`: Search query
- `type`: Content type (post, question, answer, tutorial)
- `tags`: Comma-separated list of tags
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

Response:

```json
{
  "results": [
    {
      "id": "post123",
      "type": "post",
      "title": "Getting Started with Vector Databases",
      "excerpt": "Introduction to vector databases and their applications...",
      "author": {
        "id": "user123",
        "name": "John Doe"
      },
      "created_at": "2025-05-13T15:30:00Z",
      "tags": ["vector-db", "tutorial", "beginners"],
      "score": 0.95
    },
    // More results...
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

#### Semantic Search

```http
POST /search/semantic
Content-Type: application/json

{
  "query": "How do vector databases compare to traditional relational databases?",
  "filters": {
    "content_type": ["post", "tutorial"],
    "tags": ["vector-db", "database"]
  }
}
```

Response: Similar to regular search response

### Tags

#### List Tags

```http
GET /tags?sort=popular&limit=20
```

Response:

```json
{
  "tags": [
    {
      "id": "tag123",
      "name": "vector-db",
      "count": 156,
      "description": "Questions and posts about vector databases"
    },
    // More tags...
  ],
  "pagination": {
    "total": 1245,
    "page": 1,
    "limit": 20,
    "pages": 63
  }
}
```

#### Get Tag Details

```http
GET /tags/{tagName}
```

Response:

```json
{
  "id": "tag123",
  "name": "vector-db",
  "count": 156,
  "description": "Questions and posts about vector databases",
  "related_tags": ["database", "embeddings", "similarity-search"],
  "top_contributors": [
    {
      "id": "user456",
      "name": "Jane Smith",
      "posts_count": 12
    }
    // More contributors...
  ]
}
```

### Tool Directory

#### List Tools

```http
GET /tools?category=vector-database&sort=rating
```

Response:

```json
{
  "tools": [
    {
      "id": "tool123",
      "name": "VectorDB Pro",
      "description": "Enterprise-grade vector database solution",
      "category": "vector-database",
      "avg_rating": 4.8,
      "reviews_count": 45,
      "pricing_type": "freemium",
      "logo_url": "https://example.com/logo.png"
    },
    // More tools...
  ],
  "pagination": {
    "total": 28,
    "page": 1,
    "limit": 20,
    "pages": 2
  }
}
```

#### Get Tool Details

```http
GET /tools/{toolId}
```

Response:

```json
{
  "id": "tool123",
  "name": "VectorDB Pro",
  "description": "Enterprise-grade vector database solution",
  "long_description": "VectorDB Pro is a scalable vector database that...",
  "category": "vector-database",
  "subcategories": ["similarity-search", "embeddings"],
  "avg_rating": 4.8,
  "reviews_count": 45,
  "pricing": {
    "type": "freemium",
    "plans": [
      {
        "name": "Free",
        "price": 0,
        "features": ["Up to 10,000 vectors", "Basic search"]
      },
      {
        "name": "Pro",
        "price": 49,
        "period": "monthly",
        "features": ["Unlimited vectors", "Advanced search", "API access"]
      }
    ]
  },
  "website_url": "https://example.com",
  "logo_url": "https://example.com/logo.png",
  "screenshots": ["https://example.com/screenshot1.png"],
  "vendor": {
    "id": "vendor123",
    "name": "VectorDB Inc.",
    "verified": true
  }
}
```

#### Create Tool Review

```http
POST /tools/{toolId}/reviews
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "rating": 5,
  "title": "Excellent performance and scalability",
  "content": "We've been using VectorDB Pro for our recommendation system and it's been fantastic...",
  "use_case": "Recommendation system for e-commerce"
}
```

Response:

```json
{
  "id": "review123",
  "tool_id": "tool123",
  "author": {
    "id": "user123",
    "name": "John Doe"
  },
  "rating": 5,
  "title": "Excellent performance and scalability",
  "content": "We've been using VectorDB Pro for our recommendation system and it's been fantastic...",
  "use_case": "Recommendation system for e-commerce",
  "created_at": "2025-05-13T16:45:00Z",
  "helpful_count": 0
}
```

### Notifications

#### List Notifications

```http
GET /notifications
Authorization: Bearer <jwt_token>
```

Response:

```json
{
  "notifications": [
    {
      "id": "notif123",
      "type": "mention",
      "content": "Jane Smith mentioned you in a post",
      "reference": {
        "type": "post",
        "id": "post456"
      },
      "created_at": "2025-05-13T14:30:00Z",
      "read": false
    },
    // More notifications...
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  },
  "unread_count": 12
}
```

#### Mark Notifications as Read

```http
POST /notifications/read
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "notification_ids": ["notif123", "notif124"]
}
```

Response:

```json
{
  "success": true,
  "unread_count": 10
}
```

#### Update Notification Settings

```http
PUT /notifications/settings
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "email_digest": "daily",
  "preferences": {
    "mentions": {
      "in_app": true,
      "email": true
    },
    "replies": {
      "in_app": true,
      "email": false
    },
    "upvotes": {
      "in_app": true,
      "email": false
    }
  }
}
```

Response:

```json
{
  "email_digest": "daily",
  "preferences": {
    "mentions": {
      "in_app": true,
      "email": true
    },
    "replies": {
      "in_app": true,
      "email": false
    },
    "upvotes": {
      "in_app": true,
      "email": false
    }
  }
}
```

## Error Handling

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "validation_error",
    "message": "The request was invalid",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

Common error codes:
- `authentication_error`: Invalid or missing authentication
- `authorization_error`: Insufficient permissions
- `validation_error`: Invalid request data
- `not_found`: Requested resource not found
- `rate_limit_exceeded`: Too many requests
- `server_error`: Internal server error

## Versioning

The API is versioned through the URL path (e.g., `/v1/users`). When breaking changes are introduced, a new version will be released while maintaining support for previous versions according to the deprecation policy.

## Webhooks

Webhooks allow external applications to receive real-time updates from community.io. To register a webhook:

```http
POST /webhooks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "url": "https://example.com/webhook",
  "events": ["content.created", "content.updated", "user.reputation.changed"],
  "secret": "your_webhook_secret"
}
```

Response:

```json
{
  "id": "webhook123",
  "url": "https://example.com/webhook",
  "events": ["content.created", "content.updated", "user.reputation.changed"],
  "created_at": "2025-05-13T17:00:00Z",
  "status": "active"
}
```

Webhook payloads include a signature header (`X-Community-Signature`) that can be used to verify the authenticity of the request.
