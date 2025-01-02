import { useMutation } from '@tanstack/react-query';
import { predictionsApi } from '../lib/api/predictions';
import Toast from 'react-native-toast-message';

export function usePrediction() {
  return useMutation({
    mutationFn: async ({
      optionId,
      userId,
      questionId,
    }: {
      optionId: string;
      userId: string;
      questionId: string;
    }) => {
      const response = await predictionsApi.submitPrediction(
        optionId,
        userId,
        questionId
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    },
    onError: (error: Error) => {
      if (error.message.includes('already made a prediction')) {
        Toast.show({
          type: 'error',
          text1: 'Already Predicted',
          text2: 'You have already made a prediction for this question',
          position: 'bottom',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to submit prediction',
          position: 'bottom',
        });
      }
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Prediction submitted successfully',
        position: 'bottom',
      });
    },
  });
}

export default usePrediction;
