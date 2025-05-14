# community.io – The Premier AI Community Platform

## Overview

community.io unifies the fragmented landscape of AI discussion and discovery into a single, intelligence-powered hub. It enables practitioners, researchers, enthusiasts, and organizations to exchange knowledge, review tools, and collaborate on real-world AI projects.

## Key Features

- **Account & Auth**: Secure email/OAuth sign-up with email verification
- **Content Creation & Editing**: Rich-text editor with code blocks and image upload
- **Taxonomy & Tagging**: Hierarchical topics and free-form tags with typo suggestion and limit of 5 tags per post
- **Search (Keyword & Semantic)**: Vector search with lexical fallback
- **Reputation System**: Upvotes, accepted answers, and badges
- **Notification Engine**: Real-time in-app and email digest
- **Moderation & Governance**: AI spam filter with human moderation
- **Tool Directory**: Structured pages for AI tools with reviews
- **Personalized Feed & Dashboard**: ML-powered content recommendations

## Project Goals

- **G1 – Unified Hub**: Achieve 100k registered members within 12 months
- **G2 – High-Quality Knowledge Exchange**: Reach ≥85% accepted-answer rate on Q&A threads
- **G3 – Sustainable Revenue**: Generate ≥US$1M ARR by month 18

## Getting Started

1. **Set up environment**:

   There are two ways to set up the development environment:

   **Option 1: Using the setup script**
   ```bash
   # Make the script executable
   chmod +x scripts/setup-dev.sh
   
   # Run the setup script
   ./scripts/setup-dev.sh
   ```

   **Option 2: Using Docker Compose**
   ```bash
   # Make the script executable
   chmod +x scripts/run-with-docker.sh
   
   # Run the Docker setup script
   ./scripts/run-with-docker.sh
   ```

   Or manually:
   ```bash
   # Copy environment variables
   cp .env.example .env
   
   # Edit .env file with your credentials
   
   # Start required services with Docker
   docker-compose up -d postgres redis
   
   # Run database migrations
   npm run migrate:up
   
   # Seed the database
   npm run seed
   
   # Start the development server
   npm run dev
   ```

2. **Access admin interfaces**:
   - PostgreSQL admin: http://localhost:5050 (email: admin@community.io, password: admin)
   - Redis admin: http://localhost:8081

3. **View current tasks**:
   ```bash
   task-master list
   ```

4. **Analyze task complexity**:
   ```bash
   task-master analyze-complexity --research
   ```

5. **Break down complex tasks**:
   ```bash
   task-master expand --id=<task-id>
   ```

6. **Update task status**:
   ```bash
   task-master set-status --id=<task-id> --status=<status>
   ```

## Directory Structure

```
project-root/
├── README.md                # Project overview and entry point
├── docs/                    # Documentation directory
│   ├── PRD.md               # Product Requirements Document
│   ├── ARCHITECTURE.md      # System architecture documentation
│   ├── API.md               # API documentation
│   └── DEVELOPMENT.md       # Development guidelines
├── tasks/                   # Task management files
│   ├── tasks.json           # Task definitions
│   └── [task files]         # Individual task files
├── src/                     # Source code
│   ├── components/          # UI components
│   ├── services/            # Business logic services
│   └── ...                  # Other source directories
├── .scotty/                 # Scotty configuration
│   ├── rules.md             # AI behavior rules
│   ├── context.md           # Current project context
│   └── handoffs/            # Documentation for task transitions
└── schemas/                 # Shared type definitions and contracts
```

## Task Management

This project uses the task-master CLI for managing tasks. See the [Task Management Guide](./docs/TASK_MANAGEMENT.md) for detailed information.

## Documentation

- [Product Requirements Document](./docs/PRD.md) - Detailed product requirements
- [Architecture Documentation](./docs/ARCHITECTURE.md) - System architecture
- [API Documentation](./docs/API.md) - API endpoints and usage
- [Development Guide](./docs/DEVELOPMENT.md) - Development standards and practices

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Check if PostgreSQL is running:
   ```bash
   docker ps | grep postgres
   ```

2. If it's not running, start it:
   ```bash
   docker-compose up -d postgres
   ```

3. Ensure your `.env` file has the correct database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=communityio
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

### Redis Connection Issues

If you encounter Redis connection errors:

1. Check if Redis is running:
   ```bash
   docker ps | grep redis
   ```

2. If it's not running, start it:
   ```bash
   docker-compose up -d redis
   ```

3. Ensure your `.env` file has the correct Redis configuration:
   ```
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   ```

### Migration Issues

If database migrations fail:

1. Ensure PostgreSQL is running and accessible
2. Check if the database exists:
   ```bash
   docker exec -it communityio-postgres psql -U postgres -c "\l"
   ```
3. If needed, create the database:
   ```bash
   docker exec -it communityio-postgres psql -U postgres -c "CREATE DATABASE communityio;"
   ```

## For AI Assistants

If you are an AI assistant working on this project:

1. Always reference the rules in `.scotty/rules.md` for specific behavior guidelines
2. Check `.scotty/context.md` for current project context
3. Review the task files in `tasks/` for specific implementation details
4. Follow the documentation standards described in the docs directory
