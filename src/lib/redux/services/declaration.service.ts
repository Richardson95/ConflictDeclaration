import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

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
  tagTypes: ['Declarations', 'DeclarationHistory', 'Policy', 'UserDeclarationStatus', 'DashboardMetrics'],
  endpoints: (builder) => ({
    // Get all declarations (admin view)
    getDeclarations: builder.query<
      {
        data: {
          currentPage: number;
          pageSize: number;
          totalRecords: number;
          totalPages: number;
          result: Array<{
            id: string;
            userId: string;
            userName: string;
            userEmail: string;
            departmentName: string;
            year: number;
            submittedAt: string;
            status: number;
            statusName: string;
            totalCounterparties: number;
            conflictCount: number;
            asssessmentDtos: Array<{
              id: string;
              hasConflict: boolean;
              notes: string;
              declarationVersion: number;
              declaration: string;
              counterparty: string | { id: string; name: string; description: string; createdAt: string };
            }>;
            createdAt: string;
          }>;
        };
        message: string;
        success: boolean;
      },
      { page?: number; limit?: number; year?: number; status?: string }
    >({
      query: ({ page = 1, limit = 10, year, status }) => {
        const params = new URLSearchParams({
          CurrentPage: page.toString(),
          PageSize: limit.toString(),
        });

        if (year) params.append('year', year.toString());
        if (status) params.append('status', status);

        return `Declarations?${params.toString()}`;
      },
      providesTags: ['Declarations'],
    }),

    // Get declaration by ID
    getDeclarationById: builder.query<
      {
        data: {
          id: string;
          userId: string;
          userName: string;
          userEmail: string;
          departmentName: string;
          year: number;
          submittedAt: string;
          status: number;
          statusName: string;
          totalCounterparties: number;
          conflictCount: number;
          asssessmentDtos: Array<{
            id: string;
            hasConflict: boolean;
            notes: string;
            declarationVersion: number;
            declaration: string;
            counterparty: string | { id: string; name: string; description: string; createdAt: string };
          }>;
          createdAt: string;
        };
        message: string;
        success: boolean;
      },
      string
    >({
      query: (id) => `Declarations/${id}`,
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

    // Get user's declaration history with counterparties
    getDeclarationHistoryWithCounterparties: builder.query<
      {
        data: {
          currentPage: number;
          pageSize: number;
          totalRecords: number;
          totalPages: number;
          result: Array<{
            serialNumber: number;
            declarationId: string;
            userId: string;
            userFullName: string;
            year: number;
            submittedAt: string;
            counterparties: Array<{
              serialNumber: number;
              counterparty: string | { id: string; name: string; description: string; createdAt: string };
              sector: string;
              hasConflict: boolean;
            }>;
          }>;
        };
        message: string;
        success: boolean;
      },
      { userId: string; page?: number; pageSize?: number }
    >({
      query: ({ userId, page = 1, pageSize = 10 }) => {
        const params = new URLSearchParams({
          userId,
          CurrentPage: page.toString(),
          PageSize: pageSize.toString(),
        });
        return `Declarations/history-with-counterparties?${params.toString()}`;
      },
      providesTags: ['DeclarationHistory'],
    }),

    // Get list of declarants (people who have submitted declarations)
    getDeclarants: builder.query<
      {
        data: {
          currentPage: number;
          pageSize: number;
          totalRecords: number;
          totalPages: number;
          result: Array<{
            serialNumber: number;
            fullName: string;
            department: string;
            date: string;
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
        return `Declarations/declarants?${params.toString()}`;
      },
      providesTags: ['Declarations'],
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
      {
        data: {
          id: string;
          userId: string;
          userName: string;
          userEmail: string;
          departmentName: string;
          year: number;
          submittedAt: string;
          status: number;
          statusName: string;
          totalCounterparties: number;
          conflictCount: number;
          asssessmentDtos: Array<{
            id: string;
            hasConflict: boolean;
            notes: string;
            declarationVersion: number;
            declaration: string;
            counterparty: string | { id: string; name: string; description: string; createdAt: string };
          }>;
          createdAt: string;
        };
        message: string;
        success: boolean;
      },
      IDeclarationFormData
    >({
      query: (body) => ({
        url: 'Declarations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Declarations', 'DeclarationHistory', 'UserDeclarationStatus', 'DashboardMetrics'],
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
        'UserDeclarationStatus',
        'DashboardMetrics',
      ],
    }),

    // Delete a declaration
    deleteDeclaration: builder.mutation<
      { data: string; message: string; success: boolean },
      string
    >({
      query: (id) => ({
        url: `Declarations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Declarations', 'DeclarationHistory', 'UserDeclarationStatus', 'DashboardMetrics'],
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

    // Notify compliance department
    notifyCompliance: builder.mutation<
      { data: any; message: string; success: boolean },
      { declarationId: string }
    >({
      query: ({ declarationId }) => ({
        url: `Declarations/notify-compliance/${declarationId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { declarationId }) => [
        { type: 'Declarations', id: declarationId },
      ],
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
  useGetDeclarationHistoryWithCounterpartiesQuery,
  useGetDeclarantsQuery,
  useGetCurrentDeclarationQuery,
  useSubmitDeclarationMutation,
  useUpdateDeclarationMutation,
  useDeleteDeclarationMutation,
  useGetPolicyDocumentQuery,
  useGetDeclarationCompaniesQuery,
  useDownloadDeclarationCertificateMutation,
  useNotifyComplianceMutation,
  useGetDeclarationStatsQuery,
} = declarationApi;
