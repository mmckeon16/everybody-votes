import { useMutation } from '@tanstack/react-query';
import { votingApi } from '../lib/api/vote';

export function useVote() {
  return useMutation({
    mutationFn: ({ optionId, userId }: { optionId: string; userId: string }) =>
      votingApi.submitVote(optionId, userId),
  });
}
