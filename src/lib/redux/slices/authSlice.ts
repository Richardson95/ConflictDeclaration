import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

type AuthState = {
  userInfo: any | null;
  token: string | null;
};

const initialState: AuthState = {
  userInfo: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      { payload: { data, token } }: PayloadAction<{ data: any; token: any }>
    ) => {
      state.token = token;
      state.userInfo = data;
    },

    setUser: (state, { payload }: PayloadAction<any>) => {
      state.userInfo = payload;
    },

    updateUser: (state, { payload }: PayloadAction<any>) => {
      state.userInfo = { ...state.userInfo, ...payload };
    },

    logOut: (state) => {
      state.userInfo = null;
      localStorage.removeItem('persist:root');
      Cookies.remove('token');
      // Use setTimeout to avoid React state update errors
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 0);
      return initialState;
    },
  },
});

export const { setCredentials, logOut, setUser, updateUser } =
  authSlice.actions;

export default authSlice.reducer;
