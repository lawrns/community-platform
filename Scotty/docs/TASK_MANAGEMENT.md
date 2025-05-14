# Task Management in Scotty

This guide explains how to use the task-master CLI to manage development tasks in Scotty projects.

## Task Master CLI Overview

Scotty integrates with the task-master CLI for efficient task management. This tool provides a structured approach to breaking down, prioritizing, and tracking development tasks.

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

### Starting a New Project

1. Begin with initializing the project structure:
   ```bash
   task-master init
   ```

2. Generate initial tasks from a PRD document:
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

## Task Breakdown Best Practices

- Break complex tasks into 3-7 subtasks for optimal management
- Ensure each subtask has a clear, testable outcome
- Maintain logical dependency chains between subtasks
- Add `--research` flag to leverage AI for research-backed expansions
- Use `--prompt="<context>"` to provide additional context when needed

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

### Task Generation

Generate individual task files from tasks.json:
```bash
task-master generate
```

### Clear Subtasks

Clear existing subtasks when regeneration is needed:
```bash
task-master clear-subtasks --id=<id>
```
