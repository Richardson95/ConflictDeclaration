import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

import { baseUrl } from '../baseUrl';
import type { RootState } from '../store';

// Department interface
export interface IDepartment {
  name: string;
  description: string;
  id: string;
  code: string;
}

// Create department request
export interface ICreateDepartmentRequest {
  name: string;
  description?: string;
  code?: string;
}

// Update department request
export interface IUpdateDepartmentRequest {
  name?: string;
  description?: string;
  code?: string;
}

export const departmentApi = createApi({
  reducerPath: 'departmentApi',
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
  tagTypes: ['Departments'],
  endpoints: (builder) => ({
    // Get all departments (paginated)
    getDepartments: builder.query<
      {
        data: {
          currentPage: number;
          pageSize: number;
          totalRecords: number;
          totalPages: number;
          result: IDepartment[];
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
        return `Departments?${params.toString()}`;
      },
      providesTags: ['Departments'],
    }),

    // Get departments list (simple list without pagination)
    getDepartmentsList: builder.query<
      {
        data: IDepartment[];
        message: string;
        success: boolean;
      },
      void
    >({
      query: () => 'Departments/list',
      providesTags: ['Departments'],
    }),

    // Get department by ID
    getDepartmentById: builder.query<
      {
        data: IDepartment;
        message: string;
        success: boolean;
      },
      string
    >({
      query: (id) => `Departments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Departments', id }],
    }),

    // Create department
    createDepartment: builder.mutation<
      {
        data: IDepartment;
        message: string;
        success: boolean;
      },
      ICreateDepartmentRequest
    >({
      query: (body) => ({
        url: 'Departments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Departments'],
    }),

    // Update department
    updateDepartment: builder.mutation<
      {
        data: IDepartment;
        message: string;
        success: boolean;
      },
      { id: string; data: IUpdateDepartmentRequest }
    >({
      query: ({ id, data }) => ({
        url: `Departments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Departments', id },
        'Departments',
      ],
    }),

    // Delete department
    deleteDepartment: builder.mutation<
      {
        data: boolean;
        message: string;
        success: boolean;
      },
      string
    >({
      query: (id) => ({
        url: `Departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Departments'],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentsListQuery,
  useGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApi;
