# Scotty: AI-Optimized Project Management Framework

**The ultimate project management framework for AI-assisted development**

## Overview

Scotty is a comprehensive project management framework designed specifically for AI-assisted development workflows. It provides a structured approach to managing projects, tasks, and collaboration between human developers and AI assistants.

## Key Features

- **Standardized Project Structure**: Clear organization for any project type
- **Task Management System**: Integrated with task-master CLI
- **AI Behavior Rules**: Explicit guidelines for AI assistants
- **Context Preservation**: Mechanisms to maintain context between sessions
- **Documentation Standards**: Templates for consistent documentation
- **Handoff Protocols**: Seamless transitions between AI assistants

## Getting Started

1. **Initialize a new project**:
   ```bash
   task-master init
   ```

2. **View current tasks**:
   ```bash
   task-master list
   ```

3. **Analyze task complexity**:
   ```bash
   task-master analyze-complexity --research
   ```

4. **Break down complex tasks**:
   ```bash
   task-master expand --id=<task-id>
   ```

5. **Update task status**:
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
│   ├── components/          # UI components (for web/mobile)
│   ├── services/            # Business logic services
│   └── ...                  # Other source directories
├── .scotty/                 # Scotty configuration
│   ├── rules.md             # AI behavior rules
│   ├── context.md           # Current project context
│   └── handoffs/            # Documentation for task transitions
└── schemas/                 # Shared type definitions and contracts
```

## Task Management

Scotty uses the task-master CLI for managing tasks. See the [Task Management Guide](./docs/TASK_MANAGEMENT.md) for detailed information.

## Documentation

- [Product Requirements Document](./docs/PRD.md) - Template for defining product requirements
- [Architecture Documentation](./docs/ARCHITECTURE.md) - Template for system architecture
- [Development Guide](./docs/DEVELOPMENT.md) - Development standards and practices
- [Task Management Guide](./docs/TASK_MANAGEMENT.md) - Guide for using task-master CLI

## For AI Assistants

If you are an AI assistant working on a Scotty-based project:

1. Always reference the rules in `.scotty/rules.md` for specific behavior guidelines
2. Check `.scotty/context.md` for current project context
3. Review the task files in `tasks/` for specific implementation details
4. Follow the documentation standards described in the docs directory

## License

MIT License
