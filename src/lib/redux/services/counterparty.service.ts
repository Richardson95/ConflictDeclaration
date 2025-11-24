import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { baseUrl } from '../baseUrl';
import type { RootState } from '../store';
import type {
  ICounterparty,
  ICounterpartyFilters,
  IConflictCheckRequest,
  IConflictCheckResponse,
} from '@/lib/interfaces/counterparty.interfaces';

export const counterpartyApi = createApi({
  reducerPath: 'counterpartyApi',
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
  tagTypes: ['Counterparties', 'ConflictChecks'],
  endpoints: (builder) => ({
    // Get all counterparties with filters
    getCounterparties: builder.query<
      { data: ICounterparty[]; total: number; page: number; limit: number },
      {
        filters?: ICounterpartyFilters;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ filters, page = 1, limit = 10 }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (filters?.year) params.append('year', filters.year.toString());
        if (filters?.sector) params.append('sector', filters.sector);
        if (filters?.hasConflict !== undefined)
          params.append('hasConflict', filters.hasConflict.toString());
        if (filters?.searchTerm) params.append('search', filters.searchTerm);

        return `counterparties?${params.toString()}`;
      },
      providesTags: ['Counterparties'],
    }),

    // Get single counterparty by ID
    getCounterpartyById: builder.query<{ data: ICounterparty }, string>({
      query: (id) => `counterparties/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Counterparties', id }],
    }),

    // Check conflict for a counterparty
    checkConflict: builder.mutation<
      { data: IConflictCheckResponse },
      IConflictCheckRequest
    >({
      query: (body) => ({
        url: 'counterparties/check-conflict',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ConflictChecks', 'Counterparties'],
    }),

    // Get conflict check history
    getConflictCheckHistory: builder.query<
      { data: IConflictCheckResponse[]; total: number },
      { year?: number; page?: number; limit?: number }
    >({
      query: ({ year, page = 1, limit = 10 }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (year) params.append('year', year.toString());

        return `counterparties/conflict-checks?${params.toString()}`;
      },
      providesTags: ['ConflictChecks'],
    }),

    // Create a new counterparty (admin)
    createCounterparty: builder.mutation<
      { data: ICounterparty; message: string },
      { name: string; sector: string }
    >({
      query: (body) => ({
        url: 'counterparties',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Counterparties'],
    }),

    // Update counterparty
    updateCounterparty: builder.mutation<
      { data: ICounterparty; message: string },
      { id: string; data: Partial<{ name: string; sector: string }> }
    >({
      query: ({ id, data }) => ({
        url: `counterparties/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Counterparties', id },
        'Counterparties',
      ],
    }),

    // Delete counterparty
    deleteCounterparty: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `counterparties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Counterparties'],
    }),

    // Get all available sectors
    getCounterpartySectors: builder.query<{ data: string[] }, void>({
      query: () => 'counterparties/sectors',
    }),

    // Get counterparty statistics
    getCounterpartyStats: builder.query<
      {
        total: number;
        withConflicts: number;
        withoutConflicts: number;
        bySector: Record<string, number>;
      },
      { year: number }
    >({
      query: ({ year }) => `counterparties/stats?year=${year}`,
      providesTags: ['Counterparties'],
    }),
  }),
});

export const {
  useGetCounterpartiesQuery,
  useGetCounterpartyByIdQuery,
  useCheckConflictMutation,
  useGetConflictCheckHistoryQuery,
  useCreateCounterpartyMutation,
  useUpdateCounterpartyMutation,
  useDeleteCounterpartyMutation,
  useGetCounterpartySectorsQuery,
  useGetCounterpartyStatsQuery,
} = counterpartyApi;
