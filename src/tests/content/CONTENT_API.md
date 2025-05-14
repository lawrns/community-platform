# Content API Documentation

This document describes the API endpoints for content management in the community platform.

## Base URL

All endpoints are prefixed with `/api/content`.

## Authentication

Most endpoints require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Content Types

The platform supports the following content types:

- `question`: A question post
- `answer`: An answer to a question
- `post`: A regular post/article
- `comment`: A comment on any content
- `tutorial`: A detailed tutorial

## Content Statuses

Content can have the following statuses:

- `draft`: Content is being edited and not yet published
- `published`: Content is published and visible to everyone
- `deleted`: Content has been deleted (soft delete)
- `hidden`: Content is hidden by moderators

## Endpoints

### Create Draft Content

```
POST /api/content/draft
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes

**Request Body**:
```json
{
  "type": "post",
  "title": "My Draft Post",
  "body": "# Draft Content\n\nThis is a draft post.",
  "body_html": "<h1>Draft Content</h1><p>This is a draft post.</p>",
  "tagIds": [1, 2, 3],
  "topicIds": [4, 5]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "post",
    "title": "My Draft Post",
    "body": "# Draft Content\n\nThis is a draft post.",
    "body_html": "<h1>Draft Content</h1><p>This is a draft post.</p>",
    "author_id": 1,
    "status": "draft",
    "created_at": "2025-05-01T12:00:00.000Z",
    "updated_at": "2025-05-01T12:00:00.000Z",
    "tags": [
      { "id": 1, "name": "javascript" },
      { "id": 2, "name": "react" },
      { "id": 3, "name": "tutorial" }
    ],
    "topics": [
      { "id": 4, "name": "Frontend" },
      { "id": 5, "name": "Web Development" }
    ]
  }
}
```

### Update Draft Content

```
PUT /api/content/draft/:id
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes

**Path Parameters**:
- `id`: ID of the draft content to update

**Request Body**:
```json
{
  "title": "Updated Draft Title",
  "body": "Updated draft content",
  "body_html": "<p>Updated draft content</p>",
  "tagIds": [1, 2, 5],
  "topicIds": [4],
  "edit_comment": "Fixed typos"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Draft Title",
    "body": "Updated draft content",
    "body_html": "<p>Updated draft content</p>",
    "status": "draft",
    "updated_at": "2025-05-01T12:30:00.000Z",
    "tags": [
      { "id": 1, "name": "javascript" },
      { "id": 2, "name": "react" },
      { "id": 5, "name": "frontend" }
    ],
    "topics": [
      { "id": 4, "name": "Frontend" }
    ]
  }
}
```

### Publish Draft Content

```
POST /api/content/draft/:id/publish
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes

**Path Parameters**:
- `id`: ID of the draft content to publish

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Draft Title",
    "body": "Updated draft content",
    "body_html": "<p>Updated draft content</p>",
    "status": "published",
    "updated_at": "2025-05-01T13:00:00.000Z",
    "tags": [
      { "id": 1, "name": "javascript" },
      { "id": 2, "name": "react" },
      { "id": 5, "name": "frontend" }
    ],
    "topics": [
      { "id": 4, "name": "Frontend" }
    ]
  }
}
```

### Get User's Draft Content

```
GET /api/content/drafts
```

**Authentication Required**: Yes

**Query Parameters**:
- `limit`: Maximum number of drafts to return (default: 20)
- `offset`: Offset for pagination (default: 0)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "My Draft Post",
      "status": "draft",
      "created_at": "2025-05-01T12:00:00.000Z",
      "updated_at": "2025-05-01T12:30:00.000Z",
      "tags": [
        { "id": 1, "name": "javascript" },
        { "id": 2, "name": "react" }
      ],
      "topics": [
        { "id": 4, "name": "Frontend" }
      ]
    },
    {
      "id": 2,
      "title": "Another Draft",
      "status": "draft",
      "created_at": "2025-04-29T10:00:00.000Z",
      "updated_at": "2025-04-29T10:30:00.000Z",
      "tags": [
        { "id": 3, "name": "tutorial" }
      ],
      "topics": [
        { "id": 5, "name": "Web Development" }
      ]
    }
  ]
}
```

### Get Content by ID

```
GET /api/content/:id
```

**Authentication Required**: No (but required to view own drafts)

**Path Parameters**:
- `id`: ID of the content to retrieve

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "post",
    "title": "My Published Post",
    "body": "# Post Content\n\nThis is a published post.",
    "body_html": "<h1>Post Content</h1><p>This is a published post.</p>",
    "author_id": 1,
    "author": {
      "username": "johndoe",
      "name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "reputation": 1500
    },
    "status": "published",
    "upvotes": 10,
    "downvotes": 2,
    "views": 150,
    "created_at": "2025-05-01T12:00:00.000Z",
    "updated_at": "2025-05-01T13:00:00.000Z",
    "tags": [
      { "id": 1, "name": "javascript" },
      { "id": 2, "name": "react" }
    ],
    "topics": [
      { "id": 4, "name": "Frontend" }
    ]
  }
}
```

### Update Published Content

