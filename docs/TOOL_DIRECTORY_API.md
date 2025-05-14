# Tool Directory API Documentation

This document describes the API endpoints for the Tool Directory feature of the community platform.

## Base URL

All endpoints are prefixed with `/api/tools`.

## Authentication

Most endpoints require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Tool Status Values

Tools can have the following statuses:

- `active`: Tool is active and visible to everyone
- `pending`: Tool is pending review (newly submitted)
- `hidden`: Tool is hidden by moderators
- `deleted`: Tool has been deleted (soft delete)

## Endpoints

### Get Tools

```
GET /api/tools
```

**Authentication Required**: No

**Query Parameters**:
- `limit`: Maximum number of tools to return (default: 20, max: 100)
- `offset`: Offset for pagination (default: 0)
- `search`: Search term for filtering tools by name, description, or company
- `status`: Filter by tool status (`active`, `pending`, `hidden`, `deleted`)
- `tag`: Filter by tag ID

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "ChatGPT",
      "slug": "chatgpt",
      "description": "Conversational AI assistant from OpenAI",
      "website_url": "https://chat.openai.com",
      "logo_url": "https://example.com/logo.png",
      "upvotes": 1243,
      "status": "active",
      "is_verified": true,
      "vendor_id": 5,
      "review_count": 328,
      "avg_rating": 4.7,
      "created_at": "2025-05-01T12:00:00.000Z",
      "updated_at": "2025-05-01T12:00:00.000Z",
      "tags": [
        { "id": 1, "name": "language-models" },
        { "id": 2, "name": "conversational-ai" }
      ]
    },
    {
      "id": 2,
      "name": "DALL·E 3",
      "slug": "dall-e-3",
      "description": "Image generation AI from OpenAI",
      "website_url": "https://labs.openai.com",
      "logo_url": "https://example.com/dalle-logo.png",
      "upvotes": 876,
      "status": "active",
      "is_verified": true,
      "vendor_id": 5,
      "review_count": 216,
      "avg_rating": 4.8,
      "created_at": "2025-05-01T12:30:00.000Z",
      "updated_at": "2025-05-01T12:30:00.000Z",
      "tags": [
        { "id": 3, "name": "image-generation" },
        { "id": 4, "name": "text-to-image" }
      ]
    }
  ]
}
```

### Get Tool by ID

```
GET /api/tools/:id
```

**Authentication Required**: No

**Path Parameters**:
- `id`: ID of the tool to retrieve

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "ChatGPT",
    "slug": "chatgpt",
    "description": "Conversational AI assistant from OpenAI",
    "website_url": "https://chat.openai.com",
    "logo_url": "https://example.com/logo.png",
    "pricing_info": {
      "plans": [
        {
          "name": "Free",
          "price": "$0",
          "features": ["Basic features", "Limited usage"]
        },
        {
          "name": "Plus",
          "price": "$20/month",
          "features": ["Advanced features", "Priority access"]
        }
      ]
    },
    "features": [
      "Natural language understanding",
      "Text generation",
      "Code assistance",
      "Creative writing help"
    ],
    "upvotes": 1243,
    "status": "active",
    "is_verified": true,
    "vendor_id": 5,
    "vendor": {
      "username": "openai",
      "name": "OpenAI",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "created_at": "2025-05-01T12:00:00.000Z",
    "updated_at": "2025-05-01T12:00:00.000Z",
    "tags": [
      { "id": 1, "name": "language-models" },
      { "id": 2, "name": "conversational-ai" }
    ],
    "reviews": [
      {
        "id": 1,
        "user_id": 10,
        "username": "AIEnthusiast",
        "name": "AI Enthusiast",
        "avatar_url": "https://example.com/avatar1.jpg",
        "rating": 5,
        "title": "Amazing tool",
        "content": "ChatGPT has transformed how I work. The quality of responses is impressive.",
        "upvotes": 47,
        "created_at": "2025-05-02T14:30:00.000Z"
      },
      {
        "id": 2,
        "user_id": 15,
        "username": "ProDeveloper",
        "name": "Professional Developer",
        "avatar_url": "https://example.com/avatar2.jpg",
        "rating": 4,
        "title": "Great for coding",
        "content": "Great tool for debugging code and explaining programming concepts.",
        "upvotes": 31,
        "created_at": "2025-05-01T18:45:00.000Z"
      }
    ]
  }
}
```

### Add a Review for a Tool

```
POST /api/tools/:id/reviews
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes

**Path Parameters**:
- `id`: ID of the tool to review

**Request Body**:
```json
{
  "rating": 4,
  "title": "Very helpful tool",
  "content": "This tool has been very helpful for my workflow. It saves me a lot of time and provides great results."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "tool_id": 1,
    "user_id": 20,
    "rating": 4,
    "title": "Very helpful tool",
    "content": "This tool has been very helpful for my workflow. It saves me a lot of time and provides great results.",
    "upvotes": 0,
    "status": "published",
    "created_at": "2025-05-10T09:15:00.000Z",
    "updated_at": "2025-05-10T09:15:00.000Z"
  }
}
```

### Upvote a Tool

```
POST /api/tools/:id/upvote
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes

