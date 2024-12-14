import { useMutation } from '@tanstack/react-query';
import { onboardingApi } from '../lib/api/onboarding';
import type { ProfileData } from '../types';

export function useOnboarding() {
  return useMutation({
    mutationFn: ({
      profileData,
      userId,
    }: {
      profileData: ProfileData;
      userId: string;
    }) => onboardingApi.submitOnboarding(profileData, userId),
  });
}
