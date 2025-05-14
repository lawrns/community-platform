# AI Assistant Rules

This document defines explicit rules for AI assistants working on this project. Following these rules ensures consistent, high-quality outputs that match project requirements.

## General Behavior Rules

1. **Follow Explicit Instructions**
   - Implement exactly what is requested without introducing "improved" solutions unless explicitly asked
   - Do not add features or functionality that weren't specified
   - When asked to implement something specific, use the exact approach described

2. **Code Quality Standards**
   - Write code that follows project-specific style guides and patterns
   - Include comprehensive error handling for all edge cases
   - Add detailed comments explaining complex logic
   - Ensure all code is testable and maintainable

3. **Documentation Requirements**
   - Document all functions, classes, and modules with clear descriptions
   - Include usage examples for API endpoints and components
   - Update relevant documentation when implementing changes
   - Follow the established documentation format for the project

4. **Task Management Integration**
   - Reference task IDs in code comments and commit messages
   - Update task status using task-master CLI when tasks are completed
   - Include references to related tasks when implementing features
   - Ensure task acceptance criteria are fully met before marking as complete

5. **Context Preservation**
   - Update `.scotty/context.md` with significant implementation details
   - Document architectural decisions and their rationale
   - Explicitly note any deviations from the original plan
   - Maintain a record of completed tasks and their outcomes

## Decision-Making Framework

When making technical decisions, AI assistants should:

1. **Prioritize Requirements**
   - Explicitly rank requirements by importance when trade-offs are necessary
   - Consider functional requirements, performance, maintainability, and security
   - Document the relative weight given to each factor

2. **Evaluate Alternatives**
   - Present at least two alternative approaches for significant decisions
   - List pros and cons of each approach with clear evaluation criteria
   - Explain why the chosen solution is optimal given the specific context

3. **Consider Long-Term Impact**
   - Assess how decisions affect future extensibility and maintenance
   - Avoid solutions that create technical debt unless explicitly required
   - Document any potential future issues that may arise from the decision

4. **Follow Project Precedent**
   - Maintain consistency with existing architectural patterns
   - Defer to established patterns and technologies unless there's a compelling reason not to
   - Minimize the introduction of new dependencies or paradigms unless necessary

5. **Decision Documentation**
   - Document significant decisions using this format:
     ```
     ## Decision: [Brief title]
     - Context: [The situation that requires a decision]
     - Alternatives Considered: [List of options]
     - Decision Criteria: [What factors were most important]
     - Selected Approach: [The chosen solution]
     - Rationale: [Why this option was selected]
     - Implications: [Consequences of this decision]
     ```

## Collaboration Guidelines

When multiple AI assistants collaborate on a project:

1. **Handoff Protocol**
   - Create detailed handoff documents in `.scotty/handoffs/` directory
   - Include current status, decisions made, and next steps
   - Reference specific files and code sections to maintain context

2. **Consistent Mental Model**
   - Maintain a shared understanding of system architecture and components
   - Reference and update architecture documentation when changes are made
   - Align on terminology and abstractions used in the codebase

3. **Contextual Transitions**
   - Each assistant must review the full context before continuing work
   - Reference previous handoffs and the current project context
   - Ask clarifying questions before making assumptions about previous work

4. **Conflict Resolution**
   - When different approaches conflict, document the conflict
   - Evaluate each approach against the project requirements and constraints
   - Recommend a resolution based on objective criteria, not preference

5. **Continuous Integration**
   - Ensure changes work together seamlessly across different components
   - Verify integration points between components owned by different assistants
   - Document cross-component dependencies explicitly

## Project-Specific Overrides

This section contains project-specific rules that override the general guidelines. Developers should update this section to reflect the unique requirements of each project.

```
# Project Override Template
## [Override Category]
- **Original Rule**: [The general rule being overridden]
- **Project-Specific Rule**: [The new rule for this project]
- **Rationale**: [Why this override is necessary]
```

Examples:

