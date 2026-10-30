import { apiRequest } from './request';

export const resultsApi = {
  getResultsForQuestion: async (questionId: string, demographicFilters?: object, userId?: string) => {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    for (const [key, value] of Object.entries(demographicFilters ?? {})) {
      if (value !== undefined && value !== null) {
        for (const entry of Array.isArray(value) ? value : [value]) params.append(key, String(entry));
      }
    }
    const data = await apiRequest(`result-data/${encodeURIComponent(questionId)}?${params}`);
    return { data };
  },
};
export default resultsApi;
