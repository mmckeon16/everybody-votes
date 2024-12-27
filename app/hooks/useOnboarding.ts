import { useMutation } from '@tanstack/react-query';
import { onboardingApi } from '../lib/api/onboarding';
import type { ProfileData } from '../types';
import Toast from 'react-native-toast-message';

export function useOnboarding() {
  return useMutation({
    mutationFn: async ({
      profileData,
      userId,
    }: {
      profileData: ProfileData;
      userId: string;
    }) => {
      const response = await onboardingApi.submitOnboarding(
        profileData,
        userId
      );
      console.log('Onboarding submission response:', response);

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    },
    onError: (error: Error) => {
      console.error('Onboarding submission error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to submit profile',
      });
    },
    onSuccess: () => {
      console.log('Onboarding submission successful');
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile submitted successfully',
      });
    },
  });
}
export default useOnboarding;
