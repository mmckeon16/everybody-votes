import { useMutation } from '@tanstack/react-query';
import { votingApi } from '../lib/api/vote';
import Toast from 'react-native-toast-message';

export function useVote() {
  return useMutation({
    mutationFn: ({ optionId, userId }: { optionId: string; userId: string }) =>
      votingApi.submitVote(optionId, userId),
    onError: (error: Error) => {
      if (error.message.includes('already voted')) {
        Toast.show({
          type: 'error',
          text1: 'Already Voted',
          text2: 'You have already voted on this question',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to submit vote',
        });
      }
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Vote submitted successfully',
      });
    },
  });
}
