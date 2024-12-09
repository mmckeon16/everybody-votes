import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Question, Option, OptionResult } from '../../types';

const baseUrl =
  process.env.EXPO_PUBLIC_ENV === 'development'
    ? 'http://127.0.0.1:54321/functions/v1'
    : process.env.EXPO_PUBLIC_SUPABASE_URL + '/functions/v1';

console.log(baseUrl);
console.log("HEREEE")
export const questionsApi = createApi({
  reducerPath: 'questionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set(
        'Authorization',
        `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`
      );
      return headers;
    },
  }),
  tagTypes: ['Question', 'Vote'],
  endpoints: (builder) => ({
    getActiveQuestion: builder.query<Question, void>({
      query: () => 'active-question',
      providesTags: ['Question'],
      transformResponse: (response: any) => ({
        ...response,
        startDate: response.start_date,
        endDate: response.end_date,
        isActive: response.is_active,
      }),
    }),

    getQuestionResults: builder.query<Question, string>({
      query: (id) => `questions/${id}/results`,
      providesTags: (result, error, id) => [{ type: 'Question', id }],
    }),

    getQuestionHistory: builder.query<Question[], void>({
      query: () => 'questions/history',
      providesTags: ['Question'],
    }),

    submitVote: builder.mutation<
      void,
      { questionId: string; optionId: number }
    >({
      query: (body) => ({
        url: 'votes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Question', 'Vote'],
    }),
  }),
});

export const {
  useGetActiveQuestionQuery,
  useGetQuestionResultsQuery,
  useGetQuestionHistoryQuery,
  useSubmitVoteMutation,
} = questionsApi;
