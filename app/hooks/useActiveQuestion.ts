import { useQuery } from '@tanstack/react-query';
import { questionsApi } from '../lib/api/questions';
import { useAuth } from '../context/AuthContext';

export function useActiveQuestion() {
  const { session, isLoading } = useAuth();

  return useQuery({
    queryKey: ['activeQuestion'],
    queryFn: () => questionsApi.getActiveQuestion(session?.user?.id),
    enabled: !isLoading,
  });
}

export default useActiveQuestion;
