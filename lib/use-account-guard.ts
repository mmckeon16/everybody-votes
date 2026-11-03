import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '../app/lib/supabase';

/** Keep an async action bound to the mounted screen and the account that started it. */
export function useAccountGuard(userId: string | undefined) {
  const account = useRef({ userId: userId ?? null, generation: 0, mounted: false });
  const renderedUserId = userId ?? null;
  if (account.current.userId !== renderedUserId) {
    account.current.userId = renderedUserId;
    account.current.generation++;
  }

  useEffect(() => {
    account.current.mounted = true;
    // Observe SDK transitions directly, including logout -> same account within one React batch.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUserId = session?.user.id ?? null;
      if (event === 'SIGNED_OUT' || nextUserId !== account.current.userId) {
        account.current.userId = nextUserId;
        account.current.generation++;
      }
    });
    return () => {
      account.current.mounted = false;
      account.current.generation++;
      subscription.unsubscribe();
    };
  }, []);

  const capture = useCallback(() => {
    const { userId: expectedId, generation } = account.current;
    return () => account.current.mounted && expectedId !== null &&
      account.current.userId === expectedId && account.current.generation === generation;
  }, []);
  const isMounted = useCallback(() => account.current.mounted, []);
  return { capture, isMounted };
}
