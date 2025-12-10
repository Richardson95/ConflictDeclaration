import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

import { baseUrl } from '../baseUrl';
import type { RootState } from '../store';

// SubSector interface
export interface ISubSector {
  name: string;
  description: string;
  id: string;
  sectorId: string;
  sector?: ISector | string;
}

// Sector interface
export interface ISector {
  id: string;
  name: string;
  description: string;
  counterpartyCount: number;
  isActive: boolean;
  createdAt: string;
  subSectors?: ISubSector[];
}

// Create sector request
export interface ICreateSectorRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

// Update sector request
export interface IUpdateSectorRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export const sectorApi = createApi({
  reducerPath: 'sectorApi',
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
  tagTypes: ['Sectors'],
  endpoints: (builder) => ({
    // Get all sectors (paginated)
    getSectors: builder.query<
      {
        data: {
          currentPage: number;
          pageSize: number;
          totalRecords: number;
          totalPages: number;
          result: ISector[];
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
        return `Sectors?${params.toString()}`;
      },
      providesTags: ['Sectors'],
    }),

    // Get active sectors only (paginated)
    getActiveSectors: builder.query<
      {
        data: {
          currentPage: number;
          pageSize: number;
          totalRecords: number;
          totalPages: number;
          result: ISector[];
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
        return `Sectors/active?${params.toString()}`;
      },
      providesTags: ['Sectors'],
    }),

    // Get sector by ID
    getSectorById: builder.query<
      {
        data: ISector;
        message: string;
        success: boolean;
      },
      string
    >({
      query: (id) => `Sectors/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Sectors', id }],
    }),

    // Create sector
    createSector: builder.mutation<
      {
        data: ISector;
        message: string;
        success: boolean;
      },
      ICreateSectorRequest
    >({
      query: (body) => ({
        url: 'Sectors',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Sectors'],
    }),

    // Update sector
    updateSector: builder.mutation<
      {
        data: ISector;
        message: string;
        success: boolean;
      },
      { id: string; data: IUpdateSectorRequest }
    >({
      query: ({ id, data }) => ({
        url: `Sectors/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Sectors', id },
        'Sectors',
      ],
    }),

    // Delete sector
    deleteSector: builder.mutation<
      {
        data: boolean;
        message: string;
        success: boolean;
      },
      string
    >({
      query: (id) => ({
        url: `Sectors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sectors'],
    }),
  }),
});

export const {
  useGetSectorsQuery,
  useGetActiveSectorsQuery,
  useGetSectorByIdQuery,
  useCreateSectorMutation,
  useUpdateSectorMutation,
  useDeleteSectorMutation,
} = sectorApi;
