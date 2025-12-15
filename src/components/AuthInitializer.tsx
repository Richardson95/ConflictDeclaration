'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { setCredentials, logOut } from '@/lib/redux/slices/authSlice';
import { authApi } from '@/lib/redux/services/auth.service';

/**
 * AuthInitializer - Restores authentication state from cookies on app load
 * This component runs once when the app initializes and checks if there's a token
 * in cookies. If found and Redux state is empty, it validates the user is profiled
 * before restoring the token to Redux.
 */
export const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { token: reduxToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const validateAndRestoreToken = async () => {
      // Only initialize if Redux doesn't already have a token
      if (!reduxToken) {
        const cookieToken = Cookies.get('token');

        if (cookieToken) {
          // Token exists in cookie - validate user is profiled before restoring
          try {
            // Temporarily restore token to make the API call
            dispatch(setCredentials({
              data: null,
              token: cookieToken
            }));

            // Validate user profile exists
            const result = await dispatch(
              authApi.endpoints.getCurrentUser.initiate()
            ).unwrap();

            if (result.success && result.data) {
              // User is profiled, keep the token
            } else {
              // User not profiled, remove token
              Cookies.remove('token');
              dispatch(logOut());
            }
          } catch (error) {
            // User validation failed, remove invalid token
            Cookies.remove('token');
            dispatch(logOut());
          }
        }
      }
    };

    validateAndRestoreToken();
  }, [dispatch, reduxToken]);

  return <>{children}</>;
};
