import { useQuery } from '@tanstack/react-query';
import { resultsApi } from '../lib/api/results';

export function useResults(questionId: string, demographicsFilter?: object) {
  const queryKey = demographicsFilter
    ? ['results', questionId, 'filtered', JSON.stringify(demographicsFilter)]
    : ['results', questionId, 'unfiltered'];

  return useQuery({
    queryKey,
    enabled: !!questionId,
    queryFn: () =>
      resultsApi.getResultsForQuestion(questionId, demographicsFilter),
  });
}

export default useResults;
