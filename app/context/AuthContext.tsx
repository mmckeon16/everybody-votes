import { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    const handleAuthDeepLink = async ({ url }: { url: string }) => {
      console.log('Got auth deep link:', url);
      // Only handle auth-specific deep links
      if (url.includes('code=')) {
        try {
          const code = url.match(/code=([^&]+)/)?.[1];
          if (code) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(
              code
            );
            if (error) {
              console.error('Error exchanging code for session:', error);
              return;
            }
            if (data?.session) {
              setSession(data.session);
              const needsProfileCompletion = await checkProfileCompletion(
                data.session
              );

              if (needsProfileCompletion) {
                router.replace('/auth/signup');
              } else {
                router.replace('/');
              }
            }
          }
        } catch (error) {
          console.error('Error handling auth deep link:', error);
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleAuthDeepLink);
    return () => {
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
      console.log('Navigation flow:', {
        event,
        currentRoute: router.getCurrentRoute(),
        isAuthenticated: !!_newSession,
      });

      if (_newSession) {
        setSession(_newSession);
        const needsProfileCompletion = await checkProfileCompletion(
          _newSession
        );

        // Remove setTimeout and handle navigation directly
        if (needsProfileCompletion) {
          console.log('Redirecting to signup...');
          router.replace('/auth/signup');
        } else {
          console.log('Redirecting to home...');
          router.replace('/');
        }
      } else {
        setSession(null);
        setHasCompletedProfile(false);
        router.replace('/auth'); // Add explicit navigation on signout
      }
    });

    // Single return for cleanup
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
      await supabase.auth.signOut();
      router.replace('/auth');
    },
    isAuthenticated: !!session,
    hasCompletedProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
