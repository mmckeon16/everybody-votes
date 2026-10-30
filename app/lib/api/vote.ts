import { apiRequest } from './request';

export const votingApi = {
  submitVote: (optionId: string, userId: string, questionId: string) => apiRequest('submit-vote', {
    method: 'POST', body: JSON.stringify({ userId, optionId, questionId }),
  }),
};
export default votingApi;