```
## Documentation Override
- **Original Rule**: Document all functions with JSDoc comments
- **Project-Specific Rule**: Only public API functions require JSDoc; internal functions use brief single-line comments
- **Rationale**: Team preference for concise code in internal implementations
```

```
## Testing Override
- **Original Rule**: Achieve 80% test coverage for all code
- **Project-Specific Rule**: Critical paths require 95% coverage; utility functions require 70% coverage
- **Rationale**: Prioritizing test resources on business-critical functionality
```

## Learning & Improvement

AI assistants should continuously improve their understanding and effectiveness:

1. **Feedback Integration**
   - Review and incorporate feedback from developers
   - Document common feedback patterns to avoid repeating mistakes
   - Update approach based on what works well for the specific project

2. **Knowledge Accumulation**
   - Create memories for project-specific patterns and preferences
   - Reference previous similar solutions when solving new problems
   - Build upon successful approaches rather than reinventing

3. **Self-Evaluation**
   - After completing major tasks, conduct a retrospective
   - Identify what went well and what could be improved
   - Note specific improvements for future similar tasks

4. **Continuous Adaptation**
   - Adjust to the team's evolving coding style and patterns
   - Observe which suggestions are accepted vs. modified
   - Adapt recommendations to align with demonstrated preferences

5. **Knowledge Sharing**
   - Document insights and learnings in a standardized format
   - Highlight patterns that improve efficiency or quality
   - Make explicit recommendations for process improvements

## Testing & Validation Standards

AI assistants should follow these standards when writing and reviewing tests:

1. **Test Coverage Requirements**
   - Unit tests: Cover all public functions and critical private functions
   - Integration tests: Cover all API endpoints and service interactions
   - E2E tests: Cover all critical user flows
   - Aim for minimum 80% code coverage unless overridden by project-specific rules

2. **Test Quality Standards**
   - Tests should be deterministic (same input always produces same output)
   - Each test should verify one specific behavior
   - Tests should be independent of each other
   - Mock external dependencies and focus on the unit being tested

3. **Test Documentation**
   - Document the purpose of each test suite
   - Use descriptive test names that explain the expected behavior
   - Document any complex test setup or non-obvious assertions

4. **Edge Case Testing**
   - Test boundary conditions explicitly
   - Include tests for invalid inputs and error conditions
   - Consider concurrency and race conditions where applicable
   - Test performance under expected load conditions

5. **Test Maintenance**
   - Keep tests updated when implementation changes
   - Refactor tests when they become brittle or hard to maintain
   - Treat test code with the same quality standards as production code

## Implementation Verification Requirements

When completing tasks, verify your implementation against this checklist:

1. **Functionality Verification**
   - Does the implementation fulfill all specified requirements?
   - Have all edge cases been handled?
   - Does the implementation work correctly in all required environments?

2. **Code Quality Verification**
   - Does the code follow project-specific style guides?
   - Is the code well-documented and maintainable?
   - Are there appropriate tests for the implementation?

3. **Integration Verification**
   - Does the implementation work correctly with existing components?
   - Are there any potential conflicts or breaking changes?
   - Have necessary API contracts been followed?

4. **Performance Verification**
   - Does the implementation meet performance requirements?
   - Are there any potential bottlenecks or memory issues?
   - Has the implementation been optimized appropriately?

## Response Format Requirements

When responding to queries, use this structured format:

```
## Understanding
[Brief summary of the request and requirements]

## Implementation Plan
[Step-by-step approach to implementing the request]

## Implementation
[Actual code or solution]

## Verification
[How the solution meets the requirements]
```

## API Contract Adherence

When implementing APIs:

1. Always reference the schema definitions in `schemas/`
2. Validate request and response formats against the API contracts
3. Do not modify API contracts without explicit approval
4. Ensure all endpoints follow the defined conventions

## Data Handling Requirements

1. Never use mock data when real data sources are available
2. Implement proper error handling for data retrieval failures
3. Validate all data against defined schemas
4. Follow project-specific data privacy and security requirements
