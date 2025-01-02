import { useQuery } from '@tanstack/react-query';
import { resultsApi } from '../lib/api/results';
import { useAuth } from '../context/AuthContext';

export function useResults(questionId: string, demographicsFilter?: object) {
  const queryKey = demographicsFilter
    ? ['results', questionId, 'filtered', JSON.stringify(demographicsFilter)]
    : ['results', questionId, 'unfiltered'];

  const { session, isLoading } = useAuth();

  return useQuery({
    queryKey,
    enabled: !!questionId && !isLoading,
    queryFn: () =>
      resultsApi.getResultsForQuestion(
        questionId,
        demographicsFilter,
        session?.user?.id
      ),
  });
}

export default useResults;
