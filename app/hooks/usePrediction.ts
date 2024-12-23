import { useMutation } from '@tanstack/react-query';
import { predictionsApi } from '../lib/api/predictions';

export function usePrediction() {
  return useMutation({
    mutationFn: ({ optionId, userId }: { optionId: string; userId: string }) =>
      predictionsApi.submitPrediction(optionId, userId),
  });
}
