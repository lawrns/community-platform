# Task ID: PERF-102
# Title: Code-split homepage bundle & lazy-load dashboard widgets
# Status: pending
# Dependencies: AUTH-001
# Priority: P1
# Estimate: 2 days
# Assignee: @frontend-team
# Type: High-Impact

## Description
Improve application performance by implementing code-splitting for the homepage bundle and lazy-loading dashboard widgets.

## Details
1. Implement code-splitting for the main homepage bundle
2. Convert dashboard widgets to lazy-load on demand
3. Add loading states for lazy-loaded components
4. Optimize bundle sizes for critical path rendering

## Test Strategy
1. Measure bundle sizes before and after changes
2. Test loading performance in various network conditions
3. Verify lazy-loading triggers work correctly
4. Run Lighthouse performance tests

## Acceptance Criteria
- Homepage initial bundle size reduced by at least 30%
- Dashboard widgets lazy-load when scrolled into view
- All components have appropriate loading states
- No regression in functionality
- Lighthouse performance score improved by at least 15 points
- Application remains responsive during lazy-loading