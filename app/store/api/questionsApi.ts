import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Question, Option, OptionResult } from '../../types';

export const questionsApi = createApi({
  reducerPath: 'questionsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Question', 'Vote'],
  endpoints: (builder) => ({
    getActiveQuestion: builder.query<Question, void>({
      query: () => 'questions/active',
      providesTags: ['Question'],
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
