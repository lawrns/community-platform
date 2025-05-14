/**
 * Authentication utilities for token management
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  role: string;
  reputation?: number;
}

export const AuthTokenStorage = {
  /**
   * Saves the authentication token to local storage
   */
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  /**
   * Retrieves the authentication token from local storage
   */
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  /**
   * Removes the authentication token from local storage
   */
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  /**
   * Saves the user data to local storage
   */
  setUser: (user: User): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Retrieves the user data from local storage
   */
  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(USER_KEY);
      if (userData) {
        try {
          return JSON.parse(userData) as User;
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
    }
    return null;
  },

  /**
   * Removes the user data from local storage
   */
  removeUser: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Clear all authentication data
   */
  clearAuth: (): void => {
    AuthTokenStorage.removeToken();
    AuthTokenStorage.removeUser();
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!AuthTokenStorage.getToken();
  }
};