import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAppointments, getAppointment, createAppointment } from '../services/appointments.api.js';

export const fetchAppointments = createAsyncThunk(
  'appointments/list',
  async (params, { rejectWithValue }) => {
    try {
      return await getAppointments(params);
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const fetchAppointment = createAsyncThunk(
  'appointments/get',
  async (id, { rejectWithValue }) => {
    try {
      return await getAppointment(id);
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

const slice = createSlice({
  name: 'appointments',
  initialState: { items: [], selected: null, status: 'idle', error: null },
  reducers: {
    clearSelected(s) {
      s.selected = null;
    },
  },
  extraReducers: (b) =>
    b
      .addCase(fetchAppointments.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.items = a.payload;
      })
      .addCase(fetchAppointments.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload || a.error;
      })
      .addCase(fetchAppointment.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(fetchAppointment.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.selected = a.payload;
      })
      .addCase(fetchAppointment.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload || a.error;
      }),
});

export const { clearSelected } = slice.actions;
export default slice.reducer;