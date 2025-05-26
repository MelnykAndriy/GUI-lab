import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import * as authService from '../../services/authService';
import * as userService from '../../services/userService';

export interface UserProfile {
  name: string;
  gender?: string;
  dob?: string;
  createdAt: string;
  avatarUrl?: string;
  avatarColor?: string;
}

export interface User {
  id: number;
  email: string;
  profile: UserProfile;
  access?: string;
  refresh?: string;
}

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state setup
const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Load user data from localStorage on initialization
const storedUser = localStorage.getItem('currentUser');
if (storedUser) {
  try {
    initialState.currentUser = JSON.parse(storedUser);
    initialState.isAuthenticated = true;
  } catch (e) {
    console.error('Failed to parse stored user data:', e);
  }
}

// Async thunks
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: authService.LoginData, { rejectWithValue }) => {
    try {
      // Get tokens from login
      const response = await authService.login(credentials);
      // Store tokens in localStorage immediately
      localStorage.setItem('currentUser', JSON.stringify({ access: response.access, refresh: response.refresh }));
      // Fetch user profile (now Authorization header will be set)
      const user = await userService.getCurrentUser();
      // Store tokens with user
      const userData = { ...user, access: response.access, refresh: response.refresh };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return userData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (userData: authService.RegisterData, { rejectWithValue }) => {
    try {
      // Get tokens from register
      const response = await authService.register(userData);
      // Store tokens in localStorage immediately
      localStorage.setItem('currentUser', JSON.stringify({ access: response.access, refresh: response.refresh }));
      // Fetch user profile
      const user = await userService.getCurrentUser();
      // Store tokens with user
      const newUserData = { ...user, access: response.access, refresh: response.refresh };
      localStorage.setItem('currentUser', JSON.stringify(newUserData));
      return newUserData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      
      // If user is not authenticated, reject
      if (!state.user.isAuthenticated) {
        return rejectWithValue('User not authenticated');
      }
      
      // Fetch current user data from API
      const user = await userService.getCurrentUser();
      
      // Preserve tokens
      if (state.user.currentUser?.access && state.user.currentUser?.refresh) {
        return { ...user, access: state.user.currentUser.access, refresh: state.user.currentUser.refresh };
      }
      
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user data');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: userService.UserUpdateData, { rejectWithValue, getState }) => {
    try {
      const updatedUser = await userService.updateUser(data);
      
      // Get the current state
      const state = getState() as RootState;
      
      // Combine existing user data with the updated data
      const combinedUserData = {
        ...state.user.currentUser,
        ...updatedUser,
      };
      
      // Keep tokens when updating localStorage
      if (state.user.currentUser?.access && state.user.currentUser?.refresh) {
        combinedUserData.access = state.user.currentUser.access;
        combinedUserData.refresh = state.user.currentUser.refresh;
      }
      
      // Update in localStorage
      localStorage.setItem('currentUser', JSON.stringify(combinedUserData));
      
      return combinedUserData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    logoutUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      localStorage.removeItem('currentUser');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch user cases
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        
        // Preserve tokens when updating user data
        if (state.currentUser?.access && state.currentUser?.refresh) {
          state.currentUser = { ...action.payload, access: state.currentUser.access, refresh: state.currentUser.refresh };
        } else {
          state.currentUser = action.payload;
        }
        
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update user cases
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, logoutUser } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.currentUser;
export const selectIsAuthenticated = (state: RootState) => state.user.isAuthenticated;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;

export default userSlice.reducer;
