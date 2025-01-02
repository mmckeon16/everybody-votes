const baseUrl =
  process.env.EXPO_PUBLIC_ENV === 'development'
    ? 'http://127.0.0.1:54321/functions/v1'
    : process.env.EXPO_PUBLIC_SUPABASE_URL + '/functions/v1';

export const predictionsApi = {
  submitPrediction: async (
    optionId: string,
    userId: string,
    questionId: string
  ) => {
    const response = await fetch(`${baseUrl}/submit-prediction`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        optionId,
        questionId,
      }),
    });
    return response.json();
  },
};

export default predictionsApi;
