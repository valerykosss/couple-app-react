import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type AuthState = {
    email: null | string,
    token: null | string,
    id: null | string
}

const initialState: AuthState = {
    email: null,
    token: null,
    id: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
      initUser(state, action: PayloadAction<AuthState>) {
        state.email = action.payload.email;
        state.token = action.payload.token;
        state.id = action.payload.id;
      },
      removeUser(state) {
        state.email = null;
        state.token = null;
        state.id = null;
      }
    },
  })

  export default authSlice;