import type { ProfileData } from '../../types';

const baseUrl =
  process.env.EXPO_PUBLIC_ENV === 'development'
    ? 'http://127.0.0.1:54321/functions/v1'
    : process.env.EXPO_PUBLIC_SUPABASE_URL + '/functions/v1';

export const onboardingApi = {
  submitOnboarding: async (profileData: ProfileData, userId: string) => {
    const response = await fetch(`${baseUrl}/submit-onboarding`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        onboarding: {
          user_id: userId,
          age: parseInt(profileData.age),
          gender: profileData.gender,
          state: profileData.state,
          race_ethnicity: profileData.raceEthnicity,
          income_bracket: profileData.incomeBracket,
          political_party: profileData.politicalParty,
          occupation: profileData.occupation,
          political_leaning: profileData.politicalIdeology,
          employment_status: profileData.employmentStatus,
          citizenship_status: profileData.citizenship,
        },
      }),
    });
    return response.json();
  },
};

export default onboardingApi;
