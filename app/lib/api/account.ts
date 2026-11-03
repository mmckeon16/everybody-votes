import { apiRequest } from './request';

export const accountApi = {
  deleteAccount: async () => {
    const result = await apiRequest('account', {
      method: 'DELETE',
      body: JSON.stringify({ confirmation: 'DELETE' }),
    });
    if (result?.deleted !== true) throw new Error('Account deletion could not be confirmed');
  },
};
