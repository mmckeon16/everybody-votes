import { apiRequest } from './request';
import { supabase } from '../supabase';

export const questionsApi = {
  getActiveQuestion: (userId?: string) => apiRequest(`active-question${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`),
  getLastActiveQuestion: (userId?: string) => apiRequest(`last-active-question${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`),
  getQuestionHistory: () => apiRequest('questions/history'),
  submitVote: async ({ questionId, optionId }: { questionId: string; optionId: string }) => {
    const { data: { session } } = await supabase.auth.getSession();
    return apiRequest('submit-vote', { method: 'POST', body: JSON.stringify({ questionId, optionId, userId: session?.user?.id }) });
  },
};
export default questionsApi;
