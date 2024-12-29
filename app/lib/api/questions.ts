const baseUrl =
  process.env.EXPO_PUBLIC_ENV === 'development'
    ? 'http://127.0.0.1:54321/functions/v1'
    : process.env.EXPO_PUBLIC_SUPABASE_URL + '/functions/v1';

export const questionsApi = {
  getActiveQuestion: async (userId?: string) => {
    const url = new URL(`${baseUrl}/active-question`);
    if (userId) {
      url.searchParams.append('userId', userId);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });
    const data = await response.json();
    return data;
    // return {
    //   ...data,
    //   startDate: data.start_date,
    //   endDate: data.end_date,
    //   isActive: data.is_active,
    //   userVote: data.user_vote,
    // };
  },

  getQuestionHistory: async () => {
    const response = await fetch(`${baseUrl}/questions/history`, {
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });
    return response.json();
  },

  submitVote: async ({
    questionId,
    optionId,
  }: {
    questionId: string;
    optionId: number;
  }) => {
    const response = await fetch(`${baseUrl}/votes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questionId, optionId }),
    });
    return response.json();
  },
};
export default questionsApi;
