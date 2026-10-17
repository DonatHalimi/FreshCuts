import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'ui',
  initialState: { sidebarOpen: false },
  reducers: {
    setSidebarOpen(s, a) {
      s.sidebarOpen = a.payload;
    },
    toggleSidebar(s) {
      s.sidebarOpen = !s.sidebarOpen;
    },
  },
});

export const { setSidebarOpen, toggleSidebar } = slice.actions;
export default slice.reducer;