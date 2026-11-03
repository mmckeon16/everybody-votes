import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthChangeEvent, createClient, Session } from '@supabase/supabase-js';
import { AuthProvider, useAuth } from '../../app/context/AuthContext';
import { accountApi } from '../../app/lib/api/account';
import { authStorageKey, supabase } from '../../app/lib/supabase';

const mockReplace = jest.fn();
let mockAuthListener: ((event: AuthChangeEvent, session: Session | null) => void) | undefined;

jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock('expo-linking', () => ({
  addEventListener: () => ({ remove: jest.fn() }),
  getInitialURL: async () => null,
  parse: () => ({ queryParams: {} }),
}));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../../app/lib/api/account', () => ({ accountApi: { deleteAccount: jest.fn() } }));
jest.mock('../../app/lib/supabase', () => ({
  authStorageKey: 'test-polls-auth-token',
  supabase: { auth: {
    getSession: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    exchangeCodeForSession: jest.fn(),
    onAuthStateChange: jest.fn(callback => {
      mockAuthListener = callback;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    }),
  } },
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const fixture: Session = {
  access_token: 'disposable-test-access', refresh_token: 'disposable-test-refresh',
  expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer',
  user: { id: 'test-account-a', aud: 'authenticated', app_metadata: {}, user_metadata: { completed_profile: true }, created_at: '2026-01-01T00:00:00Z' },
};
let tree: ReactTestRenderer | undefined;
let client: QueryClient;
let current: ReturnType<typeof useAuth>;

function Probe() {
  current = useAuth();
  return null;
}
async function mount() {
  await act(async () => {
    tree = create(<QueryClientProvider client={client}><AuthProvider><Probe /></AuthProvider></QueryClientProvider>);
  });
}
async function seedPersonalData() {
  client.setQueryData(['personal-results'], { user_vote: 'private-test-option' });
  client.getMutationCache().build(client, { mutationKey: ['personal-vote'] });
  await AsyncStorage.multiSet([
    [authStorageKey, JSON.stringify(fixture)],
    [authStorageKey + '-user', 'private-test-user'],
    [authStorageKey + '-code-verifier', 'private-test-verifier'],
    ['theme', 'dark'], ['unrelated-preference', 'keep'],
  ]);
}

beforeEach(async () => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  await AsyncStorage.clear();
  client = new QueryClient();
  jest.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: fixture }, error: null });
  jest.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });
  jest.mocked(accountApi.deleteAccount).mockResolvedValue(undefined);
});
afterEach(async () => {
  await act(async () => tree?.unmount());
  tree = undefined;
  client.clear();
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('successful deletion clears session, profile, queries, mutations and only this Auth storage namespace', async () => {
  await mount();
  await seedPersonalData();
  await act(async () => current.deleteAccount());
  expect(current.session).toBeNull();
  expect(current.hasCompletedProfile).toBe(false);
  expect(client.getQueryCache().getAll()).toHaveLength(0);
  expect(client.getMutationCache().getAll()).toHaveLength(0);
  expect(await AsyncStorage.getItem(authStorageKey)).toBeNull();
  expect(await AsyncStorage.getItem(authStorageKey + '-user')).toBeNull();
  expect(await AsyncStorage.getItem(authStorageKey + '-code-verifier')).toBeNull();
  expect(await AsyncStorage.getItem('theme')).toBe('dark');
  expect(await AsyncStorage.getItem('unrelated-preference')).toBe('keep');
  expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  expect(mockReplace).toHaveBeenLastCalledWith('/');
});

test('failed deletion keeps the current account, persisted session and personal data', async () => {
  await mount();
  await seedPersonalData();
  const failure = new Error('Deletion unavailable');
  jest.mocked(accountApi.deleteAccount).mockRejectedValue(failure);
  await act(async () => { await expect(current.deleteAccount()).rejects.toBe(failure); });
  expect(current.session?.user.id).toBe(fixture.user.id);
  expect(current.hasCompletedProfile).toBe(true);
  expect(client.getQueryData(['personal-results'])).toEqual({ user_vote: 'private-test-option' });
  expect(await AsyncStorage.getItem(authStorageKey)).not.toBeNull();
  expect(supabase.auth.signOut).not.toHaveBeenCalled();
  expect(mockReplace).not.toHaveBeenCalled();
});

test('a remote sign-out exception after deletion falls back to SDK local cleanup', async () => {
  await mount();
  await seedPersonalData();
  jest.mocked(supabase.auth.signOut).mockRejectedValueOnce(new Error('Offline'));
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
  try { await act(async () => current.deleteAccount()); }
  finally { warning.mockRestore(); }
  expect(supabase.auth.signOut).toHaveBeenCalledTimes(2);
  expect(supabase.auth.signOut).toHaveBeenLastCalledWith({ scope: 'local' });
  expect(current.isAuthenticated).toBe(false);
  expect(await AsyncStorage.getItem(authStorageKey)).toBeNull();
  expect(client.getQueryCache().getAll()).toHaveLength(0);
});

test('a second deletion cannot start while the first is pending', async () => {
  await mount();
  let finish!: () => void;
  jest.mocked(accountApi.deleteAccount).mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  let first!: Promise<void>;
  await act(async () => { first = current.deleteAccount(); });
  await expect(current.deleteAccount()).rejects.toThrow('already in progress');
  expect(accountApi.deleteAccount).toHaveBeenCalledTimes(1);
  await act(async () => { finish(); await first; });
});

test('refresh, user updates and repeated sign-in do not navigate, while identity changes clear caches', async () => {
  await mount();
  await seedPersonalData();
  await act(async () => {
    mockAuthListener?.('TOKEN_REFRESHED', fixture);
    mockAuthListener?.('USER_UPDATED', fixture);
    mockAuthListener?.('SIGNED_IN', fixture);
    jest.advanceTimersByTime(200);
  });
  expect(mockReplace).not.toHaveBeenCalled();
  expect(client.getQueryData(['personal-results'])).toBeDefined();
  await act(async () => mockAuthListener?.('SIGNED_IN', { ...fixture, user: { ...fixture.user, id: 'test-account-b' } }));
  expect(client.getQueryCache().getAll()).toHaveLength(0);
  expect(client.getMutationCache().getAll()).toHaveLength(0);
  await act(async () => { jest.advanceTimersByTime(200); });
  expect(mockReplace).toHaveBeenLastCalledWith('/');
});

test('deletion cancels a queued onboarding redirect and ignores stale signed-in events', async () => {
  await mount();
  await act(async () => mockAuthListener?.('SIGNED_IN', { ...fixture, user: { ...fixture.user, id: 'test-incomplete-account', user_metadata: {} } }));
  let finish!: () => void;
  jest.mocked(accountApi.deleteAccount).mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  let deletion!: Promise<void>;
  await act(async () => {
    deletion = current.deleteAccount();
    mockAuthListener?.('TOKEN_REFRESHED', fixture);
    jest.advanceTimersByTime(200);
  });
  await act(async () => { finish(); await deletion; jest.advanceTimersByTime(200); });
  expect(current.session).toBeNull();
  expect(mockReplace.mock.calls.some(([path]) => path === '/auth/signup')).toBe(false);
  expect(mockReplace).toHaveBeenLastCalledWith('/');
});

test('the installed Auth SDK forgets its session even when the logout request fails', async () => {
  jest.useRealTimers();
  const store = new Map<string, string>([['sdk-test-auth', JSON.stringify(fixture)]]);
  const offline = jest.fn().mockRejectedValue(new Error('Offline test transport'));
  const sdk = createClient('https://auth.example.test', 'disposable-public-key', {
    global: { fetch: offline },
    auth: { storageKey: 'sdk-test-auth', autoRefreshToken: false, detectSessionInUrl: false, persistSession: true,
      storage: { getItem: key => store.get(key) ?? null, setItem: (key, value) => { store.set(key, value); }, removeItem: key => { store.delete(key); } },
    },
  });
  expect((await sdk.auth.getSession()).data.session).not.toBeNull();
  const loggedError = jest.spyOn(console, 'error').mockImplementation(() => {});
  try { expect((await sdk.auth.signOut({ scope: 'local' })).error).not.toBeNull(); }
  finally { loggedError.mockRestore(); }
  expect((await sdk.auth.getSession()).data.session).toBeNull();
  expect(store.has('sdk-test-auth')).toBe(false);
  expect(offline).toHaveBeenCalledTimes(1);
});
