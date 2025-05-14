/**
 * Supabase Integration Tests
 * Tests the integration between Community.io and Supabase
 */

import { supabase, supabaseAdmin } from '../../config/supabase';
import { config } from '../../config/environment';
import { userRepository } from '../../models/repositories';
import authService from '../../services/auth/authService';

// Skip tests if Supabase credentials are not provided
const shouldRunTests = !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY;

// Test suite
describe('Supabase Integration', () => {
  // Test user data
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
    username: `testuser${Date.now()}`,
    name: 'Test User',
  };

  // Skip all tests if Supabase is not configured
  beforeAll(() => {
    if (!shouldRunTests) {
      console.log('Skipping Supabase integration tests: No Supabase credentials provided');
    }
  });

  // Clean up test users after all tests
  afterAll(async () => {
    if (shouldRunTests) {
      try {
        // Find and delete test user
        const { data: userData } = await supabaseAdmin.auth.admin.listUsers({
          filter: {
            email: testUser.email,
          },
        });

        if (userData?.users?.length) {
          await supabaseAdmin.auth.admin.deleteUser(userData.users[0].id);
        }

        // Delete from our database
        const dbUser = await userRepository.findByEmail(testUser.email);
        if (dbUser) {
          await userRepository.delete(dbUser.id);
        }
      } catch (error) {
        console.error('Error cleaning up test user:', error);
      }
    }
  });

  // Connection test
  test('Should connect to Supabase', async () => {
    if (!shouldRunTests) {
      return;
    }

    const { data, error } = await supabase.from('_metadata').select('version').maybeSingle();
    expect(error).toBeNull();
    expect(data).not.toBeNull();
  });

  // User registration test
  test('Should register a new user with Supabase Auth', async () => {
    if (!shouldRunTests) {
      return;
    }

    // Register test user
    const { user, verificationToken } = await authService.register(testUser);

    // Check user in our database
    expect(user).toBeDefined();
    expect(user.email).toBe(testUser.email);
    expect(user.username).toBe(testUser.username);
    expect(user.name).toBe(testUser.name);
    expect(user.auth_provider).toBe('supabase');
    
    // Verify user exists in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: testUser.email,
      },
    });
    
    expect(error).toBeNull();
    expect(data.users.length).toBeGreaterThan(0);
    expect(data.users[0].email).toBe(testUser.email);
    
    // Store Supabase user ID for later tests
    testUser.id = data.users[0].id;
  });

  // User login test
  test('Should login a user with Supabase Auth', async () => {
    if (!shouldRunTests) {
      return;
    }

    // Skip if registration test failed
    if (!testUser.id) {
      console.log('Skipping login test: No test user ID available');
      return;
    }

    // Login test user
    const { user, token } = await authService.login(testUser.email, testUser.password);

    // Check user and token
    expect(user).toBeDefined();
    expect(user.email).toBe(testUser.email);
    expect(token).toBeDefined();
    
    // Verify we can use the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testUser.email);
  });

  // User profile update test
  test('Should update user profile in both databases', async () => {
    if (!shouldRunTests) {
      return;
    }

    // Skip if registration test failed
    if (!testUser.id) {
      console.log('Skipping profile update test: No test user ID available');
      return;
    }

    // Find user in our database
    const user = await userRepository.findByEmail(testUser.email);
    expect(user).toBeDefined();

    // Update profile data
    const updateData = {
      bio: 'This is a test bio',
      name: 'Updated Test User',
    };

    // Update in our database
    const updatedUser = await userRepository.update(user.id, updateData);
    expect(updatedUser.bio).toBe(updateData.bio);
    expect(updatedUser.name).toBe(updateData.name);

    // Update in Supabase
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      testUser.id,
      {
        user_metadata: updateData,
      }
    );
    expect(error).toBeNull();

    // Verify Supabase update
    const { data, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(testUser.id);
    expect(getUserError).toBeNull();
    expect(data.user.user_metadata.bio).toBe(updateData.bio);
    expect(data.user.user_metadata.name).toBe(updateData.name);
  });

  // Password change test
  test('Should change user password', async () => {
    if (!shouldRunTests) {
      return;
    }

    // Skip if registration test failed
    if (!testUser.id) {
      console.log('Skipping password change test: No test user ID available');
      return;
    }

    // Find user in our database
    const user = await userRepository.findByEmail(testUser.email);
    expect(user).toBeDefined();

    // New password
    const newPassword = 'NewPassword456!';

    // Change password
    await authService.changePassword(user.id, testUser.password, newPassword);

    // Try to login with new password
    const { user: loggedInUser, token } = await authService.login(testUser.email, newPassword);
    expect(loggedInUser).toBeDefined();
    expect(loggedInUser.email).toBe(testUser.email);
    expect(token).toBeDefined();

    // Update test user password for cleanup
    testUser.password = newPassword;
  });

  // JWT token validation test
  test('Should validate JWT tokens from both systems', async () => {
    if (!shouldRunTests) {
      return;
    }

    // Skip if registration test failed
    if (!testUser.id) {
      console.log('Skipping token validation test: No test user ID available');
      return;
    }

    // Login to get a token
    const { user, token } = await authService.login(testUser.email, testUser.password);
    expect(token).toBeDefined();

    // Validate our JWT token
    const payload = await authService.validateToken(token);
    expect(payload).toBeDefined();
    expect(payload.email).toBe(testUser.email);

    // Get a Supabase token
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });
    expect(sessionError).toBeNull();
    expect(sessionData.session).toBeDefined();
    
    // Test if our middleware can validate Supabase token
    const { data: userData, error: userError } = await supabase.auth.getUser(sessionData.session.access_token);
    expect(userError).toBeNull();
    expect(userData.user).toBeDefined();
    expect(userData.user.email).toBe(testUser.email);
  });

  // Repository operations test
  test('Should perform repository operations with Supabase', async () => {
    if (!shouldRunTests) {
      return;
    }

    // Find user in our database
    const user = await userRepository.findByEmail(testUser.email);
    expect(user).toBeDefined();

    // Test findById
    const foundUser = await userRepository.findById(user.id);
    expect(foundUser).toBeDefined();
    expect(foundUser.email).toBe(testUser.email);

    // Test findByUsername
    const userByUsername = await userRepository.findByUsername(testUser.username);
    expect(userByUsername).toBeDefined();
    expect(userByUsername.email).toBe(testUser.email);

    // Test findByAuthProviderId
    const userByProviderId = await userRepository.findByAuthProviderId('supabase', testUser.id);
    expect(userByProviderId).toBeDefined();
    expect(userByProviderId.email).toBe(testUser.email);
  });
});