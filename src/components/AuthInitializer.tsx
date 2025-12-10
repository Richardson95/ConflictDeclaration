'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { setCredentials } from '@/lib/redux/slices/authSlice';

/**
 * AuthInitializer - Restores authentication state from cookies on app load
 * This component runs once when the app initializes and checks if there's a token
 * in cookies. If found and Redux state is empty, it restores the token to Redux.
 */
export const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { token: reduxToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Only initialize if Redux doesn't already have a token
    if (!reduxToken) {
      const cookieToken = Cookies.get('token');

      if (cookieToken) {
        // Token exists in cookie but not in Redux - restore it
        dispatch(setCredentials({
          data: null, // User info will be fetched separately
          token: cookieToken
        }));
        console.log('Auth token restored from cookies');
      }
    }
  }, [dispatch, reduxToken]);

  return <>{children}</>;
};
