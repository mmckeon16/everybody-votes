import { useMutation } from '@tanstack/react-query';
import { predictionsApi } from '../lib/api/predictions';
import Toast from 'react-native-toast-message';

export function usePrediction() {
  return useMutation({
    mutationFn: ({ optionId, userId }: { optionId: string; userId: string }) =>
      predictionsApi.submitPrediction(optionId, userId),
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
