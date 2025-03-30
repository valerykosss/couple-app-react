import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type AuthState = {
    email: null | string,
    firebaseToken: null | string,
    id: null | string,
    accessToken: null | string;
    refreshToken: null | string;
    tokenExpiresIn: number | null;
}

const initialState: AuthState = {
    email: null,
    firebaseToken: null,
    id: null,
    accessToken: null,
    refreshToken: null,
    tokenExpiresIn: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
      initUser(state, action: PayloadAction<AuthState>) {
        state.email = action.payload.email;
        state.firebaseToken = action.payload.firebaseToken;
        state.id = action.payload.id;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.tokenExpiresIn = action.payload.tokenExpiresIn;
      },
      removeUser(state) {
        state.email = null;
        state.firebaseToken = null;
        state.id = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.tokenExpiresIn = null;
      }
    },
  })

  export default authSlice;