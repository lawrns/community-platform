# Development Guide

This document outlines the development practices and standards for projects managed with Scotty.

## Development Workflow

### Getting Started

1. Clone the repository
2. Install dependencies
3. Review the project documentation in the `docs` directory
4. Check current tasks with `task-master list`

### Task-Based Development Process

1. Begin each development session by checking task status:
   ```bash
   task-master list
   ```

2. Select a task based on dependencies, priority, and ID order
   - All dependencies should be marked "done"
   - Choose higher priority tasks first
   - Follow ID order for tasks of equal priority

3. View task details:
   ```bash
   task-master show <id>
   ```

4. Update task status to in-progress:
   ```bash
   task-master set-status --id=<id> --status=in-progress
   ```

5. Implement the task according to specifications:
   - Follow the implementation details in the task file
   - Reference related documentation and architecture
   - Adhere to coding standards

6. Validate your implementation against:
   - Test strategy defined in the task
   - Acceptance criteria
   - AI behavior rules in `.scotty/rules.md`

7. Update task status to done when complete:
   ```bash
   task-master set-status --id=<id> --status=done
   ```

8. When implementation differs from the original plan:
   ```bash
   task-master update --from=<id> --prompt="<explanation>"
   ```

## Code Standards

### General Guidelines

- Follow language-specific style guides
- Write clear, well-commented code
- Include unit tests for all functionality
- Document public APIs and interfaces

### Git Workflow

1. Create feature branches from `main`: `git checkout -b feature/<task-id>-<description>`
2. Make small, focused commits with clear messages
3. Reference task IDs in commit messages: `feat(<scope>): implement feature X (Task #123)`
4. Submit pull requests for review before merging

### Pull Request Process

1. Ensure all tests pass
2. Update documentation as needed
3. Get code review from at least one team member
4. Squash and merge to main after approval

## Testing Standards

### Unit Tests

- Write unit tests for all new functionality
- Aim for high test coverage (>80%)
- Use mocks and stubs for external dependencies

### Integration Tests

- Test interactions between components
- Verify API contracts are followed
- Include happy path and error cases

### End-to-End Tests

- Simulate real user flows
- Test critical paths through the application
- Include performance and reliability tests

## Documentation Standards

All code should be well-documented with:

- Class and function documentation
- Usage examples
- Edge cases and limitations
- Architecture diagrams for complex systems

## Performance Guidelines

- Optimize for both speed and memory usage
- Use efficient algorithms and data structures
- Consider scalability from the beginning
- Profile code to identify bottlenecks

## Security Guidelines

- Follow security best practices for your tech stack
- Never commit sensitive information (API keys, passwords)
- Use environment variables for configuration
- Validate all user inputs
- Protect against common security vulnerabilities

## Accessibility Guidelines

- Follow WCAG 2.1 AA standards
- Test with screen readers and keyboard-only navigation
- Provide alternative text for images
- Ensure sufficient color contrast
- Support keyboard navigation

## Error Handling Guidelines

- Use consistent error handling patterns
- Log errors with appropriate context
- Provide helpful error messages
- Fail gracefully when possible
