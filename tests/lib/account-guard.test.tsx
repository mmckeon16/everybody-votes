import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useAccountGuard } from '../../lib/use-account-guard';

const mockListeners = new Set<(event: AuthChangeEvent, session: Session | null) => void>();
jest.mock('../../app/lib/supabase', () => ({ supabase: { auth: {
  onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
    mockListeners.add(callback);
    return { data: { subscription: { unsubscribe: () => mockListeners.delete(callback) } } };
  },
} } }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let guard: ReturnType<typeof useAccountGuard>;
function Probe({ userId }: { userId?: string }) { guard = useAccountGuard(userId); return null; }
const session = (id: string) => ({ user: { id } }) as Session;
function emit(event: AuthChangeEvent, next: Session | null) { mockListeners.forEach(callback => callback(event, next)); }

async function pendingAction() {
  let finish!: () => void;
  const wait = new Promise<void>(resolve => { finish = resolve; });
  const allowed = guard.capture();
  const applied = jest.fn();
  const done = (async () => { await wait; if (allowed()) applied(); })();
  return { finish, done, applied };
}

test.each(['switch-account', 'logout-and-return-to-same-account', 'unmount'])(
  'a deferred action is discarded after %s', async transition => {
    let tree!: ReactTestRenderer;
    await act(async () => { tree = create(<Probe userId="account-a" />); });
    try {
      const action = await pendingAction();
      await act(async () => {
        if (transition === 'switch-account') tree.update(<Probe userId="account-b" />);
        if (transition === 'logout-and-return-to-same-account') {
          emit('SIGNED_OUT', null);
          emit('SIGNED_IN', session('account-a'));
        }
        if (transition === 'unmount') tree.unmount();
      });
      await act(async () => { action.finish(); await action.done; });
      expect(action.applied).not.toHaveBeenCalled();
    } finally { if (transition !== 'unmount') await act(async () => tree.unmount()); }
    expect(mockListeners.size).toBe(0);
  }
);

test('ordinary token refresh, user updates and repeated sign-in preserve a pending action', async () => {
  let tree!: ReactTestRenderer;
  await act(async () => { tree = create(<Probe userId="account-a" />); });
  try {
    const action = await pendingAction();
    await act(async () => {
      emit('TOKEN_REFRESHED', session('account-a'));
      emit('USER_UPDATED', session('account-a'));
      emit('SIGNED_IN', session('account-a'));
      action.finish(); await action.done;
    });
    expect(action.applied).toHaveBeenCalledTimes(1);
  } finally { await act(async () => tree.unmount()); }
});
