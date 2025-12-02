// Auth context for managing user authentication state
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import type { SignInFormData, SignUpFormData, User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (data: SignUpFormData) => Promise<{ success: boolean; message: string }>;
  signIn: (data: SignInFormData) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await storageService.getItem<User>('userInfo');
        if (savedUser) {
          setUser(savedUser);
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Sign up function
  const signUp = useCallback(async (data: SignUpFormData): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!data.name || !data.surname || !data.email || !data.cellNumber || !data.password) {
        return { success: false, message: 'Please fill in all required fields.' };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return { success: false, message: 'Please enter a valid email address.' };
      }

      // Validate password length
      if (data.password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
      }

      // Get existing users from storage
      const existingUsers = await storageService.getItem<User[]>('registeredUsers') || [];
      
      // Check if email already exists
      const emailExists = existingUsers.some((u: User) => u.email === data.email);
      if (emailExists) {
        return { success: false, message: 'Email already registered. Please login.' };
      }

      // Create new user
      const newUser: User = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        surname: data.surname,
        email: data.email,
        cellNumber: data.cellNumber,
        password: data.password,
        avatar: undefined,
        createdAt: new Date().toISOString(),
      };

      // Add new user to array and save
      existingUsers.push(newUser);
      await storageService.setItem('registeredUsers', existingUsers);
      await storageService.setItem('lastRegisteredEmail', data.email);

      return { success: true, message: 'Account created successfully! Please log in.' };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, message: 'Failed to create account. Please try again.' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in function
  const signIn = useCallback(async (data: SignInFormData): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!data.email || !data.password) {
        return { success: false, message: 'Please enter both email and password.' };
      }

      // Get users from storage
      const users = await storageService.getItem<User[]>('registeredUsers') || [];
      
      const foundUser = users.find((u: User) => 
        u.email === data.email && u.password === data.password
      );

      if (!foundUser) {
        return { success: false, message: 'Invalid email or password.' };
      }

      // Create user info without password
      const userInfo: User = {
        id: foundUser.id,
        name: foundUser.name,
        surname: foundUser.surname,
        email: foundUser.email,
        cellNumber: foundUser.cellNumber,
        avatar: foundUser.avatar,
        createdAt: foundUser.createdAt,
        loginTime: new Date().toISOString(),
      };

      // Save user info to storage
      await storageService.setItem('userInfo', userInfo);
      setUser(userInfo);

      return { success: true, message: 'Login successful!' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await storageService.removeItem('userInfo');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user function
  const updateUser = useCallback(async (data: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false;

      const updatedUser = { ...user, ...data };
      await storageService.setItem('userInfo', updatedUser);
      setUser(updatedUser);

      // Also update in registered users list
      const users = await storageService.getItem<User[]>('registeredUsers') || [];
      const updatedUsers = users.map((u: User) => 
        u.id === user.id ? { ...u, ...data } : u
      );
      await storageService.setItem('registeredUsers', updatedUsers);

      return true;
    } catch (err) {
      console.error('Update user error:', err);
      return false;
    }
  }, [user]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
