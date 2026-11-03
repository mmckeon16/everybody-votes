import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import CompleteProfile from '../../app/auth/complete-profile';
import { supabase } from '../../app/lib/supabase';

const mockReplace = jest.fn();
const mockSave = jest.fn();
let mockSession: Session;
const mockListeners = new Set<(event: AuthChangeEvent, session: Session | null) => void>();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock('../../app/context/AuthContext', () => ({ useAuth: () => ({ session: mockSession }) }));
jest.mock('../../app/hooks/useOnboarding', () => ({ useOnboarding: () => ({ mutateAsync: mockSave, isPending: false }) }));
jest.mock('react-native-toast-message', () => ({ __esModule: true, default: { show: jest.fn() } }));
jest.mock('../../app/lib/supabase', () => ({ supabase: { auth: {
  getUser: async () => ({ data: { user: mockSession.user }, error: null }),
  updateUser: jest.fn(), refreshSession: jest.fn(),
  onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
    mockListeners.add(callback);
    return { data: { subscription: { unsubscribe: () => mockListeners.delete(callback) } } };
  },
} } }));
jest.mock('~/components/ui/button', () => ({ Button: (props: unknown) => require('react').createElement('button', props) }), { virtual: true });
jest.mock('~/components/ui/text', () => ({ Text: (props: unknown) => require('react').createElement('text', props) }), { virtual: true });
jest.mock('~/components/ui/progress', () => ({ Progress: () => null }), { virtual: true });
jest.mock('../../app/auth/components/age', () => ({ __esModule: true, default: ({ setProfileData }: { setProfileData: (value: object) => void }) => {
  require('react').useEffect(() => setProfileData({ age: '30', gender: 'female', citizenship: 'citizen', raceEthnicity: 'asian', incomeBracket: '50k-75k', politicalParty: 'independent', politicalIdeology: 'moderate', occupation: 'engineer', state: 'NY', employmentStatus: 'employed' }), [setProfileData]);
  return null;
} }));
jest.mock('../../app/auth/components/gender', () => ({ __esModule: true, default: () => null }));
jest.mock('../../app/auth/components/location', () => ({ __esModule: true, default: () => null }));
jest.mock('../../app/auth/components/race', () => ({ __esModule: true, default: () => null }));
jest.mock('../../app/auth/components/politics', () => ({ __esModule: true, default: () => null }));
jest.mock('../../app/auth/components/occupation', () => ({ __esModule: true, default: () => null }));
jest.mock('../../app/auth/components/income', () => ({ __esModule: true, default: () => null }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer;
const sessionFor = (id: string): Session => ({ access_token: 'disposable-access', refresh_token: 'disposable-refresh', expires_in: 3600, token_type: 'bearer', user: { id, aud: 'authenticated', app_metadata: {}, user_metadata: { completed_profile: true }, created_at: '2026-01-01T00:00:00Z' } });
function button(label: string) {
  return tree.root.findAll(node => node.type === 'button' && node.findAll(child => child.type === 'text').some(text => text.children.includes(label)))[0];
}
async function ready() {
  await act(async () => { tree = create(<CompleteProfile />); });
  for (let step = 1; step < 7; step++) await act(async () => button('Next').props.onPress());
}
function changeAccount(id: string) {
  mockSession = sessionFor(id);
  mockListeners.forEach(callback => callback('SIGNED_IN', mockSession));
  tree.update(<CompleteProfile />);
}
beforeEach(() => {
  jest.clearAllMocks(); mockSession = sessionFor('account-a');
  mockSave.mockResolvedValue({ success: true });
  jest.mocked(supabase.auth.refreshSession).mockResolvedValue({ data: { session: mockSession, user: mockSession.user }, error: null });
});
afterEach(async () => { if (tree) await act(async () => tree.unmount()); });

test('a pending onboarding save cannot refresh, write metadata or navigate after an account switch', async () => {
  let finish!: () => void;
  mockSave.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  await ready();
  let pending!: Promise<void>;
  await act(async () => { pending = button('Complete').props.onPress(); });
  await act(async () => { changeAccount('account-b'); finish(); await pending; });
  expect(supabase.auth.refreshSession).not.toHaveBeenCalled();
  expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  expect(mockReplace).not.toHaveBeenCalled();
});

test('a pending refresh for an old form cannot navigate into a newly signed-in account', async () => {
  let finish!: (value: Awaited<ReturnType<typeof supabase.auth.refreshSession>>) => void;
  jest.mocked(supabase.auth.refreshSession).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  await ready();
  let pending!: Promise<void>;
  await act(async () => { pending = button('Complete').props.onPress(); });
  expect(supabase.auth.refreshSession).toHaveBeenCalledWith();
  await act(async () => { changeAccount('account-b'); finish({ data: { session: mockSession, user: mockSession.user }, error: null }); await pending; });
  expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  expect(mockReplace).not.toHaveBeenCalled();
});

test('successful onboarding refreshes server metadata without writing it and continues', async () => {
  await ready();
  await act(async () => button('Complete').props.onPress());
  expect(supabase.auth.refreshSession).toHaveBeenCalledWith();
  expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  expect(mockReplace).toHaveBeenCalledWith('/auth/celebrate');
});

test('refresh failure stays on the profile form with a retryable error', async () => {
  jest.mocked(supabase.auth.refreshSession).mockResolvedValueOnce({ data: { session: null, user: null }, error: new Error('Refresh unavailable') } as Awaited<ReturnType<typeof supabase.auth.refreshSession>>);
  await ready();
  await act(async () => button('Complete').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Refresh unavailable');
  expect(button('Complete').props.disabled).toBe(false);
  expect(mockReplace).not.toHaveBeenCalled();
});
