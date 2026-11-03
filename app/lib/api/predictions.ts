import { apiRequest } from './request';

export const predictionsApi = {
  submitPrediction: (optionId: string, userId: string, questionId: string) => apiRequest('submit-prediction', {
    method: 'POST', body: JSON.stringify({ userId, optionId, questionId }),
  }),
};
export default predictionsApi;
