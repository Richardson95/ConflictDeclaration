import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

import { baseUrl } from '../baseUrl';
import type { RootState } from '../store';

export interface IDepartment {
  name: string;
  description: string;
  id: string;
  code: string;
}

export interface ICurrentUser {
  id: string;
  department: IDepartment;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
  status: number;
  profileImageUrl?: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}`,
    prepareHeaders: (headers, { getState, endpoint }) => {
      // Try to get token from Redux state first, then from cookies
      const { token: stateToken } = (getState() as RootState).auth;
      const cookieToken = Cookies.get('token');
      const token = stateToken || cookieToken;

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      // Don't set Content-Type for uploadProfileImage - let browser handle it
      if (endpoint !== 'uploadProfileImage') {
        headers.set('Content-Type', 'application/json');
      }

      return headers;
    },
  }),
  tagTypes: ['Auth', 'CurrentUser'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: `admin/login`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Get current authenticated user
    getCurrentUser: builder.query<
      { data: ICurrentUser; message: string; success: boolean },
      void
    >({
      query: () => 'Users/me',
      providesTags: ['CurrentUser'],
    }),

    // Refresh Azure AD token
    refreshToken: builder.mutation<
      {
        data: {
          accessToken: string;
          refreshToken: string;
          expiresIn: string;
        };
        message: string;
        success: boolean;
      },
      { refreshToken: string }
    >({
      query: (body) => ({
        url: 'Auth/refresh-token',
        method: 'POST',
        body,
      }),
    }),

    // Upload profile image
    uploadProfileImage: builder.mutation<
      {
        data: {
          profileImageUrl: string;
        };
        message: string;
        success: boolean;
      },
      FormData
    >({
      query: (formData) => {
        return {
          url: 'Users/profile-image',
          method: 'POST',
          body: formData,
          // Don't set Content-Type - let browser set it with boundary for multipart/form-data
        };
      },
      invalidatesTags: ['CurrentUser'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useRefreshTokenMutation,
  useUploadProfileImageMutation,
} = authApi;
