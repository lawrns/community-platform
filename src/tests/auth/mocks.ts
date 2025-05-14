/**
 * Authentication Test Mocks
 * Provides mock implementations for testing authentication
 */

import { User } from '../../models';
import cache from '../../config/cache';

/**
 * Mock user data
 */
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
    password_hash: '$2b$12$K8Y6hRjlGpHrqHJmW/tHUO0n4KRGr9I4VJHoEP5xaMQR.pEUf4Z5O', // "password123"
    reputation: 10,
    email_verified: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    email: 'unverified@example.com',
    username: 'unverified',
    name: 'Unverified User',
    password_hash: '$2b$12$K8Y6hRjlGpHrqHJmW/tHUO0n4KRGr9I4VJHoEP5xaMQR.pEUf4Z5O', // "password123"
    reputation: 0,
    email_verified: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 3,
    email: 'oauth@example.com',
    username: 'oauthuser',
    name: 'OAuth User',
    reputation: 5,
    email_verified: true,
    auth_provider: 'auth0',
    auth_provider_id: 'auth0|12345',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

/**
 * Mock UserRepository implementation
 */
export const mockUserRepository = {
  findById: jest.fn(async (id: number) => {
    return mockUsers.find(user => user.id === id) || null;
  }),
  
  findByEmail: jest.fn(async (email: string) => {
    return mockUsers.find(user => user.email === email) || null;
  }),
  
  findByUsername: jest.fn(async (username: string) => {
    return mockUsers.find(user => user.username === username) || null;
  }),
  
  findByAuthProviderId: jest.fn(async (provider: string, providerUserId: string) => {
    return mockUsers.find(user => 
      user.auth_provider === provider && user.auth_provider_id === providerUserId
    ) || null;
  }),
  
  create: jest.fn(async (userData: Partial<User>) => {
    const newUser: User = {
      id: mockUsers.length + 1,
      email: userData.email!,
      username: userData.username!,
      name: userData.name!,
      password_hash: userData.password_hash,
      auth_provider: userData.auth_provider,
      auth_provider_id: userData.auth_provider_id,
      reputation: userData.reputation || 0,
      email_verified: userData.email_verified || false,
      created_at: userData.created_at || new Date(),
      updated_at: userData.updated_at || new Date(),
    };
    
    mockUsers.push(newUser);
    return newUser;
  }),
  
  update: jest.fn(async (id: number, userData: Partial<User>) => {
    const index = mockUsers.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    mockUsers[index] = {
      ...mockUsers[index],
      ...userData,
      updated_at: new Date(),
    };
    
    return mockUsers[index];
  }),
  
  getStats: jest.fn(async (userId: number) => {
    return {
      question_count: 5,
      answer_count: 10,
      post_count: 3,
      accepted_answers: 2,
      review_count: 1,
      badge_count: 3,
    };
  }),
  
  getBadges: jest.fn(async (userId: number) => {
    return [
      { id: 1, name: 'First Answer', level: 'bronze' },
      { id: 2, name: 'Good Question', level: 'silver' },
    ];
  }),
  
  hasPrivilege: jest.fn(async (userId: number, privilege: string) => {
    return userId === 1; // Only user 1 has privileges for simplicity
  }),
};

/**
 * Mock EmailService implementation
 */
export const mockEmailService = {
  sendVerificationEmail: jest.fn(async () => true),
  sendPasswordResetEmail: jest.fn(async () => true),
  sendWelcomeEmail: jest.fn(async () => true),
  sendNotificationEmail: jest.fn(async () => true),
};

/**
 * Mock cache implementation
 */
export const mockCache = {
  get: jest.fn(async (key: string) => {
    if (key === 'verification:valid-token') {
      return { userId: 2 };
    }
    if (key === 'reset:valid-token') {
      return { userId: 1 };
    }
    return null;
  }),
  
  set: jest.fn(async (key: string, value: any, ttl: number) => {}),
  
  del: jest.fn(async (key: string) => {}),
};

/**
 * Mock JWT token generation & validation
 */
export const mockJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE2MTk3MjI3MTgsImV4cCI6MTYyMDMyNzUxOH0.wFnmnFdP3Nj2aaKF24EvUE7ROeE7qfTKT3jBrKAUAc0';

export const mockTokenPayload = {
  userId: 1,
  email: 'test@example.com',
  username: 'testuser',
};