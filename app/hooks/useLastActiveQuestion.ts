import { useQuery } from '@tanstack/react-query';
import { questionsApi } from '../lib/api/questions';
import { useAuth } from '../context/AuthContext';

export function useLastActiveQuestion() {
  const { session, isLoading } = useAuth();

  return useQuery({
    queryKey: ['lastActiveQuestion', session?.user?.id ?? null],
    queryFn: () => questionsApi.getLastActiveQuestion(session?.user?.id),
    enabled: !isLoading,
  });
}

export default useLastActiveQuestion;
