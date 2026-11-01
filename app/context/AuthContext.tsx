import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  hasCompletedProfile: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const router = useRouter();
  const handledAuthCodes = useRef(new Set<string>());

  useEffect(() => {
    // The web SDK already reads and exchanges PKCE callbacks from the browser URL.
    if (Platform.OS === 'web') return;

    let active = true;
    const handleDeepLink = async ({ url }: { url: string }) => {
      if (!active) return;
      try {
        const code = Linking.parse(url).queryParams?.code;
        if (
          typeof code !== 'string' ||
          !code ||
          handledAuthCodes.current.has(code)
        ) {
          return;
        }
        // An initial URL and a URL event can report the same single-use code.
        handledAuthCodes.current.add(code);
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!active) return;
        if (error) {
          console.error('Error exchanging code for session:', error);
          return;
        }
        if (data?.session) {
          setSession(data.session);
          const needsProfileCompletion = await checkProfileCompletion(
            data.session
          );

          // Add a small delay to ensure state updates have propagated
          setTimeout(() => {
            if (!active) return;
            if (needsProfileCompletion) {
              console.log('Redirecting to signup from deep link...');
              router.replace('/auth/signup');
            } else {
              console.log('Redirecting to home from deep link...');
              router.replace('/');
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL()
      .then(url => {
        if (url) return handleDeepLink({ url });
      })
      .catch(error => {
        console.error('Error reading initial auth link:', error);
      });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    console.log('Setting up auth listeners...');

    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', {
        hasSession: !!session,
        error,
        userId: session?.user?.id,
      });
      if (session) {
        setSession(session);
        checkProfileCompletion(session);
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, _newSession) => {
      console.log('Auth state changed:', {
        event,
        userId: _newSession?.user?.id,
        userEmail: _newSession?.user?.email,
        sessionExists: !!_newSession,
        userMetadata: _newSession?.user?.user_metadata,
      });

      if (_newSession) {
        setSession(_newSession);
        const needsProfileCompletion = await checkProfileCompletion(
          _newSession
        );

        // Add a small delay to ensure state updates have propagated
        setTimeout(() => {
          if (needsProfileCompletion) {
            console.log('Redirecting to signup...');
            router.replace('/auth/signup');
          } else {
            console.log('Redirecting to home...');
            router.replace('/');
          }
        }, 100);
      } else {
        setSession(null);
        setHasCompletedProfile(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkProfileCompletion = async (session: Session) => {
    if (!session?.user) return false;

    console.log('Checking profileCompletion for user:', session.user.id);
    console.log('User metadata:', session.user.user_metadata);
    console.log(
      'completed_profile:',
      !session.user.user_metadata?.completed_profile
    );

    const needsCompletion = !session.user.user_metadata?.completed_profile;
    setHasCompletedProfile(!needsCompletion);

    return needsCompletion;
  };

  const value = {
    session,
    isLoading,
    signUp: async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    },
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
    signOut: async () => {
      try {
        await supabase.auth.signOut();
        router.replace('/auth');
      } catch (error) {
        console.error('Error during sign out:', error);
      }
    },
    isAuthenticated: !!session,
    hasCompletedProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
