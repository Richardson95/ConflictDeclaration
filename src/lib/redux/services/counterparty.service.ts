import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { baseUrl } from '../baseUrl';
import { acquireFreshToken } from '@/lib/utils/msalTokenHelper';
import type {
  ICounterparty,
  ICounterpartyFilters,
  IConflictCheckRequest,
  IConflictCheckResponse,
} from '@/lib/interfaces/counterparty.interfaces';

// Create a custom base query that acquires fresh token before each request
const baseQuery = fetchBaseQuery({
  baseUrl: `${baseUrl}`,
});

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Acquire fresh token from MSAL
  const token = await acquireFreshToken();

  // Modify headers to include the fresh token
  const argsWithAuth = typeof args === 'string'
    ? { url: args, headers: {} }
    : { ...args, headers: args.headers || {} };

  if (token) {
    (argsWithAuth.headers as Record<string, string>)['authorization'] = `Bearer ${token}`;
  }
  (argsWithAuth.headers as Record<string, string>)['Content-Type'] = 'application/json';

  return baseQuery(argsWithAuth, api, extraOptions);
};

export const counterpartyApi = createApi({
  reducerPath: 'counterpartyApi',
  baseQuery: baseQueryWithAuth,
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
          CurrentPage: page.toString(),
          PageSize: limit.toString(),
        });

        if (filters?.year) params.append('year', filters.year.toString());
        if (filters?.sector) params.append('sector', filters.sector);
        if (filters?.hasConflict !== undefined)
          params.append('hasConflict', filters.hasConflict.toString());
        if (filters?.searchTerm) params.append('search', filters.searchTerm);

        return `Counterparties?${params.toString()}`;
      },
      transformResponse: (response: any) => ({
        data: response.data.result,
        total: response.data.totalRecords,
        page: response.data.currentPage,
        limit: response.data.pageSize,
      }),
      providesTags: ['Counterparties'],
    }),

    // Get single counterparty by ID
    getCounterpartyById: builder.query<
      { data: ICounterparty; message: string; success: boolean },
      string
    >({
      query: (id) => `Counterparties/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Counterparties', id }],
    }),

    // Check conflict (general)
    checkConflictGeneral: builder.mutation<
      {
        data: {
          referenceNumber: string;
          hasConflict: boolean;
          message: string;
          checkedByFullName: string;
          checkedAt: string;
          counterparty: { id: string; name: string };
          user: { id: string; fullName: string; department: string };
        };
        message: string;
        success: boolean;
      },
      any
    >({
      query: (body) => ({
        url: 'ConflictChecks/check',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ConflictChecks', 'Counterparties'],
    }),

    // Check conflict for a counterparty
    checkConflict: builder.mutation<
      { data: IConflictCheckResponse; message: string; success: boolean },
      IConflictCheckRequest
    >({
      query: (body) => ({
        url: 'ConflictChecks/check-counterparty',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ConflictChecks', 'Counterparties'],
    }),

    // Get conflict check history
    getConflictCheckHistory: builder.query<
      { data: any; message: string; success: boolean },
      { year: number }
    >({
      query: ({ year }) => `ConflictChecks/history?year=${year}`,
      providesTags: ['ConflictChecks'],
    }),

    // Get detailed conflict check history
    getConflictCheckHistoryDetail: builder.query<
      {
        data: {
          currentPage: number;
          pageSize: number;
          totalRecords: number;
          totalPages: number;
          result: Array<{
            serialNumber: number;
            counterparty: string;
            sector: string;
            date: string;
            checkDetail: {
              hasConflict: boolean;
              message: string;
              checkedByFullName: string;
              checkedAt: string;
              counterparty: { id: string; name: string };
              user: { id: string; fullName: string; department: string };
            };
          }>;
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
        if (year) params.append('year', year.toString());
        return `ConflictChecks/history-detail?${params.toString()}`;
      },
      providesTags: ['ConflictChecks'],
    }),

    // Create a new counterparty (admin)
    createCounterparty: builder.mutation<
      { data: ICounterparty; message: string; success: boolean },
      { name: string; sectorId: string }
    >({
      query: (body) => ({
        url: 'Counterparties',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Counterparties'],
    }),

    // Update counterparty
    updateCounterparty: builder.mutation<
      { data: ICounterparty; message: string; success: boolean },
      { id: string; data: { name?: string; sectorId?: string } }
    >({
      query: ({ id, data }) => ({
        url: `Counterparties/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Counterparties', id },
        'Counterparties',
      ],
    }),

    // Delete counterparty
    deleteCounterparty: builder.mutation<
      { data: boolean; message: string; success: boolean },
      string
    >({
      query: (id) => ({
        url: `Counterparties/${id}`,
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

    // Notify compliance department for a conflict check
    notifyComplianceForConflictCheck: builder.mutation<
      { data: any; message: string; success: boolean },
      { declarationId: string }
    >({
      query: ({ declarationId }) => ({
        url: `Declarations/notify-compliance/${declarationId}`,
        method: 'POST',
      }),
      invalidatesTags: ['ConflictChecks'],
    }),
  }),
});

export const {
  useGetCounterpartiesQuery,
  useGetCounterpartyByIdQuery,
  useCheckConflictGeneralMutation,
  useCheckConflictMutation,
  useGetConflictCheckHistoryQuery,
  useGetConflictCheckHistoryDetailQuery,
  useCreateCounterpartyMutation,
  useUpdateCounterpartyMutation,
  useDeleteCounterpartyMutation,
  useGetCounterpartySectorsQuery,
  useGetCounterpartyStatsQuery,
  useNotifyComplianceForConflictCheckMutation,
} = counterpartyApi;
