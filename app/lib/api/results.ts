const baseUrl =
  process.env.EXPO_PUBLIC_ENV === 'development'
    ? 'http://127.0.0.1:54321/functions/v1'
    : process.env.EXPO_PUBLIC_SUPABASE_URL + '/functions/v1';

// result-data/${questionId}
export const resultsApi = {
  getResultsForQuestion: async (questionId: string) => {
    const response = await fetch(`${baseUrl}/result-data/${questionId}`, {
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });
    const data = await response.json();
    return {
      data,
    };
  },
};
