import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
      const { token } = (getState() as RootState).auth;
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
        data: Array<{
          _id: string;
          action: string;
          performedBy: string;
          details: Record<string, any>;
          timestamp: string;
        }>;
        total: number;
      },
      { page?: number; limit?: number; startDate?: string; endDate?: string }
    >({
      query: ({ page = 1, limit = 10, startDate, endDate }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        return `admin/audit-logs?${params.toString()}`;
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
} = adminApi;
