'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthTokenStorage } from '@/lib/auth';
import { api } from '@/lib/api';
import { notificationService } from '@/lib/websocket';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (userData: {
    email: string;
    password: string;
    username: string;
    name?: string;
  }) => Promise<User>;
  updateUser: (data: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on initial mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const storedUser = AuthTokenStorage.getUser();
        
        if (storedUser && AuthTokenStorage.isAuthenticated()) {
          // Verify token is still valid by fetching current user
          try {
            const response = await api.users.getProfile(storedUser.id);
            setUser(response.user);
            AuthTokenStorage.setUser(response.user); // Update stored user data
            
            // Connect to notification service
            notificationService.connect();
          } catch (error) {
            console.error('Failed to verify user session:', error);
            AuthTokenStorage.clearAuth();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
    
    // Cleanup notification service on unmount
    return () => {
      notificationService.disconnect();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.auth.login({ email, password });
    
    AuthTokenStorage.setToken(response.token);
    AuthTokenStorage.setUser(response.user);
    setUser(response.user);
    
    // Connect to notification service
    notificationService.connect();
    
    // Refresh router
    router.refresh();
    
    return response.user;
  };

  // Logout function
  const logout = () => {
    AuthTokenStorage.clearAuth();
    setUser(null);
    
    // Disconnect from notification service
    notificationService.disconnect();
    
    // Redirect to home page
    router.push('/');
    router.refresh();
  };

  // Register function
  const register = async (userData: {
    email: string;
    password: string;
    username: string;
    name?: string;
  }): Promise<User> => {
    const response = await api.auth.register(userData);
    
    AuthTokenStorage.setToken(response.token);
    AuthTokenStorage.setUser(response.user);
    setUser(response.user);
    
    // Connect to notification service
    notificationService.connect();
    
    // Refresh router
    router.refresh();
    
    return response.user;
  };

  // Update user function
  const updateUser = async (data: Partial<User>): Promise<User> => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    const response = await api.users.updateProfile(user.id, data);
    const updatedUser = { ...user, ...response.user };
    
    AuthTokenStorage.setUser(updatedUser);
    setUser(updatedUser);
    
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}