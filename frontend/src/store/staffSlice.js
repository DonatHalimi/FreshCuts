import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getRoster, getStaffMe, updateAppointmentStatus } from '../services/staff.api.js';

export const fetchStaffMe = createAsyncThunk(
  'staff/me',
  async (_, { rejectWithValue }) => {
    try {
      return await getStaffMe();
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const fetchRoster = createAsyncThunk(
  'staff/roster',
  async (date, { rejectWithValue }) => {
    try {
      return await getRoster(date);
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const setStaffAppointmentStatus = createAsyncThunk(
  'staff/status',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return { id, result: await updateAppointmentStatus(id, status) };
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

const slice = createSlice({
  name: 'staff',
  initialState: { provider: null, roster: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) =>
    b
      .addCase(fetchStaffMe.fulfilled, (s, a) => {
        s.provider = a.payload;
      })
      .addCase(fetchRoster.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(fetchRoster.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.roster = a.payload;
      })
      .addCase(fetchRoster.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload || a.error;
      })
      .addCase(setStaffAppointmentStatus.fulfilled, (s, a) => {
        s.roster = s.roster.map((x) =>
          x.id === a.payload.id
            ? { ...x, status: a.payload.result?.status || a.meta?.arg?.status }
            : x
        );
      })
      .addCase(setStaffAppointmentStatus.rejected, (s, a) => {
        s.error = a.payload || a.error;
      }),
});

export default slice.reducer;