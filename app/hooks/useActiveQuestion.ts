import { useQuery } from '@tanstack/react-query';
import { questionsApi } from '../lib/api/questions';
import { useAuth } from '../context/AuthContext';

export function useActiveQuestion() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['activeQuestion'],
    queryFn: () => questionsApi.getActiveQuestion(session?.user?.id),
  });
}

export default useActiveQuestion;
