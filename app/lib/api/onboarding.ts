import type { ProfileData } from '../../types';
import { apiRequest } from './request';

export const onboardingApi = {
  submitOnboarding: (profileData: ProfileData, userId: string) => apiRequest('submit-onboarding', {
    method: 'POST',
    body: JSON.stringify({ onboarding: {
      user_id: userId, age: parseInt(profileData.age, 10), gender: profileData.gender,
      state: profileData.state, race_ethnicity: profileData.raceEthnicity, income_bracket: profileData.incomeBracket,
      political_party: profileData.politicalParty, occupation: profileData.occupation,
      political_leaning: profileData.politicalIdeology, employment_status: profileData.employmentStatus,
      citizenship_status: profileData.citizenship,
    } }),
  }),
};
export default onboardingApi;