```
PUT /api/content/:id
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes  
**Permission**: Must be author or have 2000+ reputation

**Path Parameters**:
- `id`: ID of the content to update

**Request Body**:
```json
{
  "title": "Updated Post Title",
  "body": "Updated post content",
  "body_html": "<p>Updated post content</p>",
  "tagIds": [1, 2, 5],
  "topicIds": [4],
  "edit_comment": "Fixed typos and improved clarity"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Post Title",
    "body": "Updated post content",
    "body_html": "<p>Updated post content</p>",
    "status": "published",
    "updated_at": "2025-05-02T14:00:00.000Z",
    "tags": [
      { "id": 1, "name": "javascript" },
      { "id": 2, "name": "react" },
      { "id": 5, "name": "frontend" }
    ],
    "topics": [
      { "id": 4, "name": "Frontend" }
    ]
  }
}
```

### Autosave Content

```
POST /api/content/:id/autosave
```

**Authentication Required**: Yes

**Path Parameters**:
- `id`: ID of the content to autosave

**Request Body**:
```json
{
  "title": "Work in progress",
  "body": "Content being edited...",
  "body_html": "<p>Content being edited...</p>"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Content autosaved successfully"
}
```

### Get Content Versions

```
GET /api/content/:id/versions
```

**Authentication Required**: No (but required to view versions of own drafts)

**Path Parameters**:
- `id`: ID of the content

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "content_id": 1,
      "version": 3,
      "title": "Updated Post Title",
      "editor_id": 1,
      "editor": {
        "username": "johndoe",
        "name": "John Doe"
      },
      "edit_comment": "Fixed typos and improved clarity",
      "created_at": "2025-05-02T14:00:00.000Z"
    },
    {
      "id": 2,
      "content_id": 1,
      "version": 2,
      "title": "My Published Post",
      "editor_id": 1,
      "editor": {
        "username": "johndoe",
        "name": "John Doe"
      },
      "edit_comment": null,
      "created_at": "2025-05-01T13:00:00.000Z"
    },
    {
      "id": 1,
      "content_id": 1,
      "version": 1,
      "title": "My Draft Post",
      "editor_id": 1,
      "editor": {
        "username": "johndoe",
        "name": "John Doe"
      },
      "edit_comment": null,
      "created_at": "2025-05-01T12:00:00.000Z"
    }
  ]
}
```

### Get Specific Content Version

```
GET /api/content/:id/versions/:versionNumber
```

**Authentication Required**: No (but required to view versions of own drafts)

**Path Parameters**:
- `id`: ID of the content
- `versionNumber`: Version number to retrieve

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "content_id": 1,
    "version": 2,
    "title": "My Published Post",
    "body": "# Post Content\n\nThis is a published post.",
    "body_html": "<h1>Post Content</h1><p>This is a published post.</p>",
    "editor_id": 1,
    "editor": {
      "username": "johndoe",
      "name": "John Doe"
    },
    "edit_comment": null,
    "created_at": "2025-05-01T13:00:00.000Z"
  }
}
```

### Revert to a Specific Version

```
POST /api/content/:id/versions/:versionId/revert
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes  
**Permission**: Must be author or have 2000+ reputation

**Path Parameters**:
- `id`: ID of the content
- `versionId`: ID of the version to revert to

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "My Published Post",
    "body": "# Post Content\n\nThis is a published post.",
    "body_html": "<h1>Post Content</h1><p>This is a published post.</p>",
    "status": "published",
    "updated_at": "2025-05-03T10:00:00.000Z",
    "tags": [
      { "id": 1, "name": "javascript" },
      { "id": 2, "name": "react" }
    ],
    "topics": [
      { "id": 4, "name": "Frontend" }
    ]
  }
}
```

### Vote on Content

```
POST /api/content/:id/vote
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes

**Path Parameters**:
- `id`: ID of the content to vote on

**Request Body**:
```json
{
  "vote_type": 1
}
```

Note: `vote_type` can be `1` for upvote or `-1` for downvote.

**Response**:
```json
{
  "success": true,
  "message": "Successfully upvoted content"
}
```

### Delete Content (Soft Delete)

```
DELETE /api/content/:id
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes  
**Permission**: Must be author or have 5000+ reputation

**Path Parameters**:
- `id`: ID of the content to delete

**Response**:
```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```

### Get Latest Content

```
GET /api/content
```

**Authentication Required**: No

**Query Parameters**:
- `type`: Filter by content type (optional)
- `limit`: Maximum number of items to return (default: 20)
- `offset`: Offset for pagination (default: 0)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "type": "post",
      "title": "Latest Post",
      "author": {
        "username": "janedoe",
        "name": "Jane Doe",
        "avatar_url": "https://example.com/jane.jpg"
      },
      "created_at": "2025-05-05T11:00:00.000Z",
      "updated_at": "2025-05-05T11:00:00.000Z",
      "tags": [
        { "id": 1, "name": "javascript" }
      ],
      "topics": [
        { "id": 4, "name": "Frontend" }
      ]
    },
    {
      "id": 9,
      "type": "question",
      "title": "How to use React hooks?",
      "author": {
        "username": "johndoe",
        "name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "created_at": "2025-05-04T15:00:00.000Z",
      "updated_at": "2025-05-04T15:00:00.000Z",
      "tags": [
        { "id": 1, "name": "javascript" },
        { "id": 2, "name": "react" },
        { "id": 6, "name": "hooks" }
      ],
      "topics": [
        { "id": 4, "name": "Frontend" }
      ]
    }
  ]
}
```

## File Upload Endpoints

### Upload Image

```
POST /api/content/upload/image
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes

**Request Body**:
Multipart form data with an `image` field containing the image file.

**Response**:
```json
{
  "success": true,
  "data": {
    "url": "/uploads/1620000000000-abcdef1234567890.jpg",
    "filename": "1620000000000-abcdef1234567890.jpg",
    "mimeType": "image/jpeg",
    "size": 102400
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

Common error codes:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error