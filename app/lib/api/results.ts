import { apiRequest } from './request';

export type DemographicFilters = Record<string, string[]>;

export interface PollResult {
  optionId: string;
  optionText: string;
  votes: number;
  percentage: number;
  responses: unknown[];
}

export interface StateVoteOption {
  text: string;
  votes: number;
}

export interface StateResult {
  state: string;
  totalVotes: number;
  [key: string]: StateVoteOption | string | number;
}

export interface ResultsData {
  question: { id: string; text: string };
  totalVotes: number;
  results: PollResult[];
  voteCounts: Record<string, number>;
  stateResults: StateResult[];
  user_vote: string | null;
  user_prediction: string | null;
}

export const resultsApi = {
  getResultsForQuestion: async (questionId: string, demographicFilters?: object, userId?: string) => {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    for (const [key, value] of Object.entries(demographicFilters ?? {})) {
      if (value !== undefined && value !== null) {
        for (const entry of Array.isArray(value) ? value : [value]) params.append(key, String(entry));
      }
    }
    const data: ResultsData = await apiRequest(`result-data/${encodeURIComponent(questionId)}?${params}`);
    return { data };
  },
};
export default resultsApi;
