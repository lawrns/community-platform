# Task Management Guide

## Overview

This guide explains how to use the task-master CLI to manage development tasks for the community.io platform. The task management system helps break down complex requirements into manageable tasks, track progress, and ensure consistent implementation.

## Task Master CLI Overview

The community.io project uses the task-master CLI for efficient task management. This tool provides a structured approach to breaking down, prioritizing, and tracking development tasks.

### Installation

```bash
# Install globally
npm install -g claude-task-master

# Or use locally via npx
npx claude-task-master <command>
```

### Key Commands

| Command | Description |
|---------|-------------|
| `task-master list` | View all tasks and their status |
| `task-master show <id>` | View details for a specific task |
| `task-master expand --id=<id>` | Break down a task into subtasks |
| `task-master set-status --id=<id> --status=<status>` | Update task status |
| `task-master analyze-complexity` | Analyze task complexity |
| `task-master parse-prd --input=<file>` | Generate tasks from PRD |
| `task-master update --from=<id> --prompt="<text>"` | Update tasks based on new context |
| `task-master generate` | Generate individual task files from tasks.json |
| `task-master init` | Initialize a new Scotty project |

## Task Management Process

### Starting the Project

1. Begin with initializing the project structure:
   ```bash
   task-master init
   ```

2. Generate initial tasks from the PRD document:
   ```bash
   task-master parse-prd --input=docs/PRD.md
   ```

### Daily Workflow

1. Check current tasks and priorities:
   ```bash
   task-master list
   ```

2. Analyze task complexity to identify which tasks need breaking down:
   ```bash
   task-master analyze-complexity --research
   ```

3. View detailed requirements for a specific task:
   ```bash
   task-master show <id>
   ```

4. Start working on a task:
   ```bash
   task-master set-status --id=<id> --status=in-progress
   ```

5. For complex tasks, break them down into subtasks:
   ```bash
   task-master expand --id=<id>
   ```

6. Mark tasks as complete:
   ```bash
   task-master set-status --id=<id> --status=done
   ```

7. When implementation differs from plan, update future tasks:
   ```bash
   task-master update --from=<id> --prompt="<explanation>"
   ```

## Task Complexity Analysis

Use complexity analysis to determine which tasks need to be broken down:

```bash
task-master analyze-complexity --research
```

This generates a detailed report with complexity scores for each task. Focus on breaking down tasks with high complexity scores (8-10).

### Understanding Complexity Scores

- **1-3**: Simple tasks that can be implemented directly
- **4-7**: Moderate complexity, may need some planning
- **8-10**: Complex tasks that should be broken down into subtasks

## Task Breakdown Best Practices

- Break complex tasks into 3-7 subtasks for optimal management
- Ensure each subtask has a clear, testable outcome
- Maintain logical dependency chains between subtasks
- Add `--research` flag to leverage AI for research-backed expansions
- Use `--prompt="<context>"` to provide additional context when needed

Example:
```bash
task-master expand --id=5 --research --prompt="Focus on security best practices for authentication"
```

## Task Status Management

Standard task statuses include:
- `pending`: Ready to be worked on
- `in-progress`: Currently being worked on
- `done`: Completed and verified
- `deferred`: Postponed for later
- `blocked`: Cannot proceed due to dependencies or issues

Update statuses using:
```bash
task-master set-status --id=<id> --status=<status>
```

## Task File Format

Each task includes:
- ID and title
- Status and priority
- Dependencies
- Description and implementation details
- Test strategy
- Acceptance criteria

Example task file format:
```
# Task ID: <id>
# Title: <title>
# Status: <status>
# Dependencies: <comma-separated list of dependency IDs>
# Priority: <priority>
# Description: <brief description>
# Details:
<detailed implementation notes>

# Test Strategy:
<verification approach>

# Acceptance Criteria:
- <criterion 1>
- <criterion 2>
- <criterion 3>
```

## Integration with Development Process

1. Begin each development session by checking task status
2. Implement code according to task details and requirements
3. Verify implementation against test strategy before marking complete
4. Document any deviations from original plan
5. Update task dependencies when implementation changes

## Advanced Task Master Features

### Dependency Management

View and fix dependencies using:
```bash
task-master fix-dependencies
```

This command will analyze the dependency chain and identify any circular or invalid dependencies.

### Task Generation

Generate individual task files from tasks.json:
```bash
task-master generate
```

This creates individual markdown files for each task in the tasks/ directory.

### Clear Subtasks

Clear existing subtasks when regeneration is needed:
```bash
task-master clear-subtasks --id=<id>
```

This removes all subtasks of a parent task, allowing you to regenerate them with a new approach.

### Task Prioritization

Tasks are prioritized based on:
1. Dependencies (tasks with completed dependencies are prioritized)
2. Priority level (P0, P1, P2)
3. Task ID (lower IDs generally represent earlier implementation steps)

## Task Management for community.io Features

The community.io platform has specific task categories aligned with the PRD:

### P0 (Must Have) Features

These tasks should be completed first for the MVP:
- Account & Auth
- Content Creation & Editing
- Taxonomy & Tagging
- Search
- Reputation System
- Notification Engine
- Moderation & Governance
- Tool Directory
- Personalized Feed & Dashboard

### P1 (Should Have) Features

These tasks should be planned after P0 completion:
- Live Events & AMAs
- Mobile-Responsive PWA
- Educational Cohorts & Certifications

### P2 (Nice to Have) Features

These tasks are for future consideration:
- Native Apps
- Plugin / API Marketplace
- Enterprise Private Spaces

## Task Reporting

Generate reports on task progress:

```bash
# Generate a task status report
task-master report

# Generate a complexity report
task-master complexity-report
```

## Handling Implementation Changes

When your implementation approach differs from the original plan:

1. Complete the current task with your implementation
2. Document the changes in the task completion notes
3. Update future dependent tasks:
   ```bash
   task-master update --from=<next-task-id> --prompt="Changed authentication implementation from JWT to OAuth, future tasks need to use OAuth flow instead of JWT"
   ```

## Best Practices for Task Management

1. **Keep tasks atomic**: Each task should focus on a single feature or component
2. **Maintain clear dependencies**: Explicitly define which tasks must be completed before starting a new one
3. **Update task status promptly**: Keep the task board updated to reflect current progress
4. **Document implementation details**: Add notes about implementation decisions for future reference
5. **Verify against acceptance criteria**: Ensure all criteria are met before marking a task as done
6. **Break down complex tasks**: Don't hesitate to expand tasks that seem too large or complex
7. **Prioritize based on dependencies**: Complete prerequisite tasks before moving to dependent ones
