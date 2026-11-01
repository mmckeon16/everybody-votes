import { QueryClient } from '@tanstack/react-query';
import { questionsApi } from '../../app/lib/api/questions';
import { ApiError } from '../../app/lib/api/request';
import { supabase } from '../../app/lib/supabase';

jest.mock('../../app/lib/supabase', () => ({
  backendUrl: 'https://api.example.test',
  publicApiKey: 'test-public-key',
  supabase: { auth: { getSession: jest.fn() } },
}));

const originalFetch = global.fetch;
const getSession = jest.mocked(supabase.auth.getSession);

beforeEach(() => {
  getSession.mockResolvedValue({ data: { session: null }, error: null });
  global.fetch = jest.fn();
});

afterAll(() => {
  global.fetch = originalFetch;
});

function respond(status: number, body: unknown) {
  jest.mocked(global.fetch).mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);
}

test('no active poll settles as successful empty query data without retries', async () => {
  respond(404, { error: 'No active question found' });
  const client = new QueryClient();
  try {
    await expect(client.fetchQuery({
      queryKey: ['activeQuestion'],
      queryFn: () => questionsApi.getActiveQuestion(),
      retry: 2,
      retryDelay: 0,
    })).resolves.toBeNull();
    expect(client.getQueryState(['activeQuestion'])?.status).toBe('success');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  } finally {
    client.clear();
  }
});

test('an active poll response is preserved', async () => {
  const question = { id: 'test-question', text: 'Test poll?', options: [] };
  respond(200, question);
  await expect(questionsApi.getActiveQuestion()).resolves.toEqual(question);
});

test.each([
  [401, 'No active question found'],
  [500, 'No active question found'],
  [404, 'Not found'],
])('other API failure %s remains an error', async (status, message) => {
  respond(status, { error: message });
  await expect(questionsApi.getActiveQuestion()).rejects.toMatchObject({
    name: 'ApiError', status, message,
  });
});

test('previous-poll absence retains its existing error behavior', async () => {
  respond(404, { error: 'No previous questions found' });
  await expect(questionsApi.getLastActiveQuestion()).rejects.toBeInstanceOf(ApiError);
});

test('network failures remain errors', async () => {
  const error = new TypeError('Network unavailable');
  jest.mocked(global.fetch).mockRejectedValue(error);
  await expect(questionsApi.getActiveQuestion()).rejects.toBe(error);
});

test('session errors remain errors without making a request', async () => {
  const error = new Error('Session unavailable');
  getSession.mockRejectedValue(error);
  await expect(questionsApi.getActiveQuestion()).rejects.toBe(error);
  expect(global.fetch).not.toHaveBeenCalled();
});
