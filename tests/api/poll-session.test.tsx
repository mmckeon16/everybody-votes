import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useActiveQuestion } from '../../app/hooks/useActiveQuestion';
import { useResults } from '../../app/hooks/useResults';
import { useVote } from '../../app/hooks/useVote';
import { usePrediction } from '../../app/hooks/usePrediction';
import { questionsApi } from '../../app/lib/api/questions';
import { resultsApi } from '../../app/lib/api/results';
import { votingApi } from '../../app/lib/api/vote';
import { predictionsApi } from '../../app/lib/api/predictions';

let mockUserId = 'account-a';
let mockVote: string | null = null;
let mockPrediction: string | null = null;
jest.mock('../../app/context/AuthContext', () => ({ useAuth: () => ({ session: { user: { id: mockUserId } }, isLoading: false }) }));
jest.mock('../../app/lib/api/questions', () => ({ questionsApi: { getActiveQuestion: jest.fn() } }));
jest.mock('../../app/lib/api/results', () => ({ resultsApi: { getResultsForQuestion: jest.fn() } }));
jest.mock('../../app/lib/api/vote', () => ({ votingApi: { submitVote: jest.fn() } }));
jest.mock('../../app/lib/api/predictions', () => ({ predictionsApi: { submitPrediction: jest.fn() } }));
jest.mock('react-native-toast-message', () => ({ __esModule: true, default: { show: jest.fn() } }));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let latest: any;
function PollFlow() {
  latest = { active: useActiveQuestion(), results: useResults('community-poll'), vote: useVote(), prediction: usePrediction() };
  return null;
}
const settle = () => new Promise<void>(resolve => setTimeout(resolve, 20));

beforeEach(() => {
  mockUserId = 'account-a'; mockVote = null; mockPrediction = null;
  jest.mocked(questionsApi.getActiveQuestion).mockImplementation(async (userId) => ({ id: 'community-poll', options: [], user_vote: userId === 'account-a' ? mockVote : null, user_prediction: userId === 'account-a' ? mockPrediction : null }));
  jest.mocked(resultsApi.getResultsForQuestion).mockImplementation(async (_id, _filter, userId) => ({ data: { user_vote: userId === 'account-a' ? mockVote : null, user_prediction: userId === 'account-a' ? mockPrediction : null } }) as any);
  jest.mocked(votingApi.submitVote).mockImplementation(async option => { mockVote = option; return { data: { id: 'vote' } }; });
  jest.mocked(predictionsApi.submitPrediction).mockImplementation(async option => { mockPrediction = option; return { data: { id: 'prediction' } }; });
});

test('vote and prediction refresh visible personal data, and switching accounts isolates it', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } });
  let tree: ReactTestRenderer | undefined;
  const render = () => <QueryClientProvider client={client}><PollFlow /></QueryClientProvider>;
  try {
    await act(async () => { tree = create(render()); });
    await act(settle);
    expect(latest.active.data.user_vote).toBeNull();
    await act(async () => { await latest.vote.mutateAsync({ optionId: 'beach', userId: 'account-a', questionId: 'community-poll' }); });
    await act(settle);
    expect(latest.active.data.user_vote).toBe('beach');
    expect(latest.results.data.data.user_vote).toBe('beach');
    await act(async () => { await latest.prediction.mutateAsync({ optionId: 'mountains', userId: 'account-a', questionId: 'community-poll' }); });
    await act(settle);
    expect(latest.active.data.user_prediction).toBe('mountains');
    expect(latest.results.data.data.user_prediction).toBe('mountains');
    mockUserId = 'account-b';
    await act(async () => { tree!.update(render()); });
    await act(settle);
    expect(latest.active.data.user_vote).toBeNull();
    expect(latest.active.data.user_prediction).toBeNull();
    expect(latest.results.data.data.user_vote).toBeNull();
    expect(latest.results.data.data.user_prediction).toBeNull();
    expect(questionsApi.getActiveQuestion).toHaveBeenLastCalledWith('account-b');
  } finally {
    await act(async () => tree?.unmount()); client.clear();
  }
});

test('a rejected vote leaves cached data unchanged and remains retryable', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } });
  let tree: ReactTestRenderer | undefined;
  try {
    await act(async () => { tree = create(<QueryClientProvider client={client}><PollFlow /></QueryClientProvider>); });
    await act(settle);
    jest.mocked(votingApi.submitVote).mockRejectedValueOnce(new Error('Question is closed or option is invalid'));
    await act(async () => { await expect(latest.vote.mutateAsync({ optionId: 'beach', userId: 'account-a', questionId: 'community-poll' })).rejects.toThrow('Question is closed'); });
    expect(latest.active.data.user_vote).toBeNull();
    expect(mockVote).toBeNull();
  } finally {
    await act(async () => tree?.unmount()); client.clear();
  }
});