**Path Parameters**:
- `id`: ID of the tool to upvote

**Response**:
```json
{
  "success": true,
  "message": "Tool upvoted successfully"
}
```

### Claim a Tool as Vendor

```
POST /api/tools/:id/claim
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes

**Path Parameters**:
- `id`: ID of the tool to claim

**Response**:
```json
{
  "success": true,
  "message": "Your claim has been submitted and is pending review",
  "data": {
    "claimId": 1
  }
}
```

### Add Proof to a Tool Claim

```
POST /api/tools/claims/:id/proof
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes

**Path Parameters**:
- `id`: ID of the claim to add proof to

**Request Body**:
```json
{
  "proof": "I am the CEO of this company. You can verify this by checking our website at example.com/about or our LinkedIn profile. You can also email verification@example.com to confirm."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Proof added to claim successfully"
}
```

### Approve a Tool Claim (Admin Only)

```
POST /api/tools/claims/:id/approve
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes  
**Admin Required**: Yes (reputation > 10000)

**Path Parameters**:
- `id`: ID of the claim to approve

**Response**:
```json
{
  "success": true,
  "message": "Claim approved successfully"
}
```

### Reject a Tool Claim (Admin Only)

```
POST /api/tools/claims/:id/reject
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes  
**Admin Required**: Yes (reputation > 10000)

**Path Parameters**:
- `id`: ID of the claim to reject

**Response**:
```json
{
  "success": true,
  "message": "Claim rejected successfully"
}
```

### Create a New Tool

```
POST /api/tools
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes

**Request Body**:
```json
{
  "name": "New AI Tool",
  "description": "A powerful new AI tool for productivity",
  "website_url": "https://example.com/tool",
  "logo_url": "https://example.com/logo.png",
  "category": "Productivity",
  "pricing_info": {
    "plans": [
      {
        "name": "Free",
        "price": "$0",
        "features": ["Basic features", "Limited usage"]
      },
      {
        "name": "Pro",
        "price": "$29/month",
        "features": ["Advanced features", "Unlimited usage"]
      }
    ]
  },
  "features": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  "tagIds": [5, 10, 15]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "New AI Tool",
    "slug": "new-ai-tool",
    "description": "A powerful new AI tool for productivity",
    "website_url": "https://example.com/tool",
    "logo_url": "https://example.com/logo.png",
    "pricing_info": {
      "plans": [
        {
          "name": "Free",
          "price": "$0",
          "features": ["Basic features", "Limited usage"]
        },
        {
          "name": "Pro",
          "price": "$29/month",
          "features": ["Advanced features", "Unlimited usage"]
        }
      ]
    },
    "features": [
      "Feature 1",
      "Feature 2",
      "Feature 3"
    ],
    "upvotes": 0,
    "status": "pending",
    "is_verified": false,
    "vendor_id": 20,
    "created_at": "2025-05-10T10:00:00.000Z",
    "updated_at": "2025-05-10T10:00:00.000Z",
    "tags": [
      { "id": 5, "name": "productivity" },
      { "id": 10, "name": "ai-tools" },
      { "id": 15, "name": "workflow" }
    ]
  }
}
```

### Update a Tool (Vendor Only)

```
PUT /api/tools/:id
```

**Authentication Required**: Yes  
**Verified Email Required**: Yes  
**Permission**: Must be the vendor of the tool

**Path Parameters**:
- `id`: ID of the tool to update

**Request Body**:
```json
{
  "name": "Updated Tool Name",
  "description": "Updated description of the tool",
  "website_url": "https://example.com/updated",
  "logo_url": "https://example.com/updated-logo.png",
  "pricing_info": {
    "plans": [
      {
        "name": "Basic",
        "price": "$0",
        "features": ["Updated basic features", "Limited usage"]
      },
      {
        "name": "Professional",
        "price": "$39/month",
        "features": ["All basic features", "Advanced features", "Unlimited usage"]
      }
    ]
  },
  "features": [
    "Updated Feature 1",
    "Updated Feature 2",
    "New Feature 3",
    "New Feature 4"
  ],
  "tagIds": [5, 20, 25]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "Updated Tool Name",
    "slug": "updated-tool-name",
    "description": "Updated description of the tool",
    "website_url": "https://example.com/updated",
    "logo_url": "https://example.com/updated-logo.png",
    "pricing_info": {
      "plans": [
        {
          "name": "Basic",
          "price": "$0",
          "features": ["Updated basic features", "Limited usage"]
        },
        {
          "name": "Professional",
          "price": "$39/month",
          "features": ["All basic features", "Advanced features", "Unlimited usage"]
        }
      ]
    },
    "features": [
      "Updated Feature 1",
      "Updated Feature 2",
      "New Feature 3",
      "New Feature 4"
    ],
    "upvotes": 0,
    "status": "active",
    "is_verified": true,
    "vendor_id": 20,
    "created_at": "2025-05-10T10:00:00.000Z",
    "updated_at": "2025-05-10T11:30:00.000Z",
    "tags": [
      { "id": 5, "name": "productivity" },
      { "id": 20, "name": "collaboration" },
      { "id": 25, "name": "automation" }
    ]
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