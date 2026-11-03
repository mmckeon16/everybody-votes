import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { authStorageKey, supabase } from '../lib/supabase';
import { accountApi } from '../lib/api/account';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  isAuthenticated: boolean;
  hasCompletedProfile: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionRef = useRef<Session | null>(null);
  const handledAuthCodes = useRef(new Set<string>());
  const authGeneration = useRef(0);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deletingAccount = useRef(false);
  const mounted = useRef(true);

  function cancelAuthNavigation() {
    if (navigationTimer.current) clearTimeout(navigationTimer.current);
    navigationTimer.current = null;
  }

  function applySession(nextSession: Session | null, navigate = false) {
    if (!mounted.current) return;
    const previousUser = sessionRef.current?.user.id;
    const generation = ++authGeneration.current;
    cancelAuthNavigation();
    sessionRef.current = nextSession;
    setSession(nextSession);
    setHasCompletedProfile(!!nextSession?.user.user_metadata?.completed_profile);
    if (!nextSession || previousUser !== nextSession.user.id) {
      // Personal vote/result data must not carry over to the next account or guest.
      void queryClient.cancelQueries();
      queryClient.clear();
    }
    if (navigate && nextSession) {
      navigationTimer.current = setTimeout(() => {
        if (!mounted.current || deletingAccount.current || generation !== authGeneration.current) return;
        router.replace(nextSession.user.user_metadata?.completed_profile ? '/' : '/auth/signup');
      }, 100);
    }
  }

  async function finishSignOut(afterDeletion = false) {
    applySession(null);
    let remoteSignOutFailed = false;
    try {
      const { error } = await supabase.auth.signOut({ scope: afterDeletion ? 'local' : 'global' });
      remoteSignOutFailed = !!error;
      if (error) console.warn('Remote sign-out unavailable; clearing this device session.');
    } catch {
      remoteSignOutFailed = true;
      console.warn('Remote sign-out unavailable; clearing this device session.');
    } finally {
      await queryClient.cancelQueries();
      queryClient.clear();
      try {
        // Clear only this Auth client's namespace, retaining theme and unrelated app preferences.
        const keys = await AsyncStorage.getAllKeys();
        await AsyncStorage.multiRemove(keys.filter(key => key === authStorageKey || key.startsWith(`${authStorageKey}-`)));
      } catch {
        console.warn('Local auth storage cleanup could not be completed.');
      }
      if (remoteSignOutFailed) {
        // Storage is now empty, so this public SDK call clears its internal session state
        // without sending a token to the server again.
        try { await supabase.auth.signOut({ scope: 'local' }); }
        catch { console.warn('SDK local sign-out could not be completed.'); }
      }
      applySession(null);
      router.replace('/');
    }
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelAuthNavigation();
    };
  }, []);

  useEffect(() => {
    // The web SDK already reads and exchanges PKCE callbacks from the browser URL.
    if (Platform.OS === 'web') return;
    let active = true;
    const handleDeepLink = async ({ url }: { url: string }) => {
      if (!active || deletingAccount.current) return;
      const generation = authGeneration.current;
      try {
        const code = Linking.parse(url).queryParams?.code;
        if (typeof code !== 'string' || !code || handledAuthCodes.current.has(code)) return;
        handledAuthCodes.current.add(code);
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!active || generation !== authGeneration.current || deletingAccount.current) return;
        if (error) {
          console.error('OAuth callback exchange failed.');
          return;
        }
        if (data?.session) applySession(data.session, true);
      } catch {
        console.error('OAuth callback could not be processed.');
      }
    };
    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then(url => {
      if (url) return handleDeepLink({ url });
    }).catch(() => console.error('Initial auth link could not be read.'));
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const generation = authGeneration.current;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted.current || generation !== authGeneration.current || deletingAccount.current) return;
      applySession(session);
      setIsLoading(false);
    }).catch(() => {
      if (mounted.current) setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // Keep the SDK callback synchronous; SDK methods can deadlock while its auth lock is held.
      if (deletingAccount.current && nextSession) return;
      applySession(nextSession, event === 'SIGNED_IN' && sessionRef.current?.user.id !== nextSession?.user.id);
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    session,
    isLoading,
    signUp: async (email, password) => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    },
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    signOut: () => finishSignOut(),
    deleteAccount: async () => {
      if (!sessionRef.current) throw new Error('Sign in before deleting your account');
      if (deletingAccount.current) throw new Error('Account deletion is already in progress');
      deletingAccount.current = true;
      ++authGeneration.current;
      cancelAuthNavigation();
      try {
        await accountApi.deleteAccount();
        await finishSignOut(true);
      } finally {
        deletingAccount.current = false;
      }
    },
    isAuthenticated: !!session,
    hasCompletedProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
