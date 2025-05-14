# Environment Configuration

## Overview

This document outlines the environment configuration requirements for the community.io platform. Proper configuration is essential for both development and production environments.

## Environment Variables

The application uses environment variables for configuration. These variables should be set in a `.env` file for local development or through environment configuration in production deployments.

### Required Environment Variables

#### Core Application

```
# Application
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000/api
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=communityio
DB_USER=postgres
DB_PASSWORD=postgres

# Authentication
AUTH_SECRET=your-auth-secret-key
AUTH_EXPIRES_IN=7d
AUTH_PROVIDER=auth0  # or cognito
AUTH0_DOMAIN=your-auth0-domain
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# Storage
STORAGE_PROVIDER=s3  # or local
S3_BUCKET=your-s3-bucket
S3_REGION=us-west-2
S3_ACCESS_KEY=your-s3-access-key
S3_SECRET_KEY=your-s3-secret-key

# Email
EMAIL_PROVIDER=postmark  # or sendgrid, ses
POSTMARK_API_KEY=your-postmark-api-key
EMAIL_FROM=noreply@community.io

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Logging
LOG_LEVEL=info
```

#### AI Services

```
# AI Moderation
AI_MODERATION_ENABLED=true
OPENAI_API_KEY=your-openai-api-key
MODERATION_MODEL=text-moderation-latest

# Content Recommendation
RECOMMENDATION_SERVICE_URL=http://localhost:5000
RECOMMENDATION_API_KEY=your-recommendation-api-key

# Semantic Search
VECTOR_SEARCH_ENABLED=true
EMBEDDING_MODEL=text-embedding-3-small
```

#### Task Management

```
# Task Master CLI
ANTHROPIC_API_KEY=your-anthropic-api-key
PERPLEXITY_API_KEY=your-perplexity-api-key
OPENAI_API_KEY=your-openai-api-key
```

#### Monitoring and Analytics

```
# Monitoring
SENTRY_DSN=your-sentry-dsn
PROMETHEUS_ENABLED=true

# Analytics
ANALYTICS_PROVIDER=posthog  # or segment, ga4
POSTHOG_API_KEY=your-posthog-api-key
POSTHOG_HOST=https://app.posthog.com
```

### Optional Environment Variables

```
# Feature Flags
FEATURE_LIVE_EVENTS=false
FEATURE_EDUCATIONAL_COHORTS=false
FEATURE_NATIVE_APPS=false
FEATURE_API_MARKETPLACE=false
FEATURE_ENTERPRISE_SPACES=false

# Performance
CACHE_TTL=3600
MAX_UPLOAD_SIZE=5242880  # 5MB
RATE_LIMIT_WINDOW=60000  # 1 minute
RATE_LIMIT_MAX=100  # 100 requests per minute
```

## Environment Setup Guide

### Local Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your local configuration.

3. For local development, you can use the following minimal configuration:
   ```
   NODE_ENV=development
   PORT=3000
   API_URL=http://localhost:3000/api
   FRONTEND_URL=http://localhost:3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=communityio
   DB_USER=postgres
   DB_PASSWORD=postgres
   AUTH_SECRET=local-development-secret
   STORAGE_PROVIDER=local
   EMAIL_PROVIDER=console
   VECTOR_SEARCH_ENABLED=true
   AI_MODERATION_ENABLED=false
   ```

### Docker Development Environment

When using Docker Compose for development, environment variables should be defined in the `docker-compose.yml` file or in a `.env` file in the project root.

Example Docker Compose environment configuration:
```yaml
services:
  api:
    environment:
      NODE_ENV: development
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: communityio
      DB_USER: postgres
      DB_PASSWORD: postgres
      REDIS_HOST: redis
      REDIS_PORT: 6379
  # ...
```

### Production Environment

For production deployments, environment variables should be set through the deployment platform's environment configuration system. Never commit production secrets to version control.

#### Kubernetes

For Kubernetes deployments, use Secrets and ConfigMaps to manage environment variables:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: communityio-secrets
type: Opaque
data:
  DB_PASSWORD: <base64-encoded-password>
  AUTH_SECRET: <base64-encoded-secret>
  # Other secrets...
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: communityio-config
data:
  NODE_ENV: production
  PORT: "3000"
  DB_HOST: postgres-service
  # Other config values...
```

## Secrets Management

### Development

For local development, secrets can be stored in the `.env` file, which should be added to `.gitignore` to prevent committing secrets to version control.

### CI/CD

For CI/CD pipelines, secrets should be stored in the CI/CD platform's secrets management system and injected into the build environment as needed.

### Production

For production environments, use a dedicated secrets management solution:

- **AWS**: AWS Secrets Manager or Parameter Store
- **GCP**: Google Secret Manager
- **Azure**: Azure Key Vault
- **Kubernetes**: Kubernetes Secrets with optional encryption providers

## Configuration Validation

The application performs validation of required environment variables at startup. If any required variables are missing, the application will log an error and exit.

Example validation code:
```javascript
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'AUTH_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Required environment variable ${envVar} is not set`);
    process.exit(1);
  }
}
```

## Environment-Specific Configuration

The application loads different configuration based on the `NODE_ENV` value:

- `development`: Development configuration with detailed logging and debugging
- `test`: Test configuration for running automated tests
- `staging`: Staging configuration for pre-production testing
- `production`: Production configuration with optimized settings

## Feature Flags

Feature flags allow enabling or disabling features without code changes. They are controlled through environment variables prefixed with `FEATURE_`.

Example usage:
```javascript
const isLiveEventsEnabled = process.env.FEATURE_LIVE_EVENTS === 'true';

if (isLiveEventsEnabled) {
  // Initialize live events functionality
}
```

## Logging Configuration

Logging is configured based on the environment and the `LOG_LEVEL` environment variable:

- `development`: Detailed logging with source maps for stack traces
- `production`: Structured JSON logging with appropriate redaction of sensitive data

Example logging configuration:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' 
    ? winston.format.json() 
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
  transports: [
    new winston.transports.Console()
  ]
});
```

## Database Configuration

Database connection pooling is configured based on environment variables:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000', 10)
});
```
