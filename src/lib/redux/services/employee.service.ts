import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { baseUrl } from '../baseUrl';
import type { RootState } from '../store';
import type { IEmployee, IEmployeeFilters } from '@/lib/interfaces/employee.interfaces';

export const employeeApi = createApi({
  reducerPath: 'employeeApi',
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
  tagTypes: ['Employees', 'EmployeeDeclarations'],
  endpoints: (builder) => ({
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
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useGetEmployeeDeclarationsQuery,
  useSendEmployeeNotificationMutation,
  useDownloadEmployeeReportMutation,
  useGetEmployeeStatsQuery,
} = employeeApi;
