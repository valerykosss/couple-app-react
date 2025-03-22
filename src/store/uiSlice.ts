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
      console.log(`Setting isAuthModalOpen to: ${action.payload}`); // Логируем изменение состояния
      state.isAuthModalOpen = action.payload;
    },
    setLoggingOut(state, action: PayloadAction<boolean>) {
      console.log(`Setting isLoggingOut to: ${action.payload}`); // Логируем изменение состояния
      state.isLoggingOut = action.payload;
    },
  },
});

export default uiSlice;