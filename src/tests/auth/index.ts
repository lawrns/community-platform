/**
 * Auth Tests
 * Entry point for auth module tests
 * 
 * The auth tests are organized as follows:
 * 
 * 1. Unit Tests:
 *    - authService.test.ts: Tests the authentication service in isolation
 *    - authMiddleware.test.ts: Tests the auth middleware components
 *    - authRoutes.test.ts: Tests the auth API routes with mocked services
 * 
 * 2. Integration Tests:
 *    - authIntegration.test.ts: End-to-end tests for authentication flows
 *      with actual database and cache interactions
 * 
 * 3. Support Files:
 *    - mocks.ts: Mock implementations for testing
 * 
 * To run all auth tests:
 * npm test -- src/tests/auth
 * 
 * To run a specific test file:
 * npm test -- src/tests/auth/authService.test.ts
 */

export * from './mocks';