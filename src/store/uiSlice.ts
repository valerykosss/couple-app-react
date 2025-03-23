import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UIState = {
  isAuthModalOpen: boolean;
  isLoggingOut: boolean;
};

const initialState: UIState = {
  isAuthModalOpen: false,
  isLoggingOut: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setAuthModalOpen(state, action: PayloadAction<boolean>) {
      state.isAuthModalOpen = action.payload;
    },
    setLoggingOut(state, action: PayloadAction<boolean>) {
      state.isLoggingOut = action.payload;
    },
  },
});

export default uiSlice;