import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { Results } from '../../types';

const baseUrl =
  process.env.EXPO_PUBLIC_ENV === 'development'
    ? 'http://127.0.0.1:54321/functions/v1'
    : process.env.EXPO_PUBLIC_SUPABASE_URL + '/functions/v1';

export const resultsApi = createApi({
  reducerPath: 'resultsApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: headers => {
      headers.set(
        'Authorization',
        `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`
      );
      return headers;
    },
  }),
  tagTypes: ['Results'],
  endpoints: builder => ({
    // TODO fix type
    getResultsForQuestion: builder.query<any, { questionId: string }>({
      query: ({ questionId }) => `result-data/${questionId}`,
      providesTags: ['Results'],
    }),
  }),
});

export const { useGetResultsForQuestionQuery } = resultsApi;
