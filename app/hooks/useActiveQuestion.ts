import { useQuery } from '@tanstack/react-query';
import { questionsApi } from '../lib/api/questions';

export function useActiveQuestion() {
  return useQuery({
    queryKey: ['activeQuestion'],
    queryFn: questionsApi.getActiveQuestion,
  });
}

export default useActiveQuestion;
