import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { baseUrl } from '../baseUrl';
import type { RootState } from '../store';
import type {
  IDeclaration,
  IDeclarationFormData,
  IDeclarationHistory,
} from '@/lib/interfaces/declaration.interfaces';

export const declarationApi = createApi({
  reducerPath: 'declarationApi',
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
  tagTypes: ['Declarations', 'DeclarationHistory', 'Policy'],
  endpoints: (builder) => ({
    // Get all declarations (admin view)
    getDeclarations: builder.query<
      { data: IDeclaration[]; total: number; page: number; limit: number },
      { page?: number; limit?: number; year?: number; status?: string }
    >({
      query: ({ page = 1, limit = 10, year, status }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (year) params.append('year', year.toString());
        if (status) params.append('status', status);

        return `declarations?${params.toString()}`;
      },
      providesTags: ['Declarations'],
    }),

    // Get declaration by ID
    getDeclarationById: builder.query<{ data: IDeclaration }, string>({
      query: (id) => `declarations/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Declarations', id }],
    }),

    // Get user's declaration history
    getDeclarationHistory: builder.query<
      { data: IDeclarationHistory[] },
      { year?: number }
    >({
      query: ({ year }) => {
        const params = new URLSearchParams();
        if (year) params.append('year', year.toString());
        return `declarations/history?${params.toString()}`;
      },
      providesTags: ['DeclarationHistory'],
    }),

    // Get user's current year declaration
    getCurrentDeclaration: builder.query<
      { data: IDeclaration | null },
      { year: number }
    >({
      query: ({ year }) => `declarations/current?year=${year}`,
      providesTags: ['Declarations'],
    }),

    // Submit/Create a new declaration
    submitDeclaration: builder.mutation<
      { data: IDeclaration; message: string },
      IDeclarationFormData
    >({
      query: (body) => ({
        url: 'declarations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Declarations', 'DeclarationHistory'],
    }),

    // Update an existing declaration
    updateDeclaration: builder.mutation<
      { data: IDeclaration; message: string },
      { id: string; data: Partial<IDeclarationFormData> }
    >({
      query: ({ id, data }) => ({
        url: `declarations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Declarations', id },
        'DeclarationHistory',
      ],
    }),

    // Delete a declaration
    deleteDeclaration: builder.mutation<
      { message: string },
      string
    >({
      query: (id) => ({
        url: `declarations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Declarations', 'DeclarationHistory'],
    }),

    // Get conflict policy document
    getPolicyDocument: builder.query<{ data: any }, void>({
      query: () => 'declarations/policy',
      providesTags: ['Policy'],
    }),

    // Get companies/counterparties list for declaration form
    getDeclarationCompanies: builder.query<
      { data: string[] },
      void
    >({
      query: () => 'declarations/companies',
    }),

    // Download declaration certificate
    downloadDeclarationCertificate: builder.mutation<
      Blob,
      { declarationId: string }
    >({
      query: ({ declarationId }) => ({
        url: `declarations/${declarationId}/certificate`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Get declaration statistics
    getDeclarationStats: builder.query<
      {
        total: number;
        completed: number;
        pending: number;
        withConflicts: number;
      },
      { year: number }
    >({
      query: ({ year }) => `declarations/stats?year=${year}`,
      providesTags: ['Declarations'],
    }),
  }),
});

export const {
  useGetDeclarationsQuery,
  useGetDeclarationByIdQuery,
  useGetDeclarationHistoryQuery,
  useGetCurrentDeclarationQuery,
  useSubmitDeclarationMutation,
  useUpdateDeclarationMutation,
  useDeleteDeclarationMutation,
  useGetPolicyDocumentQuery,
  useGetDeclarationCompaniesQuery,
  useDownloadDeclarationCertificateMutation,
  useGetDeclarationStatsQuery,
} = declarationApi;
