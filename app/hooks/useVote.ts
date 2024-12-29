import { useMutation } from '@tanstack/react-query';
import { votingApi } from '../lib/api/vote';
import Toast from 'react-native-toast-message';

export function useVote() {
  return useMutation({
    mutationFn: async ({
      optionId,
      userId,
    }: {
      optionId: string;
      userId: string;
    }) => {
      const response = await votingApi.submitVote(optionId, userId);

      // Check if the response contains an error
      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    },
    onError: (error: Error) => {
      if (error.message.includes('already voted')) {
        Toast.show({
          type: 'error',
          text1: 'Already Voted',
          text2: 'You have already voted on this question',
          position: 'bottom',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to submit vote',
          position: 'bottom',
        });
      }
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Vote submitted successfully',
        position: 'bottom',
      });
    },
  });
}

export default useVote;
