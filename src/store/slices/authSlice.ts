// Auth Slice - Manages user authentication state
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { storageService } from '../../services/storageService';
import type { SignInFormData, SignUpFormData, User } from '../../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  permissionsGranted: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  permissionsGranted: false,
};

// Async thunks
export const loadUser = createAsyncThunk('auth/loadUser', async () => {
  const user = await storageService.getItem<User>('currentUser');
  return user;
});

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (data: SignUpFormData, { rejectWithValue }) => {
    try {
      const existingUsers = await storageService.getItem<User[]>('users') || [];
      
      const emailExists = existingUsers.some(
        (user) => user.email.toLowerCase() === data.email.toLowerCase()
      );
      
      if (emailExists) {
        return rejectWithValue('Email already registered');
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        name: data.name,
        surname: data.surname,
        email: data.email,
        cellNumber: data.cellNumber,
        avatar: 'boy',
        createdAt: new Date().toISOString(),
      };

      // Store password separately (hashed in production)
      await storageService.setItem(`password_${newUser.id}`, data.password);
      await storageService.setItem('users', [...existingUsers, newUser]);

      return newUser;
    } catch {
      return rejectWithValue('Failed to create account');
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (data: SignInFormData, { rejectWithValue }) => {
    try {
      const existingUsers = await storageService.getItem<User[]>('users') || [];
      
      const user = existingUsers.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );

      if (!user) {
        return rejectWithValue('User not found');
      }

      const storedPassword = await storageService.getItem<string>(`password_${user.id}`);
      
      if (storedPassword !== data.password) {
        return rejectWithValue('Invalid password');
      }

      const loggedInUser = {
        ...user,
        loginTime: new Date().toISOString(),
      };

      await storageService.setItem('currentUser', loggedInUser);
      return loggedInUser;
    } catch {
      return rejectWithValue('Failed to sign in');
    }
  }
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await storageService.removeItem('currentUser');
  return null;
});

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (data: Partial<User>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const currentUser = state.auth.user;
      
      if (!currentUser) {
        return rejectWithValue('No user logged in');
      }

      const updatedUser = { ...currentUser, ...data };
      await storageService.setItem('currentUser', updatedUser);

      // Update in users array too
      const existingUsers = await storageService.getItem<User[]>('users') || [];
      const updatedUsers = existingUsers.map((u) =>
        u.id === updatedUser.id ? updatedUser : u
      );
      await storageService.setItem('users', updatedUsers);

      return updatedUser;
    } catch {
      return rejectWithValue('Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPermissionsGranted: (state, action: PayloadAction<boolean>) => {
      state.permissionsGranted = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      })
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sign Out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError, setPermissionsGranted } = authSlice.actions;
export default authSlice.reducer;
