import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice.js';
import appointments from './appointmentSlice.js';
import staff from './staffSlice.js';
import ui from './uiSlice.js';

export const store = configureStore({
  reducer: { auth, appointments, staff, ui },
});