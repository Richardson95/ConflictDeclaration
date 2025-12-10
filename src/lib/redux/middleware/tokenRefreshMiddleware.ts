import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit';
import type { MiddlewareAPI } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { baseUrl } from '../baseUrl';

interface RejectedAction {
  type: string;
  payload?: {
    status?: number;
    [key: string]: any;
  };
  error?: any;
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

export const tokenRefreshMiddleware: Middleware = (_api: MiddlewareAPI) => (next) => (action) => {
  // Always pass the action through first
  const result = next(action);

  // Check if this is a rejected action with a 401 status
  const rejectedAction = action as RejectedAction;
  if (isRejectedWithValue(action) && rejectedAction.payload?.status === 401) {
    const refreshToken = Cookies.get('refreshToken');

    if (!refreshToken) {
      // No refresh token available, log warning but don't redirect here
      // Let the authErrorMiddleware handle the redirect
      console.warn('No refresh token available for silent refresh');
      return result;
    }

    // Don't block the middleware chain - handle refresh asynchronously
    if (!isRefreshing) {
      isRefreshing = true;

      // Perform token refresh asynchronously
      fetch(`${baseUrl}Auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Token refresh failed');
          }
          return response.json();
        })
        .then((data) => {
          if (data.success && data.data) {
            // Store new tokens
            Cookies.set('token', data.data.accessToken, { expires: 7 });
            Cookies.set('refreshToken', data.data.refreshToken, { expires: 7 });
            console.log('Token refreshed successfully');
            processQueue();
          } else {
            throw new Error('Invalid refresh token response');
          }
        })
        .catch((error) => {
          console.error('Token refresh error:', error);
          processQueue(error);
          // Clear tokens on failure
          Cookies.remove('token');
          Cookies.remove('refreshToken');
        })
        .finally(() => {
          isRefreshing = false;
        });
    }
  }

  return result;
};
