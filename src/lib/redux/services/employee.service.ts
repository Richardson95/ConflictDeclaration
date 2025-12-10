import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

import { baseUrl } from '../baseUrl';
import type { RootState } from '../store';
import type { IEmployee, IEmployeeFilters } from '@/lib/interfaces/employee.interfaces';
import type { IDepartment } from './department.service';

// User interface for admin management
export interface IUser {
  id: string;
  department: IDepartment;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
  status: number;
}

// Create user request
export interface ICreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  role?: number;
}

// Update user request
export interface IUpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: string;
  role?: number;
}

export const employeeApi = createApi({
  reducerPath: 'employeeApi',
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
  tagTypes: ['Employees', 'EmployeeDeclarations', 'Users'],
  endpoints: (builder) => ({
    // ==================== Existing Employee Endpoints ====================
    // Get all employees with optional filters
    getEmployees: builder.query<
      { data: IEmployee[]; total: number; page: number; limit: number },
      { filters?: IEmployeeFilters; page?: number; limit?: number; year?: number }
    >({
      query: ({ filters, page = 1, limit = 10, year }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (year) params.append('year', year.toString());
        if (filters?.status) params.append('status', filters.status);
        if (filters?.department) params.append('department', filters.department);
        if (filters?.searchTerm) params.append('search', filters.searchTerm);

        return `employees?${params.toString()}`;
      },
      providesTags: ['Employees'],
    }),

    // Get single employee by ID
    getEmployeeById: builder.query<{ data: IEmployee }, string>({
      query: (id) => `employees/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Employees', id }],
    }),

    // Get employee declarations
    getEmployeeDeclarations: builder.query<
      { data: any[]; total: number },
      { employeeId: string; year?: number }
    >({
      query: ({ employeeId, year }) => {
        const params = new URLSearchParams();
        if (year) params.append('year', year.toString());
        return `employees/${employeeId}/declarations?${params.toString()}`;
      },
      providesTags: (_result, _error, { employeeId }) => [
        { type: 'EmployeeDeclarations', id: employeeId },
      ],
    }),

    // Send notification to employee
    sendEmployeeNotification: builder.mutation<
      { message: string; success: boolean },
      { employeeId: string; message?: string }
    >({
      query: (body) => ({
        url: `employees/notify`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Employees'],
    }),

    // Download employee report
    downloadEmployeeReport: builder.mutation<
      Blob,
      { year: number; filters?: IEmployeeFilters }
    >({
      query: ({ year, filters }) => {
        const params = new URLSearchParams({ year: year.toString() });
        if (filters?.status) params.append('status', filters.status);
        if (filters?.department) params.append('department', filters.department);

        return {
          url: `employees/report?${params.toString()}`,
          method: 'GET',
          responseHandler: (response) => response.blob(),
        };
      },
    }),

    // Get employee statistics
    getEmployeeStats: builder.query<
      { total: number; completed: number; pending: number },
      { year: number }
    >({
      query: ({ year }) => `employees/stats?year=${year}`,
      providesTags: ['Employees'],
    }),

    // ==================== New User Management Endpoints ====================
    // Get all users (paginated)
    getUsers: builder.query<
      {
        data: {
          currentPage: number;
          pageSize: number;
          totalRecords: number;
          totalPages: number;
          result: IUser[];
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
        return `Users?${params.toString()}`;
      },
      providesTags: ['Users'],
    }),

    // Get user by ID
    getUserById: builder.query<
      {
        data: IUser;
        message: string;
        success: boolean;
      },
      string
    >({
      query: (id) => `Users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),

    // Create user
    createUser: builder.mutation<
      {
        data: IUser;
        message: string;
        success: boolean;
      },
      ICreateUserRequest
    >({
      query: (body) => ({
        url: 'Users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users', 'Employees'],
    }),

    // Update user
    updateUser: builder.mutation<
      {
        data: IUser;
        message: string;
        success: boolean;
      },
      { id: string; data: IUpdateUserRequest }
    >({
      query: ({ id, data }) => ({
        url: `Users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Users', id },
        'Users',
        'Employees',
      ],
    }),

    // Delete user
    deleteUser: builder.mutation<
      {
        data: boolean;
        message: string;
        success: boolean;
      },
      string
    >({
      query: (id) => ({
        url: `Users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users', 'Employees'],
    }),

    // Activate user
    activateUser: builder.mutation<
      {
        data: boolean;
        message: string;
        success: boolean;
      },
      string
    >({
      query: (id) => ({
        url: `Users/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Users', id },
        'Users',
        'Employees',
      ],
    }),

    // Deactivate user
    deactivateUser: builder.mutation<
      {
        data: boolean;
        message: string;
        success: boolean;
      },
      string
    >({
      query: (id) => ({
        url: `Users/${id}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Users', id },
        'Users',
        'Employees',
      ],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useGetEmployeeDeclarationsQuery,
  useSendEmployeeNotificationMutation,
  useDownloadEmployeeReportMutation,
  useGetEmployeeStatsQuery,
  // User management hooks
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} = employeeApi;
