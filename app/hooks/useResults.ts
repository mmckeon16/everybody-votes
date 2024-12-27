import { useQuery } from '@tanstack/react-query';
import { resultsApi } from '../lib/api/results';

export function useResults(questionId: string, demographicsFilter: object) {
  return useQuery({
    queryKey: ['results', questionId],
    queryFn: () =>
      resultsApi.getResultsForQuestion(questionId, demographicsFilter),
  });
}
