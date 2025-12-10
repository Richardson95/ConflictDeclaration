import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { MiddlewareAPI, Middleware } from '@reduxjs/toolkit';
import { logOut } from '../slices/authSlice';
import { toaster } from '@/components/ui';

/**
 * Auth Error Middleware - Handles 401 errors globally
 * When any API call returns 401 Unauthorized, this middleware:
 * 1. Logs the user out
 * 2. Clears auth state and cookies
 * 3. Shows an error message
 * 4. Redirects to login
 */
export const authErrorMiddleware: Middleware =
  (api: MiddlewareAPI) => (next) => (action: any) => {
    // Check if this is a rejected action with a 401 status
    if (isRejectedWithValue(action)) {
      const status = action.payload?.status;

      if (status === 401) {
        // Show error message
        toaster.error({
          title: 'Session Expired',
          description: 'Your session has expired. Please login again.',
          closable: true,
        });

        // Dispatch logout action
        api.dispatch(logOut());
      }
    }

    return next(action);
  };
