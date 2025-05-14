# Community.io Source Code

This directory contains the source code for the community.io platform, organized following the Scotty framework standards.

## Directory Structure

- **config/**
  - Configuration files for the application
  - Includes environment, database, logging, and cache setup
  
- **components/**
  - React components (will be added in upcoming tasks)
  - Will include UI components used across the application
  
- **models/**
  - Database models and type definitions
  - Will represent the entities in our data model
  
- **services/**
  - Business logic services
  - Each service provides functionality for a specific domain area
  
- **routes/**
  - API route definitions
  - Organized by feature or resource
  
- **middlewares/**
  - Express middleware functions
  - Includes authentication, validation, and error handling
  
- **utils/**
  - Utility functions and helper code
  - Reusable across different parts of the application

## Code Standards

- Use TypeScript for type-safety
- Follow the Airbnb JavaScript Style Guide
- Write unit tests for all business logic
- Use async/await instead of callbacks or raw promises
- Document functions with JSDoc comments
- Handle errors consistently using the custom error classes

## API Structure

All API endpoints follow this pattern:
- Base path: `/api/v1`
- Resource endpoints: `/api/v1/[resource]`
- Authentication: JWT tokens in Authorization header
- Response format: 
  ```json
  {
    "success": true,
    "data": {}, 
    "message": "Optional message"
  }
  ```
  
## Error Handling

Errors are handled consistently using the custom error handlers in `utils/errorHandler.ts`. All API responses will follow this format for errors:

```json
{
  "success": false,
  "status": 400, 
  "message": "Error message"
}
```

## Validation

Input validation is handled using Zod schemas. Each route that accepts input should:
1. Define a Zod schema for the expected input
2. Validate the input against the schema before processing
3. Return appropriate validation errors if the input is invalid