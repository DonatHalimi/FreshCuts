import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as authApi from '../services/auth.api.js';

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    return await authApi.getMe();
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const result = await authApi.login(payload);
    return result.user;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.register(payload);
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await authApi.logout();
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.updateProfile(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const initialState = {
  user: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionExpired(state) {
      state.user = null;
      state.status = 'anonymous';
      state.error = { code: 'SESSION_EXPIRED', message: 'Your session has expired.' };
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.status = 'anonymous';
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'anonymous';
        state.error = action.payload ?? { message: 'Unable to sign in.' };
      })
      .addCase(register.fulfilled, (state, action) => {
        state.error = null;
        state.status = 'anonymous';
        state.user = null;
        state.registration = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload ?? { message: 'Unable to create account.' };
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'anonymous';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload ?? { message: 'Unable to update profile.' };
      });
  },
});

export const { sessionExpired, clearAuthError } = authSlice.actions;
export default authSlice.reducer;