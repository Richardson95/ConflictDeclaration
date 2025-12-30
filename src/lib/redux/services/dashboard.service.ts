import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

import { baseUrl } from '../baseUrl';
import type { RootState } from '../store';

// Dashboard conflict metrics response
export interface IDashboardConflictMetrics {
  totalEmployeeCount: number;
  totalUsersThatHaveCompletedConflictDeclaration: number;
  totalUsersThatHaveNotCompletedConflictDeclaration: number;
  totalNumberOfCounterParties: number;
  totalNumberOfConflicts: number;
  totalNumberOfConflictedCounterParties: number;
}

// User declaration status response (single user)
export interface IUserDeclarationStatus {
  hasSubmittedThisYear: boolean;
  year: number;
  lastSubmissionDate?: string;
  declarationId?: string;
}

// Counterparty conflict summary item
export interface ICounterpartyConflictSummary {
  serialNumber: number;
  id: string;
  counterparty: string;
  sector: string;
  numberOfConflictsDeclared: number;
  conflictDeclarantNames: string[];
}

// User declaration status item (list)
export interface IUserDeclarationStatusItem {
  serialNumber: number;
  id: string;
  fullName: string;
  department: string;
  statusOfDeclaration: string;
  completedDate: string;
}

// Declaration completion percentage
export interface IDeclarationCompletionPercentage {
  totalUsers: number;
  completedCount: number;
  pendingCount: number;
  completedPercentage: number;
  pendingPercentage: number;
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}`,
    prepareHeaders: (headers, { getState }) => {
      // Try to get token from Redux state first, then from cookies
      const { token: stateToken } = (getState() as RootState).auth;
      const cookieToken = Cookies.get('token');
      const token = stateToken || cookieToken;

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['DashboardMetrics', 'UserDeclarationStatus'],
  endpoints: (builder) => ({
    // Get conflict metrics for dashboard
    getConflictMetrics: builder.query<
      { data: IDashboardConflictMetrics; message: string; success: boolean },
      { year: number }
    >({
      query: ({ year }) => `Dashboard/conflict-metrics?year=${year}`,
      providesTags: ['DashboardMetrics'],
    }),

    // Get user's declaration status
    // Note: Using the admin endpoint to get all declarations and filtering by current user
    // This is a workaround since there's no dedicated single-user status endpoint
    getUserDeclarationStatus: builder.query<
      { data: IUserDeclarationStatus; message: string; success: boolean },
      void
    >({
      query: () => {
        const currentYear = new Date().getFullYear();
        return `Declarations?CurrentPage=1&PageSize=1&year=${currentYear}`;
      },
      providesTags: ['UserDeclarationStatus'],
      transformResponse: (response: {
        data: {
          result: Array<{
            id: string;
            year: number;
            submittedAt: string;
          }>
        };
        success: boolean;
        message: string;
      }) => {
        // Check if user has any declarations for the current year in the result
        const hasSubmittedThisYear = response.data?.result && response.data.result.length > 0;
        const latestDeclaration = hasSubmittedThisYear ? response.data.result[0] : null;

        return {
          data: {
            hasSubmittedThisYear,
            year: new Date().getFullYear(),
            lastSubmissionDate: latestDeclaration?.submittedAt,
            declarationId: latestDeclaration?.id,
          },
          message: response.message || 'User declaration status retrieved successfully',
          success: true,
        };
      },
    }),

    // Notify user (admin feature)
    notifyUser: builder.mutation<
      { data: any; message: string; success: boolean },
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `Dashboard/notify-user/${userId}`,
        method: 'POST',
      }),
    }),

    // Get counterparty conflict summary (paginated)
    getCounterpartyConflictSummary: builder.query<
      {
        data: {
          currentPage: number;
          pageSize: number;
          totalRecords: number;
          totalPages: number;
          result: ICounterpartyConflictSummary[];
        };
        message: string;
        success: boolean;
      },
      { page?: number; limit?: number; year?: number }
    >({
      query: ({ page = 1, limit = 10, year }) => {
        const params = new URLSearchParams({
          CurrentPage: page.toString(),
          PageSize: limit.toString(),
        });
        if (year) {
          params.append('year', year.toString());
        }
        return `Dashboard/counterparty-conflict-summary?${params.toString()}`;
      },
      providesTags: ['DashboardMetrics'],
    }),

    // Get all users' declaration status (paginated list)
    getAllUsersDeclarationStatus: builder.query<
      {
        data: {
          currentPage: number;
          pageSize: number;
          totalRecords: number;
          totalPages: number;
          result: IUserDeclarationStatusItem[];
        };
        message: string;
        success: boolean;
      },
      { page?: number; limit?: number; year?: number }
    >({
      query: ({ page = 1, limit = 10, year }) => {
        const params = new URLSearchParams({
          CurrentPage: page.toString(),
          PageSize: limit.toString(),
        });
        if (year) {
          params.append('year', year.toString());
        }
        return `Dashboard/user-declaration-status?${params.toString()}`;
      },
      providesTags: ['UserDeclarationStatus'],
    }),

    // Get declaration completion percentage
    getDeclarationCompletionPercentage: builder.query<
      {
        data: IDeclarationCompletionPercentage;
        message: string;
        success: boolean;
      },
      void
    >({
      query: () => 'Dashboard/declaration-completion-percentage',
      providesTags: ['DashboardMetrics'],
    }),

    // Download user declaration status report
    downloadUserDeclarationStatus: builder.mutation<
      Blob,
      { format: 'csv' | 'excel' }
    >({
      query: ({ format }) => ({
        url: `Dashboard/download-user-declaration-status?format=${format}`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Download counterparty conflict summary report
    downloadCounterpartyConflictSummary: builder.mutation<
      Blob,
      { format: 'csv' | 'excel'; year?: number }
    >({
      query: ({ format, year }) => {
        const params = new URLSearchParams({
          format,
        });
        if (year) {
          params.append('year', year.toString());
        }
        return {
          url: `Dashboard/download-counterparty-conflict-summary?${params.toString()}`,
          method: 'GET',
          responseHandler: (response) => response.blob(),
        };
      },
    }),
  }),
});

export const {
  useGetConflictMetricsQuery,
  useGetUserDeclarationStatusQuery,
  useNotifyUserMutation,
  useGetCounterpartyConflictSummaryQuery,
  useGetAllUsersDeclarationStatusQuery,
  useGetDeclarationCompletionPercentageQuery,
  useDownloadUserDeclarationStatusMutation,
  useDownloadCounterpartyConflictSummaryMutation,
} = dashboardApi;
