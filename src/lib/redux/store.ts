import type { Action, ThunkAction } from '@reduxjs/toolkit';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';

import { authApi } from './services/auth.service';
import { employeeApi } from './services/employee.service';
import { declarationApi } from './services/declaration.service';
import { counterpartyApi } from './services/counterparty.service';
import { adminApi } from './services/admin.service';
import { dashboardApi } from './services/dashboard.service';
import { departmentApi } from './services/department.service';
import { sectorApi } from './services/sector.service';
import authReducer from './slices/authSlice';
import { authErrorMiddleware } from './middleware/authErrorMiddleware';
import { crossApiInvalidationMiddleware } from './middleware/crossApiInvalidation';
import { tokenRefreshMiddleware } from './middleware/tokenRefreshMiddleware';

const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [employeeApi.reducerPath]: employeeApi.reducer,
  [declarationApi.reducerPath]: declarationApi.reducer,
  [counterpartyApi.reducerPath]: counterpartyApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [departmentApi.reducerPath]: departmentApi.reducer,
  [sectorApi.reducerPath]: sectorApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      tokenRefreshMiddleware,
      authErrorMiddleware,
      crossApiInvalidationMiddleware,
      authApi.middleware,
      employeeApi.middleware,
      declarationApi.middleware,
      counterpartyApi.middleware,
      adminApi.middleware,
      dashboardApi.middleware,
      departmentApi.middleware,
      sectorApi.middleware,
    ]),
});

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
