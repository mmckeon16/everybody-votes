import { useQuery } from '@tanstack/react-query';
import { resultsApi } from '../lib/api/results';

export function useResults(questionId: string) {
  return useQuery({
    queryKey: ['results', questionId],
    queryFn: () => resultsApi.getResultsForQuestion(questionId),
  });
}
