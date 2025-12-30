import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

import { baseUrl } from '../baseUrl';
import type { RootState } from '../store';

export interface IAdminDashboardStats {
  totalEmployees: number;
  totalDeclarations: number;
  completedDeclarations: number;
  pendingDeclarations: number;
  totalCounterparties: number;
  conflictedCounterparties: number;
  complianceRate: number;
  recentActivity: IRecentActivity[];
}

export interface IRecentActivity {
  _id: string;
  type: 'declaration_submitted' | 'conflict_check' | 'notification_sent';
  description: string;
  timestamp: string;
  userName?: string;
}

export interface IAdminSettings {
  _id: string;
  declarationDeadline: string;
  reminderFrequency: number;
  autoNotifyPending: boolean;
  emailNotifications: boolean;
  updatedAt: string;
}

export interface IUpdateSettingsRequest {
  declarationDeadline?: string;
  reminderFrequency?: number;
  autoNotifyPending?: boolean;
  emailNotifications?: boolean;
}

export interface INotificationRequest {
  recipientType: 'all' | 'pending' | 'specific';
  employeeIds?: string[];
  message: string;
  subject: string;
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
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
  tagTypes: ['AdminDashboard', 'AdminSettings', 'AdminNotifications'],
  endpoints: (builder) => ({
    // Get admin dashboard statistics
    getDashboardStats: builder.query<
      { data: IAdminDashboardStats },
      { year: number }
    >({
      query: ({ year }) => `admin/dashboard/stats?year=${year}`,
      providesTags: ['AdminDashboard'],
    }),

    // Get admin settings
    getAdminSettings: builder.query<{ data: IAdminSettings }, void>({
      query: () => 'admin/settings',
      providesTags: ['AdminSettings'],
    }),

    // Update admin settings
    updateAdminSettings: builder.mutation<
      { data: IAdminSettings; message: string },
      IUpdateSettingsRequest
    >({
      query: (body) => ({
        url: 'admin/settings',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminSettings'],
    }),

    // Send bulk notifications
    sendBulkNotification: builder.mutation<
      { message: string; sentCount: number },
      INotificationRequest
    >({
      query: (body) => ({
        url: 'admin/notifications/send',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminNotifications'],
    }),

    // Get notification history
    getNotificationHistory: builder.query<
      {
        data: Array<{
          _id: string;
          subject: string;
          message: string;
          recipientCount: number;
          sentBy: string;
          sentAt: string;
        }>;
        total: number;
      },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        return `admin/notifications/history?${params.toString()}`;
      },
      providesTags: ['AdminNotifications'],
    }),

    // Download comprehensive report
    downloadComprehensiveReport: builder.mutation<
      Blob,
      { year: number; reportType: 'summary' | 'detailed' | 'compliance' }
    >({
      query: ({ year, reportType }) => ({
        url: `admin/reports/download?year=${year}&type=${reportType}`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Get audit logs
    getAuditLogs: builder.query<
      {
        data: {
          currentPage: number;
          pageSize: number;
          totalRecords: number;
          totalPages: number;
          result: Array<{
            id: string;
            action: string;
            resource: string;
            userId: string;
            userEmail: string;
            name: string;
            ipAddress: string;
            success: boolean;
            details: string;
            createdAt: string;
          }>;
        };
        message: string;
        success: boolean;
      },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => {
        const params = new URLSearchParams({
          CurrentPage: page.toString(),
          PageSize: limit.toString(),
        });
        return `auditlogs?${params.toString()}`;
      },
    }),

    // Get system health
    getSystemHealth: builder.query<
      {
        status: 'healthy' | 'warning' | 'critical';
        database: boolean;
        api: boolean;
        emailService: boolean;
        lastChecked: string;
      },
      void
    >({
      query: () => 'admin/system/health',
    }),

    // Get user activities
    getUserActivities: builder.query<
      {
        data: {
          currentPage: number;
          pageSize: number;
          totalRecords: number;
          totalPages: number;
          result: Array<{
            id: string;
            action: string;
            details: string;
            createdAt: string;
            initiator: string;
          }>;
        };
        message: string;
        success: boolean;
      },
      { page?: number; limit?: number; startDate?: string; endDate?: string }
    >({
      query: ({ page = 1, limit = 10, startDate, endDate }) => {
        const params = new URLSearchParams({
          CurrentPage: page.toString(),
          PageSize: limit.toString(),
        });
        if (startDate) params.append('StartDate', startDate);
        if (endDate) params.append('EndDate', endDate);
        return `useractivities?${params.toString()}`;
      },
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
  useSendBulkNotificationMutation,
  useGetNotificationHistoryQuery,
  useDownloadComprehensiveReportMutation,
  useGetAuditLogsQuery,
  useGetSystemHealthQuery,
  useGetUserActivitiesQuery,
} = adminApi;
