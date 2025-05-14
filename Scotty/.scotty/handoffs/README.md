# AI Assistant Handoff Protocols

This directory contains handoff documentation for transitioning work between AI assistants. Maintaining these handoffs ensures context preservation and consistent implementation.

## Creating a Handoff Document

When transitioning a task to another AI assistant, create a handoff document with the following filename structure:

```
task-<task-id>-handoff-<timestamp>.md
```

## Handoff Document Template

```markdown
# Task Handoff: [Task ID] - [Task Title]

## Current Status
[Brief description of the current status of the task]

## Work Completed
[Detailed description of work already completed, including:
- Key decisions made
- Challenges encountered
- Solutions implemented
- References to relevant files and code]

## Next Steps
[Clear description of what needs to be done next]

## Known Issues
[List of any known issues or challenges that need to be addressed]

## Context References
[Links to relevant documentation, discussions, or resources]

## Handoff Notes
[Any additional information that would be helpful for the next AI assistant]
```

## Example Handoff

```markdown
# Task Handoff: 12 - Implement User Authentication

## Current Status
The API endpoints for user authentication have been implemented. Frontend components are partially complete.

## Work Completed
- Created API endpoints for login, registration, and password reset
- Implemented JWT token authentication
- Set up password hashing and validation
- Created login and registration forms in React

## Next Steps
- Implement password reset functionality in the frontend
- Add form validation
- Connect frontend forms to the API
- Create user profile page

## Known Issues
- Token refresh mechanism needs to be optimized
- Mobile responsiveness needs improvement on login form

## Context References
- [Authentication API Documentation](../../docs/api/auth.md)
- [Frontend Component Requirements](../../docs/ui/components.md)
- Related task: Task #15 - User Profile Management

## Handoff Notes
I've used the AuthContext pattern for managing authentication state. All components should use this context rather than implementing their own authentication state management.
```

## Handoff Best Practices

1. **Be Explicit About Context**: Don't assume the next AI assistant has access to your previous conversations or decisions.

2. **Reference Specific Files**: Include absolute paths to relevant files that contain related code or documentation.

3. **Explain Why, Not Just What**: Include reasoning behind key decisions.

4. **Document Unfinished Work**: Clearly identify what remains to be done.

5. **Update Context File**: Always update the main `.scotty/context.md` file when creating a handoff.

6. **Link to Related Tasks**: Reference any related or dependent tasks.

7. **Include Verification Methods**: Specify how the next assistant should verify that the implementation meets requirements.

## Handoff Process

1. Complete your current work to a logical stopping point
2. Create a handoff document in this directory
3. Update the context file with a reference to the handoff document
4. Summarize the handoff in your response to the user
